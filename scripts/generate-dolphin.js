#!/usr/bin/env node
// Cèrcol rice-grain dolphin — scale-fill model matching reference
// Body filled with grains like fish scales, tiled densely
// All grains rx=7, ry=3.5, rotated to follow local body curve
// J-shaped leap: head upper-right, body arcs down-right, tail enters water lower-right

const W = 800, H = 600, BG = '#0047ba';
const RX = 7, RY = 3.5;

const grains = [];

function add(cx, cy, angle, color) {
  if (cx < -10 || cx > W+10 || cy < -10 || cy > H+10) return;
  grains.push({ cx:+cx.toFixed(1), cy:+cy.toFixed(1), angle:+angle.toFixed(1), color });
}

function bez(t, p) {
  const u=1-t;
  return {
    x: u*u*u*p[0].x+3*u*u*t*p[1].x+3*u*t*t*p[2].x+t*t*t*p[3].x,
    y: u*u*u*p[0].y+3*u*u*t*p[1].y+3*u*t*t*p[2].y+t*t*t*p[3].y,
  };
}
function bezAng(t, p) {
  const u=1-t;
  const dx=3*u*u*(p[1].x-p[0].x)+6*u*t*(p[2].x-p[1].x)+3*t*t*(p[3].x-p[2].x);
  const dy=3*u*u*(p[1].y-p[0].y)+6*u*t*(p[2].y-p[1].y)+3*t*t*(p[3].y-p[2].y);
  return Math.atan2(dy, dx);
}

// Fill between two bezier curves with scale-tiled grains
function fillBody(topC, botC, steps, colorFn) {
  const rowH = RY * 2 + 1.5;
  const colW = RX * 2 + 1.5;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const top = bez(t, topC);
    const bot = bez(t, botC);
    const ang = bezAng(t, topC);
    const angDeg = ang * 180 / Math.PI;

    // Direction from top to bottom at this section
    const dx = bot.x - top.x, dy = bot.y - top.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const nRows = Math.max(1, Math.round(dist / rowH));

    for (let j = 0; j <= nRows; j++) {
      const frac = j / nRows;
      const cx = top.x + dx * frac;
      const cy = top.y + dy * frac;

      // Stagger odd rows for scale pattern
      const stX = (j % 2 === 1) ? Math.cos(ang) * colW * 0.45 : 0;
      const stY = (j % 2 === 1) ? Math.sin(ang) * colW * 0.45 : 0;

      add(cx + stX, cy + stY, angDeg, colorFn(t, frac));
    }
  }
}

// Bead row along a bezier
function beadRow(pts, count, color) {
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    const pt = bez(t, pts);
    const ang = bezAng(t, pts) * 180 / Math.PI;
    add(pt.x, pt.y, ang, color);
  }
}

// Fill oval area with tiled grains
function fillOval(cx, cy, rx, ry, color, altColor, altRatio) {
  const rowH = RY * 2 + 1.5;
  const colW = RX * 2 + 1.5;
  for (let r = Math.ceil(-ry/rowH); r <= Math.floor(ry/rowH); r++) {
    for (let c = Math.ceil(-rx/colW); c <= Math.floor(rx/colW); c++) {
      const stagger = (Math.abs(r) % 2 === 1) ? colW * 0.5 : 0;
      const px = c * colW + stagger;
      const py = r * rowH;
      if ((px*px)/(rx*rx) + (py*py)/(ry*ry) > 1) continue;
      const col = (Math.random() < altRatio) ? altColor : color;
      add(cx + px, cy + py, 0, col);
    }
  }
}

// === COLORS ===
const BODY = '#7a9ab5';
const BELLY = '#a8c4d4';
const DARK = '#1a1a2e';
const SPLASH = '#7ecfed';
const POOL = '#6b3a2a';

// ===================================================================
// DOLPHIN — J-shaped leaping posture
// Head at upper-right, body arcs forward (left) then curves down,
// tail at lower-right entering water
// Positioned right half of canvas like the reference
// ===================================================================

// The J-shape: head points upper-right (~1 o'clock),
// body curves leftward across the top, then sweeps down-right to tail

// Dorsal (top/back) contour — wide J-curve
// Head points right at ~2 o'clock, body arcs up-left then sweeps down
const dorsal = [
  {x: 660, y: 115},  // nose (pointing right)
  {x: 570, y: 55},   // forehead arcs up-left
  {x: 465, y: 95},   // mid-back (leftmost extent — wide arc)
  {x: 530, y: 400},  // tail stock (drops down, slightly right)
];

// Ventral (belly) contour — inner curve
const ventral = [
  {x: 670, y: 150},  // chin
  {x: 620, y: 115},  // throat
  {x: 545, y: 185},  // belly widest
  {x: 555, y: 390},  // tail stock lower
];

// Midline
const midline = [
  {x: 665, y: 132},
  {x: 595, y: 85},
  {x: 505, y: 140},
  {x: 542, y: 395},
];

// --- MAIN BODY FILL ---
fillBody(dorsal, ventral, 22, (t, frac) => {
  // Upper portion = darker body, lower = lighter belly
  if (frac < 0.4) return BODY;
  if (frac < 0.55) return '#8fb0c8'; // transition
  return BELLY;
});

// --- SNOUT extension ---
beadRow([
  {x: 660, y: 115},
  {x: 673, y: 120},
  {x: 684, y: 128},
  {x: 692, y: 138},
], 4, BELLY);

// --- MOUTH LINE (dark) ---
beadRow([
  {x: 688, y: 140},
  {x: 678, y: 136},
  {x: 668, y: 133},
  {x: 658, y: 130},
], 4, DARK);

// --- EYE ---
add(660, 120, 15, DARK);
add(662, 118, 30, '#333355');

// --- DORSAL FIN ---
// At t≈0.3 on dorsal, fin rises outward (left and up)
const finRoot = bez(0.3, dorsal);
beadRow([
  {x: finRoot.x, y: finRoot.y},
  {x: finRoot.x - 18, y: finRoot.y - 18},
  {x: finRoot.x - 30, y: finRoot.y - 35},
  {x: finRoot.x - 36, y: finRoot.y - 50},
], 5, BODY);
beadRow([
  {x: finRoot.x + 6, y: finRoot.y + 4},
  {x: finRoot.x - 10, y: finRoot.y - 12},
  {x: finRoot.x - 24, y: finRoot.y - 28},
  {x: finRoot.x - 30, y: finRoot.y - 42},
], 4, '#6a8da8');

// --- PECTORAL FIN ---
// At t≈0.25 on ventral, angles down-left
const pecRoot = bez(0.25, ventral);
beadRow([
  {x: pecRoot.x, y: pecRoot.y},
  {x: pecRoot.x - 18, y: pecRoot.y + 14},
  {x: pecRoot.x - 32, y: pecRoot.y + 26},
  {x: pecRoot.x - 42, y: pecRoot.y + 36},
], 5, BODY);
beadRow([
  {x: pecRoot.x - 6, y: pecRoot.y + 5},
  {x: pecRoot.x - 22, y: pecRoot.y + 18},
  {x: pecRoot.x - 35, y: pecRoot.y + 30},
  {x: pecRoot.x - 44, y: pecRoot.y + 40},
], 4, '#8aacbe');

// --- TAIL FLUKES ---
const tailPt = bez(0.97, midline);
// Right fluke
beadRow([
  {x: tailPt.x, y: tailPt.y},
  {x: tailPt.x + 14, y: tailPt.y + 10},
  {x: tailPt.x + 26, y: tailPt.y + 18},
  {x: tailPt.x + 36, y: tailPt.y + 24},
], 4, BODY);
// Left fluke
beadRow([
  {x: tailPt.x - 4, y: tailPt.y + 3},
  {x: tailPt.x - 16, y: tailPt.y + 13},
  {x: tailPt.x - 26, y: tailPt.y + 21},
  {x: tailPt.x - 34, y: tailPt.y + 27},
], 4, BODY);

// --- SPLASH ---
const splashCx = tailPt.x, splashCy = tailPt.y + 30;
for (let i = 0; i < 12; i++) {
  const a = -Math.PI * 0.6 + (i / 11) * Math.PI * 1.2;
  const r = 20 + Math.sin(i * 2.1) * 10;
  add(splashCx + Math.cos(a) * r, splashCy + Math.sin(a) * r * 0.35,
    a * 180 / Math.PI + 90, SPLASH);
}

// --- WATER POOL (oval at base) ---
fillOval(splashCx, splashCy + 50, 85, 28, POOL, SPLASH, 0.2);

// --- SPARKLE (lower-right corner) ---
add(720, 545, 45, '#ffffff');
add(720, 535, 0, '#ffffff');
add(720, 555, 0, '#ffffff');
add(710, 545, 90, '#ffffff');
add(730, 545, 90, '#ffffff');

// ===================================================================
// OUTPUT
// ===================================================================
let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n`;
svg += `  <rect width="${W}" height="${H}" fill="${BG}"/>\n`;
for (const g of grains) {
  svg += `  <ellipse cx="${g.cx}" cy="${g.cy}" rx="${RX}" ry="${RY}" fill="${g.color}" transform="rotate(${g.angle} ${g.cx} ${g.cy})"/>\n`;
}
svg += `</svg>\n`;

process.stdout.write(svg);
process.stderr.write(`Total grains: ${grains.length}\n`);
