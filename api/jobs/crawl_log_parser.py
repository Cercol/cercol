"""
Parse Caddy access logs and write crawler hits to BigQuery.

# Spec: docs/architecture/seo-pipeline.md

LIMITATION: the frontend cercol.team is hosted by GitHub Pages and
exposes no origin logs to us. This parser covers ONLY the API
surface (api.cercol.team) whose logs Caddy writes to
/var/log/caddy/cercol_api_access.log in JSON. See the pipeline doc
for the consequence on dashboards.

Stateful: the parser remembers the byte offset of the log file it
last read up to, stored in /home/cercol/.state/crawl_parser_offset.
On the next tick it resumes from that offset. If the file got
rotated (its inode changed or the file is now shorter than the
saved offset), the parser restarts from the beginning of the
current file. This is intentionally simple; Caddy's logrotate
keeps three days of files, so we tolerate at most one missed
rotation cycle without going back through the rotated archive.
"""

from __future__ import annotations

import json
import logging
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

from ._config import JobConfig, load_config, table_id

log = logging.getLogger("cercol.crawl_log_parser")

DEFAULT_LOG_PATH = Path("/var/log/caddy/cercol_api_access.log")
DEFAULT_STATE_PATH = Path("/home/cercol/.state/crawl_parser_offset")

# Crawlers we care about. Match against User-Agent (case-insensitive).
# The first capture group is the normalised bot name written to BigQuery.
_BOT_PATTERNS: tuple[tuple[str, re.Pattern[str]], ...] = (
    ("googlebot",       re.compile(r"\bgooglebot\b", re.IGNORECASE)),
    ("googleother",     re.compile(r"\bgoogleother\b", re.IGNORECASE)),
    ("google-extended", re.compile(r"\bgoogle-extended\b", re.IGNORECASE)),
    ("bingbot",         re.compile(r"\bbingbot\b", re.IGNORECASE)),
    ("duckduckbot",     re.compile(r"\bduckduckbot\b", re.IGNORECASE)),
    ("yandexbot",       re.compile(r"\byandex(?:bot)?\b", re.IGNORECASE)),
    ("baiduspider",     re.compile(r"\bbaiduspider\b", re.IGNORECASE)),
    ("applebot",        re.compile(r"\bapplebot\b", re.IGNORECASE)),
    ("ahrefsbot",       re.compile(r"\bahrefsbot\b", re.IGNORECASE)),
    ("semrushbot",      re.compile(r"\bsemrushbot\b", re.IGNORECASE)),
    ("facebookbot",     re.compile(r"\bfacebookexternalhit\b", re.IGNORECASE)),
    ("twitterbot",      re.compile(r"\btwitterbot\b", re.IGNORECASE)),
    ("gptbot",          re.compile(r"\bgptbot\b", re.IGNORECASE)),
    ("claudebot",       re.compile(r"\bclaudebot\b", re.IGNORECASE)),
    ("perplexitybot",   re.compile(r"\bperplexitybot\b", re.IGNORECASE)),
)


@dataclass(frozen=True)
class CrawlRow:
    ts: str
    ts_date: str
    remote_ip: str | None
    user_agent: str | None
    bot_name: str
    host: str
    path: str
    status: int
    duration_ms: int | None
    bytes_sent: int | None


def classify_bot(user_agent: str | None) -> str | None:
    """Return a normalised bot name or None if the UA is not a tracked crawler."""
    if not user_agent:
        return None
    for name, pat in _BOT_PATTERNS:
        if pat.search(user_agent):
            return name
    return None


def parse_log_line(line: str) -> CrawlRow | None:
    """Parse one Caddy JSON access-log line. Returns None if not a crawler hit.

    Caddy's structured logger emits one JSON document per line with
    fields like:
        {
            "level": "info",
            "ts": 1748044800.123,
            "logger": "http.log.access",
            "msg": "handled request",
            "request": {
                "host": "api.cercol.team",
                "method": "GET",
                "uri": "/blog",
                "remote_ip": "66.249.66.1",
                "headers": {"User-Agent": ["Googlebot/2.1 (...)"]}
            },
            "duration": 0.018,
            "size": 12345,
            "status": 200
        }
    """
    line = line.strip()
    if not line:
        return None
    try:
        rec = json.loads(line)
    except json.JSONDecodeError:
        return None
    if rec.get("logger") != "http.log.access":
        return None

    req = rec.get("request", {}) or {}
    headers = req.get("headers", {}) or {}
    ua_list = headers.get("User-Agent") or headers.get("user-agent") or []
    ua = ua_list[0] if isinstance(ua_list, list) and ua_list else None

    bot = classify_bot(ua)
    if not bot:
        return None

    ts_raw = rec.get("ts")
    if isinstance(ts_raw, (int, float)):
        ts_dt = datetime.fromtimestamp(ts_raw, tz=timezone.utc)
    elif isinstance(ts_raw, str):
        ts_dt = datetime.fromisoformat(ts_raw.replace("Z", "+00:00"))
    else:
        return None

    duration_s = rec.get("duration")
    duration_ms = int(round(float(duration_s) * 1000)) if isinstance(duration_s, (int, float)) else None

    return CrawlRow(
        ts=ts_dt.isoformat(),
        ts_date=ts_dt.date().isoformat(),
        remote_ip=req.get("remote_ip"),
        user_agent=ua,
        bot_name=bot,
        host=str(req.get("host", "")),
        path=str(req.get("uri", "")),
        status=int(rec.get("status", 0)),
        duration_ms=duration_ms,
        bytes_sent=int(rec.get("size", 0)) if rec.get("size") is not None else None,
    )


def read_state(state_path: Path) -> tuple[int, int]:
    """Return (last_offset, last_inode) from the state file or (0, 0) if absent."""
    if not state_path.is_file():
        return (0, 0)
    try:
        data = json.loads(state_path.read_text())
        return (int(data.get("offset", 0)), int(data.get("inode", 0)))
    except (json.JSONDecodeError, ValueError):
        return (0, 0)


def write_state(state_path: Path, offset: int, inode: int) -> None:
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text(json.dumps({"offset": offset, "inode": inode}))


def iter_new_lines(log_path: Path, state_path: Path) -> Iterator[str]:
    """Yield each new line since the last run, and update state on exit.

    Detects rotation (inode change or file shorter than saved offset)
    and restarts from byte 0 in that case.
    """
    last_offset, last_inode = read_state(state_path)
    st = log_path.stat()
    current_inode = st.st_ino
    current_size = st.st_size

    start = last_offset
    if current_inode != last_inode or current_size < last_offset:
        log.info(
            "Log rotated or truncated (inode %s->%s, size %s vs offset %s); restart from 0",
            last_inode, current_inode, current_size, last_offset,
        )
        start = 0

    with log_path.open("r", encoding="utf-8", errors="replace") as f:
        f.seek(start)
        for line in f:
            yield line
        new_offset = f.tell()

    write_state(state_path, new_offset, current_inode)


def run(
    cfg: JobConfig,
    *,
    bq_client,
    log_path: Path = DEFAULT_LOG_PATH,
    state_path: Path = DEFAULT_STATE_PATH,
) -> dict[str, int]:
    """Parse all new log lines and insert crawler hits into BigQuery."""
    if not log_path.is_file():
        log.warning("Log file %s does not exist; nothing to do", log_path)
        return {"crawl_logs": 0}

    now = datetime.now(timezone.utc).isoformat()
    rows: list[dict[str, Any]] = []
    for line in iter_new_lines(log_path, state_path):
        parsed = parse_log_line(line)
        if parsed is None:
            continue
        rows.append({
            "ts": parsed.ts,
            "ts_date": parsed.ts_date,
            "remote_ip": parsed.remote_ip,
            "user_agent": parsed.user_agent,
            "bot_name": parsed.bot_name,
            "host": parsed.host,
            "path": parsed.path,
            "status": parsed.status,
            "duration_ms": parsed.duration_ms,
            "bytes_sent": parsed.bytes_sent,
            "ingested_at": now,
        })

    if rows:
        errors = bq_client.insert_rows_json(table_id(cfg, "crawl_logs"), rows)
        if errors:
            raise RuntimeError(f"insert_rows_json into crawl_logs failed: {errors}")

    return {"crawl_logs": len(rows)}


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
    cfg = load_config()
    try:
        from google.cloud import bigquery
        bq_client = bigquery.Client()
    except ImportError:
        log.error("google-cloud-bigquery not installed; run pip install -r api/requirements.txt")
        return 1
    counts = run(cfg, bq_client=bq_client)
    log.info("Crawl log parser counts: %s", counts)
    return 0


if __name__ == "__main__":
    sys.exit(main())
