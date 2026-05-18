// Toolbar above the generated plan: Word export, Print, completion status,
// Save working data, Back to edit.
//
// Gap count and "jump to next incomplete section" both derive from the
// selector layer — no DOM querying. The Word export goes through the
// document-model + dynamic-imported docx pipeline.

import { useState } from 'react';
import { usePlanState } from '~/state/usePlanState';
import { downloadText, slugify } from '~/lib/download';
import { withBase } from '~/lib/nav';
import { getOverallStatus, getSectionStatus } from '~/lib/selectors/plan-status';
import { PLAN_SECTIONS } from '~/data/plan-sections';
import { buildPlanReport } from '~/lib/document-model/build-plan';

export function PlanToolbar() {
  const { plan, exportJsonText } = usePlanState();
  const [busy, setBusy] = useState(false);

  // Gap count from the selector layer — no DOM query, no race with paint.
  const overall = getOverallStatus(plan);
  const gapCount = overall.total - overall.filled;

  const handleWord = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { exportReportToWord } = await import('~/lib/document-model/word');
      await exportReportToWord(buildPlanReport(plan));
    } catch (err) {
      console.error('Word export failed', err);
      alert('Sorry — Word export failed. Please try again, or use Print to paper as a fallback.');
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = () => window.print();

  const handleJumpGap = () => {
    // Find the first section with any incomplete fields and scroll to its
    // anchor. Each section in sections.tsx carries id="plan-sec-N"; we walk
    // PLAN_SECTIONS in order, ask the selector how complete each one is, and
    // pick the first that isn't full.
    for (let i = 0; i < PLAN_SECTIONS.length; i++) {
      const s = PLAN_SECTIONS[i]!;
      const c = getSectionStatus(plan, s.id);
      if (c.filled < c.total) {
        const target = document.getElementById(`plan-sec-${i + 1}`);
        if (target) {
          const rect = target.getBoundingClientRect();
          window.scrollTo({ top: window.scrollY + rect.top - 100, behavior: 'smooth' });
        }
        return;
      }
    }
    alert('No incomplete sections — every plan field has a value.');
  };

  const handleSaveJson = () => {
    const slug = slugify(plan.meta.schoolName || 'school');
    const date = new Date().toISOString().slice(0, 10);
    downloadText(exportJsonText(), `cyber-response-plan-${slug}-${date}.json`);
  };

  return (
    <div className="card no-print">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Your Cyber Incident Response Plan</h2>
      <p className="m-0 mb-2.5 text-sm text-muted">
        Use the table of contents on the left to jump to any section. Print it as a hard copy to
        keep alongside your business continuity documentation. You can also save the working data
        file to re-edit later.
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
          onClick={handlePrint}
          className="rounded-md border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
        >
          🖨️ Print to paper
        </button>
        <button
          type="button"
          onClick={handleJumpGap}
          className="rounded-md border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
        >
          ⚠️ Jump to next incomplete section{' '}
          {gapCount > 0 && (
            <span className="ml-1 text-danger font-bold">({gapCount})</span>
          )}
          {gapCount === 0 && <span className="ml-1 text-success font-bold">✓</span>}
        </button>
        <button
          type="button"
          onClick={handleSaveJson}
          className="rounded-md border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
        >
          💾 Save working data
        </button>
        <a
          href={withBase('/plan')}
          className="rounded-md border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy no-underline transition hover:bg-[#f0f4fa] hover:!no-underline"
        >
          ← Back to edit
        </a>
      </div>
      <p className="m-0 mt-2 text-xs text-muted">
        💡 <strong>For a print-quality PDF:</strong> use <em>Export to Word</em>, then in Word /
        LibreOffice / Google Docs choose <em>File → Save as PDF</em>. Tables, page breaks and
        typography come out far cleaner than browser print.
      </p>
    </div>
  );
}
