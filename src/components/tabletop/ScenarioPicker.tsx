// Tabletop scenario selection screen. Shows 6 scenarios as cards with a
// category chip + completion status, and a button to start/re-run/view-summary.

import type { ScenarioId, TabletopState } from '~/data/plan-schema';
import { SCENARIOS } from '~/data/scenarios';

interface Props {
  tabletop: TabletopState;
  onStart: (id: ScenarioId, reset: boolean) => void;
  onViewSummary: (id: ScenarioId) => void;
}

interface Category {
  label: string;
  cls: string;
}

function scenarioCategory(id: ScenarioId): Category {
  if (id === 'example-c-bec') return { label: 'BEC', cls: 'bg-warning-soft text-warning' };
  if (id === 'example-d-account-compromise')
    return { label: 'Account compromise', cls: 'bg-[#e8efff] text-[#1f4ed8]' };
  if (id === 'example-e-insider') return { label: 'Insider', cls: 'bg-[#f3e8ff] text-[#6b21a8]' };
  if (id === 'example-f-cloud-ransomcloud')
    return { label: 'Cloud / SaaS', cls: 'bg-[#ecfeff] text-[#0e7490]' };
  return { label: 'Ransomware', cls: 'bg-danger-soft text-danger' };
}

export function ScenarioPicker({ tabletop, onStart, onViewSummary }: Props) {
  return (
    <>
      <div className="card no-print">
        <h2 className="m-0 mb-1 text-xl font-bold text-navy">🎯 Tabletop Exercise</h2>
        <p className="m-0 mb-2 text-sm text-muted">
          Test your incident response plan against an example scenario. Each scenario walks through
          the timeline of a realistic incident — at every step, the relevant fields from your own
          plan are surfaced so you can see what your plan actually says to do, capture your team's
          intended response, and identify gaps where the plan is silent.
        </p>
        <div className="mb-2 rounded-r border-l-[3px] border-warning bg-warning-soft p-3 text-[13px] leading-[1.5]">
          <strong>About these scenarios:</strong> the tabletops below are{' '}
          <strong>illustrative example scenarios</strong> covering common patterns of UK
          education-sector cyber incidents (ransomware, business email compromise, account
          takeover, insider threat, cloud/SaaS). They are{' '}
          <strong>not affiliated with, not endorsed by, and do not represent any specific school
          or trust</strong>{' '}
          — figures, names, dates and details are fictional. Wales has no DfE-style sector cyber
          hub; for free pre-incident advice contact your regional ROCU Cyber PROTECT team
          (TARIAN for South Wales / Gwent / Dyfed-Powys, NWROCU for North Wales).
        </div>
        <p className="m-0 text-[13px] text-muted">
          <strong>NCSC and most LA cyber cover arrangements expect annual testing of your plan</strong>
          — this counts. Each tabletop takes roughly 15–25 minutes. Complete it with your SLT
          digital lead, IT lead, comms lead and DPO — that's the minimum quorum. Print the summary
          at the end as your record of testing.
        </p>
      </div>

      <div className="card">
        <h3 className="mt-0 mb-3 text-base font-bold text-navy">Choose a scenario</h3>
        <div className="flex flex-col gap-3">
          {SCENARIOS.map((s) => {
            const completed = tabletop.completed[s.id] ?? '';
            const accent = completed ? 'border-l-success' : 'border-l-accent';
            const bg = completed ? 'bg-success-soft' : 'bg-[#f7f9fc]';
            const border = completed ? 'border-success' : 'border-line';
            const cat = scenarioCategory(s.id);
            return (
              <div
                key={s.id}
                className={`rounded-md border ${border} border-l-4 ${accent} ${bg} p-3.5 px-4`}
              >
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-muted">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.04em] ${cat.cls}`}
                    >
                      {cat.label}
                    </span>
                    <span>
                      <strong className="text-ink">{s.steps.length} steps</strong> · ~20 min
                    </span>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted"
                    >
                      {s.sourceLabel} →
                    </a>
                    {completed && (
                      <span className="font-bold text-success">
                        · ✓ COMPLETED {completed}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {completed ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onViewSummary(s.id)}
                          className="rounded-md border border-line bg-white px-3 py-1 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
                        >
                          View summary
                        </button>
                        <button
                          type="button"
                          onClick={() => onStart(s.id, true)}
                          className="rounded-md border border-line bg-white px-3 py-1 text-[13px] font-semibold text-navy transition hover:bg-[#f0f4fa]"
                        >
                          Re-run
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStart(s.id, false)}
                        className="rounded-md bg-accent px-3 py-1 text-[13px] font-semibold text-white transition hover:bg-[#1657b8]"
                      >
                        Start scenario →
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="m-0 mb-1 text-[15px] font-bold text-navy">{s.title}</h4>
                <div className="text-[13px] leading-[1.5] text-ink">{s.subtitle}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
