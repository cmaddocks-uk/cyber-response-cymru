// Editorial cover page (v2.5.2).
//
// The brief: feel like a Big Four advisory cover or a UK government
// strategy paper. Authority through restraint. Typography and whitespace
// do the work; no cards, no panels, no coloured boxes, no gradients.
//
// Layout (top → bottom):
//
//     [logo · top third · 220 × 100 box · aspect ratio preserved]
//
//
//
//     Cyber Incident Response Plan            ← Fraunces, bold, navy
//     Park Community School                    ← IBM Plex Sans medium
//     Prepared for Governors & Senior Leadership   ← small, muted
//
//
//
//     Version 1.0  •  Approved 15 May 2026  •  Next review 17 May 2027
//     (single inline metadata row, no labels, no cards)
//
//                          (whitespace)
//
//                              ────
//                   Prepared by Park Community School
//
// Removed in this revision (vs v2.5.1):
//   - "May 2026" prepared-date line under the audience
//   - "CONFIDENTIAL INTERNAL DOCUMENT" tracked-caps line at the bottom
//   - "Prepared using the Cyber Incident Response Planner" attribution
//
// Added in this revision:
//   - Single inline metadata row (Version • Approved • Next review)
//   - Thin narrow divider above the "Prepared by …" footer
//   - "Prepared by [school name]" sitting at the foot of the page
//
// Architecture untouched: page break after cover preserved, footer (school
// name + page X of Y) untouched, dynamic-import pipeline untouched.

import {
  AlignmentType,
  BorderStyle,
  ImageRun,
  Paragraph,
  Table,
} from 'docx';
import { PALETTE, TYPE, FONTS } from '../theme';
import type { CoverSection } from '../types';
import { paragraph, run } from './docx-primitives';

export interface DecodedImage {
  bytes: Uint8Array;
  type: 'png' | 'jpg';
  /** Original pixel dimensions; used to scale within the cover's bounding
   *  box preserving aspect ratio. */
  width?: number;
  height?: number;
}

/** Logo bounding box on the cover. 220 × 100 px. Aspect ratio preserved. */
const LOGO_BOX = { width: 220, height: 100 };

/** Twips of vertical whitespace pushed before the bottom block so the
 *  "Prepared by …" line lands near the foot of an A4-portrait page at 0.7
 *  inch margins. Calibrated empirically against the hero block height. */
const BOTTOM_PUSH_TWIPS = 8400;

/** Caller appends the returned children to `Document.sections[0].children`. */
export function coverContent(cover: CoverSection, decodedLogo: DecodedImage | null): (Paragraph | Table)[] {
  const metaRow = formatMetaRow(cover.meta);
  const preparedBy = derivePreparedBy(cover.subtitle);

  return [
    logoParagraph(decodedLogo),
    titleParagraph(cover.title),
    ...(cover.subtitle ? [subtitleParagraph(cover.subtitle)] : []),
    preparedForParagraph(),
    ...(metaRow ? [metaRowParagraph(metaRow)] : []),
    bottomDivider(),
    preparedByParagraph(preparedBy),
    pageBreak(),
  ];
}

// ---------------------------------------------------------------------------
// Hero — top third
// ---------------------------------------------------------------------------

function logoParagraph(decoded: DecodedImage | null): Paragraph {
  if (!decoded) {
    // No logo — let the title area float lower so it reads as deliberate.
    return new Paragraph({ spacing: { before: 1800 }, children: [] });
  }
  const fit = fitWithin(decoded.width, decoded.height, LOGO_BOX.width, LOGO_BOX.height);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 720 },
    children: [
      new ImageRun({
        data: decoded.bytes,
        transformation: { width: fit.width, height: fit.height },
        type: decoded.type,
      }),
    ],
  });
}

// ---------------------------------------------------------------------------
// Middle — title block
// ---------------------------------------------------------------------------

function titleParagraph(text: string): Paragraph {
  return paragraph(
    [run(text, { bold: true, font: FONTS.display, color: PALETTE.navy, size: TYPE.coverTitle.docx })],
    { alignment: AlignmentType.CENTER, before: 0, after: 240 },
  );
}

function subtitleParagraph(text: string): Paragraph {
  // School name — IBM Plex Sans medium, NOT Fraunces.
  return paragraph(
    [run(text, { font: FONTS.body, color: PALETTE.navy2, size: TYPE.coverSubtitle.docx })],
    { alignment: AlignmentType.CENTER, before: 0, after: 200 },
  );
}

function preparedForParagraph(): Paragraph {
  return paragraph(
    [run('Prepared for Governors & Senior Leadership', {
      color: PALETTE.muted,
      font: FONTS.body,
      size: TYPE.small.docx,
    })],
    { alignment: AlignmentType.CENTER, before: 0, after: 720 },
  );
}

// ---------------------------------------------------------------------------
// Lower — single inline metadata row (no labels, no cards)
// ---------------------------------------------------------------------------

function metaRowParagraph(text: string): Paragraph {
  return paragraph(
    [run(text, {
      font: FONTS.body,
      color: PALETTE.muted,
      size: TYPE.small.docx,
      characterSpacing: 40,
    })],
    { alignment: AlignmentType.CENTER, before: 0, after: 0 },
  );
}

function formatMetaRow(meta: CoverSection['meta']): string {
  if (!meta) return '';
  return meta
    .map((m) => m.value.trim())
    .filter((v) => v !== '')
    .join('   •   ');
}

// ---------------------------------------------------------------------------
// Bottom — subtle divider + "Prepared by …" line
// ---------------------------------------------------------------------------

function bottomDivider(): Paragraph {
  // A narrow bottom border on an otherwise-empty paragraph. Big `before`
  // spacing pushes this near the foot of the page.
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: BOTTOM_PUSH_TWIPS, after: 200 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: PALETTE.line, space: 1 },
    },
    indent: { left: 3600, right: 3600 },
    children: [],
  });
}

function preparedByParagraph(schoolName: string): Paragraph {
  const text = schoolName ? `Prepared by ${schoolName}` : 'Prepared by the school';
  return paragraph(
    [run(text, {
      font: FONTS.body,
      color: PALETTE.muted,
      size: TYPE.micro.docx,
      italics: true,
    })],
    { alignment: AlignmentType.CENTER, before: 0, after: 0 },
  );
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [], pageBreakBefore: true });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Subtitle is "School Name · Trust Name" or just "School Name". The
 *  "Prepared by …" line wants only the school name, not the trust. */
export function derivePreparedBy(subtitle: string | undefined): string {
  if (!subtitle) return '';
  const first = subtitle.split('·')[0];
  return first ? first.trim() : '';
}

/** Fit (srcW × srcH) inside (maxW × maxH) without distortion. Falls back to
 *  the box size when source dimensions are unknown. Exported for unit tests. */
export function fitWithin(
  srcW: number | undefined,
  srcH: number | undefined,
  maxW: number,
  maxH: number,
): { width: number; height: number } {
  if (!srcW || !srcH || srcW <= 0 || srcH <= 0) {
    return { width: maxW, height: maxH };
  }
  const scale = Math.min(maxW / srcW, maxH / srcH, 1);
  return {
    width: Math.round(srcW * scale),
    height: Math.round(srcH * scale),
  };
}
