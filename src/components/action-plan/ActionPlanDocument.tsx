// Prioritised Action Plan document. Renders the IncidentReport document
// model produced by `buildActionPlan`. Empty / all-green / populated branches
// are handled by the builder; this component is a pure renderer.

import { forwardRef } from 'react';
import type { PlanState, ReadinessState } from '~/data/plan-schema';
import { buildActionPlan } from '~/lib/document-model/build-action-plan';
import { DocumentRenderer } from '~/components/document/DocumentRenderer';

interface Props {
  plan: PlanState;
  readiness: ReadinessState;
}

export const ActionPlanDocument = forwardRef<HTMLDivElement, Props>(function ActionPlanDocument(
  { plan, readiness },
  ref,
) {
  const report = buildActionPlan(plan, readiness);
  return <DocumentRenderer ref={ref} report={report} />;
});
