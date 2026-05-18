// Counts how many "user-fillable" fields in a plan slice are populated. Used
// by the section nav to show "3 / 12" next to "Response team" and by the
// overall progress bar.
//
// Mirrors the v1.x countFilledFields() recursion plus the Assets special
// case (pre-seeded rows shouldn't count as "filled" until the user has
// actively entered a supplier name).

import type { PlanState } from '~/data/plan-schema';
import type { SectionId } from '~/data/plan-sections';

export interface Completion {
  filled: number;
  total: number;
}

export function countFilledFields(value: unknown): Completion {
  let filled = 0;
  let total = 0;

  if (value == null) return { filled, total };

  if (typeof value === 'string') {
    total++;
    if (value.trim() !== '') filled++;
    return { filled, total };
  }

  // Booleans are skipped — they're typically `enabled` flags on playbooks,
  // not user-authored content.
  if (typeof value === 'boolean') return { filled, total };

  if (typeof value === 'number') {
    total++;
    if (!Number.isNaN(value)) filled++;
    return { filled, total };
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const sub = countFilledFields(item);
      filled += sub.filled;
      total += sub.total;
    }
    return { filled, total };
  }

  if (typeof value === 'object') {
    for (const v of Object.values(value)) {
      const sub = countFilledFields(v);
      filled += sub.filled;
      total += sub.total;
    }
  }

  return { filled, total };
}

export function getSectionCompletion(plan: PlanState, section: SectionId): Completion {
  // Assets is special: pre-seeded rows shouldn't count as "filled" until the
  // user enters a supplier name. One unit per row + one for the BIA narrative.
  if (section === 'assets') {
    const systems = plan.assets.systems ?? [];
    const filledSystems = systems.filter((s) => s && s.supplier.trim() !== '').length;
    const bia = plan.assets.biaNotes.trim() !== '' ? 1 : 0;
    return { filled: filledSystems + bia, total: systems.length + 1 };
  }

  const map: Record<Exclude<SectionId, 'assets'>, unknown> = {
    meta: plan.meta,
    team: plan.team,
    external: plan.external,
    severity: plan.severity,
    escalation: plan.escalation,
    playbooks: plan.playbooks,
    comms: plan.comms,
    recovery: plan.recovery,
    review: plan.review,
    maintenance: plan.maintenance,
  };
  return countFilledFields(map[section]);
}

export function getOverallCompletion(plan: PlanState): Completion {
  let filled = 0;
  let total = 0;
  for (const id of [
    'meta',
    'team',
    'external',
    'severity',
    'escalation',
    'playbooks',
    'comms',
    'assets',
    'recovery',
    'review',
    'maintenance',
  ] as const) {
    const c = getSectionCompletion(plan, id);
    filled += c.filled;
    total += c.total;
  }
  return { filled, total };
}
