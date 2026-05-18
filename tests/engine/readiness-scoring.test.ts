import { describe, it, expect } from 'vitest';
import { computeReadinessTotals } from '~/lib/engine/readiness-scoring';
import { READINESS } from '~/data/readiness';

const allScored = (score: number) =>
  Object.fromEntries(READINESS.map((q) => [q.id, score]));

describe('computeReadinessTotals', () => {
  it('empty readiness produces all zeros, full questionCount', () => {
    const t = computeReadinessTotals({});
    expect(t.answered).toBe(0);
    expect(t.total).toBe(0);
    expect(t.red).toBe(0);
    expect(t.amber).toBe(0);
    expect(t.green).toBe(0);
    expect(t.pct).toBe(0);
    expect(t.questionCount).toBe(READINESS.length);
    expect(t.max).toBe(READINESS.length * 3);
  });

  it('every question green ⇒ 100% green, no red/amber', () => {
    const t = computeReadinessTotals(allScored(3));
    expect(t.answered).toBe(READINESS.length);
    expect(t.green).toBe(READINESS.length);
    expect(t.amber).toBe(0);
    expect(t.red).toBe(0);
    expect(t.pct).toBe(100);
    expect(t.total).toBe(t.max);
  });

  it('every question score 2 ⇒ all amber, 66/67% pct', () => {
    const t = computeReadinessTotals(allScored(2));
    expect(t.amber).toBe(READINESS.length);
    expect(t.green).toBe(0);
    expect(t.red).toBe(0);
    // 2/3 of max, rounded
    expect(t.pct).toBe(Math.round((2 / 3) * 100));
  });

  it('score 0 and 1 both count as red', () => {
    const half = Math.floor(READINESS.length / 2);
    const readiness: Record<string, number> = {};
    READINESS.forEach((q, i) => {
      readiness[q.id] = i < half ? 0 : 1;
    });
    const t = computeReadinessTotals(readiness);
    expect(t.red).toBe(READINESS.length);
    expect(t.amber).toBe(0);
    expect(t.green).toBe(0);
  });

  it('unanswered questions do not bump `answered`', () => {
    const t = computeReadinessTotals({ R1: 3, R2: 2 });
    expect(t.answered).toBe(2);
    expect(t.green).toBe(1);
    expect(t.amber).toBe(1);
    expect(t.total).toBe(5);
  });

  it('ignores unknown question ids', () => {
    const t = computeReadinessTotals({ R1: 3, BOGUS: 3 } as Record<string, number>);
    expect(t.answered).toBe(1);
    expect(t.green).toBe(1);
  });

  it('pct rounds to nearest integer', () => {
    // One R1=2 ⇒ total 2, max = N*3. pct = round(2 / (N*3) * 100).
    const t = computeReadinessTotals({ R1: 2 });
    expect(t.pct).toBe(Math.round((2 / (READINESS.length * 3)) * 100));
  });
});
