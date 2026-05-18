// Metric cards in Word — a single-row N-column table with bold value and
// uppercase label. Optional severity accents the value colour and the top
// edge of the card.

import { AlignmentType, Table, TableRow, WidthType } from 'docx';
import type { MetricCard } from '../types';
import { PALETTE, SEVERITY_TOKENS, TYPE, FONTS } from '../theme';
import { cell, paragraph, run, uniformBorders } from './docx-primitives';

export function metricCards(cards: MetricCard[]): Table {
  if (cards.length === 0) {
    // Degenerate but valid — emit a 1-cell spacer so the caller still gets
    // a placeholder.
    cards = [{ label: '—', value: '—' }];
  }
  const cellWidthPct = Math.floor(100 / cards.length);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: uniformBorders(PALETTE.line),
    rows: [
      new TableRow({
        cantSplit: true,
        children: cards.map((c) => {
          const accent = c.severity ? SEVERITY_TOKENS[c.severity] : null;
          return cell(
            [
              paragraph(
                [run(c.label.toUpperCase(), {
                  bold: true,
                  color: PALETTE.muted,
                  size: TYPE.metricLabel.docx,
                  characterSpacing: 80,
                })],
                { alignment: AlignmentType.CENTER, before: 60, after: 60 },
              ),
              paragraph(
                [run(c.value, {
                  bold: true,
                  font: FONTS.display,
                  color: accent ? accent.text : PALETTE.navy,
                  size: TYPE.metricValue.docx,
                })],
                { alignment: AlignmentType.CENTER, before: 0, after: 40 },
              ),
              ...(c.hint
                ? [
                    paragraph(
                      [run(c.hint, { color: PALETTE.muted, size: TYPE.small.docx })],
                      { alignment: AlignmentType.CENTER, before: 0, after: 60 },
                    ),
                  ]
                : []),
            ],
            {
              widthPct: cellWidthPct,
              fill: PALETTE.surface,
              borderColor: PALETTE.line,
              padTop: 160,
              padBottom: 160,
              padLeft: 100,
              padRight: 100,
            },
          );
        }),
      }),
    ],
  });
}
