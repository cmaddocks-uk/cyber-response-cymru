// Root tabletop-page island. Routes between three views based on tabletop
// state:
//   - no active scenario     → ScenarioPicker
//   - active + in-progress   → ScenarioRunner
//   - active + completed     → ScenarioSummary (with Word/print toolbar)
//
// "Active + completed" happens after the user clicks Finish on the last step,
// or after they click "View summary" on a previously-completed scenario from
// the picker. The Word export builds an IncidentReport via the tabletop
// builder and runs through the single docx pipeline.

import { useState } from 'react';
import { useTabletopState } from '~/state/useTabletopState';
import { usePlanState } from '~/state/usePlanState';
import { useReadinessState } from '~/state/useReadinessState';
import { SCENARIO_BY_ID, type Scenario } from '~/data/scenarios';
import type { Incident } from '~/data/plan-schema';
import { buildTabletopReport } from '~/lib/document-model/build-tabletop';
import { DocumentRenderer } from '~/components/document/DocumentRenderer';
import { ScenarioPicker } from './ScenarioPicker';
import { ScenarioRunner } from './ScenarioRunner';

export function TabletopPage() {
  // Subscribe to every slice the runner/summary may surface via getByPath.
  // Building the Incident shape from hooks (rather than calling getState()
  // directly) keeps the components subscribed — they re-render if the user
  // edits their plan mid-tabletop.
  const { plan } = usePlanState();
  const { readiness } = useReadinessState();
  const {
    tabletop,
    setActiveScenario,
    setCurrentStep,
    setAnswer,
    resetScenario,
    markCompleted,
  } = useTabletopState();
  const state: Incident = { plan, readiness, tabletop };

  // No active scenario → picker
  if (!tabletop.activeScenario) {
    return (
      <ScenarioPicker
        tabletop={tabletop}
        onStart={(id, reset) => {
          if (reset) resetScenario(id);
          setActiveScenario(id);
        }}
        onViewSummary={(id) => {
          const scenario = SCENARIO_BY_ID[id];
          setActiveScenario(id);
          setCurrentStep(scenario.steps.length);
        }}
      />
    );
  }

  const scenario = SCENARIO_BY_ID[tabletop.activeScenario];
  if (!scenario) {
    // Active scenario is unknown (e.g. corrupted state) — bounce to picker.
    setActiveScenario('');
    return null;
  }

  // Active + past last step → summary
  if (tabletop.currentStep >= scenario.steps.length) {
    const answers = tabletop.scenarioAnswers[scenario.id] ?? {};
    const completedDate = tabletop.completed[scenario.id] ?? '';
    const report = buildTabletopReport(scenario, state, answers, completedDate);
    return (
      <TabletopSummaryView
        scenario={scenario}
        state={state}
        answers={answers}
        completedDate={completedDate}
        onExit={() => setActiveScenario('')}
      >
        <DocumentRenderer report={report} />
      </TabletopSummaryView>
    );
  }

  // Active + running → runner
  const answers = tabletop.scenarioAnswers[scenario.id] ?? {};
  const currentStepObj = scenario.steps[tabletop.currentStep];
  const currentAnswer = currentStepObj ? answers[currentStepObj.id] ?? '' : '';

  return (
    <ScenarioRunner
      scenario={scenario}
      stepIndex={tabletop.currentStep}
      answer={currentAnswer}
      state={state}
      onSetStep={(idx) => setCurrentStep(idx)}
      onSetAnswer={(value) => {
        if (currentStepObj) setAnswer(scenario.id, currentStepObj.id, value);
      }}
      onPrev={() => {
        if (tabletop.currentStep > 0) setCurrentStep(tabletop.currentStep - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onNext={() => {
        setCurrentStep(tabletop.currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onFinish={() => {
        markCompleted(scenario.id);
        setCurrentStep(scenario.steps.length);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onExit={() => setActiveScenario('')}
    />
  );
}

interface SummaryViewProps {
  scenario: Scenario;
  state: Incident;
  answers: Record<string, string>;
  completedDate: string;
  onExit: () => void;
  children: React.ReactNode;
}

function TabletopSummaryView({ scenario, state, answers, completedDate, onExit, children }: SummaryViewProps) {
  const [busy, setBusy] = useState(false);

  const handleWord = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { exportReportToWord } = await import('~/lib/document-model/word');
      await exportReportToWord(buildTabletopReport(scenario, state, answers, completedDate));
    } catch (err) {
      console.error('Word export failed', err);
      alert('Sorry — Word export failed. Please try again, or use Print to paper as a fallback.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="card no-print">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-xl font-bold text-navy">Tabletop Summary</h2>
            <p className="m-0 mt-1 text-sm text-muted">
              Print or save this summary as evidence of plan testing. NCSC and most LA cyber cover arrangements expect annual testing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleWord}
              disabled={busy}
              className="rounded-md bg-accent px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#1657b8] disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? 'Preparing…' : '📋 Export to Word'}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-md border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
            >
              🖨️ Print to paper
            </button>
            <button
              type="button"
              onClick={onExit}
              className="rounded-md border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
            >
              ← Back to scenarios
            </button>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
