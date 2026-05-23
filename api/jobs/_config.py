"""
Shared configuration for SEO ingest jobs.

# Spec: docs/architecture/seo-pipeline.md

Defaults come from the GCP project layout decided in
docs/decisions/0005-gcp-project-bigquery-dataset.md (Accepted).

Required secrets are validated lazily by `require_secret(name)`. Tests
import the module and exercise pure functions without triggering the
fail-fast path; production callers invoke `require_secret` before
making a network call.
"""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class JobConfig:
    """Resolved configuration snapshot for a single job invocation."""

    bigquery_project: str
    bigquery_dataset_gsc: str
    bigquery_dataset_seo: str
    google_application_credentials: str | None
    bing_wmt_api_key: str | None
    pagespeed_api_key: str | None
    site_url: str


def load_config() -> JobConfig:
    """Read all SEO-ingest env vars from the environment.

    No env var is mandatory at load time; the caller validates the
    specific subset it needs via `require_secret` right before use.
    This keeps unit tests free from environment setup.
    """
    return JobConfig(
        bigquery_project=os.getenv("BIGQUERY_PROJECT", "cercol"),
        bigquery_dataset_gsc=os.getenv("BIGQUERY_DATASET_GSC", "searchconsole"),
        bigquery_dataset_seo=os.getenv("BIGQUERY_DATASET_SEO", "cercol_seo"),
        google_application_credentials=os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
        bing_wmt_api_key=os.getenv("BING_WMT_API_KEY"),
        pagespeed_api_key=os.getenv("PAGESPEED_API_KEY"),
        site_url=os.getenv("SEO_SITE_URL", "https://cercol.team/"),
    )


class MissingSecret(RuntimeError):
    """Raised when a job-specific secret is missing at runtime."""


def require_secret(name: str, value: str | None) -> str:
    """Return `value` or raise `MissingSecret` with an operator-friendly message.

    Use at the entry of each ingest job, AFTER `load_config()`. Failing
    here gives a clear log line in the cron mail; failing inside the
    Google client gives an opaque traceback.
    """
    if not value:
        raise MissingSecret(
            f"Required secret {name!r} is not set. Define it in /home/cercol/.env "
            f"on the production server (see docs/ops/runbook.md)."
        )
    return value


def table_id(cfg: JobConfig, table: str, *, dataset: str | None = None) -> str:
    """Build a fully-qualified BigQuery table id `project.dataset.table`.

    Defaults to the `cercol_seo` dataset (our writes). Pass
    `dataset=cfg.bigquery_dataset_gsc` to address the GSC bulk export.
    """
    ds = dataset or cfg.bigquery_dataset_seo
    return f"{cfg.bigquery_project}.{ds}.{table}"
