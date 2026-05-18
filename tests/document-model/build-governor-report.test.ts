import { describe, it, expect } from 'vitest';
import { buildGovernorReport } from '~/lib/document-model/build-governor-report';
import { initialIncident } from '~/data/plan-schema';
import { READINESS } from '~/data/readiness';

const allScored = (score: number) =>
  Object.fromEntries(READINESS.map((q) => [q.id, score]));

const TODAY = new Date('2026-05-15T12:00:00Z');

describe('buildGovernorReport', () => {
  it('always emits a cover section first', () => {
    const incident = initialIncident();
    const doc = buildGovernorReport(incident.plan, {}, TODAY);
    expect(doc.sections[0]?.kind).toBe('cover');
  });

  it('cover is editorial: school name in subtitle + single inline metadata row', () => {
    const incident = initialIncident();
    incident.plan.meta.schoolName = 'Test Academy';
    incident.plan.meta.planVersion = '2.1';
    incident.plan.meta.planDate = '2026-09-15';
    const doc = buildGovernorReport(incident.plan, {}, TODAY);
    const cover = doc.sections[0];
    expect(cover.kind).toBe('cover');
    if (cover.kind !== 'cover') return;
    expect(cover.subtitle).toContain('Test Academy');
    expect(cover.readiness).toBeUndefined();
    expect(cover.operationalStatement).toBeUndefined();
    expect(cover.eyebrow).toBeUndefined();
    const values = (cover.meta ?? []).map((m) => m.value);
    expect(values).toContain('Version 2.1');
    expect(values.find((v) => v.startsWith('Approved'))).toContain('15 September 2026');
  });

  it('empty readiness ⇒ cover + single explainer body, no priority/questions sections', () => {
    const incident = initialIncident();
    const doc = buildGovernorReport(incident.plan, {}, TODAY);
    expect(doc.sections).toHaveLength(2);
    expect(doc.sections[1]?.kind).toBe('body');
    if (doc.sections[1]?.kind !== 'body') return;
    expect(doc.sections[1].title).toMatch(/not yet started/i);
  });

  it('all-green readiness ⇒ exec summary + no priority areas section', () => {
    const incident = initialIncident();
    const doc = buildGovernorReport(incident.plan, allScored(3), TODAY);
    const titles = doc.sections
      .filter((s) => s.kind === 'body')
      .map((s) => (s.kind === 'body' ? s.title : ''));
    expect(titles).toContain('Executive summary');
    expect(titles).not.toContain('Priority areas');
  });

  it('mixed RAG ⇒ priority areas table with red-first rows', () => {
    const r = allScored(3) as Record<string, number>;
    r.R1 = 0;
    r.R2 = 2;
    r.R3 = 0;
    const incident = initialIncident();
    const doc = buildGovernorReport(incident.plan, r, TODAY);
    const priority = doc.sections.find((s) => s.kind === 'body' && s.title === 'Priority areas');
    expect(priority).toBeDefined();
    if (priority?.kind !== 'body') return;
    const table = priority.blocks.find((b) => b.kind === 'table');
    expect(table?.kind).toBe('table');
    if (table?.kind !== 'table') return;
    expect(table.rows[0]?.severity).toBe('red');
  });

  it('Questions for governors section bullets carry actual question text (not undefined)', () => {
    // Regression: build-governor-report previously read `entry.question`, but
    // the data field is `govQ`. Every bullet rendered empty. Test pins the
    // contract: each bullet must be a non-empty string.
    const r = allScored(3) as Record<string, number>;
    r.R1 = 0;
    r.R2 = 2;
    const incident = initialIncident();
    const doc = buildGovernorReport(incident.plan, r, TODAY);
    const sec = doc.sections.find(
      (s) => s.kind === 'body' && s.title === 'Questions for governors to ask',
    );
    if (sec?.kind !== 'body') throw new Error('no governor-questions section');
    const bullets = sec.blocks.find((b) => b.kind === 'bullets');
    if (bullets?.kind !== 'bullets') throw new Error('no bullets block');
    expect(bullets.items.length).toBeGreaterThan(0);
    for (const item of bullets.items) {
      expect(typeof item).toBe('string');
      expect(item.trim().length).toBeGreaterThan(10);
    }
  });

  it('CE not yet certified ⇒ includes a Cyber Essentials section with the assurance question', () => {
    const incident = initialIncident();
    const doc = buildGovernorReport(incident.plan, allScored(3), TODAY);
    const ce = doc.sections.find((s) => s.kind === 'body' && s.title === 'Cyber Essentials assurance');
    expect(ce).toBeDefined();
  });

  it('CE in good standing ⇒ no Cyber Essentials section', () => {
    const incident = initialIncident();
    incident.plan.meta.ceStatus = 'Cyber Essentials Plus';
    incident.plan.meta.ceCertDate = '2026-01-01';
    const doc = buildGovernorReport(incident.plan, allScored(3), TODAY);
    const ce = doc.sections.find((s) => s.kind === 'body' && s.title === 'Cyber Essentials assurance');
    expect(ce).toBeUndefined();
  });

  it('filename slug derives from school name', () => {
    const incident = initialIncident();
    incident.plan.meta.schoolName = 'Test Academy & College';
    const doc = buildGovernorReport(incident.plan, allScored(3), TODAY);
    expect(doc.filenameBase).toMatch(/test-academy-college/);
  });
});
