import { describe, it, expect } from 'vitest';
import {
  getOverallStatus,
  getSectionStatus,
  getFilledFields,
  getCeStatus,
  getRagBand,
} from '~/lib/selectors/plan-status';
import { initialIncident } from '~/data/plan-schema';

describe('plan-status selector wrappers', () => {
  it('getOverallStatus reports filled/total for initial plan', () => {
    const incident = initialIncident();
    const c = getOverallStatus(incident.plan);
    expect(c.total).toBeGreaterThan(0);
    expect(c.filled).toBeLessThanOrEqual(c.total);
  });

  it('getSectionStatus for meta increases when fields are populated', () => {
    const incident = initialIncident();
    const before = getSectionStatus(incident.plan, 'meta').filled;
    incident.plan.meta.schoolName = 'Test Academy';
    incident.plan.meta.urn = '123456';
    const after = getSectionStatus(incident.plan, 'meta').filled;
    expect(after).toBe(before + 2);
  });

  it('getFilledFields counts an arbitrary value tree', () => {
    expect(getFilledFields({ a: 'x', b: { c: '' } })).toEqual({ filled: 1, total: 2 });
  });

  it('getCeStatus delegates to the engine — empty meta is invisible', () => {
    const incident = initialIncident();
    expect(getCeStatus(incident.plan.meta).visible).toBe(false);
  });

  it('getRagBand: 0,1 ⇒ red; 2 ⇒ amber; 3 ⇒ green; null ⇒ null', () => {
    expect(getRagBand(0)).toBe('red');
    expect(getRagBand(1)).toBe('red');
    expect(getRagBand(2)).toBe('amber');
    expect(getRagBand(3)).toBe('green');
    expect(getRagBand(null)).toBeNull();
    expect(getRagBand(undefined)).toBeNull();
  });
});
