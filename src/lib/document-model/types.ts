// Document model — the canonical, exporter-agnostic shape of a printable
// report. Both the HTML/print renderer and the docx exporter consume the same
// tree, so a screen-printed PDF and a downloaded Word document show the same
// content with the same hierarchy.
//
// Design rules:
//   - No React, no DOM, no platform calls. Pure data.
//   - No styling decisions — only semantic intent (heading level, severity).
//     The renderers map that intent to CSS classes or docx style ids.
//   - Cheap to build, cheap to test. Selectors compose into this; exporters
//     traverse it.
//
// Severity is a four-tone scale that maps cleanly to the .sev-* CSS classes
// and to docx fill colours: red (danger), amber (warning), green (success),
// navy (informational / neutral emphasis), muted (de-emphasised).

export type Severity = 'red' | 'amber' | 'green' | 'navy' | 'muted';

// ---------------------------------------------------------------------------
// Blocks — the building blocks inside a section.
// ---------------------------------------------------------------------------

export interface HeadingBlock {
  kind: 'heading';
  /** 1 = section title, 2 = subsection, 3 = sub-sub. Cover page sets its own. */
  level: 2 | 3 | 4;
  text: string;
}

export interface ParagraphBlock {
  kind: 'paragraph';
  text: string;
  /** Optional tone — renders as a styled callout banner rather than a plain paragraph. */
  callout?: Severity;
}

export interface BulletListBlock {
  kind: 'bullets';
  items: string[];
  /** true = numbered, false/undefined = unordered. */
  ordered?: boolean;
}

export interface KeyValueBlock {
  kind: 'keyValue';
  /** Two-column label/value grid. Used for cover meta strips and contact rows. */
  rows: { label: string; value: string }[];
}

export interface TableBlock {
  kind: 'table';
  /** Header row labels. Repeats on every printed page (CSS thead in HTML; tblHeader in docx). */
  columns: string[];
  /** Each row's cell content, parallel to `columns`. Severity colours the leading cell. */
  rows: TableRow[];
  /** Optional caption rendered above the table. */
  caption?: string;
  /** Column-width hints as fractions summing to 1. Optional — renderer falls back to equal widths. */
  widths?: number[];
}

export interface TableRow {
  cells: string[];
  /** Adds a coloured pill to the first cell + tints the whole row. */
  severity?: Severity;
}

export interface SpacerBlock {
  kind: 'spacer';
}

// ---------------------------------------------------------------------------
// Visual blocks added in v2.3 for "executive-grade" reports.
// All renderers (HTML, Word) must understand these.
// ---------------------------------------------------------------------------

export interface MetricCard {
  /** Tiny uppercase tag above the value. */
  label: string;
  /** The headline number / short string ("78%", "3 red", "Embedded"). */
  value: string;
  /** Optional supporting line under the value (e.g. "of 48"). */
  hint?: string;
  /** Tints the value text + the card's accent stripe. */
  severity?: Severity;
}

export interface MetricCardsBlock {
  kind: 'metricCards';
  /** 2–6 cards laid out as a responsive grid. */
  cards: MetricCard[];
}

export interface ProgressBlock {
  kind: 'progress';
  /** Short caption rendered above the bar. */
  label: string;
  /** 0..1. Renderers clamp out-of-range values. */
  value: number;
  /** Optional supplementary text shown to the right (e.g. "12/16"). */
  trailing?: string;
  severity?: Severity;
}

export interface CalloutBlock {
  kind: 'callout';
  severity: Severity;
  /** Optional bold lead-in heading, shown above body. */
  title?: string;
  body: string;
}

export interface TimelineEvent {
  /** Left-column label ("08:41", "0–5 min", "Step 1"). */
  time: string;
  /** Bold one-line headline next to the time. */
  title: string;
  /** Optional body text underneath. */
  body?: string;
  severity?: Severity;
}

export interface TimelineBlock {
  kind: 'timeline';
  events: TimelineEvent[];
}

export interface DividerBlock {
  kind: 'divider';
  /** Short label rendered next to the rule (e.g. "Section 2 · CIRT"). */
  label?: string;
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | BulletListBlock
  | KeyValueBlock
  | TableBlock
  | SpacerBlock
  | MetricCardsBlock
  | ProgressBlock
  | CalloutBlock
  | TimelineBlock
  | DividerBlock;

// ---------------------------------------------------------------------------
// Sections — top-level groupings inside a report.
// ---------------------------------------------------------------------------

export interface CoverSection {
  kind: 'cover';
  /** Main report title — Fraunces, bold. The ONLY thing on the cover in
   *  display type. */
  title: string;
  /** School name (+ optional trust). IBM Plex Sans, medium. */
  subtitle?: string;
  /** Base64 data URI or empty string. Renderers skip the slot if empty.
   *  Logo is scaled to fit a 220 × 100 bounding box preserving aspect ratio. */
  logo: string;
  /** Single inline metadata row — concatenated with " • " into one line.
   *  Empty values are dropped silently. Renderers MUST present this as one
   *  horizontal row, never as cards / a grid. Typical content:
   *    [{value:'Version 1.0'},{value:'Approved 15 May 2026'},{value:'Next review 17 May 2027'}] */
  meta?: { label?: string; value: string }[];

  // -------------------------------------------------------------------------
  // Deprecated — the editorial cover no longer renders these. They remain
  // on the type as optional one more release so any in-flight builder code
  // that sets them continues to type-check; no renderer reads them.
  // -------------------------------------------------------------------------
  /** @deprecated v2.5.2 — replaced by `meta` single-line row. */
  preparedDate?: string;
  /** @deprecated v2.5.1 — no eyebrow line on the editorial cover. */
  eyebrow?: string;
  /** @deprecated v2.5.1 — readiness number is in the executive summary body. */
  readiness?: { label: string; value: string };
  /** @deprecated v2.5.1 — operational statement removed from cover. */
  operationalStatement?: string;
  /** @deprecated v2.5.1 — next-review surfaced via `meta` if needed. */
  nextReview?: string;
  /** @deprecated v2.5 — replaced by the editorial-style cover. */
  summary?: string;
}

export interface BodySection {
  kind: 'body';
  /** Section title — rendered as h2 by the HTML renderer, as Heading 1 in docx. */
  title: string;
  /** Optional one-line description shown under the title. */
  lede?: string;
  /** Optional DOM id for in-page anchors. Used by the Plan TOC scrollspy. */
  anchor?: string;
  blocks: Block[];
}

export type Section = CoverSection | BodySection;

// ---------------------------------------------------------------------------
// Top-level report.
// ---------------------------------------------------------------------------

export interface IncidentReport {
  /** Used as the docx document title and the print page <title>. */
  documentTitle: string;
  /** Filename slug minus extension. The exporter appends .docx / .pdf. */
  filenameBase: string;
  sections: Section[];
  /** Optional footer note rendered on every printed page. */
  footer?: string;
}
