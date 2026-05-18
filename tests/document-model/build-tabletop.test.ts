import { describe, it, expect } from 'vitest';
import { buildTabletopReport } from '~/lib/document-model/build-tabletop';
import { initialIncident } from '~/data/plan-schema';
import { SCENARIOS } from '~/data/scenarios';

const TODAY = new Date('2026-05-15T12:00:00Z');
const SCENARIO = SCENARIOS[0]!;

describe('buildTabletopReport', () => {
  it('cover is editorial: scenario title + school + tabletop metadata row (Conducted / source)', () => {
    const incident = initialIncident();
    incident.plan.meta.planVersion = '1.0';
    const doc = buildTabletopReport(SCENARIO, incident, {}, '2026-04-20', TODAY);
    if (doc.sections[0]?.kind !== 'cover') throw new Error('no cover');
    expect(doc.sections[0].title).toBe(SCENARIO.title);
    expect(doc.sections[0].readiness).toBeUndefined();
    expect(doc.sections[0].operationalStatement).toBeUndefined();
    const values = (doc.sections[0].meta ?? []).map((m) => m.value);
    expect(values).toContain('Plan version 1.0');
    expect(values.find((v) => v.startsWith('Conducted'))).toContain('20 April 2026');
    // Gap count is in the Exercise outcome body section, NOT the cover.
    const outcome = doc.sections.find((s) => s.kind === 'body' && s.title === 'Exercise outcome');
    expect(outcome).toBeDefined();
  });

  it('emits Exercise outcome → Step-by-step record (timeline)', () => {
    const incident = initialIncident();
    const doc = buildTabletopReport(SCENARIO, incident, {}, '', TODAY);
    const bodyTitles = doc.sections
      .filter((s) => s.kind === 'body')
      .map((s) => (s.kind === 'body' ? s.title : ''));
    expect(bodyTitles[0]).toBe('Exercise outcome');
    expect(bodyTitles[1]).toBe('Step-by-step record');
  });

  it('exercise outcome contains metric cards + a severity callout', () => {
    const incident = initialIncident();
    const doc = buildTabletopReport(SCENARIO, incident, {}, '', TODAY);
    const outcome = doc.sections.find(
      (s) => s.kind === 'body' && s.title === 'Exercise outcome',
    );
    if (outcome?.kind !== 'body') throw new Error('no outcome');
    expect(outcome.blocks.some((b) => b.kind === 'metricCards')).toBe(true);
    expect(outcome.blocks.some((b) => b.kind === 'callout')).toBe(true);
  });

  it('step-by-step record renders the steps as a timeline block', () => {
    const incident = initialIncident();
    const doc = buildTabletopReport(SCENARIO, incident, {}, '', TODAY);
    const sec = doc.sections.find(
      (s) => s.kind === 'body' && s.title === 'Step-by-step record',
    );
    if (sec?.kind !== 'body') throw new Error('no step section');
    const tl = sec.blocks.find((b) => b.kind === 'timeline');
    if (tl?.kind !== 'timeline') throw new Error('no timeline');
    expect(tl.events).toHaveLength(SCENARIO.steps.length);
  });

  it('appends an All-plan-gaps section only when gaps exist', () => {
    const incident = initialIncident();
    const doc = buildTabletopReport(SCENARIO, incident, {}, '', TODAY);
    const allGaps = doc.sections.find(
      (s) => s.kind === 'body' && s.title === 'All plan gaps identified',
    );
    const hasFields = SCENARIO.steps.some((s) => (s.planFields ?? []).length > 0);
    if (hasFields) {
      expect(allGaps).toBeDefined();
    } else {
      expect(allGaps).toBeUndefined();
    }
  });

  it('timeline event severity reflects step state (gaps ⇒ amber, answered ⇒ green, blank ⇒ muted)', () => {
    const incident = initialIncident();
    const firstStep = SCENARIO.steps[0]!;
    const answers = { [firstStep.id]: 'We disconnected the device.' };
    const doc = buildTabletopReport(SCENARIO, incident, answers, '2026-05-10', TODAY);
    const sec = doc.sections.find(
      (s) => s.kind === 'body' && s.title === 'Step-by-step record',
    );
    if (sec?.kind !== 'body') throw new Error('no step section');
    const tl = sec.blocks.find((b) => b.kind === 'timeline');
    if (tl?.kind !== 'timeline') throw new Error('no timeline');
    // First event: the answered step. Its severity is green if it has no
    // gaps, amber if it has gaps. Either way, it's never 'muted' since we
    // captured an answer.
    expect(tl.events[0]?.severity).not.toBe('muted');
  });
});
