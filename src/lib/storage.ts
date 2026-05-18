// sessionStorage wrapper. Same key as v1.7.0 so saved JSON exports from the
// old build load cleanly into v2 once the full plan/readiness shape lands.
//
// sessionStorage (not localStorage) is deliberate: the privacy promise is
// "data wiped when the tab closes". Don't change without revisiting that.

export const STORAGE_KEY = 'cyberResponseState';

export function loadRaw(): unknown {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveRaw(value: unknown): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Quota exceeded / serialisation failure / SSR — swallow.
  }
}

export function clearRaw(): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
