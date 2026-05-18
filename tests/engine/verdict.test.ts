import { describe, it, expect } from 'vitest';
import {
  computeVerdictBand,
  bandToTone,
  computeMaturityBand,
} from '~/lib/engine/verdict';
import type { ReadinessTotals } from '~/lib/engine/readiness-scoring';

const totals = (over: Partial<ReadinessTotals>): ReadinessTotals => ({
  total: 48,
  max: 48,
  pct: 100,
  red: 0,
  amber: 0,
  green: 16,
  answered: 16,
  questionCount: 16,
  ...over,
});

describe('computeVerdictBand', () => {
  it('unanswered questions ⇒ incomplete', () => {
    expect(computeVerdictBand(totals({ answered: 15 }))).toBe('incomplete');
  });

  it('all answered, no red, ≤2 amber ⇒ strong', () => {
    expect(computeVerdictBand(totals({ red: 0, amber: 0 }))).toBe('strong');
    expect(computeVerdictBand(totals({ red: 0, amber: 2 }))).toBe('strong');
  });

  it('no red but ≥3 amber falls out of strong into reasonable', () => {
    expect(computeVerdictBand(totals({ red: 0, amber: 3 }))).toBe('reasonable');
  });

  it('1–2 red ⇒ reasonable', () => {
    expect(computeVerdictBand(totals({ red: 1 }))).toBe('reasonable');
    expect(computeVerdictBand(totals({ red: 2 }))).toBe('reasonable');
  });

  it('≥3 red ⇒ significant', () => {
    expect(computeVerdictBand(totals({ red: 3 }))).toBe('significant');
    expect(computeVerdictBand(totals({ red: 10 }))).toBe('significant');
  });
});

describe('bandToTone', () => {
  it('maps each band to its tone', () => {
    expect(bandToTone('strong')).toBe('success');
    expect(bandToTone('reasonable')).toBe('warning');
    expect(bandToTone('significant')).toBe('danger');
    expect(bandToTone('incomplete')).toBe('muted');
  });
});

describe('computeMaturityBand', () => {
  it('not assessed when readiness incomplete', () => {
    expect(computeMaturityBand(totals({ answered: 10 })).band).toBe('Not assessed');
  });

  it('boundary thresholds (40, 65, 85)', () => {
    expect(computeMaturityBand(totals({ pct: 39 })).band).toBe('Initial');
    expect(computeMaturityBand(totals({ pct: 40 })).band).toBe('Developing');
    expect(computeMaturityBand(totals({ pct: 64 })).band).toBe('Developing');
    expect(computeMaturityBand(totals({ pct: 65 })).band).toBe('Established');
    expect(computeMaturityBand(totals({ pct: 84 })).band).toBe('Established');
    expect(computeMaturityBand(totals({ pct: 85 })).band).toBe('Embedded');
    expect(computeMaturityBand(totals({ pct: 100 })).band).toBe('Embedded');
  });
});
