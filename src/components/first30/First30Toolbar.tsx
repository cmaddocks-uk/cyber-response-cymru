import { useState } from 'react';
import type { PlanState } from '~/data/plan-schema';
import { buildFirst30Report } from '~/lib/document-model/build-first30';
import { withBase } from '~/lib/nav';

interface Props {
  plan: PlanState;
}

export function First30Toolbar({ plan }: Props) {
  const [busy, setBusy] = useState(false);

  const handleWord = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { exportReportToWord } = await import('~/lib/document-model/word');
      await exportReportToWord(buildFirst30Report(plan));
    } catch (err) {
      console.error('Word export failed', err);
      alert('Sorry — Word export failed. Please try again, or use Print card as a fallback.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card no-print">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">
        🚨 First 30 Minutes — Rapid Response Card
      </h2>
      <p className="m-0 mb-2 text-sm text-muted">
        A one-page printable card for the moment an incident starts. Print it, laminate it if you
        can, and put copies <strong>by the headteacher's office, in the network/server room, and
        in the bursar's drawer</strong>. The full plan is for governance and assurance — this card
        is for the first 30 minutes, when nobody has time to read 12 sections.
      </p>
      <p className="m-0 mb-2.5 text-[13px] text-muted">
        <strong>Auto-populated</strong> from the contacts you've entered in the Plan Builder. If
        contacts are missing, the card will say <em>[not set]</em> — fill them in via the Plan
        Builder and come back here to print.
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-accent px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#1657b8]"
        >
          🖨️ Print card
        </button>
        <button
          type="button"
          onClick={handleWord}
          disabled={busy}
          className="rounded-md border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa] disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? 'Preparing…' : '📋 Export to Word'}
        </button>
        <a
          href={withBase('/plan')}
          className="rounded-md border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-navy no-underline transition hover:bg-[#f0f4fa] hover:!no-underline"
        >
          ← Back to plan builder
        </a>
      </div>
      <p className="m-0 mt-2 text-xs text-muted">
        Opens your browser's print dialog — choose your physical printer (A4 portrait, single page)
        to print and laminate. <strong>For the cleanest output:</strong> expand <em>"More
        settings"</em> in the print dialog and <strong>uncheck</strong> "Headers and footers" to
        hide the browser-added URL strip.
      </p>
    </div>
  );
}
