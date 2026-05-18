// Step-by-step scenario runner. Shows the current step's narrative + question
// + plan-field surface (gaps vs filled), with a free-text answer textarea and
// sticky bottom navigation. The step-indicator strip at the top lets the user
// jump between steps.

import { useMemo } from 'react';
import type { Incident } from '~/data/plan-schema';
import type { Scenario } from '~/data/scenarios';
import { getTabletopStepData, type FieldEntry } from '~/lib/selectors/tabletop-run';

interface Props {
  scenario: Scenario;
  stepIndex: number;
  answer: string;
  state: Incident;
  onSetStep: (idx: number) => void;
  onSetAnswer: (value: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  onExit: () => void;
}

export function ScenarioRunner({
  scenario,
  stepIndex,
  answer,
  state,
  onSetStep,
  onSetAnswer,
  onPrev,
  onNext,
  onFinish,
  onExit,
}: Props) {
  const step = scenario.steps[stepIndex];
  if (!step) return null;

  const { fieldEntries, gaps, filled, isLast } = useMemo(
    () => getTabletopStepData(step, stepIndex, scenario.steps.length, state),
    [step, stepIndex, scenario.steps.length, state],
  );

  return (
    <>
      {/* Header / step indicator strip */}
      <div className="card no-print">
        <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[240px] flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[.06em] text-accent">
              TABLETOP · {scenario.title}
            </div>
            <h2 className="m-0 mt-1 mb-0.5 text-navy">{step.title}</h2>
            <div className="text-[13px] text-muted">{step.time}</div>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="rounded-md border border-line bg-white px-3 py-1 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
          >
            × Exit scenario
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
          {scenario.steps.map((s, i) => {
            let bg: string, color: string, border: string;
            if (i === stepIndex) {
              bg = 'bg-accent';
              color = 'text-white';
              border = 'border-accent';
            } else if (i < stepIndex) {
              bg = 'bg-success';
              color = 'text-white';
              border = 'border-success';
            } else {
              bg = 'bg-white';
              color = 'text-muted';
              border = 'border-line';
            }
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSetStep(i)}
                title={`Step ${i + 1}: ${s.title}`}
                className={`h-[30px] w-[30px] rounded-full border-2 ${border} ${bg} ${color} flex items-center justify-center text-xs font-bold transition`}
              >
                {i + 1}
              </button>
            );
          })}
          <span className="ml-2 text-[13px] text-muted">
            Step {stepIndex + 1} of {scenario.steps.length}
          </span>
        </div>
      </div>

      {/* Scenario context */}
      <div className="card border-l-4 border-l-warning bg-[#fffaf0] p-5">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[.06em] text-warning">
          Scenario
        </div>
        <p className="m-0 text-sm leading-[1.6] text-ink">{step.narrative}</p>
      </div>

      {/* Question */}
      <div className="card border-t-4 border-t-accent p-6">
        <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[.06em] text-accent">
          Question for your team
        </div>
        <p className="m-0 text-[18px] font-semibold leading-[1.5] text-navy">{step.prompt}</p>
      </div>

      {/* Plan field surface */}
      {fieldEntries.length > 0 ? (
        <div className="card">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="m-0 text-navy">Your plan says</h3>
            <div className="text-[13px]">
              {gaps.length > 0 && (
                <span className="font-bold text-danger">
                  ⚠ {gaps.length} gap{gaps.length === 1 ? '' : 's'}
                </span>
              )}
              {gaps.length > 0 && filled.length > 0 && (
                <span className="mx-2 text-muted">·</span>
              )}
              {filled.length > 0 && (
                <span className="font-bold text-success">
                  ✓ {filled.length} filled
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {gaps.map((f) => (
              <FieldRow key={f.path} entry={f} />
            ))}
            {filled.map((f) => (
              <FieldRow key={f.path} entry={f} />
            ))}
          </div>
        </div>
      ) : (
        <div className="card border-l-[3px] border-l-muted bg-[#f7f9fc]">
          <p className="m-0 text-[13px] italic text-muted">
            This step is reflective — no specific plan field is being tested. Capture your team's
            discussion below.
          </p>
        </div>
      )}

      {/* Answer textarea */}
      <div className="card">
        <label className="m-0 block">
          <span className="block text-[15px] font-semibold text-navy-2">
            Your team's response
          </span>
          <span className="mt-1 mb-1.5 block min-h-[16px] text-xs text-muted">
            Capture what your team would actually do at this step. Saved as evidence of testing your plan.
          </span>
          <textarea
            value={answer}
            onChange={(e) => onSetAnswer(e.target.value)}
            className="min-h-[120px] w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
          />
        </label>
      </div>

      {/* Sticky bottom navigation */}
      <div className="card no-print sticky bottom-3.5 z-30 mb-0 p-3.5 px-5 shadow-[0_-2px_12px_rgba(15,23,42,.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={stepIndex === 0}
            className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="text-[13px] text-muted">
            Step {stepIndex + 1} of {scenario.steps.length}
          </span>
          {isLast ? (
            <button
              type="button"
              onClick={onFinish}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1657b8]"
            >
              Finish &amp; view summary →
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1657b8]"
            >
              Next step →
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function FieldRow({ entry }: { entry: FieldEntry }) {
  const isGap = entry.group === 'gap';
  const bg = isGap ? 'bg-danger-soft' : 'bg-success-soft';
  const border = isGap ? 'border-l-danger' : 'border-l-success';
  const indicatorColor = isGap ? 'text-danger' : 'text-success';
  const indicator = isGap ? '⚠' : '✓';
  return (
    <div
      className={`grid grid-cols-[24px_1fr_2fr] items-start gap-3 rounded-r border-l-[3px] ${border} ${bg} px-3.5 py-2.5 text-[13px]`}
    >
      <span className={`text-[14px] font-bold leading-[1.4] ${indicatorColor}`}>{indicator}</span>
      <span className="font-semibold text-navy-2">{entry.label}</span>
      <span className={isGap ? 'italic' : ''}>{entry.display}</span>
    </div>
  );
}
