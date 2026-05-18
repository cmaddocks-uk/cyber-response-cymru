// The six tabletop scenarios. Each is a guided 7-step walk through a
// realistic incident type, surfacing the user's plan fields at each step
// so they can see whether their plan answers the question.
//
// Scenarios are illustrative examples covering common UK education-sector
// incident patterns — they don't represent any specific school or trust.
// The `sourceLabel` / `sourceUrl` link out to authoritative sector context.
//
// IDs are strings (not enums) on the step level so they're stable across
// renames; ScenarioId is enumerated in plan-schema.ts because tabletop
// state and the answers map are keyed by scenario.

import type { ScenarioId } from '~/data/plan-schema';

export interface ScenarioStep {
  id: string;
  time: string;
  title: string;
  narrative: string;
  prompt: string;
  /** Dot-paths of plan fields the runner should surface at this step. */
  planFields: string[];
}

export interface Scenario {
  id: ScenarioId;
  title: string;
  subtitle: string;
  sourceLabel: string;
  sourceUrl: string;
  /** Short summary shown on the selection screen — HTML allowed. */
  summary: string;
  steps: ScenarioStep[];
}

export const SCENARIOS: Scenario[] = [
  // ---------------------------------------------------------------------------
  // A. Trust-wide ransomware
  // ---------------------------------------------------------------------------
  {
    id: 'active-learning-trust',
    title: 'Example A: Trust-wide ransomware',
    subtitle:
      'Mid-sized multi-academy trust hit by ransomware across the estate — recovery costs in the high six figures, well over a thousand staff hours, around a week or more of active response',
    sourceLabel: 'Sector context: anonymised UK school case studies',
    sourceUrl: 'https://www.ncsc.gov.uk/section/education-skills/schools',
    summary:
      'An <strong>illustrative example scenario</strong> covering trust-wide ransomware against a multi-academy trust. Run your plan against the timeline and identify gaps before they cost you.',
    steps: [
      {
        id: 'alt-1',
        time: 'Day 1, 06:30',
        title: 'Detection',
        narrative:
          "It is 06:30 on a weekday morning. A network admin spots ransomware files encrypted on the file server. A search shows the same encryption pattern on servers across all the trust's sites.",
        prompt:
          'Per your plan, who is the first responder at this point? What do they do BEFORE calling SLT? Do they have multiple ways to contact your incident lead if email is down?',
        planFields: [
          'plan.team.leadName',
          'plan.team.leadPhone',
          'plan.team.leadAlt',
          'plan.team.deputyName',
          'plan.team.deputyPhone',
        ],
      },
      {
        id: 'alt-2',
        time: 'Day 1, 07:30',
        title: 'Triage and severity',
        narrative:
          "Confirmed: active ransomware encryption across all the trust's sites. Multiple schools and several thousand students potentially affected.",
        prompt:
          "What severity does this match in your matrix? Who has the authority to take all 10 sites' systems offline? Who is their named deputy if they're unreachable?",
        planFields: [
          'plan.severity.s1Desc',
          'plan.escalation.decisionTakeOffline',
          'plan.escalation.decisionTakeOfflineDeputy',
        ],
      },
      {
        id: 'alt-3',
        time: 'Day 1, 09:00',
        title: 'External notification',
        narrative:
          'This is a Severity 1. Your local authority / insurer, NCSC, and the ICO all need to know. The ICO 72-hour clock is now running from the moment of awareness.',
        prompt:
          'Who calls your local authority cyber lead / insurer? Who calls NCSC? Who has authority to notify the ICO?',
        planFields: [
          'plan.external.rpa',
          'plan.external.ncscReport',
          'plan.external.ico',
          'plan.escalation.decisionICO',
          'plan.escalation.decisionICODeputy',
        ],
      },
      {
        id: 'alt-4',
        time: 'Day 1, midday',
        title: 'Communications',
        narrative:
          'Schools are due to open. Parents will start asking questions. Press may pick this up by lunchtime.',
        prompt:
          'Who drafts the parent letter? Is the template pre-approved by SLT and DPO? Who handles press enquiries?',
        planFields: [
          'plan.team.commsLeadName',
          'plan.team.commsLeadPhone',
          'plan.comms.parentTemplate',
          'plan.escalation.decisionPress',
        ],
      },
      {
        id: 'alt-5',
        time: 'Day 2-3',
        title: 'Containment and backups',
        narrative:
          "Encryption confirmed across all 10 sites' file servers. Restoration must come from backups — which need to be verified as not affected.",
        prompt:
          "Where are your immutable / off-site backups? Who confirms they're unaffected? When were they last tested?",
        planFields: [
          'plan.recovery.backupLocations',
          'plan.recovery.backupOwner',
          'plan.recovery.backupTestFrequency',
        ],
      },
      {
        id: 'alt-6',
        time: 'Day 4-7',
        title: 'Recovery',
        narrative:
          'Restoration begins. RTO targets are being tested in real time across 10 sites.',
        prompt:
          "What's your priority order for restoration? Are your RTO/RPO targets realistic for an estate this size?",
        planFields: [
          'plan.recovery.priorityRestoreOrder',
          'plan.recovery.rto',
          'plan.recovery.rpo',
        ],
      },
      {
        id: 'alt-7',
        time: 'Day 8-9',
        title: 'Closure and lessons',
        narrative:
          'Containment achieved after about a week of active response. Recovery costs in scenarios at this scale typically run into high-six-figure damages, well over a thousand staff hours diverted from teaching and operations. A common lesson learned across these incidents: internal firewall rules and intrusion protection between segments could have contained the breach more effectively.',
        prompt: 'Who runs the post-incident review? When and how do lessons feed back into the plan?',
        planFields: [
          'plan.review.reviewLead',
          'plan.review.reviewDeadline',
          'plan.review.learningProcess',
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // B. Single-trust ransomware with data exfiltration
  // ---------------------------------------------------------------------------
  {
    id: 'fylde-coast',
    title: 'Example B: Single-trust ransomware with data exfiltration',
    subtitle:
      'Single school trust estate hit by double-extortion ransomware — multi-terabyte data exfiltration including pupil and staff personal data, damages in the seven-figure range, KS4 cohort impacted during exam preparation',
    sourceLabel: 'Sector context: anonymised UK school case studies',
    sourceUrl: 'https://www.ncsc.gov.uk/section/education-skills/schools',
    summary:
      'An <strong>illustrative example scenario</strong> covering a single-trust ransomware with double extortion — bandwidth spike visible beforehand but unactioned. Run your plan against the warning signs and the encryption itself.',
    steps: [
      {
        id: 'fca-1',
        time: 'Sunday before discovery',
        title: 'Warning sign — bandwidth spike',
        narrative:
          'Your broadband supplier flags an unusually large spike in outbound bandwidth from your network over the weekend. They send an email Monday morning.',
        prompt:
          "Who in your school monitors traffic alerts? Does the supplier have your right contact? What's your investigation process when this happens?",
        planFields: [
          'plan.external.broadbandSupplier',
          'plan.team.itLeadName',
          'plan.team.itLeadPhone',
        ],
      },
      {
        id: 'fca-2',
        time: 'Monday morning, week 4 of term',
        title: 'Detection',
        narrative:
          'Users report no internet access. Senior technicians find ransomware on the on-premises servers.',
        prompt:
          'First responder action — what does your plan say comes BEFORE calling SLT? Do staff know to disconnect (don\'t power off) and stop using the device?',
        planFields: [
          'plan.team.itLeadName',
          'plan.team.leadName',
          'plan.escalation.decisionTakeOffline',
        ],
      },
      {
        id: 'fca-3',
        time: 'Day 1, afternoon',
        title: 'Scope discovery',
        narrative:
          'Encryption hits everything on-premises: file servers, NAS backups, catering systems and CCTV. All on-prem systems are compromised. Cloud / SaaS systems unaffected.',
        prompt:
          'Are your backups truly immutable, or also on the network? When did you last test a restore? Are the catering / CCTV systems segmented from the main network?',
        planFields: [
          'plan.recovery.backupLocations',
          'plan.recovery.backupTestFrequency',
          'plan.assets.systems',
        ],
      },
      {
        id: 'fca-4',
        time: 'Day 2',
        title: 'Data exfiltration discovered',
        narrative:
          'Forensics confirms multiple terabytes and millions of files exfiltrated — including names, addresses, NI numbers and possible bank details. The ICO 72-hour clock is now running from the moment of awareness.',
        prompt:
          'Who is the DPO? When did awareness officially start? What does the ICO notification say? Have you got the template ready?',
        planFields: [
          'plan.team.dpoName',
          'plan.team.dpoEmail',
          'plan.team.dpoPhone',
          'plan.escalation.decisionICO',
          'plan.comms.icoTemplate',
        ],
      },
      {
        id: 'fca-5',
        time: 'Day 2-3',
        title: 'Communications',
        narrative:
          'An entire KS4 cohort has lost access — exam season is approaching. Parents need to know. Governors need to know. The safeguarding lead needs to be involved.',
        prompt:
          "Who drafts the parent letter? Who briefs governors? What's the safeguarding lead's role when pupil data is exfiltrated?",
        planFields: [
          'plan.comms.parentTemplate',
          'plan.comms.governorTemplate',
          'plan.team.commsLeadName',
        ],
      },
      {
        id: 'fca-6',
        time: 'Weeks 1-4',
        title: 'Recovery',
        narrative:
          'Network rebuild required. All Windows devices wiped and reimaged. Hardware bought for staff to access via dongles. Took several months to fully resolve.',
        prompt:
          "What's your minimum acceptable RTO for the MIS? How long can the school run 'manual'? Who decides when to keep the school open vs. close?",
        planFields: ['plan.recovery.rto', 'plan.recovery.rpo', 'plan.escalation.decisionPress'],
      },
      {
        id: 'fca-7',
        time: 'Post-incident',
        title: 'Lesson — internal segmentation',
        narrative:
          'A common post-incident remediation in scenarios like this includes deploying internal firewalls between VLANs — many UK trusts retrofit real internal segmentation only AFTER an attack. Damages in scenarios at this scale: in the seven-figure range.',
        prompt:
          'Do you currently have internal firewalls between your VLANs? When was that segmentation last reviewed and by whom? Is this a known gap in your plan?',
        planFields: [],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // C. Business email compromise / invoice fraud
  // ---------------------------------------------------------------------------
  {
    id: 'example-c-bec',
    title: 'Example C: Business email compromise',
    subtitle:
      'Invoice-redirection fraud targeting the bursar — typical sector loss in the four- to six-figure range, often discovered weeks later when the real supplier chases payment',
    sourceLabel: 'Sector context: anonymised UK school case studies',
    sourceUrl: 'https://www.ncsc.gov.uk/section/education-skills/schools',
    summary:
      "An <strong>illustrative example scenario</strong> testing your plan's BEC defences — verification rules, dual-approval thresholds, fraud reporting routes, and the gap between 'plausible email' and 'fraudulent payment'.",
    steps: [
      {
        id: 'ec-1',
        time: 'Day 1, morning',
        title: 'Suspicious email',
        narrative:
          'The bursar receives an email apparently from a known supplier, requesting an urgent change of bank details for an upcoming invoice. The email is plausible — correct logo, signature block, even a quoted invoice number — but the reply-to address has a subtle character difference, and there is a strong tone of urgency.',
        prompt:
          'Does your plan name a finance-side decision-maker for this kind of request? What is your bank-detail-change verification rule? Is it specifically a phone call to a number you have used before — not the number in the email?',
        planFields: [
          'plan.team.itLeadName',
          'plan.team.itLeadPhone',
          'plan.team.commsLeadName',
        ],
      },
      {
        id: 'ec-2',
        time: 'Day 1, afternoon',
        title: 'Verification fails',
        narrative:
          "Pressed for time, the bursar emails the supplier to confirm — using the reply-to address on the suspicious email. The 'supplier' replies confirming. Verification feels complete.",
        prompt:
          'Does your plan explicitly say verification must be by phone, on an independently-sourced number? Who enforces this rule? Does anyone audit finance-process compliance regularly?',
        planFields: ['plan.review.reviewLead'],
      },
      {
        id: 'ec-3',
        time: 'Day 2-3',
        title: 'Payment authorised',
        narrative:
          'The new bank details are entered. Payment of a four- to five-figure invoice goes through. The attacker receives the funds and disappears.',
        prompt:
          'What is your dual-approval threshold for finance changes? Is there a clear record of who authorised this payment? Who would catch an unusual payment in the next finance review?',
        planFields: [
          'plan.escalation.decisionEngageExternal',
          'plan.escalation.decisionEngageExternalDeputy',
        ],
      },
      {
        id: 'ec-4',
        time: 'Week 2-3',
        title: 'Discovery',
        narrative:
          'The real supplier chases the unpaid invoice. The penny drops. Realisation hits — the previous email, the urgency, the changed bank details. The school has paid the wrong account.',
        prompt:
          'Who in your plan has authority to declare an active financial-fraud incident? What is their immediate next step?',
        planFields: [
          'plan.team.leadName',
          'plan.team.itLeadName',
          'plan.escalation.decisionEngageExternal',
        ],
      },
      {
        id: 'ec-5',
        time: 'Same day, urgently',
        title: 'Containment',
        narrative:
          "The bank must be contacted within minutes — fraud-recall windows are short. Email accounts must be checked for compromise (the bursar's account in particular). Audit logs reviewed for the period since the original email.",
        prompt:
          "Does your plan list your bank's fraud line? Who has authority to engage external incident response? Who checks if the bursar's email account is itself compromised?",
        planFields: [
          'plan.external.itProvider.outOfHours',
          'plan.team.itLeadPhone',
          'plan.escalation.decisionEngageExternal',
        ],
      },
      {
        id: 'ec-6',
        time: 'Day of discovery, ongoing',
        title: 'External notification',
        narrative:
          'Report Fraud is the UK fraud-reporting route (replacing the old Action Fraud number). Your local authority / insurer needs to know if a claim is being made. The ICO needs notifying if any personal data was exposed in the email exchange.',
        prompt:
          'Who in your plan calls Report Fraud (0300 123 2040)? Who calls your local authority / insurer? Does the DPO need to assess this for ICO notifiability?',
        planFields: [
          'plan.external.actionFraud',
          'plan.external.rpa',
          'plan.team.dpoName',
          'plan.escalation.decisionICO',
        ],
      },
      {
        id: 'ec-7',
        time: 'Post-incident',
        title: 'Lessons',
        narrative:
          'BEC is the highest-volume threat to Welsh schools — invoice-redirection fraud and CEO-impersonation patterns appear week-in, week-out across the sector. The single most effective control is a strict bank-detail-change rule: verify by phone, on an independently-sourced number, every time.',
        prompt:
          'Is that rule documented in your plan? Is it part of staff onboarding? When was the last time the bursar / finance team had specific BEC training?',
        planFields: [
          'plan.review.reviewLead',
          'plan.review.learningProcess',
          'plan.maintenance.reviewFrequency',
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // D. Account compromise via phishing
  // ---------------------------------------------------------------------------
  {
    id: 'example-d-account-compromise',
    title: 'Example D: Account compromise via phishing',
    subtitle:
      'Phishing-driven Microsoft 365 / Google Workspace takeover of a senior staff account — mailbox forwarding rules set, sensitive folders accessed, lateral attempts before discovery',
    sourceLabel: 'Sector context: anonymised UK school case studies',
    sourceUrl: 'https://www.ncsc.gov.uk/section/education-skills/schools',
    summary:
      "An <strong>illustrative example scenario</strong> testing your plan's response to a compromised staff account — the precursor to most ransomware. Tests admin-side authority, audit log retention, MFA enforcement, and the breach-or-not judgement.",
    steps: [
      {
        id: 'ed-1',
        time: 'Day 1, AM',
        title: 'Phishing report',
        narrative:
          "Multiple staff have flagged a phishing email overnight. By 09:00, one staff member admits to clicking through and entering their school credentials on the lookalike login page. The account is a senior leader's.",
        prompt:
          'Who in your plan has authority to disable a Microsoft 365 / Google Workspace account at short notice? Is the process documented? Who do they contact in-hours vs out-of-hours?',
        planFields: [
          'plan.team.itLeadName',
          'plan.team.itLeadPhone',
          'plan.team.itLeadAlt',
          'plan.escalation.decisionTakeOffline',
        ],
      },
      {
        id: 'ed-2',
        time: 'Day 1, AM',
        title: 'Disable and reset',
        narrative:
          "Account is disabled. The user's password is reset. Active sessions revoked. MFA tokens re-enrolled. Now: what did the attacker do in the window between login and lockout?",
        prompt:
          'Who reviews login activity? What is the audit log retention on your tenant — 90 days, 6 months, longer? Have you ever needed to query it before?',
        planFields: ['plan.team.itLeadName', 'plan.assets.systems'],
      },
      {
        id: 'ed-3',
        time: 'Day 1, AM',
        title: 'Forwarding rule check',
        narrative:
          'A mailbox forwarding rule is found, silently copying every inbound email to an external Gmail address. It has been active for the past 12 hours. Some sensitive emails have already been forwarded.',
        prompt:
          'Who checks for mailbox forwarding rules in your plan? Is this part of every account-compromise response? What other inbox rules might the attacker have set?',
        planFields: ['plan.team.itLeadName'],
      },
      {
        id: 'ed-4',
        time: 'Day 1, PM',
        title: 'Scope check',
        narrative:
          '30-day audit log review. The attacker accessed SharePoint folders containing pupil and staff personal data, downloaded files. Other accounts\' login attempts visible in the same period — possible wider campaign.',
        prompt:
          'Who decides whether this is a notifiable personal data breach? When does the ICO 72-hour clock start? Do you have an ICO notification template ready?',
        planFields: [
          'plan.team.dpoName',
          'plan.team.dpoEmail',
          'plan.escalation.decisionICO',
          'plan.escalation.decisionICODeputy',
          'plan.comms.icoTemplate',
        ],
      },
      {
        id: 'ed-5',
        time: 'Day 2',
        title: 'Estate-wide reset',
        narrative:
          'Out of an abundance of caution: forced password reset across all staff accounts, MFA re-enrolment, conditional-access policies tightened. Communicating this to staff requires the alternate channel — email may not be the right vector.',
        prompt:
          'What is your alternate communication channel for an estate-wide reset announcement? Who does the comms? How do staff know it is genuine?',
        planFields: [
          'plan.comms.alternateChannel',
          'plan.comms.staffTemplate',
          'plan.team.commsLeadName',
        ],
      },
      {
        id: 'ed-6',
        time: 'Day 2-3',
        title: 'Notification',
        narrative:
          "The DPO has assessed the access as a notifiable personal data breach. ICO notification within 72 hours of awareness. Affected pupils and staff must be considered for notification (UK GDPR Art 34 — 'high risk to rights and freedoms').",
        prompt:
          'Who in your plan drafts the ICO notification? Who decides on data-subject notification? Has the parent letter template been adapted for a data-breach context?',
        planFields: ['plan.team.dpoName', 'plan.comms.icoTemplate', 'plan.comms.parentTemplate'],
      },
      {
        id: 'ed-7',
        time: 'Post-incident',
        title: 'Lessons',
        narrative:
          'Account compromise is the most common entry point into a school network. The standard precursor to ransomware is exactly this scenario — except it goes undetected for weeks. Detection requires actively monitoring for signs of compromise (forwarding rules, OAuth consents, geo-anomalous logins) rather than waiting for the user to notice.',
        prompt:
          'Is MFA enforced on every staff account, or just SLT? Are conditional-access policies in place? Who reviews compromise indicators on a regular cadence — and do they have time to?',
        planFields: ['plan.review.reviewLead', 'plan.review.learningProcess'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // E. Insider threat / leaver with retained access
  // ---------------------------------------------------------------------------
  {
    id: 'example-e-insider',
    title: 'Example E: Insider threat — leaver with retained access',
    subtitle:
      'Former staff member retained system access for several weeks after leaving and inappropriately accessed safeguarding records — tests joiner/mover/leaver process, HR coordination, audit log retention and LADO threshold',
    sourceLabel: 'Sector context: anonymised UK school case studies',
    sourceUrl: 'https://www.ncsc.gov.uk/section/education-skills/schools',
    summary:
      'An <strong>illustrative example scenario</strong> covering insider misuse — a fundamentally different incident type from technical attacks. Tests personnel-security plumbing rather than network defence: JML process, HR confidentiality, evidence preservation, and the safeguarding angle.',
    steps: [
      {
        id: 'ee-1',
        time: 'Day 1, AM',
        title: 'Discovery',
        narrative:
          'A routine audit log review (or a tip-off from a colleague) reveals that a former staff member has been logging into school systems several weeks after their leaving date. The records they accessed include safeguarding case files for current pupils.',
        prompt:
          'Who runs the audit log review in your plan? When was the last time it was actually done? Who has authority to act on what it finds?',
        planFields: [
          'plan.team.itLeadName',
          'plan.review.reviewLead',
          'plan.maintenance.reviewFrequency',
        ],
      },
      {
        id: 'ee-2',
        time: 'Day 1, AM',
        title: 'Disable access urgently',
        narrative:
          "Access removed across all systems immediately — Microsoft 365, MIS, file shares, building access cards, anything else linked to the user's identity. The harder question: why was it not removed at their leaving date?",
        prompt:
          'Who in your plan owns the joiner/mover/leaver process? What is the SLA for access removal on departure — same day for SLT, within 24h for teaching staff, etc?',
        planFields: [
          'plan.team.itLeadName',
          'plan.maintenance.owner',
          'plan.escalation.decisionTakeOffline',
        ],
      },
      {
        id: 'ee-3',
        time: 'Day 1',
        title: 'Evidence preservation',
        narrative:
          'Logs preserved before the individual is alerted to the investigation: file access records, login history, geo-IP, device fingerprints. CCTV checked if relevant. This window matters — alerting too early lets the individual cover tracks.',
        prompt:
          'Who is the evidence-preservation owner in your plan? Where are the relevant logs held, and what is their retention period?',
        planFields: ['plan.team.itLeadName', 'plan.team.dpoName'],
      },
      {
        id: 'ee-4',
        time: 'Day 1-2',
        title: 'HR and legal coordination',
        narrative:
          'Confidential HR involvement. Legal advice considered (employment law, data protection law, possibly criminal). The investigation must be handled before any communication with the individual to preserve disciplinary or legal options.',
        prompt:
          'Does your plan include an HR contact (internal or external)? Who has authority to engage legal advice? What is the confidentiality protocol while the investigation proceeds?',
        planFields: [
          'plan.external.legalAdviser',
          'plan.escalation.decisionEngageExternal',
          'plan.team.dpoName',
        ],
      },
      {
        id: 'ee-5',
        time: 'Day 1-2',
        title: 'Safeguarding angle',
        narrative:
          'The accessed records include safeguarding case files. The Designated Safeguarding Lead (DSL) is involved. The Local Authority Designated Officer (LADO) threshold is met (an adult who works with children, with a safeguarding concern about their conduct).',
        prompt:
          'Who is your DSL and how do you reach them out of hours? Does your plan reference the LADO threshold and contact route? Are pupils potentially affected by what the individual saw?',
        planFields: ['plan.team.dpoName', 'plan.escalation.decisionICO'],
      },
      {
        id: 'ee-6',
        time: 'Day 2-3',
        title: 'External notification',
        narrative:
          'DPO assesses ICO notifiability — unauthorised access to personal data is a personal data breach under UK GDPR. Police involvement considered if the access is likely criminal (Computer Misuse Act). The individual is now formally notified.',
        prompt:
          'Who notifies the ICO? Who decides on police engagement? How is the formal communication with the individual handled — and by whom?',
        planFields: [
          'plan.team.dpoName',
          'plan.escalation.decisionICO',
          'plan.external.ico',
          'plan.external.actionFraud',
        ],
      },
      {
        id: 'ee-7',
        time: 'Post-incident',
        title: 'Lessons',
        narrative:
          'Insider misuse is fundamentally different from technical attack response — it is a personnel-security and access-management issue. The joiner/mover/leaver process, audit log retention and HR coordination matter more than any technical tooling. The single most preventable factor is access not being removed promptly on departure.',
        prompt:
          'When was the last access audit conducted across your estate? Are there other ex-staff accounts that may still be active? What is your timeline to fix the JML process gap exposed here?',
        planFields: [
          'plan.review.reviewLead',
          'plan.review.learningProcess',
          'plan.maintenance.lastReviewed',
          'plan.maintenance.nextReview',
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // F. Cloud tenant compromise & ransomcloud
  // ---------------------------------------------------------------------------
  {
    id: 'example-f-cloud-ransomcloud',
    title: 'Example F: Cloud (M365 / Google / Hwb services) tenant compromise & ransomcloud',
    subtitle:
      "An MFA-fatigue attack takes over the bursar's account; the attacker grants themselves OAuth access to the tenant and ransomware-encrypts shared OneDrive / SharePoint files via the Graph API, with data exfiltration and a 24-hour extortion deadline. Recovery is entirely cloud-side — no servers to unplug, no tape to swap. Tests the new asset register, the SaaS supplier playbook, parent comms when email is untrusted, and cloud-native recovery.",
    sourceLabel: 'Sector context: anonymised UK education-sector cyber incidents',
    sourceUrl: 'https://www.ncsc.gov.uk/section/education-skills/schools',
    summary:
      "An <strong>illustrative example scenario</strong> covering a cloud-native incident — the increasingly common pattern where there is no on-prem server to take offline because the data is in someone else's cloud (Microsoft, Google, or Welsh Government's Hwb-hosted services). Tests M365 / Google Workspace admin authority, OAuth consent governance, asset-register completeness, the SaaS supplier playbook (Microsoft / Google / Hwb as data processor; school as data controller), parent comms when the email channel itself is compromised, and the realistic point that cloud recovery happens through retention windows and version history rather than tape. Welsh-specific: TARIAN / NWROCU notification, local authority cyber lead engagement, and Welsh Government Cyber Resilient Wales reporting where applicable.",
    steps: [
      {
        id: 'ef-1',
        time: 'Day 1, 09:15',
        title: 'First sign — phishing-as-yourself',
        narrative:
          'Multiple staff arrive to find an email apparently from the bursar sent to all-staff overnight, with a OneDrive link to "the new payroll spreadsheet — please review by lunchtime". The link redirects to a Microsoft-branded sign-in page that captures credentials. Several staff have already clicked. The bursar swears she didn\'t send it.',
        prompt:
          'How does staff report a suspected phishing event in your plan? Who responds first, and what is the in-hours / out-of-hours route to the IT lead?',
        planFields: [
          'plan.team.itLeadName',
          'plan.team.itLeadPhone',
          'plan.team.itLeadAlt',
          'plan.team.leadName',
        ],
      },
      {
        id: 'ef-2',
        time: 'Day 1, 09:45',
        title: 'Triage — not a one-off',
        narrative:
          "Sign-in logs show a successful login on the bursar's account from outside the UK at 03:47, MFA approved (the bursar admits she dismissed an MFA prompt overnight thinking it was a glitch). A mailbox forwarding rule has been added, and an inbox rule sweeping mails containing \"invoice\" or \"payroll\" to a hidden folder. Three other staff accounts show the same pattern. This is not a spray attack — it's a coordinated, targeted compromise.",
        prompt:
          'What severity does this match in your plan — S1, S2? Who has authority to disable multiple accounts at this hour? Where is M365 / Google Workspace / Hwb in your asset register, and what does the register say it holds?',
        planFields: [
          'plan.severity.s1Desc',
          'plan.severity.s2Desc',
          'plan.escalation.decisionTakeOffline',
          'plan.escalation.decisionTakeOfflineDeputy',
          'plan.assets.systems',
        ],
      },
      {
        id: 'ef-3',
        time: 'Day 1, 10:30',
        title: 'Containment — OAuth consent phishing discovered',
        narrative:
          "Affected accounts disabled, sessions revoked, MFA re-enrolment forced across all staff. Reviewing OAuth consent grants: an unfamiliar app, \"PrintAssistantPro\", was granted full Mail.ReadWrite + Files.ReadWrite.All scope yesterday by the bursar — consent phishing. The app is not in Microsoft's verified-publisher list. The app's permissions persist even after the account is disabled — that's the trap with OAuth consent grants.",
        prompt:
          'Who in your plan has Global Admin / Conditional Access rights to revoke OAuth consents? Is your tenant configured to require admin consent for non-verified publishers (it should be)? Where is the supplier incident contact for Microsoft / Google / Hwb (hwb@gov.wales) in your asset register?',
        planFields: [
          'plan.team.itLeadName',
          'plan.assets.systems',
          'plan.escalation.decisionTakeOffline',
        ],
      },
      {
        id: 'ef-4',
        time: 'Day 1, 14:00',
        title: 'Files encrypted — ransomcloud in motion',
        narrative:
          'Multiple staff report shared SharePoint and OneDrive folders showing files renamed with a .locked extension. The OneDrive sync icons show mass-modification activity in the last hour. Tenant audit logs (Purview / Defender) confirm the unfamiliar OAuth app from step 3 has called the Microsoft Graph API many thousands of times to read-then-overwrite files via the API — ransomware that never touched a single endpoint. A README.txt appears in OneDrive root: "We have your data and your files. £25,000 in 24 hours or it goes public."',
        prompt:
          'Where is OneDrive / SharePoint in your asset register, and what is the recorded RTO and recovery priority? Does the SaaS Supplier Incident playbook in your plan apply here (yes, with Microsoft as the affected supplier)? Who has authority to engage external incident responders at this point?',
        planFields: [
          'plan.assets.systems',
          'plan.escalation.decisionEngageExternal',
          'plan.escalation.decisionEngageExternalDeputy',
        ],
      },
      {
        id: 'ef-5',
        time: 'Day 1, 16:00',
        title: 'Data exfiltration confirmed — the 72-hour clock is running',
        narrative:
          "Audit logs confirm ~12 GB of files were downloaded by the OAuth app over the past 6 hours, including pupil records, safeguarding correspondence, finance ledgers and supplier bank details. The 72-hour ICO clock started at 09:45 when the school became aware of unauthorised access. The DPO is engaged. The attacker's note claims the data will be released on the dark web in 24 hours if payment isn't made.",
        prompt:
          'Who in your plan decides whether to pay (NCSC and Welsh Government strongly advise against)? Who notifies the ICO — named individual and deputy? Who notifies parents under UK GDPR Article 34 — and via which channel, given email may be untrusted right now?',
        planFields: [
          'plan.escalation.decisionRansomware',
          'plan.escalation.decisionICO',
          'plan.escalation.decisionICODeputy',
          'plan.team.dpoName',
          'plan.team.dpoPhone',
        ],
      },
      {
        id: 'ef-6',
        time: 'Day 2 — Day 3',
        title: 'Notification cascade — SaaS supplier playbook in action',
        narrative:
          "Within the 72-hour window: ICO notified (high risk to data subjects); NCSC reporting service informed; Report Fraud (extortion); local authority cyber lead notified; regional ROCU Cyber PROTECT team contacted (TARIAN for South Wales / Gwent / Dyfed-Powys; NWROCU for North Wales) — they may be aware of wider campaigns affecting other Welsh schools; Welsh Government / consortium digital education contact informed where applicable; cyber insurer engaged; affected parents directly informed under UK GDPR Article 34. Microsoft FastTrack Security engaged via the Premier Support channel for tenant-side forensics and recovery support. The school's MIS supplier is contacted because pupil records were exfiltrated — they may need to know for downstream comms or onward fraud detection. Parent comms uses the alternate (non-email) channel because email itself may be compromised.",
        prompt:
          'Are all these contacts in your External Contacts section — ICO, NCSC, Report Fraud, your LA cyber lead, your regional ROCU (TARIAN / NWROCU), your insurer, Microsoft / Google support? Who in your plan owns each notification? Do you have a parent letter template ready, and an alternate channel (SMS, ParentPay, phone tree) when email is the compromised vector?',
        planFields: [
          'plan.external.ico',
          'plan.external.ncscReport',
          'plan.external.actionFraud',
          'plan.external.rpa',
          'plan.external.rocuCyberProtect',
          'plan.external.welshGovContact',
          'plan.comms.icoTemplate',
          'plan.comms.parentTemplate',
          'plan.comms.alternateChannel',
        ],
      },
      {
        id: 'ef-7',
        time: 'Day 3 — Day 7 & lessons',
        title: 'Cloud-native recovery and the lessons that stick',
        narrative:
          "Recovery is entirely cloud-side: SharePoint version history rolls back encrypted files (within the retention window, default 90 days but extendable); OneDrive recycle bin recovers deleted items (default 93 days); Conditional Access policies tightened to block legacy auth and require compliant devices for admin actions; OAuth consent settings changed to admin-approval-required for non-verified publishers; user-driven OAuth consent disabled. There were no on-prem backups to restore from — and that's the point: cloud incidents need cloud-native recovery, not tape. The single biggest preventable factor: the tenant was configured to allow user OAuth consent for any publisher.",
        prompt:
          'Do you know your M365 / Google Workspace retention windows for version history and recycle bin? When was your last test restore from those? Are your Conditional Access policies and OAuth admin-consent settings reviewed on the calendar (Plan Maintenance section 12.1)? What changes to your asset register and SaaS supplier playbook does this incident drive?',
        planFields: [
          'plan.recovery.priorityRestoreOrder',
          'plan.recovery.backupTestFrequency',
          'plan.review.learningProcess',
          'plan.maintenance.nextReview',
          'plan.assets.biaNotes',
        ],
      },
    ],
  },
];

export const SCENARIO_BY_ID: Record<ScenarioId, Scenario> = SCENARIOS.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<ScenarioId, Scenario>,
);
