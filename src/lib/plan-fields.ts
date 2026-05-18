// Helpers for reading values from the Incident state via dot-path strings.
// The tabletop scenarios use these to surface "the relevant fields from the
// user's plan" at each step of a scenario.

import type { Incident } from '~/data/plan-schema';

/**
 * Reads a value from app state by dot-path, e.g. `plan.team.leadName`.
 * Returns undefined if any intermediate key is missing or the value is null.
 * Defensive: doesn't throw on missing keys.
 */
export function getByPath(state: Incident, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, state as unknown);
}

/**
 * "Is this plan field effectively blank?" Used by the tabletop runner to
 * decide which fields show as a "gap" vs as filled.
 * Counts as blank: null, undefined, empty string (after trim), empty array.
 */
export function isPlanFieldBlank(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}
