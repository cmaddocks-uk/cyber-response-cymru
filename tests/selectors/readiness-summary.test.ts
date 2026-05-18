import { describe, it, expect } from 'vitest';
import { getReadinessSummaryData } from '~/lib/selectors/readiness-summary';
import { READINESS } from '~/data/readiness';

const allScored = (score: number) =>
  Object.fromEntries(READINESS.map((q) => [q.id, score]));

describe('getReadinessSummaryData', () => {
  it('empty readiness ⇒ incomplete verdict, no actions', () => {
    const d = getReadinessSummaryData({});
    expect(d.verdict.title).toMatch(/not yet complete/i);
    expect(d.verdict.tone).toBe('muted');
    expect(d.actions).toEqual([]);
  });

  it('all green ⇒ strong verdict, no actions', () => {
    const d = getReadinessSummaryData(allScored(3));
    expect(d.verdict.title).toMatch(/strong/i);
    expect(d.verdict.tone).toBe('success');
    expect(d.actions).toEqual([]);
  });

  it('mix of red/amber/green ⇒ reasonable verdict, actions red-first', () => {
    const d = getReadinessSummaryData({ R1: 0, R2: 2, R3: 3, R4: 3 });
    expect(d.actions[0]?.rag).toBe('red');
    expect(d.actions[1]?.rag).toBe('amber');
    expect(d.actions.every((a) => a.rag === 'red' || a.rag === 'amber')).toBe(true);
  });

  it('actions include both question text and suggested next-step', () => {
    const d = getReadinessSummaryData({ R1: 0 });
    const a = d.actions[0];
    expect(a?.qid).toBe('R1');
    expect(a?.qtext).toBeTruthy();
    expect(a?.action).toBeTruthy();
  });

  it('≥3 red items ⇒ significant verdict (only when readiness fully answered)', () => {
    const r = allScored(3) as Record<string, number>;
    r.R1 = 0;
    r.R2 = 0;
    r.R3 = 0;
    const d = getReadinessSummaryData(r);
    expect(d.verdict.title).toMatch(/significant gaps/i);
    expect(d.verdict.tone).toBe('danger');
  });
});
