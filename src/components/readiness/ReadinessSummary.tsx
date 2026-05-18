// Readiness Summary panel — purely a renderer. All scoring, banding,
// verdict-wording and priority-action selection lives in
// `~/lib/selectors/readiness-summary`. This file contains no business
// logic; if a number needs computing, it comes from the selector.

import type { ReadinessState } from '~/data/plan-schema';
import { withBase } from '~/lib/nav';
import {
  getReadinessSummaryData,
  type ReadinessSummaryAction,
  type VerdictTone,
} from '~/lib/selectors/readiness-summary';

interface Props {
  readiness: ReadinessState;
}

export function ReadinessSummary({ readiness }: Props) {
  const { totals, verdict, actions } = getReadinessSummaryData(readiness);

  return (
    <div className="card">
      <h2 className="m-0 mb-3 text-xl font-bold text-navy">Your readiness summary</h2>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <ScoreCell value={`${totals.total} / ${totals.max}`} label="Score (out of 48)" />
        <ScoreCell value={`${totals.pct}%`} label="Readiness" />
        <ScoreCell value={totals.red} label="Red gaps" color="text-danger" />
        <ScoreCell value={totals.amber} label="Amber gaps" color="text-warning" />
        <ScoreCell value={totals.green} label="Green" color="text-success" />
      </div>

      <div className={`mb-4 rounded-md border-l-4 p-4 ${bannerClass(verdict.tone)}`}>
        <h4 className="m-0 mb-1.5 text-sm font-bold uppercase tracking-[.04em] text-navy-2">
          {verdict.title}
        </h4>
        <p className="m-0 text-[13px]">{verdict.text}</p>
      </div>

      <h3 className="mb-2 mt-4 text-base font-bold text-navy">Priority actions</h3>
      {actions.length === 0 ? (
        <p className="text-sm italic text-muted">
          No priority actions — all areas are green. Maintain your testing schedule.
        </p>
      ) : (
        <div className="space-y-2">
          {actions.map((a) => (
            <PriorityRow key={a.qid} action={a} />
          ))}
        </div>
      )}

      <div className="no-print mt-5 flex flex-wrap gap-2.5">
        <a
          href={withBase('/governor')}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-[#1657b8] hover:!text-white hover:!no-underline"
        >
          📊 Generate governor report →
        </a>
        <a
          href={withBase('/plan')}
          className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-navy no-underline transition hover:bg-[#f0f4fa] hover:!no-underline"
        >
          Continue to plan builder →
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:bg-[#f0f4fa]"
        >
          🖨️ Print readiness report
        </button>
      </div>
    </div>
  );
}

function ScoreCell({
  value,
  label,
  color = 'text-navy',
}: {
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-[#f7f9fc] p-3 text-center">
      <div className={`text-[28px] font-extrabold leading-none ${color}`}>{value}</div>
      <div className="mt-1.5 text-xs font-semibold uppercase tracking-[.04em] text-muted">
        {label}
      </div>
    </div>
  );
}

function PriorityRow({ action }: { action: ReadinessSummaryAction }) {
  const border = action.rag === 'red' ? 'border-danger' : 'border-warning';
  return (
    <div className={`rounded-r-md border-l-[3px] bg-[#fafbfc] px-3 py-2.5 ${border}`}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[.05em] text-accent">
          {action.qid}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${
            action.rag === 'red' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
          {action.rag.toUpperCase()}
        </span>
      </div>
      <div className="mb-1.5 text-[13px] text-muted">{action.qtext}</div>
      <div className="rounded-r border-l-2 border-accent bg-[#eaf2fd] px-3 py-2 text-[13px]">
        {action.action}
      </div>
    </div>
  );
}

/** Maps a verdict tone to the Tailwind classes for the verdict banner. */
function bannerClass(tone: VerdictTone): string {
  switch (tone) {
    case 'success':
      return 'border-success bg-success-soft';
    case 'warning':
      return 'border-warning bg-warning-soft';
    case 'danger':
      return 'border-danger bg-danger-soft';
    case 'muted':
      return 'border-accent bg-[#eaf2fd]';
  }
}
