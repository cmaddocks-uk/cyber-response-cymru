// Premium data tables in Word — navy header with white text, zebra-striped
// body, refined padding, severity-tinted rows. tableHeader: true repeats
// the header on every page; cantSplit: true keeps each row whole.

import { Table, TableRow, WidthType } from 'docx';
import { PALETTE, SEVERITY_TOKENS, TABLE, TYPE, FONTS, SPACE } from '../theme';
import type { TableBlock } from '../types';
import { cell, paragraph, run, textParagraph, uniformBorders } from './docx-primitives';

const USABLE_WIDTH_DXA = 9000; // ≈ A4 portrait usable width at standard margins.

export function dataTable(block: TableBlock): Table {
  const colWidths = block.widths ?? block.columns.map(() => 1 / block.columns.length);
  const widthDxa = colWidths.map((w) => Math.round(w * USABLE_WIDTH_DXA));

  const header = new TableRow({
    cantSplit: true,
    tableHeader: true,
    children: block.columns.map((label, i) =>
      cell(
        [
          paragraph(
            [run(label.toUpperCase(), {
              bold: true,
              color: TABLE.headerText,
              font: FONTS.body,
              // Tighter than v2.3: narrow asset-register columns were wrapping
              // single words like "PRIORITY" / "INCIDENT CONTACT" awkwardly.
              size: TYPE.micro.docx,
              characterSpacing: 20,
            })],
            { before: 0, after: 0 },
          ),
        ],
        {
          widthDxa: widthDxa[i],
          fill: TABLE.headerFill,
          borderColor: TABLE.headerFill,
          padTop: 90,
          padBottom: 90,
        },
      ),
    ),
  });

  const bodyRows = block.rows.map((row, rowIdx) => {
    const tint = row.severity ? SEVERITY_TOKENS[row.severity].rowTint : (rowIdx % 2 === 1 ? TABLE.zebraTint : undefined);
    return new TableRow({
      cantSplit: true,
      children: row.cells.map((rawText, i) => {
        const isLeading = i === 0 && !!row.severity;
        const lines = rawText.split('\n');
        const paragraphs = lines.map((line, idx) =>
          textParagraph(line, {
            bold: isLeading && idx === 0,
            color: isLeading && idx === 0 ? SEVERITY_TOKENS[row.severity!].text : PALETTE.ink,
            size: TYPE.small.docx,
          }, { before: 0, after: idx < lines.length - 1 ? 20 : 0 }),
        );
        return cell(paragraphs, {
          widthDxa: widthDxa[i],
          fill: tint,
          borderColor: TABLE.borderSoft,
          padTop: 100,
          padBottom: 100,
        });
      }),
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: uniformBorders(TABLE.border, 4),
    rows: [header, ...bodyRows],
  });
}

/** Two-column label/value table. No header row; the label column is tinted. */
export function keyValueTable(rows: { label: string; value: string }[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: uniformBorders(TABLE.borderSoft, 4),
    rows: rows.map((r) =>
      new TableRow({
        cantSplit: true,
        children: [
          cell(
            [textParagraph(r.label, { bold: true, color: PALETTE.navy2, size: TYPE.small.docx })],
            { widthPct: 38, fill: TABLE.zebraTint, borderColor: TABLE.borderSoft, padTop: 100, padBottom: 100 },
          ),
          cell(
            [textParagraph(r.value || '—', { size: TYPE.small.docx })],
            { widthPct: 62, borderColor: TABLE.borderSoft, padTop: 100, padBottom: 100 },
          ),
        ],
      }),
    ),
  });
}

void SPACE;
