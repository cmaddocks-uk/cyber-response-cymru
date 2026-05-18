// React hook for the tabletop slice. Same useState+useEffect+subscribe
// pattern as useReadinessState and usePlanState — see those files for the
// rationale (avoid useSyncExternalStore in client:only islands).

import { useEffect, useMemo, useState } from 'react';
import { getState, subscribe, update } from './store';
import type { ScenarioId, TabletopState } from '~/data/plan-schema';

export interface UseTabletopState {
  tabletop: TabletopState;
  /** Switch to a scenario. Pass empty string to return to the picker. */
  setActiveScenario: (id: ScenarioId | '') => void;
  /** Move within the active scenario. Caller validates against scenario length. */
  setCurrentStep: (step: number) => void;
  /** Write the user's free-text response for one step. */
  setAnswer: (scenarioId: ScenarioId, stepId: string, value: string) => void;
  /** Reset a scenario's answers + completion timestamp (so it can be re-run cleanly). */
  resetScenario: (id: ScenarioId) => void;
  /** Stamp a completion date (today, ISO) for the given scenario. */
  markCompleted: (id: ScenarioId) => void;
}

export function useTabletopState(): UseTabletopState {
  const [tabletop, setTabletop] = useState<TabletopState>(() => getState().tabletop);

  useEffect(() => {
    setTabletop(getState().tabletop);
    return subscribe(() => setTabletop(getState().tabletop));
  }, []);

  const actions = useMemo<Omit<UseTabletopState, 'tabletop'>>(
    () => ({
      setActiveScenario: (id) => {
        update((s) => ({
          ...s,
          tabletop: { ...s.tabletop, activeScenario: id, currentStep: 0 },
        }));
      },
      setCurrentStep: (step) => {
        update((s) => ({ ...s, tabletop: { ...s.tabletop, currentStep: step } }));
      },
      setAnswer: (scenarioId, stepId, value) => {
        update((s) => ({
          ...s,
          tabletop: {
            ...s.tabletop,
            scenarioAnswers: {
              ...s.tabletop.scenarioAnswers,
              [scenarioId]: {
                ...(s.tabletop.scenarioAnswers[scenarioId] ?? {}),
                [stepId]: value,
              },
            },
          },
        }));
      },
      resetScenario: (id) => {
        update((s) => ({
          ...s,
          tabletop: {
            ...s.tabletop,
            scenarioAnswers: { ...s.tabletop.scenarioAnswers, [id]: {} },
            completed: { ...s.tabletop.completed, [id]: '' },
          },
        }));
      },
      markCompleted: (id) => {
        const today = new Date().toISOString().slice(0, 10);
        update((s) => ({
          ...s,
          tabletop: { ...s.tabletop, completed: { ...s.tabletop.completed, [id]: today } },
        }));
      },
    }),
    [],
  );

  return { tabletop, ...actions };
}
