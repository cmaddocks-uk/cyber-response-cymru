// Schema-strict deep merge for JSON imports. This is the security guard for
// `usePlanState().load(file)`: untrusted user JSON gets validated against the
// schema (= the initial state shape) before any value is copied into app state.
//
// Three things this blocks:
//   1. Prototype pollution — only iterates schema keys, never incoming keys,
//      so `__proto__` / `constructor.prototype` from the import are ignored.
//   2. Type confusion — if the schema says a field is a string and the import
//      provides an object, the schema's default value is used instead.
//   3. DoS — strings capped at 50 KB, arrays at 200 items.
//
// Covered by tests in tests/schema.test.ts. Don't change behaviour without
// updating those.

const MAX_STRING_BYTES = 50_000;
const MAX_ARRAY_ITEMS = 200;

export function deepMergeSchema<T>(schema: T, incoming: unknown): T {
  // Primitive strings: keep schema's value unless incoming is a string. Cap length.
  if (typeof schema === 'string') {
    if (typeof incoming !== 'string') return schema;
    return (incoming.length > MAX_STRING_BYTES
      ? incoming.slice(0, MAX_STRING_BYTES)
      : incoming) as T;
  }

  if (typeof schema === 'number') {
    return (typeof incoming === 'number' && Number.isFinite(incoming) ? incoming : schema) as T;
  }

  if (typeof schema === 'boolean') {
    return (typeof incoming === 'boolean' ? incoming : schema) as T;
  }

  if (Array.isArray(schema)) {
    if (!Array.isArray(incoming)) return [...schema] as T;
    const items = incoming.slice(0, MAX_ARRAY_ITEMS);
    // Templated arrays: schema[0] is the shape every entry must match.
    if (schema.length > 0 && typeof schema[0] === 'object' && schema[0] !== null) {
      const template = schema[0];
      return items.map((it) =>
        typeof it === 'object' && it !== null && !Array.isArray(it)
          ? deepMergeSchema(template, it)
          : { ...template },
      ) as T;
    }
    // Primitive arrays: drop entries whose type doesn't match the schema's.
    if (schema.length === 0) return items as T;
    const expectedType = typeof schema[0];
    return items.filter((x) => typeof x === expectedType) as T;
  }

  if (typeof schema === 'object' && schema !== null) {
    if (typeof incoming !== 'object' || incoming === null || Array.isArray(incoming)) {
      return schema;
    }
    const out: Record<string, unknown> = {};
    const src = schema as Record<string, unknown>;
    const inc = incoming as Record<string, unknown>;
    const schemaKeys = Object.keys(src);

    // Open-map case: empty schema object `{}` means "arbitrary string keys with
    // primitive values" (e.g. readiness state: question-id → score, or tabletop
    // scenarioAnswers' inner step-id → response map). We accept any incoming
    // keys but only safe primitive values, and cap the entry count.
    //
    // Without this branch, readiness state silently empties on every hydration
    // because the closed-shape logic below iterates `Object.keys(src)` which is
    // empty for `{}`.
    if (schemaKeys.length === 0) {
      const incomingKeys = Object.keys(inc).slice(0, MAX_ARRAY_ITEMS);
      for (const k of incomingKeys) {
        // Block prototype-pollution keys even in open maps.
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
        const v = inc[k];
        if (typeof v === 'string') {
          out[k] = v.length > MAX_STRING_BYTES ? v.slice(0, MAX_STRING_BYTES) : v;
        } else if (typeof v === 'number' && Number.isFinite(v)) {
          out[k] = v;
        } else if (typeof v === 'boolean') {
          out[k] = v;
        }
        // Reject objects/arrays inside open maps — they can't appear in any
        // current open-shaped slice and would need their own schema to be
        // safely deep-merged.
      }
      return out as T;
    }

    // Closed-shape object: iterate schema keys only. This is what blocks
    // __proto__ / constructor pollution at the top level (Object.keys on the
    // schema never yields those names) and silently drops unknown keys.
    for (const k of schemaKeys) {
      out[k] = Object.prototype.hasOwnProperty.call(inc, k)
        ? deepMergeSchema(src[k], inc[k])
        : src[k];
    }
    return out as T;
  }

  return schema;
}

// One-time cleanup for legacy v1.6.x state where a few seed strings shipped
// HTML-encoded (e.g. "Email &amp; productivity"). Decoding here is idempotent
// so it's safe to run on every load.
const ENTITY_DECODES: Array<[RegExp, string]> = [
  [/&amp;/g, '&'],
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&quot;/g, '"'],
  [/&#39;/g, "'"],
];

export function migrateLegacyEntities<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => migrateLegacyEntities(v)) as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as object)) {
      out[k] = migrateLegacyEntities((value as Record<string, unknown>)[k]);
    }
    return out as T;
  }
  if (typeof value === 'string') {
    let s: string = value;
    for (const [pattern, replacement] of ENTITY_DECODES) s = s.replace(pattern, replacement);
    return s as T;
  }
  return value;
}
