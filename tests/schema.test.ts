// Security tests for the data-layer guarantees. Ported from the v1.x
// `security-test.js` so the protections that earned a green run there still
// pass here. Don't relax these without a deliberate, reviewed decision —
// most exist because of a real attack vector documented in SECURITY.md.

import { describe, it, expect, beforeEach } from 'vitest';
import { escapeHtml } from '~/lib/escape';
import { deepMergeSchema, migrateLegacyEntities } from '~/lib/schema';
import { initialIncident } from '~/data/plan-schema';
import * as store from '~/state/store';

beforeEach(() => {
  store.reset();
});

// ----------------------------------------------------------------------------
// escapeHtml — used by the Word export and any future set:html / dangerouslySetInnerHTML
// ----------------------------------------------------------------------------
describe('escapeHtml', () => {
  it('escapes the eight characters in the v1.x replacement table', () => {
    const out = escapeHtml(`<script>alert("/=\`')</script>`);
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(out).toContain('&lt;');
    expect(out).toContain('&gt;');
    expect(out).toContain('&quot;');
    expect(out).toContain('&#x2F;');
    expect(out).toContain('&#x3D;');
    expect(out).toContain('&#x60;');
    expect(out).toContain('&#39;');
  });

  it('escapes ampersands first so we do not double-encode', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('returns empty string for null and undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('preserves the literal "0" when given the number 0 (not falsy-coerced)', () => {
    expect(escapeHtml(0)).toBe('0');
  });

  it('escapes inside attribute-style strings', () => {
    expect(escapeHtml('" onerror="alert(1)')).not.toContain('"');
    expect(escapeHtml("' onerror='alert(1)")).not.toContain("'");
  });
});

// ----------------------------------------------------------------------------
// deepMergeSchema — the JSON-import security guard. Everything below is here
// because there is a real attack vector if it doesn't hold.
// ----------------------------------------------------------------------------
describe('deepMergeSchema — prototype pollution', () => {
  it('blocks pollution via __proto__', () => {
    const malicious = JSON.parse('{"__proto__":{"polluted":true},"plan":{"meta":{"schoolName":"OK"}}}');
    const merged = deepMergeSchema(initialIncident(), malicious);
    // Object prototype not modified
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    // Merged object has no `polluted` key (schema doesn't list it)
    expect((merged as unknown as Record<string, unknown>).polluted).toBeUndefined();
    // Legitimate fields still made it through
    expect(merged.plan.meta.schoolName).toBe('OK');
  });

  it('blocks pollution via constructor.prototype', () => {
    const malicious = JSON.parse('{"constructor":{"prototype":{"polluted2":true}}}');
    deepMergeSchema(initialIncident(), malicious);
    expect(({} as Record<string, unknown>).polluted2).toBeUndefined();
  });
});

describe('deepMergeSchema — schema strictness', () => {
  it('drops unknown top-level keys', () => {
    const input = {
      rogue_top_level: 'should not appear',
      plan: { meta: { schoolName: 'Real Name' } },
    };
    const merged = deepMergeSchema(initialIncident(), input) as unknown as Record<string, unknown>;
    expect(merged.rogue_top_level).toBeUndefined();
    expect(merged.plan).toBeDefined();
  });

  it('drops unknown nested keys', () => {
    const input = {
      plan: { meta: { schoolName: 'Real Name', evilExtraField: 'gone', anotherEvil: { nested: 'stuff' } } },
    };
    const merged = deepMergeSchema(initialIncident(), input);
    const meta = merged.plan.meta as Record<string, unknown>;
    expect(meta.schoolName).toBe('Real Name');
    expect(meta.evilExtraField).toBeUndefined();
    expect(meta.anotherEvil).toBeUndefined();
  });

  it('preserves schema defaults for keys the import omits', () => {
    const partial = { plan: { meta: { schoolName: 'OK' } } };
    const merged = deepMergeSchema(initialIncident(), partial);
    expect(merged.plan.meta.schoolName).toBe('OK');
    expect(merged.plan.meta.planVersion).toBe('1.0'); // from initialPlan()
  });
});

describe('deepMergeSchema — type confusion', () => {
  it('rejects an array where a string field is expected', () => {
    const input = { plan: { meta: { schoolName: ['array', 'instead', 'of', 'string'] } } };
    const merged = deepMergeSchema(initialIncident(), input);
    expect(typeof merged.plan.meta.schoolName).toBe('string');
  });

  it('rejects an object where a string field is expected', () => {
    const input = { plan: { meta: { urn: { nested: 'obj' } } } };
    const merged = deepMergeSchema(initialIncident(), input);
    expect(typeof merged.plan.meta.urn).toBe('string');
  });

  it('rejects a number where a string field is expected', () => {
    const input = { plan: { meta: { planVersion: 42 } } };
    const merged = deepMergeSchema(initialIncident(), input);
    expect(typeof merged.plan.meta.planVersion).toBe('string');
  });
});

describe('deepMergeSchema — size caps', () => {
  it('caps string length at 50_000 bytes', () => {
    const longString = 'x'.repeat(100_000);
    const input = { plan: { meta: { schoolName: longString } } };
    const merged = deepMergeSchema(initialIncident(), input);
    expect(merged.plan.meta.schoolName.length).toBeLessThanOrEqual(50_000);
  });

  it('caps array length at 200 items', () => {
    const bigArray = Array.from({ length: 500 }, () => ({
      name: 'x',
      role: 'x',
      phone: 'x',
      email: 'x',
      alt: 'x',
    }));
    const input = { plan: { team: { members: bigArray } } };
    const merged = deepMergeSchema(initialIncident(), input);
    expect(merged.plan.team.members.length).toBeLessThanOrEqual(200);
  });
});

describe('deepMergeSchema — open maps (empty-object schemas)', () => {
  it('preserves readiness state entries (qid → score)', () => {
    const input = { readiness: { R1: 3, R5: 2, R12: 1 } };
    const merged = deepMergeSchema(initialIncident(), input);
    expect(merged.readiness).toEqual({ R1: 3, R5: 2, R12: 1 });
  });

  it('preserves nested open maps (tabletop scenarioAnswers)', () => {
    const input = {
      tabletop: {
        scenarioAnswers: {
          'active-learning-trust': { 'alt-1': 'first answer', 'alt-2': 'second' },
        },
      },
    };
    const merged = deepMergeSchema(initialIncident(), input);
    expect(merged.tabletop.scenarioAnswers['active-learning-trust']).toEqual({
      'alt-1': 'first answer',
      'alt-2': 'second',
    });
  });

  it('blocks prototype-pollution keys inside open maps', () => {
    const malicious = JSON.parse(
      '{"readiness":{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted2":true}},"R1":3}}',
    );
    const merged = deepMergeSchema(initialIncident(), malicious);
    // Object.prototype itself is unmodified.
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(({} as Record<string, unknown>).polluted2).toBeUndefined();
    // Legitimate readiness entry got through.
    expect(merged.readiness.R1).toBe(3);
    // __proto__ and constructor are NOT own-properties of the merged map
    // (the accessor still reflects the inherited prototype, but no copy was made).
    expect(Object.prototype.hasOwnProperty.call(merged.readiness, '__proto__')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(merged.readiness, 'constructor')).toBe(false);
  });

  it('rejects non-primitive values in open maps', () => {
    const input = {
      readiness: {
        R1: 3,
        R2: { nested: 'bad' },
        R3: [1, 2, 3],
        R4: 2,
      },
    };
    const merged = deepMergeSchema(initialIncident(), input);
    expect(merged.readiness.R1).toBe(3);
    expect((merged.readiness as Record<string, unknown>).R2).toBeUndefined();
    expect((merged.readiness as Record<string, unknown>).R3).toBeUndefined();
    expect(merged.readiness.R4).toBe(2);
  });

  it('caps open-map entry count', () => {
    const huge: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) huge[`Q${i}`] = 2;
    const input = { readiness: huge };
    const merged = deepMergeSchema(initialIncident(), input);
    expect(Object.keys(merged.readiness).length).toBeLessThanOrEqual(200);
  });
});

describe('deepMergeSchema — broken inputs', () => {
  it('falls back to schema for non-object inputs', () => {
    for (const bad of [null, undefined, 'string', 42, true, [1, 2, 3]] as const) {
      const merged = deepMergeSchema(initialIncident(), bad);
      expect(typeof merged).toBe('object');
      expect(merged).not.toBeNull();
      expect(merged.plan).toBeDefined();
    }
  });
});

// ----------------------------------------------------------------------------
// migrateLegacyEntities — one-shot cleanup for v1.6.x HTML-encoded seed strings
// ----------------------------------------------------------------------------
describe('migrateLegacyEntities', () => {
  it('decodes HTML entities in strings, recursively', () => {
    const input = { plan: { assets: { systems: [{ name: 'Email &amp; productivity' }] } } };
    const out = migrateLegacyEntities(input);
    expect((out as typeof input).plan.assets.systems[0].name).toBe('Email & productivity');
  });

  it('leaves non-string values unchanged', () => {
    const input = { count: 5, flag: true, list: [1, 2, 3] };
    const out = migrateLegacyEntities(input);
    expect(out).toEqual(input);
  });

  it('is idempotent (running twice gives the same result)', () => {
    const input = { s: 'a &amp; b &lt; c' };
    const once = migrateLegacyEntities(input);
    const twice = migrateLegacyEntities(once);
    expect(once).toEqual(twice);
  });
});

// ----------------------------------------------------------------------------
// store.importJsonText — the public JSON-import entry point. Wraps deepMergeSchema
// with the file-size and JSON-parse guards.
// ----------------------------------------------------------------------------
describe('store.importJsonText', () => {
  it('rejects input larger than the 1 MB cap', () => {
    const tooBig = 'x'.repeat(1_000_001);
    const result = store.importJsonText(tooBig);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/too large/i);
  });

  it('rejects invalid JSON', () => {
    const result = store.importJsonText('not json {{{');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/parse/i);
  });

  it('rejects non-object JSON values', () => {
    expect(store.importJsonText('"a string"').ok).toBe(false);
    expect(store.importJsonText('42').ok).toBe(false);
    expect(store.importJsonText('true').ok).toBe(false);
    expect(store.importJsonText('null').ok).toBe(false);
    expect(store.importJsonText('[1,2,3]').ok).toBe(false);
  });

  it('accepts a valid plan and writes it through to the store', () => {
    const json = JSON.stringify({ plan: { meta: { schoolName: 'Test School' } } });
    const result = store.importJsonText(json);
    expect(result.ok).toBe(true);
    expect(store.getState().plan.meta.schoolName).toBe('Test School');
  });

  it('still applies prototype-pollution guards when used via the import path', () => {
    const json = '{"__proto__":{"polluted_via_store":true},"plan":{"meta":{"schoolName":"OK"}}}';
    const result = store.importJsonText(json);
    expect(result.ok).toBe(true);
    expect(({} as Record<string, unknown>).polluted_via_store).toBeUndefined();
    expect(store.getState().plan.meta.schoolName).toBe('OK');
  });
});
