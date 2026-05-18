// Timeline in Word — two-column Table with a left "time" column (~16% wide)
// and a body column carrying a severity dot, title, and optional body.
// Page-safe (every row keeps `cantSplit: true`) and grayscale-legible (the
// dot uses both a coloured glyph and a bold colour on the title text).

import { Table, TableRow, WidthType } from 'docx';
import { SEVERITY_TOKENS, PALETTE, TYPE, FONTS } from '../theme';
import type { TimelineEvent } from '../types';
import { cell, paragraph, run, uniformBorders } from './docx-primitives';

export function timeline(events: TimelineEvent[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: uniformBorders(PALETTE.lineSoft),
    rows: events.map((evt) => {
      const tok = evt.severity ? SEVERITY_TOKENS[evt.severity] : SEVERITY_TOKENS.navy;
      const titleRuns = [
        run(`${tok.symbol}  `, { bold: true, color: tok.text, size: TYPE.body.docx }),
        run(evt.title, { bold: true, color: PALETTE.navy, font: FONTS.body, size: TYPE.body.docx }),
      ];
      return new TableRow({
        cantSplit: true,
        children: [
          cell(
            [paragraph([run(evt.time, { color: PALETTE.muted, bold: true, size: TYPE.small.docx, characterSpacing: 40 })], { before: 0, after: 0 })],
            { widthPct: 16, fill: PALETTE.surface, borderColor: PALETTE.lineSoft, padTop: 100, padBottom: 100 },
          ),
          cell(
            [
              paragraph(titleRuns, { before: 0, after: evt.body ? 40 : 0 }),
              ...(evt.body
                ? [paragraph([run(evt.body, { color: PALETTE.inkSoft, size: TYPE.small.docx })], { before: 0, after: 0 })]
                : []),
            ],
            { widthPct: 84, borderColor: PALETTE.lineSoft, padTop: 100, padBottom: 100 },
          ),
        ],
      });
    }),
  });
}
