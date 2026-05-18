import { describe, it, expect } from 'vitest';
import { getActionPlanData } from '~/lib/selectors/action-plan';
import { READINESS } from '~/data/readiness';

const allScored = (score: number) =>
  Object.fromEntries(READINESS.map((q) => [q.id, score]));

describe('getActionPlanData', () => {
  it('empty readiness ⇒ no rows, zero totals', () => {
    const d = getActionPlanData({});
    expect(d.rows).toEqual([]);
    expect(d.redCount).toBe(0);
    expect(d.amberCount).toBe(0);
    expect(d.totalAnswered).toBe(0);
  });

  it('all green ⇒ no rows but totalAnswered = N', () => {
    const d = getActionPlanData(allScored(3));
    expect(d.rows).toEqual([]);
    expect(d.totalAnswered).toBe(READINESS.length);
  });

  it('one red + one amber ⇒ two rows, red first', () => {
    const d = getActionPlanData({ R1: 2, R2: 0 });
    expect(d.rows).toHaveLength(2);
    expect(d.rows[0]?.rag).toBe('red');
    expect(d.rows[1]?.rag).toBe('amber');
    expect(d.redCount).toBe(1);
    expect(d.amberCount).toBe(1);
    expect(d.totalAnswered).toBe(2);
  });

  it('rows carry label, plain, action and frameworks', () => {
    const d = getActionPlanData({ R1: 0 });
    const row = d.rows[0]!;
    expect(row.qid).toBe('R1');
    expect(row.label).toBeTruthy();
    expect(row.plain).toBeTruthy();
    expect(row.action).toBeTruthy();
    expect(Array.isArray(row.frameworks)).toBe(true);
  });

  it('greens are excluded from rows but still bump totalAnswered', () => {
    const d = getActionPlanData({ R1: 0, R2: 3, R3: 3 });
    expect(d.rows).toHaveLength(1);
    expect(d.totalAnswered).toBe(3);
  });

  it('score 1 is red, score 2 is amber, score 3 is green-excluded', () => {
    const d = getActionPlanData({ R1: 1, R2: 2, R3: 3 });
    expect(d.rows.find((r) => r.qid === 'R1')?.rag).toBe('red');
    expect(d.rows.find((r) => r.qid === 'R2')?.rag).toBe('amber');
    expect(d.rows.find((r) => r.qid === 'R3')).toBeUndefined();
  });
});
