// Tabletop run selector. Encapsulates every derivation the runner + summary
// surface depended on inline: referenced plan paths, gap detection, display
// formatting, per-step grouping, banner state.
//
// Audience: components rendering the tabletop step view and the printable
// summary. Pure function — no React, no DOM.

import type { Incident } from '~/data/plan-schema';
import type { Scenario, ScenarioStep } from '~/data/scenarios';
import { planFieldLabel } from '~/data/plan-field-labels';
import { getByPath, isPlanFieldBlank } from '~/lib/plan-fields';

export type FieldGroup = 'gap' | 'filled';

export interface FieldEntry {
  path: string;
  label: string;
  group: FieldGroup;
  /** User-facing one-line description of the current value (or a gap marker). */
  display: string;
}

export interface TabletopStepData {
  /** Stable scenario step reference for the component layer. */
  step: ScenarioStep;
  index: number;
  isLast: boolean;
  /** Every plan-field this step references, in declared order, with gap/filled classification. */
  fieldEntries: FieldEntry[];
  /** Convenience subsets — derived once so the component doesn't re-filter. */
  gaps: FieldEntry[];
  filled: FieldEntry[];
}

export interface TabletopRunData {
  scenario: Scenario;
  /** Aggregated across every step: distinct gap paths the scenario surfaces. */
  allGaps: { path: string; label: string }[];
  /** True when the scenario surfaced no gaps at all. Drives the summary banner colour. */
  allGreen: boolean;
  /** One entry per scenario step, in order. */
  steps: TabletopStepData[];
}

export function getTabletopRunData(scenario: Scenario, incident: Incident): TabletopRunData {
  const steps: TabletopStepData[] = scenario.steps.map((step, index) =>
    buildStepData(step, index, scenario.steps.length, incident),
  );

  const allGapPaths = new Map<string, string>();
  for (const s of steps) {
    for (const g of s.gaps) allGapPaths.set(g.path, g.label);
  }
  const allGaps = Array.from(allGapPaths, ([path, label]) => ({ path, label }));

  return {
    scenario,
    allGaps,
    allGreen: allGaps.length === 0,
    steps,
  };
}

/** Build the data for a single tabletop step. Exported so a step view can
 *  derive its own data when the runner doesn't pre-compute the full run. */
export function getTabletopStepData(
  step: ScenarioStep,
  index: number,
  totalSteps: number,
  incident: Incident,
): TabletopStepData {
  return buildStepData(step, index, totalSteps, incident);
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const DISPLAY_TRUNCATE_AT = 90;
const GAP_DISPLAY = 'blank — gap in your plan';

function buildStepData(
  step: ScenarioStep,
  index: number,
  totalSteps: number,
  incident: Incident,
): TabletopStepData {
  const fieldEntries: FieldEntry[] = (step.planFields ?? []).map((path) =>
    buildFieldEntry(path, incident),
  );
  return {
    step,
    index,
    isLast: index === totalSteps - 1,
    fieldEntries,
    gaps: fieldEntries.filter((f) => f.group === 'gap'),
    filled: fieldEntries.filter((f) => f.group === 'filled'),
  };
}

function buildFieldEntry(path: string, incident: Incident): FieldEntry {
  const value = getByPath(incident, path);
  const blank = isPlanFieldBlank(value);
  return {
    path,
    label: planFieldLabel(path),
    group: blank ? 'gap' : 'filled',
    display: blank ? GAP_DISPLAY : describeValue(value),
  };
}

function describeValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `${value.length} entr${value.length === 1 ? 'y' : 'ies'} captured`;
  }
  const s = String(value);
  return s.length > DISPLAY_TRUNCATE_AT ? `${s.slice(0, DISPLAY_TRUNCATE_AT)}…` : s;
}
