// React hook for the readiness slice. Subscribes to the shared store and
// re-renders when its slice changes.
//
// We use the explicit useState+useEffect+subscribe pattern rather than
// React 18's useSyncExternalStore. Reason: useSyncExternalStore is strict
// about snapshot identity and SSR/CSR consistency, and any tiny mismatch
// (e.g. when the hook is used inside a client:only island that has no
// matching SSR pass) throws an opaque error that astro-island catches and
// leaves the page blank. The explicit pattern below is a hair more code but
// behaves predictably in every Astro hydration mode.

import { useEffect, useMemo, useState } from 'react';
import { getState, subscribe, update } from './store';
import type { ReadinessState } from '~/data/plan-schema';

export interface UseReadinessState {
  /** Map of question id (e.g. "R3") → score 0..3. Missing key = not yet answered. */
  readiness: ReadinessState;
  /** Set the score for one question. */
  setQuestion: (qid: string, score: number) => void;
  /** Wipe all readiness answers. Plan and tabletop state untouched. */
  resetReadiness: () => void;
}

export function useReadinessState(): UseReadinessState {
  const [readiness, setReadiness] = useState<ReadinessState>(() => getState().readiness);

  useEffect(() => {
    // After mount: pull the latest snapshot in case the store hydrated between
    // first render and effect, then subscribe for future updates.
    setReadiness(getState().readiness);
    return subscribe(() => setReadiness(getState().readiness));
  }, []);

  const actions = useMemo<Omit<UseReadinessState, 'readiness'>>(
    () => ({
      setQuestion: (qid, score) => {
        update((s) => ({ ...s, readiness: { ...s.readiness, [qid]: score } }));
      },
      resetReadiness: () => {
        update((s) => ({ ...s, readiness: {} }));
      },
    }),
    [],
  );

  return { readiness, ...actions };
}
