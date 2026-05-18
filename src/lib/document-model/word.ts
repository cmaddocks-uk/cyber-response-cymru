// docx exporter — renders an IncidentReport tree to a real .docx file.
// Composition only. Every visual primitive lives in components/ and reads
// its colours, fonts, and spacing from theme.ts so the output stays in
// lockstep with the HTML renderer.
//
// Dynamic-imported from the toolbars: the ~370 KB library never enters the
// main bundle.

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  TableCell,
  TextRun,
  PageOrientation,
  WidthType,
  convertInchesToTwip,
  type Table,
} from 'docx';
import { brandDiscBytes } from './brand-image';
import { Table as DocxTable, TableRow as DocxTableRow } from 'docx';
import type {
  Block,
  BodySection,
  CoverSection,
  IncidentReport,
  Section,
} from './types';
import { FONTS, PALETTE, TYPE } from './theme';

// Components
import { coverContent } from './components/cover';
import { dataTable, keyValueTable } from './components/tables';
import { callout as calloutBlock } from './components/callouts';
import { metricCards } from './components/cards';
import { progressBar } from './components/progress';
import { timeline } from './components/timeline';
import { divider } from './components/dividers';
import { paragraph, run } from './components/docx-primitives';

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

/** Browser entry — builds the Document, packs to a Blob, triggers a download. */
export async function exportReportToWord(report: IncidentReport): Promise<void> {
  const doc = buildDocxDocument(report);
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${report.filenameBase}.docx`);
}

/** Pure Document builder — shared by the browser exporter and the Node-side
 *  examples generator. Returns a docx Document; callers choose how to pack
 *  it (Blob in the browser, Buffer on Node). */
export function buildDocxDocument(report: IncidentReport): Document {
  const children: (Paragraph | Table)[] = [];
  for (const section of report.sections) {
    children.push(...renderSection(section));
  }

  return new Document({
    creator: 'Cyber Incident Response Planner',
    title: report.documentTitle,
    description: report.documentTitle,
    numbering: {
      config: [
        {
          reference: 'ordered',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.START,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: FONTS.body, size: TYPE.body.docx, color: PALETTE.ink },
          paragraph: { spacing: { line: 320, before: 0, after: 100 } },
        },
        heading1: {
          run: { font: FONTS.display, size: TYPE.h1.docx, bold: true, color: PALETTE.navy },
          paragraph: { spacing: { before: 320, after: 120 } },
        },
        heading2: {
          run: { font: FONTS.display, size: TYPE.h2.docx, bold: true, color: PALETTE.navy },
          paragraph: { spacing: { before: 240, after: 100 } },
        },
        heading3: {
          run: { font: FONTS.display, size: TYPE.h3.docx, bold: true, color: PALETTE.navy2 },
          paragraph: { spacing: { before: 180, after: 60 } },
        },
        heading4: {
          run: { font: FONTS.body, size: TYPE.h4.docx, bold: true, color: PALETTE.navy2 },
          paragraph: { spacing: { before: 140, after: 40 } },
        },
      },
    },
    sections: [
      {
        properties: {
          titlePage: true,
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: {
              top: convertInchesToTwip(0.7),
              bottom: convertInchesToTwip(0.7),
              left: convertInchesToTwip(0.6),
              right: convertInchesToTwip(0.6),
            },
          },
        },
        children,
        // `titlePage: true` + `first:` only — the disc shows on the cover
        // page only; pages 2+ have no header.
        headers: { first: docHeader() },
        footers: report.footer ? { default: docFooter(report.footer) } : undefined,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Section dispatch
// ---------------------------------------------------------------------------

function renderSection(section: Section): (Paragraph | Table)[] {
  return section.kind === 'cover' ? coverContent(section, decodeDataUri(section.logo)) : renderBody(section);
}

function renderBody(body: BodySection): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];

  // Section heading with a thin navy underline rule.
  out.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: PALETTE.navy, space: 6 } },
      children: [new TextRun({ text: body.title })],
    }),
  );
  if (body.lede) {
    out.push(
      paragraph(
        [run(body.lede, { italics: true, color: PALETTE.muted, size: TYPE.small.docx })],
        { before: 0, after: 160 },
      ),
    );
  }
  for (const block of body.blocks) {
    out.push(...renderBlock(block));
  }
  return out;
}

function renderBlock(block: Block): (Paragraph | Table)[] {
  switch (block.kind) {
    case 'heading': {
      const level = block.level === 2 ? HeadingLevel.HEADING_2
        : block.level === 3 ? HeadingLevel.HEADING_3
        : HeadingLevel.HEADING_4;
      return [new Paragraph({ heading: level, children: [new TextRun({ text: block.text })] })];
    }
    case 'paragraph': {
      // A "paragraph" with a callout severity is treated as a callout — same
      // semantic intent, just a styled paragraph rather than a separate type.
      if (block.callout) return [calloutBlock(block.callout, block.text)];
      // Multi-line content (playbook school-specific notes, comms templates,
      // any "Label: value" block) splits on double-newlines into separate
      // paragraphs and uses `break: 1` on TextRuns for single newlines within.
      // Without this, every newline collapses to a space and structured
      // notes render as one long run-on sentence.
      const paragraphs = block.text.split(/\r?\n\s*\r?\n/);
      return paragraphs.map((para) => {
        const lines = para.split(/\r?\n/);
        const children = lines.map((line, i) =>
          i === 0 ? run(line) : new TextRun({ text: line, break: 1 }),
        );
        return paragraph(children);
      });
    }
    case 'callout':
      return [calloutBlock(block.severity, block.body, block.title)];
    case 'bullets':
      return block.items.map((item) =>
        new Paragraph({
          bullet: block.ordered ? undefined : { level: 0 },
          numbering: block.ordered ? { reference: 'ordered', level: 0 } : undefined,
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: item })],
        }),
      );
    case 'keyValue':
      return [keyValueTable(block.rows)];
    case 'table':
      return [dataTable(block)];
    case 'spacer':
      return [new Paragraph({ children: [], spacing: { before: 80, after: 80 } })];
    case 'metricCards':
      return [metricCards(block.cards)];
    case 'progress':
      return [progressBar(block)];
    case 'timeline':
      return [timeline(block.events)];
    case 'divider':
      return [divider(block.label)];
  }
}

// ---------------------------------------------------------------------------
// Header + Footer + utilities
// ---------------------------------------------------------------------------

/** Page header — bare CIRP disc at top-left, repeating on every page like
 *  a corporate letterhead. PNG bytes come from the generated
 *  `brand-image.ts` (pre-rasterised so the pipeline does not need a runtime
 *  SVG renderer in the browser). */
function docHeader(): Header {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 0, after: 0 },
        children: [
          new ImageRun({
            data: brandDiscBytes(),
            transformation: { width: 32, height: 32 },
            type: 'png',
          }),
        ],
      }),
    ],
  });
}

function docFooter(text: string): Footer {
  // Two-column footer table: school name on the left, "Page X of Y" on the
  // right. Implemented as a borderless table because Word footers don't
  // support multi-element flex layouts in any other way.
  const footerTable = new DocxTable({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: PALETTE.line },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right:  { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideVertical:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    rows: [
      new DocxTableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: { top: 60, bottom: 60, left: 0, right: 0 },
            borders: {
              top:    { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              left:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right:  { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: 0, after: 0 },
                children: [
                  run(text, { color: PALETTE.muted, size: TYPE.micro.docx }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: { top: 60, bottom: 60, left: 0, right: 0 },
            borders: {
              top:    { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              left:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right:  { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 0 },
                children: [
                  run('Page ', { color: PALETTE.muted, size: TYPE.micro.docx }),
                  new TextRun({ children: [PageNumber.CURRENT], color: PALETTE.navy2, size: TYPE.micro.docx, bold: true }),
                  run(' of ', { color: PALETTE.muted, size: TYPE.micro.docx }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], color: PALETTE.navy2, size: TYPE.micro.docx, bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  return new Footer({ children: [footerTable] });
}

function decodeDataUri(
  dataUri: string,
): { bytes: Uint8Array; type: 'png' | 'jpg'; width?: number; height?: number } | null {
  const match = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/.exec(dataUri);
  if (!match) return null;
  const mime = match[1]!.toLowerCase();
  const b64 = match[2]!;
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const type: 'png' | 'jpg' = mime === 'png' ? 'png' : 'jpg';
    const dims = type === 'png' ? pngDimensions(bytes) : jpegDimensions(bytes);
    return { bytes, type, ...(dims ?? {}) };
  } catch {
    return null;
  }
}

/** Read width + height from a PNG byte stream. PNG IHDR chunk follows the
 *  8-byte signature; width is at offset 16, height at offset 20, each a
 *  big-endian uint32. Returns null on a malformed header. */
function pngDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 24) return null;
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) return null;
  const width  = (bytes[16]! << 24) | (bytes[17]! << 16) | (bytes[18]! << 8) | bytes[19]!;
  const height = (bytes[20]! << 24) | (bytes[21]! << 16) | (bytes[22]! << 8) | bytes[23]!;
  return width > 0 && height > 0 ? { width, height } : null;
}

/** Read width + height from a JPEG byte stream. Scans for an SOFn marker
 *  (FFC0–FFC3, FFC5–FFC7, FFC9–FFCB, FFCD–FFCF) and reads height + width
 *  from the segment. Returns null if no SOF marker is found. */
function jpegDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 4) return null;
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null; // SOI marker
  let i = 2;
  while (i < bytes.length - 1) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = bytes[i + 1]!;
    // SOFn markers carry frame info — but skip SOF4 (=0xC4, DHT) and SOFA-D
    // (DAC, DNL, DRI, etc.) which collide in the 0xC4–0xCC range.
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSof) {
      const height = (bytes[i + 5]! << 8) | bytes[i + 6]!;
      const width  = (bytes[i + 7]! << 8) | bytes[i + 8]!;
      return width > 0 && height > 0 ? { width, height } : null;
    }
    // Not a frame header — skip the segment using its length field (2 bytes BE,
    // includes the length bytes themselves).
    const segLen = (bytes[i + 2]! << 8) | bytes[i + 3]!;
    i += 2 + segLen;
  }
  return null;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
