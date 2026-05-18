import type { PlanState } from '~/data/plan-schema';
import { PLAN_SECTIONS, type SectionId } from '~/data/plan-sections';
import { getOverallStatus, getSectionStatus } from '~/lib/selectors/plan-status';

interface Props {
  plan: PlanState;
  current: SectionId;
  onChange: (id: SectionId) => void;
}

export function PlanSectionNav({ plan, current, onChange }: Props) {
  const overall = getOverallStatus(plan);
  const overallPct = overall.total === 0 ? 0 : Math.round((overall.filled / overall.total) * 100);

  return (
    <div className="mb-4 rounded-lg border border-line bg-white p-2.5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-line px-1 pb-3.5">
        <div className="text-xs font-semibold text-muted">
          Plan completion:{' '}
          <strong className="text-[13px] text-navy">
            {overall.filled} of {overall.total} fields · {overallPct}%
          </strong>
        </div>
        <div className="h-[6px] min-w-[120px] max-w-[240px] flex-1 overflow-hidden rounded bg-line">
          <div
            className="h-full bg-gradient-to-r from-accent to-[#4287f5] transition-[width] duration-300"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PLAN_SECTIONS.map((section, idx) => {
          const c = getSectionStatus(plan, section.id);
          const active = section.id === current;
          let statusColor = 'text-muted';
          if (c.total > 0) {
            const pct = c.filled / c.total;
            if (pct >= 0.9) statusColor = 'text-success';
            else if (c.filled > 0) statusColor = 'text-warning';
          }
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? 'border-navy bg-navy text-white'
                  : 'border-line bg-white text-navy-2 hover:bg-[#f0f4fa]'
              }`}
            >
              {idx + 1}. {section.title}{' '}
              <span
                className={`ml-1 text-[11px] font-bold ${active ? 'text-white/90' : statusColor}`}
              >
                {c.filled}/{c.total}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
