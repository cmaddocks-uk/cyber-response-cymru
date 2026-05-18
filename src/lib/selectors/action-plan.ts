// Prioritised Action Plan selector. Builds the row list the Action Plan
// document renders — every red and amber readiness item with its label, plain
// description, suggested action and framework mapping.
//
// Audience: SLT / IT planning meetings. Component renders to a printable
// table with Owner / Target / Status columns left blank for handwriting.

import type { ReadinessState } from '~/data/plan-schema';
import { READINESS, ragForScore, type Framework } from '~/data/readiness';
import { GOV_PLAIN } from '~/data/governor-questions';

export interface ActionRow {
  qid: string;
  rag: 'red' | 'amber';
  /** Governor-questions plain-English label (e.g. "Written response plan"). */
  label: string;
  /** Governor-questions plain-English description. */
  plain: string;
  /** Suggested action text — pulled from READINESS[q].actions[score]. */
  action: string;
  /** Framework tags mapped to this readiness item. */
  frameworks: Framework[];
}

export interface ActionPlanData {
  rows: ActionRow[];
  redCount: number;
  amberCount: number;
  totalAnswered: number;
}

const FALLBACK_ACTION = 'Review this area and document next steps.';

export function getActionPlanData(readiness: ReadinessState): ActionPlanData {
  const rows: ActionRow[] = [];
  let totalAnswered = 0;
  for (const q of READINESS) {
    const s = readiness[q.id];
    if (s == null) continue;
    totalAnswered++;
    const rag = ragForScore(s);
    if (rag !== 'red' && rag !== 'amber') continue;
    const entry = GOV_PLAIN[q.id];
    rows.push({
      qid: q.id,
      rag,
      label: entry?.label ?? q.id,
      plain: entry?.plain ?? q.text,
      action: q.actions[s] ?? q.actions[q.actions.length - 1] ?? FALLBACK_ACTION,
      frameworks: q.frameworks.slice(),
    });
  }
  // Red items first, stable order otherwise.
  rows.sort((a, b) => (a.rag === 'red' ? 0 : 1) - (b.rag === 'red' ? 0 : 1));

  const redCount = rows.filter((r) => r.rag === 'red').length;
  const amberCount = rows.length - redCount;

  return { rows, redCount, amberCount, totalAnswered };
}
