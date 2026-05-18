// React hook for the plan slice. Same useState+useEffect+subscribe pattern as
// useReadinessState — see that file for the rationale (boils down to: avoid
// useSyncExternalStore in client:only islands; it's strict about contracts in
// ways that interact badly with astro-island's silent error catching).

import { useEffect, useMemo, useState } from 'react';
import {
  getState,
  subscribe,
  update,
  reset,
  importJsonText,
  exportJsonText,
  type ImportResult,
} from './store';
import type { PlanState } from '~/data/plan-schema';

export interface UsePlanState {
  plan: PlanState;
  /** Functional update against the plan slice. */
  updatePlan: (producer: (plan: PlanState) => PlanState) => void;
  /** Wipe the entire app state (plan + readiness + tabletop). */
  resetAll: () => void;
  /** Schema-validating JSON import. See store.ts for the security guarantees. */
  importJsonText: (text: string) => ImportResult;
  /** Serialise the whole app state for download. */
  exportJsonText: () => string;
}

export function usePlanState(): UsePlanState {
  const [plan, setPlan] = useState<PlanState>(() => getState().plan);

  useEffect(() => {
    setPlan(getState().plan);
    return subscribe(() => setPlan(getState().plan));
  }, []);

  const actions = useMemo<Omit<UsePlanState, 'plan'>>(
    () => ({
      updatePlan: (producer) => {
        update((s) => ({ ...s, plan: producer(s.plan) }));
      },
      resetAll: () => {
        reset();
      },
      importJsonText,
      exportJsonText,
    }),
    [],
  );

  return { plan, ...actions };
}
