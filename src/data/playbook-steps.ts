// Generic step lists for each playbook — these appear verbatim in every
// generated plan output, alongside the user's school-specific notes from
// the Plan Builder. Ported from v1.x's generatePlaybooks() generic[] map.
//
// The user-authored content lives in `src/data/playbooks.ts` (titles,
// why-matters callouts, examples, fill-in-the-blanks templates) and in
// `plan.playbooks[key].notes` (the user's local notes). This file is just
// the canned step-by-step actions every plan should include for each
// enabled incident type.

import type { PlaybookKey } from '~/data/plan-schema';

export const PLAYBOOK_STEPS: Record<PlaybookKey, { title: string; steps: string[] }> = {
  ransomware: {
    title: 'Ransomware',
    steps: [
      'Disconnect affected devices from the network — do not power off (preserve evidence).',
      'Activate Severity 1 response. Notify CIRT and IT support immediately.',
      'Do NOT pay the ransom. Refer to the ransomware policy in section 5. Notify your local authority cyber lead / cyber insurer before any external incident responder is engaged.',
      'Identify scope of encryption. Do not reconnect any device until cleared.',
      'Notify NCSC, Report Fraud, and the ICO if personal data is affected (within 72 hours of awareness).',
      'Begin restoration from clean, immutable / off-site backups in the priority order set out in section 10.',
      'Force a full credential reset across the estate before restored systems are returned to production.',
      "Capture evidence and engage forensic investigation per your LA cyber lead / insurer's requirements before reformatting any device.",
    ],
  },
  dataBreach: {
    title: 'Personal data breach',
    steps: [
      'Immediately limit further exposure (revoke access, take affected systems offline if necessary).',
      'Notify the DPO. The 72-hour ICO clock starts when the school becomes aware of the breach.',
      'Convene CIRT. Determine: what data, how many individuals, sensitivity, likely consequences.',
      'Document everything in the incident log — facts, decisions, timing.',
      'DPO assesses notifiability to the ICO; SLT decides on notification of data subjects if there is a high risk to their rights and freedoms.',
      'Use the ICO notification template in section 8.3 if reportable.',
      'Communicate with affected individuals using the parent/carer or staff template, as appropriate.',
      'Capture root cause and feed into post-incident review.',
    ],
  },
  accountCompromise: {
    title: 'Account compromise (staff)',
    steps: [
      'Disable the affected account. Force password reset, revoke all active sessions and refresh tokens, re-enrol MFA.',
      'Review mailbox rules, forwarding rules and recently sent items for signs of attacker activity (BEC / data exfiltration).',
      'Review login activity for the past 30 days — geo, device, IP — and identify what the attacker accessed.',
      'Determine whether the compromise is isolated or part of a wider phishing campaign — search for similar logins on other accounts.',
      'Review files and SharePoint/OneDrive access of the affected user. Assume the attacker has read what the user has read.',
      'If personal data was accessible, escalate to the data breach playbook.',
      'Notify the user and reset all of their school credentials.',
      'Capture root cause (phishing email, credential reuse, MFA bypass) and update controls accordingly.',
    ],
  },
  phishing: {
    title: 'Phishing campaign',
    steps: [
      'Confirm the phishing email — collect headers, sender, subject, content for analysis.',
      'Search the email environment for other recipients of the same or similar messages and remove them.',
      'Block the sender, domain and any URLs at the email gateway and web filter.',
      'Identify any users who clicked, replied or entered credentials. Treat each as a potential account compromise (escalate to that playbook).',
      'Issue a brief staff alert (using the staff template in section 8.3) noting the lure, what to look out for, and that staff should report any suspicions.',
      'If the campaign targeted finance staff (BEC) and a fraudulent payment was attempted, contact the bank, Report Fraud and the police (escalate to the BEC playbook).',
      'Capture in the incident log and post-incident review.',
    ],
  },
  bec: {
    title: 'Business email compromise (BEC) / invoice fraud',
    steps: [
      "If a payment has been made or is about to be made: call the school's bank fraud line IMMEDIATELY. Time-to-recall is the single biggest determinant of whether the money comes back. Make this call BEFORE notifying anyone else.",
      'Call Report Fraud on 0300 123 2040 (24/7 live-attack line) to obtain a police crime reference number — required for local authority cyber cover / insurance claims and for bank-recall escalation.',
      'Notify your local authority cyber lead / cyber insurer immediately. Most arrangements require notification before engaging external incident responders.',
      'Identify the compromised or spoofed account. If a school account: disable it, force password reset, revoke all sessions and refresh tokens, re-enrol MFA, audit mail-forwarding rules, inbox rules, delegate-access and OAuth grants. If a supplier account: contact the supplier via a known phone number on file (NOT the number in the suspicious email).',
      'Search the mail environment for all messages from the spoofed or compromised sender. Quarantine and review for additional fraud attempts targeted at colleagues.',
      'Notify all finance-handling staff (bursar, finance officer, headteacher\'s PA, business manager) of the attempt and what to look for in the coming days — attackers commonly try again with variants.',
      'If employee or supplier personal data was involved (bank details, payroll, contact details), escalate to the personal data breach playbook for ICO notifiability assessment.',
      'Post-incident review: bank recall outcome, root cause (compromised mailbox? spoofed sender? broken supplier verification?), control improvements required (dual-authorisation threshold, supplier call-back policy, MFA enforcement on finance accounts), staff training refresh.',
    ],
  },
  aiExtortion: {
    title: 'Extortion via AI (deepfake / synthetic media)',
    steps: [
      'Treat as a safeguarding incident FIRST. The Designated Safeguarding Lead (DSL) leads; the CIRT supports. Do NOT engage with the perpetrator and do NOT pay — engagement validates the demand and creates further offences.',
      'Treat all media as FABRICATED until verified by trained professionals. AI-generated imagery and voice are now cheap and ubiquitous; do not assume the content is real, and do not let the pupil or parent assume it is either.',
      'Capture evidence WITHOUT downloading the media: screenshot the URL, platform, username and timestamp; photograph the screen on a separate device if needed. Store in a restricted folder, named individuals only.',
      'For imagery of children under 18, refer to IWF Report Remove (iwf.org.uk/our-technology/report-remove). For non-illegal harmful material, use Report Harmful Content (reportharmfulcontent.com). Use the social media platform\'s own takedown form in parallel.',
      'If a staff member is named, notify the Local Authority Designated Officer (LADO). If a pupil is at risk, refer to children\'s social care via your safeguarding pathway.',
      "Contact your regional ROCU's Cyber PROTECT team (see external contacts). For suspected criminal offences, call 101 (non-urgent) or 999 (immediate risk to life), and Report Fraud on 0300 123 2040 for the police crime reference number.",
      'Pupil welfare is the priority: a trained safeguarding staff member contacts the pupil and parents/carers; offer counselling or external support. Limit internal awareness to the CIRT + DSL in the first 24 hours — rumours spread fast and add harm.',
      'Communications discipline: withhold any press / media statement unless directly asked; route external comms via the comms lead, approved by the Headteacher and DSL. Avoid identifying details.',
      'Post-incident review: time-to-safeguarding-pathway, DSL out-of-hours accessibility, AUP / safeguarding policy update to reference AI-generated imagery, age-appropriate pupil training on synthetic media.',
    ],
  },
  denialOfService: {
    title: 'Denial of service',
    steps: [
      'Confirm impact — identify affected services and scope.',
      'Engage your broadband / connectivity supplier and any DDoS-mitigation provider immediately.',
      'Activate the website holding page from section 8.2 if school services are externally impacted.',
      'Communicate with parents / carers using the parent template.',
      'Document the attack pattern (volume, type, source if known).',
      'Once mitigated, review whether additional DDoS protection is justified.',
    ],
  },
  insiderThreat: {
    title: 'Insider threat / misuse',
    steps: [
      'Convene a small CIRT including HR and the DPO. Confidentiality is critical at this stage.',
      'Preserve evidence — system logs, email, file access — before the individual is made aware.',
      'Take HR / safeguarding advice on next steps.',
      'Disable access to systems at an agreed point — too early alerts the individual, too late risks further harm.',
      'If criminal activity is suspected, contact Report Fraud or the police as appropriate.',
      'Document the investigation. Engage legal advice if required.',
      'Review root cause — access controls, joiner/mover/leaver process, monitoring.',
    ],
  },
  saasSupplierIncident: {
    title: 'SaaS supplier incident (Arbor / SIMS / Bromcom / ParentPay / CPOMS / M365 / Hwb services etc.)',
    steps: [
      'Verify the incident is real — confirm via the supplier\'s official channel (status page, account manager direct), NOT the email that told you about it. Phishing impersonating a supplier breach is increasingly common.',
      "Get the supplier's official Incident Notification in writing for the school's evidence pack. Note the supplier's reference number, date/time of confirmation, and the precise scope they've identified.",
      "Convene CIRT including the DPO. Determine the scope of YOUR school's data affected: categories (pupil records, safeguarding, finance, contact details), volume (number of pupils / staff / parents), and any special category data (health, ALN/ASN, safeguarding).",
      'ICO 72-hour clock starts when YOU become aware — not when the supplier does. The DPO assesses notifiability under UK GDPR Article 33. If notifiable, the school files at ico.org.uk/for-organisations/report-a-breach. The supplier\'s own notification to the ICO (if any) does NOT discharge the school\'s obligation.',
      'Article 34: if the breach is high-risk to data subjects, the school must inform them directly (parents, staff). The supplier\'s notification to the school is not the same as the school\'s notification to its data subjects.',
      'Exercise the school\'s contractual right (UK GDPR Article 28 / Data Processing Agreement) to obtain a current copy of all data the supplier holds on the school\'s behalf — so the school can act independently if supplier service is degraded or unavailable.',
      'Maintain operational continuity. Trigger paper-fallback procedures where the supplier\'s service is unavailable (e.g. paper attendance register, paper safeguarding log) until the service is restored.',
      'Notify your local authority cyber lead, the regional ROCU Cyber PROTECT team (TARIAN for South Wales / Gwent / Dyfed-Powys; NWROCU for North Wales), and any applicable Welsh Government / consortium digital education contact.',
      "Post-incident review: assess the supplier's root cause, remedial actions and any change to their security posture. Make a commercial decision on continuing the contract. Update the school's asset register (Plan section 9) with any changes to the supplier's incident contact, DPA review date, or recovery procedures.",
    ],
  },
};
