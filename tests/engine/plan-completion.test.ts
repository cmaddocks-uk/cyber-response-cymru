import { describe, it, expect } from 'vitest';
import {
  countFilledFields,
  getSectionCompletion,
  getOverallCompletion,
} from '~/lib/engine/plan-completion';
import { initialIncident } from '~/data/plan-schema';

describe('countFilledFields', () => {
  it('counts a non-empty string as filled', () => {
    expect(countFilledFields('hello')).toEqual({ filled: 1, total: 1 });
  });

  it('counts empty/whitespace strings as not filled', () => {
    expect(countFilledFields('')).toEqual({ filled: 0, total: 1 });
    expect(countFilledFields('   ')).toEqual({ filled: 0, total: 1 });
  });

  it('skips booleans entirely (playbook enabled flags)', () => {
    expect(countFilledFields(true)).toEqual({ filled: 0, total: 0 });
    expect(countFilledFields(false)).toEqual({ filled: 0, total: 0 });
  });

  it('recurses into objects and arrays', () => {
    const value = { a: 'x', b: ['y', '', 'z'], c: { d: 'w' } };
    expect(countFilledFields(value)).toEqual({ filled: 4, total: 5 });
  });

  it('null/undefined are zero/zero', () => {
    expect(countFilledFields(null)).toEqual({ filled: 0, total: 0 });
    expect(countFilledFields(undefined)).toEqual({ filled: 0, total: 0 });
  });
});

describe('getSectionCompletion — Assets special case', () => {
  it('assets section: pre-seeded rows count as unfilled until supplier is set (Hwb row is the exception — it ships pre-filled because every Welsh school has Hwb)', () => {
    const incident = initialIncident();
    const a = getSectionCompletion(incident.plan, 'assets');
    // The Hwb-hosted services row ships with supplier + incidentContact pre-filled.
    expect(a.filled).toBe(1);
    expect(a.total).toBeGreaterThan(0);
  });

  it('assets section: filling another supplier name counts that row too', () => {
    const incident = initialIncident();
    incident.plan.assets.systems[0]!.supplier = 'Capita SIMS';
    const a = getSectionCompletion(incident.plan, 'assets');
    // Hwb row (pre-filled) plus the newly-filled row 0.
    expect(a.filled).toBe(2);
  });

  it('assets section: BIA notes count as one additional unit', () => {
    const incident = initialIncident();
    const before = getSectionCompletion(incident.plan, 'assets').filled;
    incident.plan.assets.biaNotes = 'Critical system inventory captured.';
    const after = getSectionCompletion(incident.plan, 'assets').filled;
    expect(after).toBe(before + 1);
  });
});

describe('getOverallCompletion', () => {
  it('reports a positive total for the seeded plan shape', () => {
    const incident = initialIncident();
    const c = getOverallCompletion(incident.plan);
    expect(c.total).toBeGreaterThan(0);
    expect(c.filled).toBeLessThanOrEqual(c.total);
  });

  it('filling a meta and a team field bumps the count by 2', () => {
    const incident = initialIncident();
    const before = getOverallCompletion(incident.plan).filled;
    incident.plan.meta.schoolName = 'Test Academy';
    incident.plan.team.leadName = 'Alice';
    const after = getOverallCompletion(incident.plan).filled;
    expect(after).toBe(before + 2);
  });
});
