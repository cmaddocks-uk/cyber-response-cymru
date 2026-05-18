// Single source of truth for the 11 Plan Builder sections. Order matters —
// it drives the nav, the previous/next footer and the order sections appear
// in the generated plan output.

export type SectionId =
  | 'meta'
  | 'team'
  | 'external'
  | 'severity'
  | 'escalation'
  | 'playbooks'
  | 'comms'
  | 'assets'
  | 'recovery'
  | 'review'
  | 'maintenance';

export interface PlanSection {
  id: SectionId;
  title: string;
  /** Plain-English short hint shown beneath the section title in the nav. */
  hint?: string;
}

export const PLAN_SECTIONS: PlanSection[] = [
  { id: 'meta', title: 'School details' },
  { id: 'team', title: 'Response team' },
  { id: 'external', title: 'External contacts' },
  { id: 'severity', title: 'Severity & triage' },
  { id: 'escalation', title: 'Escalation & authority' },
  { id: 'playbooks', title: 'Playbooks' },
  { id: 'comms', title: 'Communications' },
  { id: 'assets', title: 'Critical systems & impact' },
  { id: 'recovery', title: 'Recovery & backups' },
  { id: 'review', title: 'Post-incident review' },
  { id: 'maintenance', title: 'Plan maintenance' },
];
