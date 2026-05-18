// Shared application store. Module-level state with subscribe/notify so
// multiple React islands on the same page can share the same plan + readiness
// data without prop-drilling or Context (Context can't cross island roots in
// Astro — each island has its own React tree).
//
// Hydrates lazily on first browser-side access: SSR returns the deterministic
// initial state, the client loads from sessionStorage on first read.
//
// All writes go through `update()` / `reset()` / `importJsonText()` so we have
// a single audit point for save+notify.

import { initialIncident, type Incident } from '~/data/plan-schema';
import { loadRaw, saveRaw } from '~/lib/storage';
import { deepMergeSchema, migrateLegacyEntities } from '~/lib/schema';

let _state: Incident = initialIncident();
let _hydrated = false;
const _listeners = new Set<() => void>();

function hydrate(): void {
  if (_hydrated || typeof window === 'undefined') return;
  _hydrated = true;
  const raw = loadRaw();
  if (raw == null) return;
  try {
    _state = migrateLegacyEntities(deepMergeSchema(initialIncident(), raw));
  } catch (err) {
    console.warn('Could not hydrate state from sessionStorage; using defaults.', err);
  }
}

function notify(): void {
  for (const fn of _listeners) fn();
}

export function subscribe(listener: () => void): () => void {
  hydrate();
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
}

export function getState(): Incident {
  hydrate();
  return _state;
}

// For useSyncExternalStore's third arg. Always returns the deterministic
// initial state (no sessionStorage access) so SSR is reproducible.
export function getServerState(): Incident {
  return _state;
}

export function update(producer: (s: Incident) => Incident): void {
  hydrate();
  _state = producer(_state);
  saveRaw(_state);
  notify();
}

export function reset(): void {
  hydrate();
  _state = initialIncident();
  saveRaw(_state);
  notify();
}

export type ImportResult = { ok: true } | { ok: false; reason: string };

const MAX_IMPORT_BYTES = 1_000_000;

export function importJsonText(text: string): ImportResult {
  hydrate();
  if (text.length > MAX_IMPORT_BYTES) {
    return { ok: false, reason: 'File is too large to be a valid plan export (over 1MB).' };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'This does not look like a valid plan export — JSON could not be parsed.' };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, reason: 'This does not look like a valid plan export.' };
  }
  _state = migrateLegacyEntities(deepMergeSchema(initialIncident(), parsed));
  saveRaw(_state);
  notify();
  return { ok: true };
}

export function exportJsonText(): string {
  hydrate();
  return JSON.stringify(_state, null, 2);
}
