// One-off generator: builds the social-share preview image (the Open Graph
// card) at 1200×630 PNG and writes it to public/og-image.png.
//
// Re-run with `npm run generate:og-image` if the brand changes (palette,
// disc artwork, product name, framework list).
//
// Composition: navy background with the half-shaded "30" disc on the left,
// the product name in serif on the right, a one-line descriptor below,
// and a tracked framework strip across the foot of the card.

import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const glyphsPath = path.join(root, 'src', 'components', 'brand-glyphs.ts');
const outPath = path.join(root, 'public', 'og-image.png');

const glyphsSrc = readFileSync(glyphsPath, 'utf8');
const m3 = glyphsSrc.match(/BRAND_3_PATH = "([^"]+)"/);
const m0 = glyphsSrc.match(/BRAND_0_PATH = "([^"]+)"/);
if (!m3 || !m0) throw new Error('Could not extract glyph paths from brand-glyphs.ts');
const PATH_3 = m3[1];
const PATH_0 = m0[1];

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0b2545"/>
      <stop offset="100%" stop-color="#081a35"/>
    </linearGradient>
    <clipPath id="og-disc"><circle cx="32" cy="32" r="30"/></clipPath>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Disc, large, on the left -->
  <g transform="translate(110, 165) scale(4.5)">
    <g clip-path="url(#og-disc)">
      <rect x="0" y="0" width="32" height="64" fill="#0b2545"/>
      <rect x="32" y="0" width="32" height="64" fill="#ffffff"/>
      <line x1="32" y1="2" x2="32" y2="62" stroke="#0b2545" stroke-width="1.5" stroke-opacity="0.65"/>
    </g>
    <circle cx="32" cy="32" r="30" fill="none" stroke="#ffffff" stroke-width="1.5"/>
    <path fill="#ffffff" d="${PATH_3}"/>
    <path fill="#0b2545" d="${PATH_0}"/>
  </g>

  <!-- Eyebrow -->
  <text x="500" y="225" font-family="Georgia, serif" font-weight="500"
        font-size="22" fill="#c5d1e3" letter-spacing="6">CIRP</text>

  <!-- Title, two lines -->
  <text x="500" y="305" font-family="Georgia, 'Times New Roman', serif"
        font-weight="700" font-size="64" fill="#ffffff">Cyber Incident</text>
  <text x="500" y="380" font-family="Georgia, 'Times New Roman', serif"
        font-weight="700" font-size="64" fill="#ffffff">Response Planner</text>

  <!-- Subtitle -->
  <text x="500" y="440" font-family="Helvetica, Arial, sans-serif"
        font-weight="500" font-size="26" fill="#c5d1e3">Free planning tool for Welsh schools and colleges</text>

  <!-- Foot strip -->
  <rect x="0" y="555" width="1200" height="75" fill="#081a35"/>
  <line x1="0" y1="555" x2="1200" y2="555" stroke="#1a2f54" stroke-width="1"/>
  <text x="110" y="602" font-family="Helvetica, Arial, sans-serif"
        font-weight="600" font-size="15" fill="#c5d1e3" letter-spacing="3">NCSC  ·  LLYWODRAETH CYMRU  ·  ESTYN  ·  TARIAN  ·  ICO  ·  CYBER ESSENTIALS  ·  HWB</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  background: '#0b2545',
});
const png = resvg.render().asPng();
writeFileSync(outPath, png);
console.log(`Wrote ${outPath} (${png.length.toLocaleString()} bytes, 1200x630)`);