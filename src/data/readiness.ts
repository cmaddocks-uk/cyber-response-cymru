// 16-question readiness check. Ported verbatim from v1.7.0 index.html.
// Each question carries 4 answer options (RAG-scored 0..3) and 3 next-step
// actions (one per score level under 3 — score 3 is green and needs none).

export type Framework = 'NCSC' | 'WelshGov' | 'LAcover' | 'Estyn' | 'CE' | 'ICO';

export interface ReadinessQuestion {
  id: string;
  text: string;
  frameworks: Framework[];
  opts: [string, string, string, string];
  actions: [string, string, string];
}

// Static metadata for each framework — used by FrameworkBadge components on
// readiness questions and the About page. Click-through goes to source guidance.
export const FRAMEWORK_META: Record<
  Framework,
  { label: string; href: string; pillClass: string }
> = {
  NCSC: {
    label: 'NCSC Incident Management',
    href: 'https://www.ncsc.gov.uk/collection/incident-management',
    pillClass: 'bg-[#e8efff] text-[#1f4ed8]',
  },
  WelshGov: {
    label: 'Welsh Gov — Cyber Resilient Wales',
    href: 'https://www.gov.wales/cyber-resilient-wales-strategy',
    pillClass: 'bg-[#fff4e6] text-[#a04500]',
  },
  LAcover: {
    label: 'LA cyber cover (Wales)',
    href: 'https://www.gov.wales/cyber-resilient-wales-strategy',
    pillClass: 'bg-[#e7f5ec] text-[#0a6a30]',
  },
  Estyn: {
    label: 'Estyn inspection arrangements',
    href: 'https://www.estyn.gov.wales/inspection-guidance-resources',
    pillClass: 'bg-[#f3e8ff] text-[#6b21a8]',
  },
  CE: {
    label: 'Cyber Essentials',
    href: 'https://www.ncsc.gov.uk/cyberessentials/overview',
    pillClass: 'bg-[#ecfeff] text-[#0e7490]',
  },
  ICO: {
    label: 'ICO Information & Cyber Security toolkit',
    href: 'https://ico.org.uk/for-organisations/advice-and-services/audits/data-protection-audit-framework/toolkits/information-and-cyber-security/',
    pillClass: 'bg-[#fef2f2] text-[#9f1239]',
  },
};

export type RagBand = 'red' | 'amber' | 'green';

export function ragForScore(score: number | null | undefined): RagBand | null {
  if (score == null) return null;
  if (score >= 3) return 'green';
  if (score >= 2) return 'amber';
  return 'red';
}

export const READINESS: ReadinessQuestion[] = [
  {
    id: 'R1',
    text: 'Do you have a written cyber incident response plan that is accessible to the people who would need to use it?',
    frameworks: ['NCSC', 'WelshGov', 'LAcover', 'Estyn'],
    opts: [
      'No written plan exists',
      'An informal plan exists but is not documented or shared',
      'A documented plan exists but is only stored online or only known to IT staff',
      'A documented plan exists, is stored both online and as a hard copy off-site/off-network, and key staff know where to find it',
    ],
    actions: [
      'Start the plan builder in this tool to draft a baseline plan today. NCSC requires this as the starting point of incident management.',
      'Move from informal to documented. Use the plan builder, then have it reviewed by SLT, IT and your DPO.',
      'Print a hard copy and store it off-site. NCSC and most local authority cyber cover arrangements require an offline copy — if your network is compromised, you may not be able to access an online-only plan.',
    ],
  },
  {
    id: 'R2',
    text: 'Has your incident response plan been tested in the last 12 months (e.g. tabletop exercise, walkthrough, or NCSC Exercise in a Box)?',
    frameworks: ['NCSC', 'WelshGov', 'LAcover'],
    opts: [
      'Never tested',
      'Tested more than 2 years ago',
      'Tested in the last 13–24 months',
      'Tested in the last 12 months — and lessons learned were captured and incorporated',
    ],
    actions: [
      "Run a basic tabletop within the next term. NCSC's free 'Exercise in a Box' is designed for organisations like schools.",
      'Schedule an annual exercise as a recurring item in your IT calendar. NCSC and most LA cyber cover arrangements expect this as part of business continuity.',
      "Document what worked and what didn't. Most insurers expect evidence that lessons learned have been incorporated into the next version.",
    ],
  },
  {
    id: 'R3',
    text: 'Do you have an up-to-date contact list for incident response, including at least two contact methods for each key person, stored where it is accessible if email and the network are down?',
    frameworks: ['NCSC', 'LAcover'],
    opts: [
      'No structured contact list exists',
      'A list exists but only has one contact method per person, or is only stored on the network',
      'A list exists with multiple contact methods, but is not stored offline',
      'A list exists with at least two contact methods per key role, stored both online and as a hard copy off-network, reviewed termly',
    ],
    actions: [
      'Build the contacts list in the plan builder. Include personal mobile numbers (with consent) so you can still reach people if work systems are down.',
      'Add at least one alternative contact method for every key role. NCSC specifically calls this out — losing email during the very incident you\'re responding to is common.',
      'Print a copy and store it off-network. A list locked inside an encrypted file share during a ransomware attack is no use.',
    ],
  },
  {
    id: 'R4',
    text: 'Have you defined incident severity levels (e.g. critical / major / minor) with clear criteria for each?',
    frameworks: ['NCSC'],
    opts: [
      'No severity levels defined',
      'Levels are mentioned informally but not written down',
      'Levels are documented but criteria are vague or untested',
      'Severity levels are documented with clear, measurable criteria covering availability, confidentiality and integrity impacts',
    ],
    actions: [
      "Use the severity matrix in the plan builder — it follows NCSC's three-axis approach (availability, confidentiality, integrity).",
      "Convert your informal understanding into written criteria. Without these, the wrong people get woken up at 3am — or no one does.",
      "Test your criteria against a recent incident or near-miss. If you can't classify it confidently, the criteria need refining.",
    ],
  },
  {
    id: 'R5',
    text: 'Is it clearly documented who has authority to make critical decisions during an incident — including taking systems offline, contacting the press, and engaging external incident responders?',
    frameworks: ['NCSC', 'LAcover'],
    opts: [
      'No documented decision authority',
      'Some decisions are documented but not all key ones (e.g. nothing on press or external responders)',
      'Decision authority is documented but not deputised — single point of failure if the named person is unavailable',
      'Decision authority is documented for all critical decisions, with named deputies for each, and authority levels match the severity of the incident',
    ],
    actions: [
      'Use the decision authority section of the plan builder. Without this, ransomware decisions get stuck waiting for the headteacher who is on holiday.',
      'Add deputies for every authority. NCSC specifically warns that ideally you should include at least 2 people for every key role.',
      "Spell out who can authorise paying a ransom. Welsh Government and NCSC both strongly advise against paying ransoms; check your local authority's position before any decision.",
    ],
  },
  {
    id: 'R6',
    text: 'Do you have playbooks (specific step-by-step guidance) for the most likely incident types in a school environment — particularly ransomware and data breach?',
    frameworks: ['NCSC'],
    opts: [
      'No playbooks',
      'Generic playbook exists but no specific guidance for ransomware or data breach',
      'Playbooks exist for ransomware and data breach but are not tested',
      'Tested playbooks exist for at least the top 3-5 most likely incident types, including ransomware, data breach and account compromise',
    ],
    actions: [
      'Start with a ransomware playbook in the plan builder — it is the highest-impact and most common incident type for Welsh schools.',
      'Add a data breach playbook. Under UK GDPR you have 72 hours to report a notifiable breach to the ICO — this is too short to figure out from scratch.',
      'Test each playbook annually with the relevant team. NCSC recommends starting with the top 3-5 most likely incident types.',
    ],
  },
  {
    id: 'R7',
    text: 'Do you have a documented backup strategy that includes immutable or air-gapped copies that cannot be encrypted in a ransomware attack?',
    frameworks: ['WelshGov', 'LAcover', 'Estyn'],
    opts: [
      'Backups exist but all are connected to the network',
      'Some backups are off-site but not immutable or air-gapped',
      'At least one immutable or air-gapped backup exists but restoration has not been tested in the last year',
      'Backups follow the 3-2-1 rule (3 copies, 2 different media, 1 off-site/immutable), AND restoration is tested at least termly with the result logged',
    ],
    actions: [
      'Speak to your IT provider this term about adding an immutable/air-gapped backup. This is the single biggest determinant of whether a school recovers from ransomware.',
      'Review against the NCSC 3-2-1 rule (3 copies, 2 different media, 1 off-site / immutable). Cyber Essentials and IASME Cyber Assurance certification both require this.',
      'Schedule termly restoration tests and log the result. An untested backup is not a backup.',
    ],
  },
  {
    id: 'R8',
    text: 'Do you know how to report a cyber incident to (a) NCSC, (b) Report Fraud, (c) the ICO if personal data is involved, and (d) your local authority and / or insurer?',
    frameworks: ['WelshGov', 'LAcover', 'Estyn'],
    opts: [
      'Do not know the reporting routes',
      'Aware of one or two reporting routes but no documented procedure',
      'All reporting routes documented but not all timeframes captured (especially the 72-hour ICO deadline)',
      'All reporting routes documented with timeframes, named reporters, and contact details — including the NCSC reporting service and ICO 72-hour deadline',
    ],
    actions: [
      'Add the four reporting routes (NCSC, Report Fraud, ICO, your LA / insurer) to the External Contacts section of your plan. Add your regional ROCU Cyber PROTECT team (TARIAN or NWROCU) for pre-incident advice.',
      'Document the ICO 72-hour deadline prominently. Missing it is a regulatory breach in its own right.',
      'If your local authority provides cyber cover or insurance, contact them before engaging external IR providers — they may have appointed responders and rules around expense recovery.',
    ],
  },
  {
    id: 'R9',
    text: 'Do you have prepared communication templates (parents, staff, ICO, governors, suppliers) ready to adapt during an incident?',
    frameworks: ['LAcover', 'NCSC'],
    opts: [
      'No templates prepared',
      'Some informal templates but not structured or approved',
      'Templates exist but only for some audiences (e.g. parents but not ICO or suppliers)',
      'Templates exist for parents, staff, ICO, governors and key suppliers, pre-approved by SLT and DPO, and stored where they are accessible offline',
    ],
    actions: [
      'Use the communication templates section of the plan builder — it includes pre-drafted parent letters, staff briefings and ICO notification text you can adapt.',
      'Get the templates pre-approved by your DPO and SLT now, not during the incident. Drafting a parent letter while ransomware is encrypting your files is a bad time.',
      'Print copies for the offline incident folder.',
    ],
  },
  {
    id: 'R10',
    text: 'Have all staff with network access received cyber security training in the last 12 months — and do they know specifically how to report a suspected incident?',
    frameworks: ['WelshGov', 'Estyn'],
    opts: [
      'No formal training',
      'Training delivered but more than 12 months ago',
      'Training in the last 12 months but reporting route is unclear or not part of the training',
      'All staff (including supply, agency and at least one governor) have had training in the last 12 months that explicitly covers how to report a suspected incident',
    ],
    actions: [
      "Roll out NCSC's free 'Top Tips for Staff' or equivalent training. NCSC and most LA cyber cover arrangements expect this annually.",
      'Refresh the training and ensure it includes the reporting route. Most incidents in schools are first spotted by staff — they need to know what to do in the next 5 minutes, not who to email next week.',
      'Include at least one governor in the training. NCSC explicitly recommends this and most LA arrangements require it.',
    ],
  },
  {
    id: 'R11',
    text: 'Is multi-factor authentication (MFA) enforced for all staff accounts with access to personal data, sensitive systems, or admin functions?',
    frameworks: ['WelshGov', 'CE'],
    opts: [
      'MFA is not in use',
      'MFA available but only used by some staff voluntarily',
      'MFA enforced for senior leaders and IT admins but not all staff handling sensitive data',
      'MFA enforced for all staff accounts with access to personal data, sensitive systems or admin functions, with documented exceptions and compensating controls',
    ],
    actions: [
      'Enable MFA across staff accounts as a top priority. NCSC and Cyber Essentials both require this, and the absence of MFA is the single most common factor in school account compromises.',
      "Convert from voluntary to enforced MFA. Voluntary MFA does not protect the accounts that don't use it — and those are the ones that get compromised.",
      'Extend MFA to all staff with access to sensitive data, not just SLT. Office staff and SENCo accounts often hold the most sensitive personal data.',
    ],
  },
  {
    id: 'R12',
    text: 'Do you have a process for capturing and learning lessons after every incident, no matter how minor, and feeding those into the plan?',
    frameworks: ['NCSC', 'LAcover'],
    opts: [
      'No post-incident review process',
      'Reviews happen for major incidents only, informally',
      'Reviews are documented for major incidents but rarely lead to plan updates',
      'Every incident triggers a documented review using a standard form, and findings drive scheduled updates to the plan',
    ],
    actions: [
      "Add the post-incident review form (provided in this tool's plan builder) to your incident process. NCSC and most LA cyber cover arrangements require this.",
      'Review minor incidents too — they are early warnings of bigger ones.',
      "Schedule a formal plan review at least annually, plus after any incident. Lessons learned that don't change the plan are wasted lessons.",
    ],
  },
  {
    id: 'R13',
    text: "Is your Data Protection Officer (DPO) a standing member of the school's information / cyber security committee or governance board, with regular sight of cyber risk discussions?",
    frameworks: ['ICO'],
    opts: [
      'DPO has no involvement in cyber security oversight',
      'DPO is consulted only when a data breach occurs',
      'DPO attends information / cyber security discussions on an ad-hoc basis',
      'DPO is a standing member of the relevant governance committee with regular sight of cyber risk, and attendance is minuted',
    ],
    actions: [
      "Add the DPO as a standing member of whichever committee or governance forum discusses cyber risk (typically SLT digital, the trust board, or a digital strategy group). The ICO's Information & Cyber Security toolkit treats this as a baseline control.",
      'Move from incident-only involvement to standing membership so the DPO sees risks emerging rather than only being called in after a breach.',
      'Minute DPO attendance at cyber risk discussions — auditable evidence of integrated data-protection oversight.',
    ],
  },
  {
    id: 'R14',
    text: 'Do your business continuity and incident response procedures explicitly cover remote / home-working scenarios — staff working off-network, on personal devices, or with school data on cloud services accessed from home?',
    frameworks: ['ICO', 'NCSC'],
    opts: [
      'Remote / home-working scenarios are not covered in BC or IR procedures',
      'Procedures mention remote working but do not address cyber incident scenarios specifically',
      'Remote / home-working is covered in general BC but not in cyber incident response procedures',
      'BC and IR procedures both explicitly cover remote / home-working — including device isolation, account suspension, and access to cloud-hosted data when on-site systems are unavailable',
    ],
    actions: [
      'Add a remote-working clause to your incident response plan: how do you isolate or recover a staff member working from a personal device, on home wifi, accessing M365 / Google Workspace?',
      "Extend the existing BC remote-working coverage into the cyber IR scenario specifically (the two are usually written by different people and don't talk to each other).",
      'Test the remote-working scenario in your next tabletop exercise — most plans assume everyone is on-site.',
    ],
  },
  {
    id: 'R15',
    text: "Are cyber and information security risks recorded on the school's risk register — both as discrete entries (with owner, likelihood, impact, mitigations) and (where relevant) linked to specific systems on the asset register?",
    frameworks: ['ICO', 'Estyn'],
    opts: [
      "Cyber risks are not on the school's risk register",
      "A single generic 'cyber security' entry exists on the risk register but is not regularly reviewed",
      'Cyber risks are recorded but only at the central / trust level — no link to specific school systems on the asset register',
      'Cyber risks recorded as discrete entries on the risk register (with owner, likelihood, impact, mitigations, review date), with links to specific systems on the asset register where relevant, reviewed at least termly',
    ],
    actions: [
      "Add specific cyber risks to the school's risk register — not just one entry. Typical entries: ransomware, SaaS supplier breach, account compromise / BEC, AI extortion, denial of service, insider misuse.",
      "Review the existing generic cyber risk entry quarterly. Risks that don't move are not being managed; the review cadence is what gives the register operational value.",
      'Cross-reference your asset register (Plan section 9) and risk register: each high-impact system should have at least one risk entry that names it.',
    ],
  },
  {
    id: 'R16',
    text: 'When a new system or supplier is introduced, are Data Protection Impact Assessments (DPIAs) explicitly linked to the security risk assessment for that system?',
    frameworks: ['ICO'],
    opts: [
      'DPIAs are not routinely completed for new systems',
      'DPIAs are completed but separately from any security risk assessment',
      'DPIAs and security risk assessments are both completed but rarely cross-reference each other',
      'DPIAs are integrated with the security risk assessment — both reference each other, share an owner where appropriate, and feed into the asset register and risk register',
    ],
    actions: [
      'Adopt a procurement gate that requires both a DPIA and a security risk assessment before a new SaaS supplier is signed off. Most school SaaS deals skip the security risk assessment.',
      'Update the DPIA template so it explicitly references the security risk assessment — they cover overlapping ground (data flows, retention, supplier security posture) and should be done together.',
      'Feed both into the asset register (Plan section 9) and the risk register (R15) so the school keeps a single, joined-up picture of system risk.',
    ],
  },
];
