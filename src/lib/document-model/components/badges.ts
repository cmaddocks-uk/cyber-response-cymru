// Severity badges (Word). The HTML rendering is a real CSS pill (.sev-badge
// in global.css). Word doesn't support rounded corners on inline text, so
// the inline badge runs are baked directly into the leading cell of a data
// table (see tables.ts) — that's the only consumer.
//
// The label is always prefixed with the severity LETTER (R/A/G/N/·) so it
// remains legible when the badge is photocopied to grayscale.

import { SEVERITY_TOKENS, TYPE } from '../theme';
import type { Severity } from '../types';
import { run } from './docx-primitives';

/** Build the bold coloured TextRun pair that represents a severity badge:
 *  letter prefix + uppercased label. Embed inside a table cell or paragraph
 *  — this function only returns the runs, never wraps them. */
export function inlineBadgeRuns(severity: Severity, label: string) {
  const t = SEVERITY_TOKENS[severity];
  return [
    run(`${t.letter}  `, { bold: true, color: t.text, characterSpacing: 30, size: TYPE.small.docx }),
    run(label.toUpperCase(), { bold: true, color: t.text, characterSpacing: 60, size: TYPE.small.docx }),
  ];
}
