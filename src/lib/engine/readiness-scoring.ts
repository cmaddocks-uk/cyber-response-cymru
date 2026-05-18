// Readiness scoring — pure tally of answered readiness questions.
// Inputs: readiness slice. Outputs: counts + percentage + per-RAG breakdown.

import { READINESS, ragForScore } from '~/data/readiness';
import type { ReadinessState } from '~/data/plan-schema';

export interface ReadinessTotals {
  /** Sum of scores across answered questions. 0..(questionCount*3). */
  total: number;
  /** Maximum possible total if every question scored a green 3. */
  max: number;
  /** Percentage of `max`, rounded to nearest integer. */
  pct: number;
  red: number;
  amber: number;
  green: number;
  /** Number of questions the user has answered (0..questionCount). */
  answered: number;
  /** Total number of questions in the readiness check (constant). */
  questionCount: number;
}

export function computeReadinessTotals(readiness: ReadinessState): ReadinessTotals {
  let total = 0;
  let red = 0;
  let amber = 0;
  let green = 0;
  let answered = 0;
  for (const q of READINESS) {
    const s = readiness[q.id];
    if (s == null) continue;
    answered++;
    total += s;
    const rag = ragForScore(s);
    if (rag === 'green') green++;
    else if (rag === 'amber') amber++;
    else red++;
  }
  const max = READINESS.length * 3;
  const pct = max === 0 ? 0 : Math.round((total / max) * 100);
  return { total, max, pct, red, amber, green, answered, questionCount: READINESS.length };
}
