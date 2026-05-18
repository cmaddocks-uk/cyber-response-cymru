import { describe, it, expect } from 'vitest';
import { getGovernorReportData } from '~/lib/selectors/governor-report';
import { initialIncident } from '~/data/plan-schema';
import { READINESS } from '~/data/readiness';

const TODAY = new Date('2026-05-15T12:00:00Z');

const allScored = (score: number) =>
  Object.fromEntries(READINESS.map((q) => [q.id, score]));

describe('getGovernorReportData', () => {
  it('incomplete readiness ⇒ incomplete-verdict + Not assessed maturity', () => {
    const incident = initialIncident();
    const d = getGovernorReportData(incident.plan, {}, TODAY);
    expect(d.verdict.title).toMatch(/not yet complete/i);
    expect(d.maturity.band).toBe('Not assessed');
    expect(d.totals.answered).toBe(0);
    expect(d.priorityItems).toEqual([]);
    expect(d.governorQuestions).toEqual([]);
  });

  it('all green ⇒ strong verdict and Embedded maturity', () => {
    const incident = initialIncident();
    const d = getGovernorReportData(incident.plan, allScored(3), TODAY);
    expect(d.verdict.title).toMatch(/strong/i);
    expect(d.maturity.band).toBe('Embedded');
    expect(d.priorityItems).toEqual([]);
  });

  it('reds appear first in priorityItems; capped at the priority limit', () => {
    const r = allScored(2) as Record<string, number>;
    // Six reds — more than the default limit of 5.
    for (const id of ['R1', 'R2', 'R3', 'R4', 'R5', 'R6']) r[id] = 0;
    const incident = initialIncident();
    const d = getGovernorReportData(incident.plan, r, TODAY);
    expect(d.priorityItems).toHaveLength(5);
    expect(d.priorityItems.every((it) => it.rag === 'red')).toBe(true);
  });

  it('governorQuestions is uncapped and includes every non-green item', () => {
    const r = allScored(3) as Record<string, number>;
    r.R1 = 0;
    r.R2 = 2;
    r.R3 = 0;
    const incident = initialIncident();
    const d = getGovernorReportData(incident.plan, r, TODAY);
    expect(d.governorQuestions).toHaveLength(3);
  });

  it('CE governor question populated when CE not yet certified', () => {
    const incident = initialIncident();
    const d = getGovernorReportData(incident.plan, {}, TODAY);
    expect(d.ceQuestion).toMatch(/clear plan/i);
  });

  it('CE question null and ceStatus hidden when comfortably in good standing', () => {
    const incident = initialIncident();
    incident.plan.meta.ceStatus = 'Cyber Essentials Plus';
    incident.plan.meta.ceCertDate = '2026-01-01';
    const d = getGovernorReportData(incident.plan, {}, TODAY);
    expect(d.ceQuestion).toBeNull();
    expect(d.ceStatus.visible).toBe(true);
    expect(d.ceStatus.statusLabel).toBe('Cyber Essentials Plus');
  });

  it('priorityLimit override caps the list', () => {
    const r = allScored(2) as Record<string, number>;
    r.R1 = 0;
    r.R2 = 0;
    r.R3 = 0;
    const incident = initialIncident();
    const d = getGovernorReportData(incident.plan, r, TODAY, 2);
    expect(d.priorityItems).toHaveLength(2);
  });
});
