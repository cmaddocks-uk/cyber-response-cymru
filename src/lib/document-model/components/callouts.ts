// Severity-tinted callouts in Word — a tight Table that hosts an accent left
// border, a tinted fill, optional bold title and a body paragraph. Using a
// Table (rather than a Paragraph with `border: left`) lets the whole callout
// keep cantSplit semantics so it never splits across a page break.

import { Table, TableRow, WidthType } from 'docx';
import { SEVERITY_TOKENS, TYPE, FONTS } from '../theme';
import type { Severity } from '../types';
import { cell, paragraph, run } from './docx-primitives';

export function callout(severity: Severity, body: string, title?: string): Table {
  const t = SEVERITY_TOKENS[severity];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          // Left accent bar.
          cell([paragraph([], { before: 0, after: 0 })], {
            widthPct: 1.5,
            fill: t.text,
            noBorders: true,
            padTop: 0,
            padBottom: 0,
            padLeft: 0,
            padRight: 0,
          }),
          // Body.
          cell(
            [
              ...(title
                ? [
                    paragraph([
                      run(title, { bold: true, color: t.text, font: FONTS.body, size: TYPE.small.docx, characterSpacing: 40 }),
                    ], { before: 0, after: 40 }),
                  ]
                : []),
              paragraph([run(body, { color: t.text, size: TYPE.body.docx })], { before: 0, after: 0 }),
            ],
            {
              widthPct: 98.5,
              fill: t.fill,
              noBorders: true,
              padTop: 140,
              padBottom: 140,
              padLeft: 200,
              padRight: 200,
            },
          ),
        ],
      }),
    ],
  });
}
