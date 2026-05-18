// One-off generator for the iOS home-screen icon. 180×180 PNG with a flat
// solid-navy background and a bold serif "30" centred — iOS applies its
// own rounded-square mask on top, so the icon is left as a square here.
//
// Re-run with `npm run generate:apple-icon` if the brand changes.

import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outPath = path.join(root, 'public', 'apple-touch-icon.png');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect width="180" height="180" fill="#0f1a2a"/>
  <text x="90" y="90" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'Times New Roman', serif" font-weight="700"
        font-size="118" letter-spacing="-5" fill="#ffffff">30</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 180 },
  background: '#0f1a2a',
});
const png = resvg.render().asPng();
writeFileSync(outPath, png);
console.log(`Wrote ${outPath} (${png.length.toLocaleString()} bytes, 180x180)`);
