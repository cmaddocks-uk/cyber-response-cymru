import { usePlanState } from '~/state/usePlanState';
import { useReadinessState } from '~/state/useReadinessState';
import { ActionPlanDocument } from './ActionPlanDocument';
import { ActionPlanToolbar } from './ActionPlanToolbar';

export function ActionPlanPage() {
  const { plan } = usePlanState();
  const { readiness } = useReadinessState();

  return (
    <>
      <ActionPlanToolbar plan={plan} readiness={readiness} />
      <ActionPlanDocument plan={plan} readiness={readiness} />
    </>
  );
}
