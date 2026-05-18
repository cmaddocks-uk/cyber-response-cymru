import { describe, it, expect } from 'vitest';
import { buildPlanReport } from '~/lib/document-model/build-plan';
import { initialIncident } from '~/data/plan-schema';

const TODAY = new Date('2026-05-15T12:00:00Z');

describe('buildPlanReport', () => {
  it('emits a cover, an executive summary, then 13 numbered sections', () => {
    const incident = initialIncident();
    const doc = buildPlanReport(incident.plan, TODAY);
    expect(doc.sections[0]?.kind).toBe('cover');
    const bodyTitles = doc.sections
      .filter((s) => s.kind === 'body')
      .map((s) => (s.kind === 'body' ? s.title : ''));
    expect(bodyTitles).toHaveLength(14);
    expect(bodyTitles[0]).toBe('Executive summary');
    expect(bodyTitles[1]).toMatch(/^1\. Purpose/);
    expect(bodyTitles[13]).toMatch(/^13\. Framework/);
  });

  it('cover is editorial: title + school + single inline metadata row (no readiness on cover)', () => {
    const incident = initialIncident();
    incident.plan.meta.schoolName = 'Test Academy';
    incident.plan.meta.planVersion = '1.0';
    incident.plan.meta.planDate = '2026-05-15';
    incident.plan.meta.nextReview = '2027-05-17';
    const doc = buildPlanReport(incident.plan, TODAY);
    if (doc.sections[0]?.kind !== 'cover') throw new Error('no cover');
    expect(doc.sections[0].title).toBe('Cyber Incident Response Plan');
    expect(doc.sections[0].subtitle).toContain('Test Academy');
    expect(doc.sections[0].readiness).toBeUndefined();
    expect(doc.sections[0].operationalStatement).toBeUndefined();
    expect(doc.sections[0].eyebrow).toBeUndefined();
    const values = (doc.sections[0].meta ?? []).map((m) => m.value);
    expect(values).toEqual([
      'Version 1.0',
      'Approved 15 May 2026',
      'Next review 17 May 2027',
    ]);
  });

  it('CIRT table has a navy severity row for the lead when name is filled', () => {
    const incident = initialIncident();
    incident.plan.team.leadName = 'Alice';
    const doc = buildPlanReport(incident.plan, TODAY);
    const cirt = doc.sections.find(
      (s) => s.kind === 'body' && s.title.startsWith('2.'),
    );
    if (cirt?.kind !== 'body') throw new Error('no CIRT');
    const table = cirt.blocks.find((b) => b.kind === 'table');
    if (table?.kind !== 'table') throw new Error('no table');
    expect(table.rows[0]?.severity).toBe('navy');
    expect(table.rows[0]?.cells[1]).toBe('Alice');
  });

  it('severity bands section renders four severity-tinted rows', () => {
    const incident = initialIncident();
    const doc = buildPlanReport(incident.plan, TODAY);
    const sec = doc.sections.find((s) => s.kind === 'body' && s.title.startsWith('4.'));
    if (sec?.kind !== 'body') throw new Error('no severity section');
    const table = sec.blocks.find((b) => b.kind === 'table');
    if (table?.kind !== 'table') throw new Error('no table');
    expect(table.rows).toHaveLength(4);
    expect(table.rows[0]?.severity).toBe('red');
    expect(table.rows[3]?.severity).toBe('green');
  });

  it('playbooks section shows "no playbooks enabled" callout when nothing is enabled', () => {
    const incident = initialIncident();
    for (const k of Object.keys(incident.plan.playbooks)) {
      incident.plan.playbooks[k as keyof typeof incident.plan.playbooks].enabled = false;
    }
    const doc = buildPlanReport(incident.plan, TODAY);
    const sec = doc.sections.find((s) => s.kind === 'body' && s.title.startsWith('7.'));
    if (sec?.kind !== 'body') throw new Error('no playbooks');
    const callout = sec.blocks.find(
      (b) => b.kind === 'paragraph' && b.callout === 'amber',
    );
    expect(callout).toBeDefined();
  });

  it('enabling a playbook lists its steps as an ordered bullet list', () => {
    const incident = initialIncident();
    incident.plan.playbooks.ransomware = { enabled: true, notes: 'Tested 2026-03.' };
    const doc = buildPlanReport(incident.plan, TODAY);
    const sec = doc.sections.find((s) => s.kind === 'body' && s.title.startsWith('7.'));
    if (sec?.kind !== 'body') throw new Error('no playbooks');
    const orderedList = sec.blocks.find(
      (b) => b.kind === 'bullets' && b.ordered === true,
    );
    expect(orderedList).toBeDefined();
  });

  it('filename slug derives from school name', () => {
    const incident = initialIncident();
    incident.plan.meta.schoolName = 'Anytown High & Sixth Form';
    const doc = buildPlanReport(incident.plan, TODAY);
    expect(doc.filenameBase).toMatch(/anytown-high-sixth-form/);
  });

  it('CE status surfaces inside the Executive summary section (not on the cover)', () => {
    const incident = initialIncident();
    incident.plan.meta.ceStatus = 'Cyber Essentials Plus';
    incident.plan.meta.ceCertDate = '2026-01-01';
    const doc = buildPlanReport(incident.plan, TODAY);
    const execSec = doc.sections.find((s) => s.kind === 'body' && s.title === 'Executive summary');
    if (execSec?.kind !== 'body') throw new Error('no exec summary');
    const cards = execSec.blocks.find((b) => b.kind === 'metricCards');
    if (cards?.kind !== 'metricCards') throw new Error('no metric cards');
    const ceCard = cards.cards.find((c) => c.label === 'CE status');
    expect(ceCard?.value).toBe('CE Plus');
  });
});
