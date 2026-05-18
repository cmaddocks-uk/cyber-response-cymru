// Plain-English labels for plan fields surfaced in the tabletop runner.
// Maps the dot-path used in scenarios.planFields ("plan.team.leadName") to
// a human-readable label ("Incident Lead — name"). Falls back to a
// generated label from the path if no entry is registered.

export const PLAN_FIELD_LABELS: Record<string, string> = {
  'plan.team.leadName': 'Incident Lead — name',
  'plan.team.leadPhone': 'Incident Lead — phone',
  'plan.team.leadAlt': 'Incident Lead — alternative contact',
  'plan.team.deputyName': 'Deputy Lead — name',
  'plan.team.deputyPhone': 'Deputy Lead — phone',
  'plan.team.itLeadName': 'Technical Lead — name',
  'plan.team.itLeadPhone': 'Technical Lead — phone',
  'plan.team.itLeadAlt': 'Technical Lead — out-of-hours contact',
  'plan.team.dpoName': 'DPO — name',
  'plan.team.dpoEmail': 'DPO — email',
  'plan.team.dpoPhone': 'DPO — phone',
  'plan.team.commsLeadName': 'Communications Lead — name',
  'plan.team.commsLeadPhone': 'Communications Lead — phone',
  'plan.severity.s1Desc': 'Severity 1 (Critical) definition',
  'plan.severity.s2Desc': 'Severity 2 (Major) definition',
  'plan.escalation.decisionTakeOffline': 'Authority to take systems offline',
  'plan.escalation.decisionTakeOfflineDeputy': 'Authority to take systems offline (deputy)',
  'plan.escalation.decisionICO': 'Authority to notify the ICO',
  'plan.escalation.decisionICODeputy': 'Authority to notify the ICO (deputy)',
  'plan.escalation.decisionPress': 'Authority to communicate with press',
  'plan.escalation.decisionEngageExternal': 'Authority to engage external incident responders',
  'plan.escalation.decisionEngageExternalDeputy': 'Authority to engage external responders (deputy)',
  'plan.escalation.decisionRansomware': 'Ransomware / extortion policy',
  'plan.external.rpa': 'Local authority cyber cover / insurance arrangement',
  'plan.external.welshGovContact': 'Welsh Government / consortium digital education contact',
  'plan.external.rocuCyberProtect': 'ROCU Cyber PROTECT contact (TARIAN / NWROCU)',
  'plan.external.ncscReport': 'NCSC reporting contact',
  'plan.external.ico': 'ICO breach reporting contact',
  'plan.external.actionFraud': 'Report Fraud (UK fraud reporting line)',
  'plan.external.broadbandSupplier': 'Broadband / connectivity supplier',
  'plan.external.legalAdviser': 'Legal adviser',
  'plan.external.itProvider.outOfHours': 'IT support — out-of-hours / emergency',
  'plan.comms.parentTemplate': 'Parent / carer letter template',
  'plan.comms.staffTemplate': 'Staff briefing template',
  'plan.comms.governorTemplate': 'Governor / trustee briefing template',
  'plan.comms.icoTemplate': 'ICO notification template',
  'plan.comms.alternateChannel': 'Alternate / out-of-band communication channel',
  'plan.recovery.backupLocations': 'Backup locations and types',
  'plan.recovery.backupOwner': 'Backup owner',
  'plan.recovery.backupTestFrequency': 'Backup test frequency',
  'plan.recovery.rto': 'Recovery Time Objective (RTO)',
  'plan.recovery.rpo': 'Recovery Point Objective (RPO)',
  'plan.recovery.priorityRestoreOrder': 'Priority restoration order',
  'plan.assets.systems': 'Critical systems & impact — asset register',
  'plan.assets.biaNotes': 'Business Impact Analysis — narrative',
  'plan.review.reviewLead': 'Post-incident review lead',
  'plan.review.reviewDeadline': 'Post-incident review deadline',
  'plan.review.learningProcess': 'Lessons-learned feedback process',
  'plan.maintenance.owner': 'Plan owner',
  'plan.maintenance.reviewFrequency': 'Plan review frequency',
  'plan.maintenance.lastReviewed': 'Plan last reviewed date',
  'plan.maintenance.nextReview': 'Plan next review date',
};

/** Looks up a friendly label for a dot-path; falls back to a generated one. */
export function planFieldLabel(path: string): string {
  return (
    PLAN_FIELD_LABELS[path] ?? path.replace(/^plan\./, '').replace(/\./g, ' → ')
  );
}
