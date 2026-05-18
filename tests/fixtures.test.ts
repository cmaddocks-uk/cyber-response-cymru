// Fixture-driven regression tests. Two saved-plan JSON files exercise the
// schema-merge + entity migration paths against real-shaped data instead of
// synthetic objects.

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initialIncident, type Incident } from '~/data/plan-schema';
import { deepMergeSchema, migrateLegacyEntities } from '~/lib/schema';
import * as store from '~/state/store';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadFixture(name: string): unknown {
  const text = readFileSync(join(__dirname, 'fixtures', name), 'utf8');
  return JSON.parse(text);
}

function importFixture(name: string): Incident {
  const raw = loadFixture(name);
  return migrateLegacyEntities(deepMergeSchema(initialIncident(), raw));
}

beforeEach(() => {
  store.reset();
});

// ---------------------------------------------------------------------------

describe('legacy-v1-plan.json', () => {
  it('loads through the schema merger without throwing', () => {
    expect(() => importFixture('legacy-v1-plan.json')).not.toThrow();
  });

  it('decodes HTML entities in user strings (v1.6.x legacy encoding)', () => {
    const imported = importFixture('legacy-v1-plan.json');
    expect(imported.plan.meta.schoolName).toBe('Anytown High & Sixth Form');
    expect(imported.plan.meta.approverRole).toBe('Headteacher & Accounting Officer');
    expect(imported.plan.external.itProvider.name).toBe('Acme IT & Support');
  });

  it('drops the unknown nested key (plan.polluted)', () => {
    const imported = importFixture('legacy-v1-plan.json');
    expect((imported.plan as unknown as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('drops the unknown top-level key (_v1Notes)', () => {
    const imported = importFixture('legacy-v1-plan.json');
    expect((imported as unknown as Record<string, unknown>)._v1Notes).toBeUndefined();
  });

  it('schema defaults fill in fields the legacy file omits', () => {
    const imported = importFixture('legacy-v1-plan.json');
    // severity / escalation / comms / recovery / review / maintenance not in v1 fixture.
    expect(imported.plan.severity).toBeDefined();
    expect(imported.plan.escalation).toBeDefined();
    expect(imported.plan.comms).toBeDefined();
    expect(imported.plan.recovery).toBeDefined();
    expect(imported.plan.maintenance).toBeDefined();
  });

  it('preserves the school logo (base64 data URI)', () => {
    const imported = importFixture('legacy-v1-plan.json');
    expect(imported.plan.meta.schoolLogo).toMatch(/^data:image\/png;base64,/);
  });

  it('preserves tabletop scenario answers and completion dates', () => {
    const imported = importFixture('legacy-v1-plan.json');
    expect(imported.tabletop.completed['active-learning-trust']).toBe('2025-11-15');
    expect(
      imported.tabletop.scenarioAnswers['active-learning-trust']?.['alt-step-1'],
    ).toContain('disconnected');
  });

  it('preserves readiness scores', () => {
    const imported = importFixture('legacy-v1-plan.json');
    expect(imported.readiness.R1).toBe(3);
    expect(imported.readiness.R3).toBe(1);
  });
});

// ---------------------------------------------------------------------------

describe('current-v2-plan.json', () => {
  it('loads without losing data', () => {
    const imported = importFixture('current-v2-plan.json');
    expect(imported.plan.meta.schoolName).toBe('Anytown High & Sixth Form');
    expect(imported.plan.meta.ceStatus).toBe('Cyber Essentials Plus');
    expect(imported.plan.team.dpoOrg).toBe('External DPO Ltd');
  });

  it('round-trips via the store: import → export → re-import is identical', () => {
    const raw = loadFixture('current-v2-plan.json');
    const json = JSON.stringify(raw);
    const r1 = store.importJsonText(json);
    expect(r1.ok).toBe(true);
    const exported = store.exportJsonText();

    store.reset();
    const r2 = store.importJsonText(exported);
    expect(r2.ok).toBe(true);
    const exportedAgain = store.exportJsonText();
    expect(exportedAgain).toBe(exported);
  });

  it('logo persists through a store round-trip', () => {
    const json = JSON.stringify(loadFixture('current-v2-plan.json'));
    store.importJsonText(json);
    const out = JSON.parse(store.exportJsonText()) as Incident;
    expect(out.plan.meta.schoolLogo).toMatch(/^data:image\/png;base64,/);
  });

  it('tabletop state persists through a store round-trip', () => {
    const json = JSON.stringify(loadFixture('current-v2-plan.json'));
    store.importJsonText(json);
    const out = JSON.parse(store.exportJsonText()) as Incident;
    expect(out.tabletop.completed['active-learning-trust']).toBe('2026-04-20');
    expect(out.tabletop.scenarioAnswers['active-learning-trust']?.['alt-step-2']).toContain(
      'severity as S2',
    );
  });

  it('readiness answers persist through a round-trip', () => {
    const json = JSON.stringify(loadFixture('current-v2-plan.json'));
    store.importJsonText(json);
    const out = JSON.parse(store.exportJsonText()) as Incident;
    expect(Object.keys(out.readiness).length).toBe(16);
    expect(out.readiness.R8).toBe(0);
  });
});

// ---------------------------------------------------------------------------

describe('importJsonText guards', () => {
  it('rejects input over the 1 MB cap', () => {
    const big = '"' + 'a'.repeat(2_000_000) + '"';
    const r = store.importJsonText(big);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/too large/i);
  });

  it('rejects malformed JSON', () => {
    const r = store.importJsonText('not json');
    expect(r.ok).toBe(false);
  });

  it('rejects arrays and primitives at the root', () => {
    expect(store.importJsonText('[]').ok).toBe(false);
    expect(store.importJsonText('null').ok).toBe(false);
    expect(store.importJsonText('42').ok).toBe(false);
  });
});
