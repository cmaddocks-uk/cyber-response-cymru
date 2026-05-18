// Generated Governor / Trustee Report. Renders the IncidentReport document
// model produced by `buildGovernorReport` — no scoring or verdict logic in
// this component. The same document tree is consumed by the Word exporter
// (src/lib/document-model/word.ts), so screen and Word stay aligned.

import { forwardRef } from 'react';
import type { PlanState, ReadinessState } from '~/data/plan-schema';
import { buildGovernorReport } from '~/lib/document-model/build-governor-report';
import { DocumentRenderer } from '~/components/document/DocumentRenderer';

interface Props {
  plan: PlanState;
  readiness: ReadinessState;
}

export const GovernorReport = forwardRef<HTMLDivElement, Props>(function GovernorReport(
  { plan, readiness },
  ref,
) {
  const report = buildGovernorReport(plan, readiness);
  return <DocumentRenderer ref={ref} report={report} />;
});
