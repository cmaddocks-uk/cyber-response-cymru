import { PLAN_SECTIONS, type SectionId } from '~/data/plan-sections';
import { withBase } from '~/lib/nav';

interface Props {
  current: SectionId;
  onChange: (id: SectionId) => void;
}

export function PlanFooter({ current, onChange }: Props) {
  const idx = PLAN_SECTIONS.findIndex((s) => s.id === current);
  const isFirst = idx === 0;
  const isLast = idx === PLAN_SECTIONS.length - 1;
  const prev = isFirst ? null : PLAN_SECTIONS[idx - 1];
  const next = isLast ? null : PLAN_SECTIONS[idx + 1];

  const goTo = (id: SectionId) => {
    onChange(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="no-print sticky bottom-[14px] z-30 mt-4 rounded-lg border border-line bg-white p-3 shadow-[0_-2px_12px_rgba(15,23,42,.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {isFirst ? (
            <a
              href={withBase('/readiness')}
              className="inline-block rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-navy no-underline transition hover:bg-[#f0f4fa] hover:!no-underline"
            >
              ← Back to readiness
            </a>
          ) : prev ? (
            <button
              type="button"
              onClick={() => goTo(prev.id)}
              className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:bg-[#f0f4fa]"
            >
              ← Previous: {prev.title}
            </button>
          ) : null}
        </div>
        <div className="text-[13px] text-muted">
          Step {idx + 1} of {PLAN_SECTIONS.length}
        </div>
        <div>
          {isLast ? (
            <a
              href={withBase('/output')}
              className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-[#1657b8] hover:!text-white hover:!no-underline"
            >
              📋 Generate plan →
            </a>
          ) : next ? (
            <button
              type="button"
              onClick={() => goTo(next.id)}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1657b8]"
            >
              Next: {next.title} →
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
