// Plan-status selector. Thin wrappers over the engine functions that
// components used to import directly. Lets the architecture rule "components
// only consume selectors" hold without losing the pure-engine reusability.
//
// Each function delegates to its engine counterpart and re-exports the
// associated types. Components import from here, never from `~/lib/engine/`.

import type { PlanState } from '~/data/plan-schema';
import type { SectionId } from '~/data/plan-sections';
import {
  type Completion,
  countFilledFields,
  getOverallCompletion as overallEng,
  getSectionCompletion as sectionEng,
} from '~/lib/engine/plan-completion';
import {
  type CeStatusSummary,
  type Severity,
  getCeStatusSummary as ceSummaryEng,
} from '~/lib/engine/cyber-essentials';
import { ragForScore as ragEng, type RagBand } from '~/data/readiness';

export type { Completion, CeStatusSummary, Severity, RagBand };

/** Per-section completion counts. */
export function getSectionStatus(plan: PlanState, section: SectionId): Completion {
  return sectionEng(plan, section);
}

/** Whole-plan completion counts. */
export function getOverallStatus(plan: PlanState): Completion {
  return overallEng(plan);
}

/** Raw filled/total walk — exposed for the rare component that needs to count
 *  an arbitrary sub-tree (e.g. a section preview card). */
export function getFilledFields(value: unknown): Completion {
  return countFilledFields(value);
}

/** Cyber Essentials status summary, today by default. */
export function getCeStatus(meta: PlanState['meta'], today: Date = new Date()): CeStatusSummary {
  return ceSummaryEng(meta, today);
}

/** Map a readiness score (0..3) to its RAG band. */
export function getRagBand(score: number | null | undefined): RagBand | null {
  return ragEng(score);
}
