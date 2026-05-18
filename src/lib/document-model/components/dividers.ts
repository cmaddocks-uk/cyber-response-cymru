// Section dividers in Word — a thin horizontal rule with an optional label.
// Rendered as a 1-cell Table for cleaner control over horizontal extent than
// Paragraph borders give us.

import { BorderStyle, Paragraph, Table, TableRow, WidthType } from 'docx';
import { PALETTE, TYPE, FONTS } from '../theme';
import { cell, paragraph, run } from './docx-primitives';

export function divider(label?: string): Table | Paragraph {
  if (!label) {
    return new Paragraph({
      spacing: { before: 200, after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: PALETTE.line, space: 1 } },
      children: [],
    });
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          cell(
            [
              paragraph(
                [run(label.toUpperCase(), {
                  color: PALETTE.muted,
                  bold: true,
                  font: FONTS.body,
                  size: TYPE.micro.docx,
                  characterSpacing: 120,
                })],
                {
                  before: 200,
                  after: 80,
                },
              ),
            ],
            { noBorders: true, padTop: 0, padBottom: 0, padLeft: 0, padRight: 0 },
          ),
        ],
      }),
    ],
  });
}
