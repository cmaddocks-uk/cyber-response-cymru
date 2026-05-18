import {
  FRAMEWORK_META,
  type Framework,
  type ReadinessQuestion as RQ,
} from '~/data/readiness';
import { getRagBand, type RagBand } from '~/lib/selectors/plan-status';

interface Props {
  question: RQ;
  index: number;
  total: number;
  score: number | undefined;
  onSelect: (score: number) => void;
}

export function ReadinessQuestion({ question, index, total, score, onSelect }: Props) {
  const rag = getRagBand(score);
  const borderColor = leftBorderClass(rag);

  return (
    <div id={`readiness-q-${question.id}`} className="card scroll-mt-[260px]">
      <div className={`rounded-r-md border-l-[3px] bg-[#fafbfc] px-4 py-3 ${borderColor}`}>
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2.5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.05em] text-accent">
              Question {index + 1} of {total} · {question.id}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {question.frameworks.map((f) => (
                <FrameworkPill key={f} framework={f} />
              ))}
            </div>
          </div>
          {rag && <RagBadge rag={rag} />}
        </div>

        <div className="mb-2 font-semibold text-ink">{question.text}</div>

        <div className="space-y-1.5">
          {question.opts.map((opt, i) => {
            const selected = score === i;
            return (
              <label
                key={i}
                className={`block cursor-pointer rounded-md border px-2.5 py-2 text-[13px] transition ${
                  selected
                    ? 'border-accent bg-[#eaf2fd] shadow-[inset_3px_0_0_#1f6feb]'
                    : 'border-line bg-white hover:border-accent hover:bg-[#f5f9ff]'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={i}
                  checked={selected}
                  onChange={() => onSelect(i)}
                  className="mr-2 align-middle"
                />
                {opt}
              </label>
            );
          })}
        </div>

        {score != null && score < 3 && (
          <div className="mt-2 rounded-r border-l-2 border-accent bg-[#eaf2fd] px-3 py-2 text-[13px]">
            <strong>Suggested action:</strong>{' '}
            {question.actions[score] ?? question.actions[question.actions.length - 1]}
          </div>
        )}
      </div>
    </div>
  );
}

function leftBorderClass(rag: RagBand | null): string {
  switch (rag) {
    case 'green':
      return 'border-success';
    case 'amber':
      return 'border-warning';
    case 'red':
      return 'border-danger';
    default:
      return 'border-accent';
  }
}

function FrameworkPill({ framework }: { framework: Framework }) {
  const meta = FRAMEWORK_META[framework];
  return (
    <a
      href={meta.href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${meta.label} in a new tab`}
      className={`inline-block rounded-full px-2.5 py-[3px] text-[11px] font-bold uppercase tracking-[.02em] no-underline transition hover:-translate-y-px hover:opacity-90 ${meta.pillClass}`}
    >
      {meta.label}
    </a>
  );
}

function RagBadge({ rag }: { rag: RagBand }) {
  const bg = ragBadgeClass(rag);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${bg}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {rag.toUpperCase()}
    </span>
  );
}

function ragBadgeClass(rag: RagBand): string {
  switch (rag) {
    case 'green':
      return 'bg-success-soft text-success';
    case 'amber':
      return 'bg-warning-soft text-warning';
    case 'red':
      return 'bg-danger-soft text-danger';
  }
}
