// Root readiness-page island. One React tree wrapping the sticky progress
// strip, all 16 question cards and the summary. State comes from the shared
// store via useReadinessState() so a future "reset readiness" control or
// import-from-JSON flow re-renders this page without needing to navigate.

import { READINESS } from '~/data/readiness';
import { useReadinessState } from '~/state/useReadinessState';
import { ReadinessProgress } from './ReadinessProgress';
import { ReadinessQuestion } from './ReadinessQuestion';
import { ReadinessSummary } from './ReadinessSummary';

export function ReadinessPage() {
  const { readiness, setQuestion } = useReadinessState();
  const allAnswered = Object.keys(readiness).length === READINESS.length;

  return (
    <>
      <ReadinessProgress readiness={readiness} />

      <div>
        {READINESS.map((q, idx) => (
          <ReadinessQuestion
            key={q.id}
            question={q}
            index={idx}
            total={READINESS.length}
            score={readiness[q.id]}
            onSelect={(score) => setQuestion(q.id, score)}
          />
        ))}
      </div>

      {allAnswered && <ReadinessSummary readiness={readiness} />}
    </>
  );
}
