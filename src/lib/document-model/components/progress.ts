// Progress bar in Word — rendered as a fixed-width unicode block-bar plus
// a trailing percentage. Avoids docx graphics entirely so the output is
// font-portable and copy-paste safe.
//
// 10 segments at full width: ████████░░ — readable in any monospace fallback.

import { Paragraph } from 'docx';
import { SEVERITY_TOKENS, PALETTE, TYPE, FONTS } from '../theme';
import type { ProgressBlock } from '../types';
import { paragraph, run } from './docx-primitives';

const BAR_LENGTH = 14;
const FILLED = '█';
const EMPTY = '░';

export function progressBar(block: ProgressBlock): Paragraph {
  const ratio = Math.max(0, Math.min(1, block.value));
  const filled = Math.round(ratio * BAR_LENGTH);
  const empty = BAR_LENGTH - filled;
  const bar = FILLED.repeat(filled) + EMPTY.repeat(empty);
  const tok = block.severity ? SEVERITY_TOKENS[block.severity] : SEVERITY_TOKENS.navy;

  const trailing = block.trailing ?? `${Math.round(ratio * 100)}%`;

  return paragraph(
    [
      run(`${block.label}  `, { color: PALETTE.muted, size: TYPE.small.docx, bold: true, characterSpacing: 60 }),
      run(bar, { color: tok.text, font: FONTS.body, size: TYPE.body.docx }),
      run(`  ${trailing}`, { color: PALETTE.navy, bold: true, size: TYPE.body.docx }),
    ],
    { before: 80, after: 80 },
  );
}
