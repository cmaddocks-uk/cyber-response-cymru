// Action Plan toolbar — Word export via the document-model docx pipeline.
// The docx library is dynamic-imported on click; main bundle stays lean.

import { useState } from 'react';
import type { PlanState, ReadinessState } from '~/data/plan-schema';
import { buildActionPlan } from '~/lib/document-model/build-action-plan';
import { withBase } from '~/lib/nav';

interface Props {
  plan: PlanState;
  readiness: ReadinessState;
}

export function ActionPlanToolbar({ plan, readiness }: Props) {
  const [busy, setBusy] = useState(false);

  const handleWord = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { exportReportToWord } = await import('~/lib/document-model/word');
      await exportReportToWord(buildActionPlan(plan, readiness));
    } catch (err) {
      console.error('Word export failed', err);
      alert('Sorry — Word export failed. Please try again, or use Print to paper as a fallback.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card no-print">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">📋 Prioritised Action Plan</h2>
      <p className="m-0 mb-2 text-sm text-muted">
        Auto-generated from your readiness check. Lists every red and amber item, ordered by
        priority, with the suggested next-step action and the framework it maps to.
      </p>
      <p className="m-0 mb-2.5 text-[13px] text-muted">
        <strong>
          Designed to be printed, taken into an SLT or IT planning meeting, and used to assign
          owners and target dates by hand.
        </strong>{' '}
        The tool deliberately doesn't ask you to enter owners and dates here — that work happens in
        your normal action tracker, not in another web form.
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2.5">
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
        <a
          href={withBase('/readiness')}
          className="rounded-md border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy no-underline transition hover:bg-[#f0f4fa] hover:!no-underline"
        >
          ← Back to readiness check
        </a>
        <a
          href={withBase('/plan')}
          className="rounded-md border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy no-underline transition hover:bg-[#f0f4fa] hover:!no-underline"
        >
          Plan Builder →
        </a>
      </div>
      <p className="m-0 mt-2 text-xs text-muted">
        💡 <strong>For a print-quality PDF:</strong> use <em>Export to Word</em>, then in Word /
        LibreOffice / Google Docs choose <em>File → Save as PDF</em>.
      </p>
    </div>
  );
}
