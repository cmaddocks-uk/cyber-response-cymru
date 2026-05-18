// Governor Report selector. The Governor Report component calls this once
// and renders the result — no scoring or rule logic in the component.
//
// "Selector" here means: takes the canonical state slices, returns a fully-
// derived view ready for rendering. Pure function. No DOM. No React.
//
// Audience: governors / trustees. Verdict wording reflects that — see
// `getGovernorVerdict()` below.

import type { PlanState, ReadinessState } from '~/data/plan-schema';
import { READINESS, ragForScore, type RagBand } from '~/data/readiness';
import { GOV_PLAIN, type GovernorQuestionEntry } from '~/data/governor-questions';
import {
  computeReadinessTotals,
  type ReadinessTotals,
} from '~/lib/engine/readiness-scoring';
import {
  computeVerdictBand,
  computeMaturityBand,
  bandToTone,
  type VerdictBand,
  type VerdictTone,
  type MaturityBand,
} from '~/lib/engine/verdict';
import { getCeGovernorQuestion } from '~/lib/engine/ce-governor-question';
import { getCeStatusSummary, type CeStatusSummary } from '~/lib/engine/cyber-essentials';

export interface Verdict {
  title: string;
  text: string;
  tone: VerdictTone;
}

export interface PriorityItem {
  id: string;
  rag: RagBand;
  entry: GovernorQuestionEntry;
}

export interface GovernorQuestion {
  id: string;
  rag: RagBand;
  entry: GovernorQuestionEntry;
}

export interface GovernorReportData {
  totals: ReadinessTotals;
  verdict: Verdict;
  maturity: MaturityBand;
  /** Top non-green items, red first, capped at the limit. */
  priorityItems: PriorityItem[];
  /** Every non-green readiness item, not capped. */
  governorQuestions: GovernorQuestion[];
  /** State-aware CE assurance question, or null if CE is in good standing. */
  ceQuestion: string | null;
  /** CE status line (cert date + any active deadline). */
  ceStatus: CeStatusSummary;
}

const DEFAULT_PRIORITY_LIMIT = 5;

export function getGovernorReportData(
  plan: PlanState,
  readiness: ReadinessState,
  today: Date = new Date(),
  priorityLimit: number = DEFAULT_PRIORITY_LIMIT,
): GovernorReportData {
  const totals = computeReadinessTotals(readiness);
  const band = computeVerdictBand(totals);
  return {
    totals,
    verdict: getGovernorVerdict(band, totals),
    maturity: computeMaturityBand(totals),
    priorityItems: collectNonGreenItems(readiness, priorityLimit),
    governorQuestions: collectNonGreenItems(readiness, Number.POSITIVE_INFINITY),
    ceQuestion: getCeGovernorQuestion(plan.meta, today),
    ceStatus: getCeStatusSummary(plan.meta, today),
  };
}

/** Governor-audience verdict wording for the given band. Speaks to governors
 *  and trustees about what they should ask SLT for. */
function getGovernorVerdict(band: VerdictBand, totals: ReadinessTotals): Verdict {
  const tone = bandToTone(band);
  switch (band) {
    case 'incomplete':
      return {
        title: 'Not yet complete',
        text: `The readiness check has not been fully completed (${totals.answered} of ${totals.questionCount} questions answered). A complete readiness check is recommended before this report is presented to governors.`,
        tone,
      };
    case 'strong':
      return {
        title: 'Strong readiness',
        text: 'The school has a mature cyber incident response capability with a small number of areas to maintain or improve. Governors should seek assurance that testing and training continue at the agreed cadence and that any remaining amber items have a named owner and target date.',
        tone,
      };
    case 'reasonable':
      return {
        title: 'Reasonable readiness — gaps to address',
        text: 'The school has foundations in place but a small number of red areas need urgent attention. Governors should request a written action plan from the SLT digital lead with timescales and resource implications for each red area.',
        tone,
      };
    case 'significant':
      return {
        title: 'Significant gaps in readiness',
        text: 'Several core elements of cyber incident response are missing or incomplete. Governors should treat this as a strategic risk requiring an urgent SLT response with a costed remediation plan presented at the next meeting.',
        tone,
      };
  }
}

/** Internal: collects every non-green readiness item with its governor-questions
 *  entry, sorted red-first, capped at `limit`. Used for both the Priority Areas
 *  list (capped) and the Governor Questions list (uncapped). */
function collectNonGreenItems(readiness: ReadinessState, limit: number): PriorityItem[] {
  const items: PriorityItem[] = [];
  for (const q of READINESS) {
    const s = readiness[q.id];
    if (s == null) continue;
    const rag = ragForScore(s);
    if (rag === 'green' || rag == null) continue;
    const entry = GOV_PLAIN[q.id];
    if (!entry) continue;
    items.push({ id: q.id, rag, entry });
  }
  items.sort((a, b) => (a.rag === 'red' ? 0 : 1) - (b.rag === 'red' ? 0 : 1));
  return limit === Number.POSITIVE_INFINITY ? items : items.slice(0, limit);
}
