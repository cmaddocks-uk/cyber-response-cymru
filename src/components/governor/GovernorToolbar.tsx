// Governor Report toolbar — Word export via the document-model docx pipeline.
// The docx library (~200 KB) is dynamic-imported on click so it stays off
// the main bundle.

import { useState } from 'react';
import type { PlanState, ReadinessState } from '~/data/plan-schema';
import { buildGovernorReport } from '~/lib/document-model/build-governor-report';
import { withBase } from '~/lib/nav';

interface Props {
  plan: PlanState;
  readiness: ReadinessState;
}

export function GovernorToolbar({ plan, readiness }: Props) {
  const [busy, setBusy] = useState(false);

  const handleWord = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { exportReportToWord } = await import('~/lib/document-model/word');
      await exportReportToWord(buildGovernorReport(plan, readiness));
    } catch (err) {
      console.error('Word export failed', err);
      alert('Sorry — Word export failed. Please try again, or use Print to paper as a fallback.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card no-print">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Governor / Trustee Report</h2>
      <p className="m-0 mb-2.5 text-sm text-muted">
        A one-page, plain-English summary of cyber response readiness designed for governing body
        and trustee meetings. Helps demonstrate assurance against the Estyn "<em>How do you assure
        yourselves...</em>" line of questioning during inspection.
      </p>
      <p className="m-0 mb-2.5 text-[13px] text-muted">
        Estyn does not currently inspect cyber security directly, but cyber response intersects
        with the safeguarding and the leadership and management aspects of inspection.
        <strong> Best practice:</strong> ensure this report is minuted — auditable evidence that
        cyber assurance has taken place at governor level.
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
      </div>
      <p className="m-0 mt-2 text-xs text-muted">
        💡 <strong>For a print-quality PDF:</strong> use <em>Export to Word</em>, then in Word /
        LibreOffice / Google Docs choose <em>File → Save as PDF</em>.
      </p>
    </div>
  );
}
