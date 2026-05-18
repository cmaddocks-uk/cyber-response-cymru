import { READINESS } from '~/data/readiness';
import type { ReadinessState } from '~/data/plan-schema';
import { getRagBand, type RagBand } from '~/lib/selectors/plan-status';

interface Props {
  readiness: ReadinessState;
}

// Sticky strip with one RAG dot per question. Clicking a dot scrolls to that
// question with an offset so it doesn't end up hidden under the topbar +
// the sticky strip itself.
export function ReadinessProgress({ readiness }: Props) {
  const total = READINESS.length;
  const answered = Object.keys(readiness).length;
  const pct = total === 0 ? 0 : Math.round((answered / total) * 100);

  return (
    <div className="card no-print sticky top-[78px] z-20 shadow-card">
      <h2 className="m-0 mb-1 text-xl font-bold text-navy">Readiness check</h2>
      <p className="mb-2.5 mt-0 text-sm text-muted">
        Sixteen questions on the current state of your incident response capability. Each maps to
        NCSC guidance, the Welsh Government Cyber Resilient Wales strategy, local authority cyber
        cover arrangements, Estyn inspection arrangements and the ICO toolkit.
      </p>
      <div className="mb-2.5 h-2 overflow-hidden rounded bg-line">
        <div
          className="h-full bg-gradient-to-r from-accent to-[#4287f5] transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {READINESS.map((q, idx) => (
            <Dot key={q.id} index={idx} qid={q.id} rag={getRagBand(readiness[q.id])} />
          ))}
        </div>
        <p className="m-0 text-[13px] text-muted">
          {answered} of {total} answered
        </p>
      </div>
    </div>
  );
}

function Dot({ index, qid, rag }: { index: number; qid: string; rag: RagBand | null }) {
  const label = `Question ${index + 1} (${qid}) — ${rag ?? 'unanswered'}`;
  const cls = dotClass(rag);
  const onClick = () => scrollToQuestion(qid);
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border-2 p-0 text-[10px] font-bold transition hover:scale-110 ${cls}`}
    >
      {index + 1}
    </button>
  );
}

function dotClass(rag: RagBand | null): string {
  switch (rag) {
    case 'green':
      return 'border-success bg-success text-white';
    case 'amber':
      return 'border-warning bg-warning text-white';
    case 'red':
      return 'border-danger bg-danger text-white';
    default:
      return 'border-line bg-white text-muted';
  }
}

function scrollToQuestion(qid: string): void {
  const el = document.getElementById(`readiness-q-${qid}`);
  if (!el) return;
  // Offset = topbar height (~78px) + sticky strip height (~190px). Estimated;
  // a few px either way doesn't matter visually.
  const offset = 260;
  const rect = el.getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + rect.top - offset, behavior: 'smooth' });
}
