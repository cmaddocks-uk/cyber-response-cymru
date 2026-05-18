import { describe, it, expect } from 'vitest';
import { getTabletopRunData, getTabletopStepData } from '~/lib/selectors/tabletop-run';
import { initialIncident } from '~/data/plan-schema';
import { SCENARIOS } from '~/data/scenarios';

const SCENARIO = SCENARIOS[0]!;

describe('getTabletopRunData', () => {
  it('returns one TabletopStepData per scenario step', () => {
    const incident = initialIncident();
    const run = getTabletopRunData(SCENARIO, incident);
    expect(run.steps).toHaveLength(SCENARIO.steps.length);
  });

  it('default incident → every referenced path is a gap, allGreen=false', () => {
    const incident = initialIncident();
    const run = getTabletopRunData(SCENARIO, incident);
    const totalRefs = SCENARIO.steps.reduce(
      (n, s) => n + (s.planFields?.length ?? 0),
      0,
    );
    if (totalRefs > 0) {
      expect(run.allGreen).toBe(false);
      expect(run.allGaps.length).toBeGreaterThan(0);
    }
  });

  it('filling a referenced field reduces the gap count by one', () => {
    const incident = initialIncident();
    const firstStepWithFields = SCENARIO.steps.find(
      (s) => s.planFields && s.planFields.length > 0,
    );
    if (!firstStepWithFields) return;
    const path = firstStepWithFields.planFields![0]!;
    const before = getTabletopRunData(SCENARIO, incident).allGaps.length;

    // Walk the dot path and set a non-empty value.
    const parts = path.split('.');
    let cursor: Record<string, unknown> = incident as unknown as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      cursor = cursor[parts[i]!] as Record<string, unknown>;
    }
    cursor[parts.at(-1)!] = 'filled value';

    const after = getTabletopRunData(SCENARIO, incident).allGaps.length;
    expect(after).toBe(before - 1);
  });

  it('allGaps is de-duplicated across steps that share a path', () => {
    const incident = initialIncident();
    const run = getTabletopRunData(SCENARIO, incident);
    const paths = run.allGaps.map((g) => g.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('isLast is set on the final step only', () => {
    const incident = initialIncident();
    const run = getTabletopRunData(SCENARIO, incident);
    const lasts = run.steps.filter((s) => s.isLast);
    expect(lasts).toHaveLength(1);
    expect(lasts[0]!.index).toBe(SCENARIO.steps.length - 1);
  });
});

describe('getTabletopStepData — display formatting', () => {
  it('blank value renders the gap marker', () => {
    const incident = initialIncident();
    const step = SCENARIO.steps.find((s) => s.planFields?.length)!;
    const data = getTabletopStepData(step, 0, SCENARIO.steps.length, incident);
    expect(data.fieldEntries[0]?.group).toBe('gap');
    expect(data.fieldEntries[0]?.display).toMatch(/gap/i);
  });

  it('array values display an entry count', () => {
    const incident = initialIncident();
    // Find a step that references an array field (team.members).
    const step = SCENARIO.steps.find((s) =>
      s.planFields?.some((p) => p === 'plan.team.members'),
    );
    if (!step) return;
    incident.plan.team.members = [
      { name: 'A', role: 'r', phone: '', email: '', alt: '' },
      { name: 'B', role: 'r', phone: '', email: '', alt: '' },
    ];
    const data = getTabletopStepData(step, 0, SCENARIO.steps.length, incident);
    const arrEntry = data.fieldEntries.find((f) => f.path === 'plan.team.members');
    expect(arrEntry?.display).toMatch(/2 entries/);
  });

  it('long string values are truncated to ~90 chars + ellipsis', () => {
    const incident = initialIncident();
    incident.plan.meta.schoolName = 'A'.repeat(200);
    const data = getTabletopStepData(
      { id: 's', time: '', title: '', narrative: '', prompt: '', planFields: ['plan.meta.schoolName'] },
      0,
      1,
      incident,
    );
    expect(data.fieldEntries[0]?.display.length).toBeLessThanOrEqual(91);
    expect(data.fieldEntries[0]?.display).toMatch(/…$/);
  });
});
