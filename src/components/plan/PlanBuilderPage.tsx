// Root Plan Builder island. Owns the "which section is showing" UI state and
// renders the toolbar, sticky section nav, the active section, and the sticky
// previous/next footer.
//
// Plan data lives in the shared store (usePlanState). The toolbar and the
// active section both read/write it.

import { useState } from 'react';
import { usePlanState } from '~/state/usePlanState';
import { PLAN_SECTIONS, type SectionId } from '~/data/plan-sections';
import { PlanToolbar } from './PlanToolbar';
import { PlanSectionNav } from './PlanSectionNav';
import { PlanFooter } from './PlanFooter';
import {
  AssetsSection,
  CommsSection,
  EscalationSection,
  ExternalSection,
  MaintenanceSection,
  MetaSection,
  PlaybooksSection,
  RecoverySection,
  ReviewSection,
  SeveritySection,
  TeamSection,
  type Updater,
} from './sections';
import type { PlanState } from '~/data/plan-schema';

export function PlanBuilderPage() {
  const { plan, updatePlan } = usePlanState();
  const [current, setCurrent] = useState<SectionId>(PLAN_SECTIONS[0]!.id);

  return (
    <>
      <PlanToolbar />
      <PlanSectionNav plan={plan} current={current} onChange={setCurrent} />
      <ActiveSection current={current} plan={plan} updatePlan={updatePlan} />
      <PlanFooter current={current} onChange={setCurrent} />
    </>
  );
}

function ActiveSection({
  current,
  plan,
  updatePlan,
}: {
  current: SectionId;
  plan: PlanState;
  updatePlan: Updater;
}) {
  switch (current) {
    case 'meta':
      return <MetaSection plan={plan} updatePlan={updatePlan} />;
    case 'team':
      return <TeamSection plan={plan} updatePlan={updatePlan} />;
    case 'external':
      return <ExternalSection plan={plan} updatePlan={updatePlan} />;
    case 'severity':
      return <SeveritySection plan={plan} updatePlan={updatePlan} />;
    case 'escalation':
      return <EscalationSection plan={plan} updatePlan={updatePlan} />;
    case 'playbooks':
      return <PlaybooksSection plan={plan} updatePlan={updatePlan} />;
    case 'comms':
      return <CommsSection plan={plan} updatePlan={updatePlan} />;
    case 'assets':
      return <AssetsSection plan={plan} updatePlan={updatePlan} />;
    case 'recovery':
      return <RecoverySection plan={plan} updatePlan={updatePlan} />;
    case 'review':
      return <ReviewSection plan={plan} updatePlan={updatePlan} />;
    case 'maintenance':
      return <MaintenanceSection plan={plan} updatePlan={updatePlan} />;
  }
}
