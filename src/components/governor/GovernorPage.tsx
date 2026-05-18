// Root Governor Report island. Reads plan + readiness state from the shared
// store, surfaces the toolbar, and renders the document. The Word export is
// data-driven now (builds an IncidentReport from the same state) so no DOM
// ref needs to leave the document component.

import { usePlanState } from '~/state/usePlanState';
import { useReadinessState } from '~/state/useReadinessState';
import { GovernorReport } from './GovernorReport';
import { GovernorToolbar } from './GovernorToolbar';

export function GovernorPage() {
  const { plan } = usePlanState();
  const { readiness } = useReadinessState();

  return (
    <>
      <GovernorToolbar plan={plan} readiness={readiness} />
      <GovernorReport plan={plan} readiness={readiness} />
    </>
  );
}
