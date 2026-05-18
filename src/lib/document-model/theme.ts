// Centralised export theme. Single source of truth for colours, typography,
// spacing and severity treatment, consumed by both the docx exporter and the
// HTML renderer. Keeping these here (rather than scattered as magic numbers)
// is what makes the two outputs visually agree.
//
// Colours are stored as hex strings *without* the leading "#". The docx
// library expects raw hex; the HTML renderer prepends "#" when emitting
// CSS / style attributes.

import type { Severity } from './types';

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

export const PALETTE = {
  // Ink — primary text / heading colours.
  navy:        '0B2545',
  navy2:       '13315C',
  ink:         '1F2937',
  inkSoft:     '374151',
  muted:       '5B6A82',
  mutedSoft:   '94A3B8',

  // Surface — backgrounds and panels.
  page:        'FFFFFF',
  surface:     'F7F9FC',
  surfaceAlt:  'F0F4FA',
  line:        'E3E8EF',
  lineSoft:    'EEF2F7',

  // Status — RAG + accent. Chosen so that:
  //  - text-on-fill keeps >= 4.5:1 contrast in print
  //  - the *fill* still reads as "red" / "amber" / "green" when photocopied
  //    to grayscale (because the underlying lightness differs).
  redFill:     'FBE9E7',
  redText:     '8E1B12',
  redEdge:     'F4C5C0',
  amberFill:   'FDF3E2',
  amberText:   '7A3A07',
  amberEdge:   'F1D8A5',
  greenFill:   'E7F5EC',
  greenText:   '0A4B22',
  greenEdge:   'BFE1C9',
  navyFill:    'EAF2FD',
  navyText:    '0B2545',
  navyEdge:    'CDD9ED',
  mutedFill:   'F0F4FA',
  mutedText:   '5B6A82',
  mutedEdge:   'D8DFE9',

  // Status — the full-strength, non-tinted RAG colours (paired with the
  // *Fill / *Text / *Edge variants above, which are the lighter
  // text-on-fill variants). These match the Tailwind theme tokens in
  // tailwind.config.mjs so utility classes (`bg-danger`, `text-warning`)
  // stay in sync with the document-model output.
  danger:      'B42318',
  warning:     'B45309',
  success:     '0A8A3A',

  // Accent / cover.
  accent:      '1F6FEB',
  accentSoft:  'EAF2FD',
  white:       'FFFFFF',
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const FONTS = {
  display: 'Fraunces',
  body: 'IBM Plex Sans',
} as const;

// Docx sizes are half-points; CSS sizes are pixels at body size 11pt ≈ 14.5px.
export const TYPE = {
  // Display
  coverTitle: { docx: 64, css: 36 },      // ~32pt
  coverSubtitle: { docx: 28, css: 20 },   // ~14pt
  coverEyebrow: { docx: 16, css: 11 },    // small caps eyebrow above title

  // Headings
  h1: { docx: 36, css: 22 },              // 18pt section titles
  h2: { docx: 28, css: 19 },              // 14pt subsection
  h3: { docx: 22, css: 16 },              // 11pt sub-sub
  h4: { docx: 18, css: 13 },              // 9pt uppercase tag

  // Body
  body: { docx: 22, css: 14 },            // 11pt
  small: { docx: 18, css: 12 },           // 9pt captions / lede
  micro: { docx: 14, css: 11 },           // 7pt footer

  // Metrics
  metricValue: { docx: 56, css: 30 },     // 28pt card values
  metricLabel: { docx: 14, css: 11 },     // 7pt uppercase label
} as const;

// ---------------------------------------------------------------------------
// Spacing (docx uses twips: 20 twips = 1 point ≈ 1/72 inch)
// ---------------------------------------------------------------------------

export const SPACE = {
  /** Vertical rhythm between blocks. */
  blockBefore: 160,
  blockAfter: 120,
  sectionBefore: 320,
  sectionAfter: 200,

  /** Cell padding (docx twips). */
  cellPadTop: 100,
  cellPadBottom: 100,
  cellPadLeft: 140,
  cellPadRight: 140,
} as const;

// ---------------------------------------------------------------------------
// Severity treatment — used by badges, callouts, row tints and timeline dots.
// ---------------------------------------------------------------------------

export interface SeverityTokens {
  /** Background fill. */
  fill: string;
  /** Text + dot colour. */
  text: string;
  /** Border / edge accent. */
  edge: string;
  /** Subtle row-tint variant, lighter than `fill`. */
  rowTint: string;
  /** Single-letter grayscale fallback prefix for the badge label. */
  letter: 'R' | 'A' | 'G' | 'N' | '·';
  /** Short symbol for inline use ("●" filled circle, hollow for muted). */
  symbol: '●' | '○';
}

export const SEVERITY_TOKENS: Record<Severity, SeverityTokens> = {
  red:   { fill: PALETTE.redFill,   text: PALETTE.redText,   edge: PALETTE.redEdge,   rowTint: 'FDF2F0', letter: 'R', symbol: '●' },
  amber: { fill: PALETTE.amberFill, text: PALETTE.amberText, edge: PALETTE.amberEdge, rowTint: 'FDF7EB', letter: 'A', symbol: '●' },
  green: { fill: PALETTE.greenFill, text: PALETTE.greenText, edge: PALETTE.greenEdge, rowTint: 'F1F8F4', letter: 'G', symbol: '●' },
  navy:  { fill: PALETTE.navyFill,  text: PALETTE.navyText,  edge: PALETTE.navyEdge,  rowTint: 'F0F4FA', letter: 'N', symbol: '●' },
  muted: { fill: PALETTE.mutedFill, text: PALETTE.mutedText, edge: PALETTE.mutedEdge, rowTint: 'F7F9FC', letter: '·', symbol: '○' },
};

// ---------------------------------------------------------------------------
// Table treatment
// ---------------------------------------------------------------------------

export const TABLE = {
  headerFill: PALETTE.navy,
  headerText: PALETTE.white,
  zebraTint: PALETTE.surface,
  border: PALETTE.line,
  borderSoft: PALETTE.lineSoft,
} as const;

// ---------------------------------------------------------------------------
// HTML helpers — these produce CSS-friendly hex strings on demand.
// ---------------------------------------------------------------------------

export function cssHex(rawHex: string): string {
  return `#${rawHex}`;
}

export function severityCss(s: Severity): { fill: string; text: string; edge: string; rowTint: string } {
  const t = SEVERITY_TOKENS[s];
  return {
    fill: cssHex(t.fill),
    text: cssHex(t.text),
    edge: cssHex(t.edge),
    rowTint: cssHex(t.rowTint),
  };
}

/** Serialise the palette + per-severity tokens as a `:root { --token: #hex; }`
 *  block. Inlined once in BaseLayout.astro so global.css can `var(--…)` the
 *  same hex values the Word exporter uses, killing the manual drift between
 *  theme.ts and global.css. */
export function buildCssVariables(): string {
  const lines: string[] = [];
  // Palette → kebab-cased var names.
  for (const [name, hex] of Object.entries(PALETTE)) {
    lines.push(`  --c-${camelToKebab(name)}: #${hex};`);
  }
  // Per-severity expanded slots — easier to use in global.css than
  // composing them from the palette names.
  for (const sev of ['red', 'amber', 'green', 'navy', 'muted'] as const) {
    const t = SEVERITY_TOKENS[sev];
    lines.push(`  --sev-${sev}-fill:    #${t.fill};`);
    lines.push(`  --sev-${sev}-text:    #${t.text};`);
    lines.push(`  --sev-${sev}-edge:    #${t.edge};`);
    lines.push(`  --sev-${sev}-row:     #${t.rowTint};`);
  }
  return `:root {\n${lines.join('\n')}\n}\n`;
}

function camelToKebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
