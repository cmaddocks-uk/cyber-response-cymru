// Root output-page island. Renders the generated plan via the unified
// document-model pipeline — same IncidentReport tree as the Word export.

import { usePlanState } from '~/state/usePlanState';
import { DocumentRenderer } from '~/components/document/DocumentRenderer';
import { buildPlanReport } from '~/lib/document-model/build-plan';
import { PlanToc } from './PlanToc';
import { PlanToolbar } from './PlanToolbar';

export function OutputPage() {
  const { plan } = usePlanState();
  const report = buildPlanReport(plan);

  return (
    <>
      <PlanToolbar />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_1fr]">
        <PlanToc />
        <DocumentRenderer report={report} />
      </div>
    </>
  );
}
