// Low-level docx primitives. Pure presentation helpers — no document-model
// knowledge. Wrap docx's verbose APIs into single-call helpers the higher-
// level renderers (badges, cards, tables, callouts, timeline) compose.

import {
  AlignmentType,
  BorderStyle,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type IShadingAttributesProperties,
  type ITableBordersOptions,
  type ParagraphChild,
} from 'docx';
import { FONTS, PALETTE, SPACE, TYPE } from '../theme';

// ---------------------------------------------------------------------------
// Borders
// ---------------------------------------------------------------------------

/** Thin uniform borders in a single colour. */
export function uniformBorders(color: string, size = 4): ITableBordersOptions {
  const b = { style: BorderStyle.SINGLE, size, color };
  return { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b };
}

/** No visible borders — used for layout tables (cover meta, card grids). */
export const NO_BORDERS: ITableBordersOptions = {
  top:    { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right:  { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideVertical:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

// ---------------------------------------------------------------------------
// Cells
// ---------------------------------------------------------------------------

export interface CellOpts {
  widthPct?: number;
  widthDxa?: number;
  fill?: string;
  borderColor?: string;
  noBorders?: boolean;
  padTop?: number;
  padBottom?: number;
  padLeft?: number;
  padRight?: number;
}

/** Build a TableCell with sensible defaults. */
export function cell(children: (Paragraph | Table)[], opts: CellOpts = {}): TableCell {
  const shading: IShadingAttributesProperties | undefined = opts.fill
    ? { type: ShadingType.CLEAR, fill: opts.fill, color: 'auto' }
    : undefined;
  return new TableCell({
    width: opts.widthPct != null
      ? { size: opts.widthPct, type: WidthType.PERCENTAGE }
      : opts.widthDxa != null
        ? { size: opts.widthDxa, type: WidthType.DXA }
        : undefined,
    shading,
    margins: {
      top: opts.padTop ?? SPACE.cellPadTop,
      bottom: opts.padBottom ?? SPACE.cellPadBottom,
      left: opts.padLeft ?? SPACE.cellPadLeft,
      right: opts.padRight ?? SPACE.cellPadRight,
    },
    borders: opts.noBorders ? NO_BORDERS : opts.borderColor ? uniformBorders(opts.borderColor) : undefined,
    children,
  });
}

// ---------------------------------------------------------------------------
// Runs / paragraphs
// ---------------------------------------------------------------------------

export interface RunOpts {
  bold?: boolean;
  italics?: boolean;
  color?: string;
  font?: string;
  size?: number;
  characterSpacing?: number;
  underline?: boolean;
}

export function run(text: string, opts: RunOpts = {}): TextRun {
  return new TextRun({
    text,
    font: opts.font ?? FONTS.body,
    color: opts.color ?? PALETTE.ink,
    size: opts.size ?? TYPE.body.docx,
    bold: opts.bold,
    italics: opts.italics,
    characterSpacing: opts.characterSpacing,
    underline: opts.underline ? {} : undefined,
  });
}

export function paragraph(children: ParagraphChild[], opts: {
  alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
  before?: number;
  after?: number;
  fill?: string;
  indentLeft?: number;
  indentRight?: number;
  leftBar?: { color: string; size?: number };
} = {}): Paragraph {
  const indent =
    opts.indentLeft != null || opts.indentRight != null
      ? {
          ...(opts.indentLeft != null ? { left: opts.indentLeft } : {}),
          ...(opts.indentRight != null ? { right: opts.indentRight } : {}),
        }
      : undefined;
  return new Paragraph({
    alignment: opts.alignment,
    spacing: { before: opts.before, after: opts.after },
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill, color: 'auto' } : undefined,
    indent,
    border: opts.leftBar
      ? { left: { style: BorderStyle.SINGLE, size: opts.leftBar.size ?? 24, color: opts.leftBar.color, space: 8 } }
      : undefined,
    children,
  });
}

export function textParagraph(text: string, runOpts: RunOpts = {}, paraOpts: Parameters<typeof paragraph>[1] = {}): Paragraph {
  return paragraph([run(text, runOpts)], paraOpts);
}

// ---------------------------------------------------------------------------
// Row helper
// ---------------------------------------------------------------------------

export function row(cells: TableCell[], opts: { cantSplit?: boolean; tableHeader?: boolean } = {}): TableRow {
  return new TableRow({
    cantSplit: opts.cantSplit ?? true,
    tableHeader: opts.tableHeader,
    children: cells,
  });
}
