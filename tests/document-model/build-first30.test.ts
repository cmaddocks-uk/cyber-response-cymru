import { describe, it, expect } from 'vitest';
import { buildFirst30Report } from '~/lib/document-model/build-first30';
import { initialIncident } from '~/data/plan-schema';

const TODAY = new Date('2026-05-15T12:00:00Z');

describe('buildFirst30Report', () => {
  it('emits cover + readiness snapshot + response timeline + phase tables + Do NOT + escalation', () => {
    const incident = initialIncident();
    const doc = buildFirst30Report(incident.plan, TODAY);
    const titles = doc.sections.map((s) => (s.kind === 'cover' ? '[cover]' : s.title));
    expect(titles[0]).toBe('[cover]');
    expect(titles).toContain('Readiness snapshot');
    expect(titles).toContain('Response timeline');
    expect(titles).toContain('Phase 1 contacts · 0–5 min');
    expect(titles).toContain('Phase 2 contacts · 5–15 min');
    expect(titles).toContain('Phase 3 contacts · 15–30 min');
    expect(titles).toContain('Do NOT');
    expect(titles).toContain('Escalation chain');
  });

  it('readiness snapshot uses metric cards and a callout', () => {
    const incident = initialIncident();
    const doc = buildFirst30Report(incident.plan, TODAY);
    const snap = doc.sections.find((s) => s.kind === 'body' && s.title === 'Readiness snapshot');
    if (snap?.kind !== 'body') throw new Error('no snapshot');
    expect(snap.blocks.some((b) => b.kind === 'metricCards')).toBe(true);
    expect(snap.blocks.some((b) => b.kind === 'callout')).toBe(true);
  });

  it('response timeline is a timeline block with three events', () => {
    const incident = initialIncident();
    const doc = buildFirst30Report(incident.plan, TODAY);
    const tl = doc.sections.find((s) => s.kind === 'body' && s.title === 'Response timeline');
    if (tl?.kind !== 'body') throw new Error('no timeline section');
    const block = tl.blocks.find((b) => b.kind === 'timeline');
    if (block?.kind !== 'timeline') throw new Error('no timeline block');
    expect(block.events).toHaveLength(3);
    expect(block.events[0]?.severity).toBe('red');
    expect(block.events[2]?.severity).toBe('green');
  });

  it('phase 1 contact table is amber when contacts are blank', () => {
    const incident = initialIncident();
    const doc = buildFirst30Report(incident.plan, TODAY);
    const phase1 = doc.sections.find(
      (s) => s.kind === 'body' && s.title === 'Phase 1 contacts · 0–5 min',
    );
    if (phase1?.kind !== 'body') throw new Error('no phase 1 section');
    const table = phase1.blocks.find((b) => b.kind === 'table');
    if (table?.kind !== 'table') throw new Error('no table');
    expect(table.rows.every((r) => r.severity === 'amber')).toBe(true);
  });

  it('filling the lead promotes phase 1 SLT row from amber to navy', () => {
    const incident = initialIncident();
    incident.plan.team.leadName = 'Alice';
    incident.plan.team.leadPhone = '01234';
    const doc = buildFirst30Report(incident.plan, TODAY);
    const phase1 = doc.sections.find(
      (s) => s.kind === 'body' && s.title === 'Phase 1 contacts · 0–5 min',
    );
    if (phase1?.kind !== 'body') throw new Error('no phase 1 section');
    const table = phase1.blocks.find((b) => b.kind === 'table');
    if (table?.kind !== 'table') throw new Error('no table');
    expect(table.rows[0]?.severity).toBe('navy');
    expect(table.rows[0]?.cells[1]).toBe('Alice');
  });

  it('escalation chain uses an ordered list', () => {
    const incident = initialIncident();
    const doc = buildFirst30Report(incident.plan, TODAY);
    const esc = doc.sections.find((s) => s.kind === 'body' && s.title === 'Escalation chain');
    if (esc?.kind !== 'body') throw new Error('no escalation section');
    const bullets = esc.blocks.find((b) => b.kind === 'bullets');
    if (bullets?.kind !== 'bullets') throw new Error('no bullets');
    expect(bullets.ordered).toBe(true);
    expect(bullets.items.length).toBeGreaterThan(0);
  });
});
