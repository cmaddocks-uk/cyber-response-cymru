import { describe, it, expect } from 'vitest';
import { buildActionPlan } from '~/lib/document-model/build-action-plan';
import { initialIncident } from '~/data/plan-schema';
import { READINESS } from '~/data/readiness';

const allScored = (score: number) =>
  Object.fromEntries(READINESS.map((q) => [q.id, score]));

const TODAY = new Date('2026-05-15T12:00:00Z');

describe('buildActionPlan', () => {
  it('empty readiness ⇒ cover + explainer body', () => {
    const incident = initialIncident();
    const doc = buildActionPlan(incident.plan, {}, TODAY);
    expect(doc.sections).toHaveLength(2);
    if (doc.sections[1]?.kind !== 'body') throw new Error('expected body');
    expect(doc.sections[1].title).toMatch(/not yet started/i);
  });

  it('all-green ⇒ cover + "no outstanding" body, no action table', () => {
    const incident = initialIncident();
    const doc = buildActionPlan(incident.plan, allScored(3), TODAY);
    if (doc.sections[1]?.kind !== 'body') throw new Error('expected body');
    expect(doc.sections[1].title).toMatch(/no remediation/i);
    const hasTable = doc.sections
      .filter((s) => s.kind === 'body')
      .some(
        (s) => s.kind === 'body' && s.blocks.some((b) => b.kind === 'table'),
      );
    expect(hasTable).toBe(false);
  });

  it('reds + ambers ⇒ cover + executive summary + action register + timescales', () => {
    const r = allScored(3) as Record<string, number>;
    r.R1 = 0;
    r.R2 = 2;
    const incident = initialIncident();
    const doc = buildActionPlan(incident.plan, r, TODAY);
    const bodyTitles = doc.sections
      .filter((s) => s.kind === 'body')
      .map((s) => (s.kind === 'body' ? s.title : ''));
    expect(bodyTitles).toEqual(['Executive summary', 'Action register', 'Suggested timescales']);
  });

  it('action table rows are red-first and carry severity', () => {
    const r = allScored(3) as Record<string, number>;
    r.R1 = 2;
    r.R2 = 0;
    const incident = initialIncident();
    const doc = buildActionPlan(incident.plan, r, TODAY);
    const register = doc.sections.find((s) => s.kind === 'body' && s.title === 'Action register');
    if (register?.kind !== 'body') throw new Error('no register');
    const table = register.blocks.find((b) => b.kind === 'table');
    if (table?.kind !== 'table') throw new Error('no table');
    expect(table.rows[0]?.severity).toBe('red');
    expect(table.rows[1]?.severity).toBe('amber');
  });

  it('cover is editorial: title + school + single inline metadata row (no readiness / operational statement / eyebrow)', () => {
    const r = allScored(3) as Record<string, number>;
    r.R1 = 0;
    r.R2 = 0;
    const incident = initialIncident();
    incident.plan.meta.planVersion = '2.1';
    incident.plan.meta.planDate = '2026-05-15';
    incident.plan.meta.nextReview = '2027-05-17';
    const doc = buildActionPlan(incident.plan, r, TODAY);
    const cover = doc.sections[0];
    if (cover.kind !== 'cover') throw new Error('no cover');
    expect(cover.title).toBe('Prioritised Action Plan');
    expect(cover.readiness).toBeUndefined();
    expect(cover.operationalStatement).toBeUndefined();
    expect(cover.eyebrow).toBeUndefined();
    const values = (cover.meta ?? []).map((m) => m.value);
    expect(values).toContain('Version 2.1');
    expect(values.find((v) => v.startsWith('Approved'))).toContain('15 May 2026');
    expect(values.find((v) => v.startsWith('Next review'))).toContain('17 May 2027');
  });
});
