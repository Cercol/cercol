"""Unify statistical decimals to the German comma across the reviewed corpus.

Deliberately narrow. It only rewrites a number that sits immediately after a
statistics operator (r = .31, d < 0.15, beta = -0.29), which is the one place
the reviewers disagreed with each other. Everything else keeps its dot:
DOIs, URLs, version numbers and, above all, SVG coordinates, where a comma
would silently break the geometry.

Idempotent: a number that already uses a comma does not match.
"""
import pathlib
import re
import sys

OUT = pathlib.Path(__file__).parent / "out"

# r = .31 / r = 0,31 / d < 0.15 / beta = -0.29 / M = 3.4 / SD = 0.72
STAT = re.compile(
    r'(?P<sym>\b(?:r|d|g|p|M|SD|ES|β|beta|ρ|rho|R²|R2)\s*(?:=|≈|<|>|≤|≥)\s*)'
    r'(?P<sign>[-−+]?)(?P<int>\d*)\.(?P<frac>\d+)'
)

SVG_LINE = re.compile(r'<(svg|path|rect|circle|line|text|g|polyline|polygon)\b', re.I)


def convert(text: str) -> tuple[str, int]:
    out, hits = [], 0
    in_code = False
    for line in text.split("\n"):
        if line.lstrip().startswith("```"):
            in_code = not in_code
        # SVG geometry and fenced code keep their dots.
        if in_code or SVG_LINE.search(line):
            out.append(line)
            continue
        new, n = STAT.subn(
            lambda m: f"{m['sym']}{m['sign']}{m['int'] or '0'},{m['frac']}", line
        )
        hits += n
        out.append(new)
    return "\n".join(out), hits


def main() -> int:
    apply = "--apply" in sys.argv
    total, touched = 0, 0
    for path in sorted(OUT.glob("*.md")):
        text = path.read_text()
        new, n = convert(text)
        if n:
            touched += 1
            total += n
            if apply:
                path.write_text(new)
    print(f"{'applied' if apply else 'would change'} {total} numbers in {touched} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
