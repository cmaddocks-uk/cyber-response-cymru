import { describe, it, expect } from 'vitest';
import { getByPath, isPlanFieldBlank } from '~/lib/plan-fields';
import { initialIncident } from '~/data/plan-schema';

describe('getByPath', () => {
  it('returns a top-level slice', () => {
    const incident = initialIncident();
    expect(getByPath(incident, 'plan')).toBe(incident.plan);
  });

  it('walks nested dot paths', () => {
    const incident = initialIncident();
    incident.plan.meta.schoolName = 'Test Academy';
    expect(getByPath(incident, 'plan.meta.schoolName')).toBe('Test Academy');
  });

  it('returns undefined for a missing intermediate key', () => {
    const incident = initialIncident();
    expect(getByPath(incident, 'plan.meta.nonexistent.deeper')).toBeUndefined();
  });

  it('does not throw when the root is null/undefined-shaped', () => {
    expect(getByPath({} as never, 'plan.meta.schoolName')).toBeUndefined();
  });

  it('handles array indexing not supported — returns undefined for [N] syntax', () => {
    // Documented behaviour: getByPath only splits on dots; array indices are
    // not in the contract. Confirm the function doesn't crash.
    const incident = initialIncident();
    expect(getByPath(incident, 'plan.team.members[0].name')).toBeUndefined();
  });
});

describe('isPlanFieldBlank', () => {
  it('treats null and undefined as blank', () => {
    expect(isPlanFieldBlank(null)).toBe(true);
    expect(isPlanFieldBlank(undefined)).toBe(true);
  });

  it('treats empty string (trimmed) as blank', () => {
    expect(isPlanFieldBlank('')).toBe(true);
    expect(isPlanFieldBlank('   ')).toBe(true);
    expect(isPlanFieldBlank('\n\t')).toBe(true);
  });

  it('non-empty strings are not blank', () => {
    expect(isPlanFieldBlank('hello')).toBe(false);
    expect(isPlanFieldBlank('0')).toBe(false);
  });

  it('empty array is blank, non-empty array is not', () => {
    expect(isPlanFieldBlank([])).toBe(true);
    expect(isPlanFieldBlank(['x'])).toBe(false);
  });

  it('numbers and booleans are not blank', () => {
    expect(isPlanFieldBlank(0)).toBe(false);
    expect(isPlanFieldBlank(false)).toBe(false);
    expect(isPlanFieldBlank(true)).toBe(false);
  });
});
