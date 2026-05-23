#!/usr/bin/env python3
"""
Generate the Cercol social-card og:image (1200x630 PNG).

# Spec: docs/architecture/seo-pipeline.md

Brand specification (mm-design palette):
- Background: #0047ba blue.
- Accent: #cf3339 red (small circle), #f1c22f yellow (small circle),
  #427c42 green (small circle). The four-circle motif echoes the
  Cercol logo without copying it.
- Title typography: Playfair Display Bold (display).
- Subtitle typography: Roboto Regular.

The script downloads the font files from Google Fonts on first run and
caches them under scripts/.og_fonts/. The output overwrites
public/og-image.png. Re-run any time to refresh.

This is the FIRST version; the design is intentionally simple and
re-generatable. Phase 17.6.7 may add per-route variants (title pulled
from the page meta).
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT = REPO_ROOT / "public" / "og-image.png"
FONT_DIR = REPO_ROOT / "scripts" / ".og_fonts"

# Direct TTF URLs from fonts.gstatic.com. Versioned (v40, v51) so the
# look is stable across script reruns. To refresh fonts: query
# `https://fonts.googleapis.com/css2?family=...&display=swap` with a
# real User-Agent and copy the gstatic URL out of the @font-face rule.
FONT_URLS = {
    "PlayfairDisplay-Bold.ttf": (
        "https://fonts.gstatic.com/s/playfairdisplay/v40/"
        "nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf"
    ),
    "Roboto-Regular.ttf": (
        "https://fonts.gstatic.com/s/roboto/v51/"
        "KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbWmT.ttf"
    ),
}

WIDTH = 1200
HEIGHT = 630

# Cercol brand palette (mm-design).
BG = "#0047ba"
WHITE = "#ffffff"
WHITE_70 = (255, 255, 255, 178)
RED = "#cf3339"
YELLOW = "#f1c22f"
GREEN = "#427c42"


def _ensure_fonts() -> dict[str, Path]:
    """Download font files once and return the local paths.

    Uses curl to dodge macOS Python's missing-CA-bundle issue. Curl
    ships with the system's trust store and follows redirects.
    """
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    paths = {}
    for name, url in FONT_URLS.items():
        local = FONT_DIR / name
        if not local.is_file():
            print(f"  downloading {name} ...")
            subprocess.run(
                ["curl", "-sSL", "-o", str(local), url],
                check=True,
            )
        paths[name] = local
    return paths


def _draw() -> Image.Image:
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img, mode="RGBA")

    fonts = _ensure_fonts()
    f_title = ImageFont.truetype(str(fonts["PlayfairDisplay-Bold.ttf"]), 96)
    f_subtitle = ImageFont.truetype(str(fonts["Roboto-Regular.ttf"]), 36)
    f_tag = ImageFont.truetype(str(fonts["Roboto-Regular.ttf"]), 24)

    # Four-circle motif top-left echoes the lunar phases on the site.
    cy = 120
    cx_start = 100
    spacing = 50
    radius = 18
    palette = [WHITE, RED, YELLOW, GREEN]
    for i, color in enumerate(palette):
        cx = cx_start + i * spacing
        draw.ellipse(
            (cx - radius, cy - radius, cx + radius, cy + radius),
            fill=color,
        )

    # Tag line, top-right.
    tag = "OPEN SOURCE - BIG FIVE - FREE"
    bbox = draw.textbbox((0, 0), tag, font=f_tag)
    tag_w = bbox[2] - bbox[0]
    draw.text(
        (WIDTH - 100 - tag_w, cy - 12),
        tag,
        font=f_tag,
        fill=WHITE_70,
    )

    # Main title, two lines (manually wrapped for predictable layout).
    title_line1 = "Cercol"
    title_line2 = "Team personality assessment"

    # Position title roughly in the middle-left.
    draw.text((100, 240), title_line1, font=f_title, fill=WHITE)

    # The subtitle sits under the title with a colored accent bar.
    bar_top = 360
    bar_h = 60
    draw.rectangle(
        (100, bar_top, 100 + 6, bar_top + bar_h),
        fill=RED,
    )
    draw.text(
        (130, 365),
        title_line2,
        font=f_subtitle,
        fill=WHITE,
    )

    # Footer URL, bottom-left.
    draw.text((100, HEIGHT - 90), "cercol.team", font=f_subtitle, fill=WHITE_70)

    return img


def main() -> int:
    print(f"generating {OUT.relative_to(REPO_ROOT)} ({WIDTH}x{HEIGHT}) ...")
    img = _draw()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, format="PNG", optimize=True)
    size_kb = OUT.stat().st_size / 1024
    print(f"  wrote {OUT} ({size_kb:.1f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
