// Readiness Summary selector — drives the panel that appears at the bottom
// of the Readiness Check page once the user has answered all 16 questions.
//
// Audience: school staff completing the assessment. Verdict wording reflects
// that — see `getReadinessVerdict()` below.
//
// Shares the band logic (engine/verdict) with the Governor Report; just
// composes different wording.

import type { ReadinessState } from '~/data/plan-schema';
import { READINESS, ragForScore } from '~/data/readiness';
import {
  computeReadinessTotals,
  type ReadinessTotals,
} from '~/lib/engine/readiness-scoring';
import {
  computeVerdictBand,
  bandToTone,
  type VerdictBand,
  type VerdictTone,
} from '~/lib/engine/verdict';

export type { VerdictTone };

export interface Verdict {
  title: string;
  text: string;
  tone: VerdictTone;
}

export interface ReadinessSummaryAction {
  qid: string;
  /** The full readiness question text. Shown in the Summary's priority list. */
  qtext: string;
  rag: 'red' | 'amber';
  /** The suggested next action — pulled from READINESS[q].actions[score]. */
  action: string;
}

export interface ReadinessSummaryData {
  totals: ReadinessTotals;
  verdict: Verdict;
  /** Red items first, then amber. Empty when every answered item is green. */
  actions: ReadinessSummaryAction[];
}

export function getReadinessSummaryData(readiness: ReadinessState): ReadinessSummaryData {
  const totals = computeReadinessTotals(readiness);
  const band = computeVerdictBand(totals);
  return {
    totals,
    verdict: getReadinessVerdict(band),
    actions: collectActions(readiness),
  };
}

/** School-audience verdict wording for the given band. Speaks to the school
 *  staff who just completed the readiness check. */
function getReadinessVerdict(band: VerdictBand): Verdict {
  const tone = bandToTone(band);
  switch (band) {
    case 'incomplete':
      return {
        title: 'Not yet complete',
        text: 'Answer all the readiness questions to see your summary.',
        tone,
      };
    case 'strong':
      return {
        title: 'Strong readiness',
        text: 'Your responses indicate a mature incident response capability. Focus on maintaining and testing the plan, and on closing the small number of remaining gaps.',
        tone,
      };
    case 'reasonable':
      return {
        title: 'Reasonable readiness — gaps to address',
        text: 'You have foundations in place but a small number of red areas need urgent attention. These are typically the ones that determine how badly an incident hurts.',
        tone,
      };
    case 'significant':
      return {
        title: 'Significant gaps in readiness',
        text: 'Several core elements of incident response are missing. The plan builder in this tool will help you draft a baseline plan within a few hours, which is a much better starting point than the absence of one.',
        tone,
      };
  }
}

function collectActions(readiness: ReadinessState): ReadinessSummaryAction[] {
  const actions: ReadinessSummaryAction[] = [];
  for (const q of READINESS) {
    const s = readiness[q.id];
    if (s == null) continue;
    if (s >= 3) continue;
    const rag = ragForScore(s);
    if (rag !== 'red' && rag !== 'amber') continue;
    actions.push({
      qid: q.id,
      qtext: q.text,
      rag,
      action: q.actions[s] ?? q.actions[q.actions.length - 1] ?? 'Review this area.',
    });
  }
  // Red first, stable order otherwise.
  actions.sort((a, b) => (a.rag === 'red' ? 0 : 1) - (b.rag === 'red' ? 0 : 1));
  return actions;
}
