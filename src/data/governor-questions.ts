// Plain-English summary of each readiness question for governors, plus the
// specific "How do you assure yourselves..." question they should ask SLT at
// the next meeting if this area isn't fully green.
//
// R1–R12 ported verbatim from v1.x. R13–R16 added to cover the ICO toolkit
// readiness questions added in this rebuild.

export interface GovernorQuestionEntry {
  /** Short headline used in the Priority Areas list. */
  label: string;
  /** Plain-English description for non-technical readers. */
  plain: string;
  /** Estyn-style assurance question for governors to ask SLT. */
  govQ: string;
}

export const GOV_PLAIN: Record<string, GovernorQuestionEntry> = {
  R1: {
    label: 'Written response plan',
    plain:
      'Whether the school has a written plan for responding to a cyber attack, accessible to the people who would need it.',
    govQ:
      'How do you assure yourselves that the school has an up-to-date, written cyber incident response plan, and that key staff know where to find it — including a hard copy stored off-network?',
  },
  R2: {
    label: 'Plan tested in last 12 months',
    plain:
      'Whether the response plan has been tested through a tabletop exercise so the school knows it actually works.',
    govQ:
      'How do you assure yourselves that the response plan has been tested in the last twelve months and that lessons learned have been incorporated?',
  },
  R3: {
    label: 'Up-to-date contact list',
    plain:
      'Whether the school has named contacts for incident response, with multiple ways to reach each person if email is down.',
    govQ:
      'How do you assure yourselves that the incident contact list is current, with at least two contact methods per key role, and stored where it can be reached if the network is unavailable?',
  },
  R4: {
    label: 'Severity grading',
    plain:
      'Whether the school has agreed in advance how it will judge how serious an incident is — so the right people get involved at the right time.',
    govQ:
      'How do you assure yourselves that there are clear criteria for grading the severity of a cyber incident, and that staff know how to apply them?',
  },
  R5: {
    label: 'Decision authority',
    plain:
      'Whether it is documented who has authority to take systems offline, engage external help, contact the press and notify the regulator — including named deputies.',
    govQ:
      'How do you assure yourselves that critical incident decisions — including taking systems offline, engaging external responders and ICO notification — have named decision-makers and named deputies?',
  },
  R6: {
    label: 'Ransomware & data breach playbooks',
    plain:
      'Whether the school has step-by-step playbooks for the most likely incident types, particularly ransomware and personal data breaches.',
    govQ:
      'How do you assure yourselves that the school has tested playbooks for at least the top three most likely incident types, including ransomware and personal data breach?',
  },
  R7: {
    label: 'Immutable / off-site backups',
    plain:
      "Whether the school's backups can survive a ransomware attack and whether restoration is regularly tested.",
    govQ:
      "How do you assure yourselves that the school's backups are immutable or air-gapped (cannot be encrypted in a ransomware attack) and that restoration is tested at least termly with the result logged?",
  },
  R8: {
    label: 'Reporting routes',
    plain:
      'Whether the school knows how and when to report incidents to NCSC, Report Fraud, the ICO (within 72 hours if personal data is involved), and your local authority / insurer.',
    govQ:
      'How do you assure yourselves that the school knows the four UK reporting routes, including the 72-hour ICO notification deadline for personal data breaches?',
  },
  R9: {
    label: 'Communication templates',
    plain:
      'Whether the school has pre-prepared, SLT-approved letters and statements for parents, staff, the ICO and governors — ready to adapt during an incident.',
    govQ:
      'How do you assure yourselves that pre-approved communication templates exist for parents, staff, the ICO and governors, and that they are reviewed at least annually?',
  },
  R10: {
    label: 'Annual staff cyber training',
    plain:
      'Whether all staff with network access — including supply, agency and at least one governor — have had cyber security training in the last twelve months.',
    govQ:
      'How do you assure yourselves that all staff with network access have received cyber training in the last twelve months, and that they know specifically how to report a suspected incident?',
  },
  R11: {
    label: 'Multi-factor authentication (MFA)',
    plain:
      'Whether MFA is enforced on all staff accounts that can access personal data or sensitive systems — not just senior leaders.',
    govQ:
      'How do you assure yourselves that MFA is enforced for all staff accounts with access to personal data or sensitive systems, with documented exceptions and compensating controls?',
  },
  R12: {
    label: 'Post-incident learning',
    plain:
      "Whether the school captures lessons learned after every incident and feeds them back into the plan so the same thing doesn't happen twice.",
    govQ:
      'How do you assure yourselves that every incident — major or minor — triggers a documented review and that lessons learned are incorporated into the next version of the plan?',
  },
  R13: {
    label: 'DPO governance integration',
    plain:
      "Whether the school's Data Protection Officer is a standing member of the committee that oversees cyber risk, not just consulted after a breach.",
    govQ:
      'How do you assure yourselves that the DPO is a standing member of the relevant governance forum, with regular sight of cyber risk discussions, and that attendance is minuted?',
  },
  R14: {
    label: 'Remote-working incident coverage',
    plain:
      "Whether the school's incident procedures explicitly cover staff working from home or on personal devices accessing cloud services.",
    govQ:
      "How do you assure yourselves that the school's incident response procedures explicitly cover remote and home-working scenarios — device isolation, account suspension and access to cloud-hosted data?",
  },
  R15: {
    label: 'Cyber on risk register',
    plain:
      "Whether cyber security risks are recorded on the school's risk register as discrete entries with owners and review dates.",
    govQ:
      "How do you assure yourselves that cyber risks are recorded on the school's risk register as discrete entries with owners, mitigations and review dates — not just as a single generic line?",
  },
  R16: {
    label: 'DPIA + security risk linkage',
    plain:
      'Whether the school links Data Protection Impact Assessments to security risk assessments when introducing new systems or suppliers.',
    govQ:
      'How do you assure yourselves that when a new system or supplier is introduced, the Data Protection Impact Assessment and the security risk assessment are completed together and feed into the asset and risk registers?',
  },
};
