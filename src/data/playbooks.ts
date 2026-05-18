// Playbook content for the Plan Builder's "Playbooks" section and the
// generated plan output. Ported verbatim from the v1.7.0 build.
//
// `whyMatters` is HTML (rendered via dangerouslySetInnerHTML in the section).
// The content is hard-coded in this file — there is no user-supplied input
// in it — so the dangerouslySetInnerHTML usage is bounded to compile-time
// trust. Don't change this to accept user content without revisiting that.

import type { PlaybookKey } from '~/data/plan-schema';

export interface PlaybookContent {
  key: PlaybookKey;
  title: string;
  desc: string;
  defaultEnabled: boolean;
  /** HTML allowed. Compile-time trusted only — see file header. */
  whyMatters: string;
  examples: string[];
  /** Fill-in-the-blanks starter for the user's school-specific notes. */
  template: string;
}

// ---------------------------------------------------------------------------
// Templates as named constants so the array literal stays readable.
// ---------------------------------------------------------------------------

const RANSOMWARE_TEMPLATE = `SCHOOL-SPECIFIC RANSOMWARE NOTES

Out-of-hours authority to disconnect the network:
  Primary:  [name, role, phone]
  Deputy:   [name, role, phone]

Physical location of network kit (for emergency isolation):
  Core switch / router:     [room, building, key holder]
  On-prem servers:          [room, building, key holder]

Immutable / off-site backup details:
  Supplier:                 [name]
  Account reference:        [account number]
  24/7 incident contact:    [phone, email]
  Last successful restore test: [date]

Priority order for recovery (school-specific — adjust as needed):
  1. [e.g. CPOMS / safeguarding records]
  2. [e.g. SIMS / Bromcom / Arbor]
  3. [e.g. finance / FMS]
  4. [e.g. email / Microsoft 365 / Google Workspace]
  5. [e.g. teaching applications]
  6. [e.g. general file shares]

Decision: keep school open vs close
  Authority:                [name, role]
  Trigger criteria:         [e.g. SIMS unavailable beyond 24 hours]

Parent communication:
  First audience to notify: [e.g. all year groups via ParentPay / SMS]
  Letter drafted by:        [name]
  Approved by:              [name, role]`;

const DATA_BREACH_TEMPLATE = `SCHOOL-SPECIFIC DATA BREACH NOTES

Data Protection Officer:
  Name:                     [DPO name]
  Organisation:             [internal / LA / MAT / external]
  In-hours contact:         [phone, email]
  Out-of-hours contact:     [phone, email]
  Holiday cover:            [name, contact]

Where to find the Record of Processing Activities (ROPA):
  Location:                 [system / shared drive / hardcopy location]
  Owner:                    [name, role]

Categories of personal data the school holds (and where each lives):
  Pupil basic records:      [system, e.g. SIMS]
  Safeguarding (CPOMS etc.):[system, location]
  ALN/ASN records:          [system, location]
  Medical records:          [system, location]
  Free school meals data:   [system, location]
  Photos / video:           [system, location]
  Staff HR records:         [system, location]
  Finance / payment data:   [system, location]

Notification of affected individuals (where high risk):
  Drafted by:               [name, role]
  Approved by:              [DPO + SLT names]
  Sent by:                  [name]
  Channel:                  [email / letter / SMS]

Onward notification thresholds:
  Local Authority required at: [criteria]
  Federation / consortium at:  [criteria]
  Welsh Gov contact at:        [criteria]

"High risk" interpretation (agreed with DPO):
  [e.g. any breach involving safeguarding records, ALN/ASN data, or more than 50 pupils' contact details]`;

const ACCOUNT_COMPROMISE_TEMPLATE = `SCHOOL-SPECIFIC ACCOUNT COMPROMISE NOTES

Tenant / platform:
  Primary:                   [Microsoft 365 / Google Workspace / both]
  Tenant ID / domain:        [identifier]

Authority to disable a staff account at short notice:
  In-hours:                  [name, role]
  Out-of-hours:              [name, role, phone]
  Process documented at:     [link or location]

Forced password reset across the estate:
  Owner:                     [name, role]
  Tooling used:              [e.g. M365 admin centre, scripting]
  Staff notification method: [e.g. SMS to school mobiles, posters]

Audit log retention:
  M365 retention:            [default 90 days / extended to ___]
  Google retention:          [default 6 months / extended to ___]
  Conditional access policy owner: [name]

Standard checks on a compromised account:
  Mailbox forwarding rules:  reviewer = [name]
  Inbox rules generally:     reviewer = [name]
  Recent file activity:      reviewer = [name]
  Shared / external links:   reviewer = [name]
  OAuth app consents:        reviewer = [name]

Affected user communications:
  Notified by:               [name]
  Forced re-enrolment of MFA: [yes/no, by whom]`;

const PHISHING_TEMPLATE = `SCHOOL-SPECIFIC PHISHING NOTES

Bulk email search and removal:
  Tool:                      [M365 Content Search / Google Vault]
  Authorised user:           [name, role]
  Approval needed from:      [name, role]

Email gateway / domain blocking:
  Gateway:                   [supplier / product]
  Owner:                     [name]
  Process to block sender:   [link or steps]

Staff alert standard wording:
  Subject line template:     ["URGENT: Phishing email circulating - DO NOT click"]
  Approved by:               [comms lead / SLT]
  Sent via:                  [email / Teams / SMS]

Phishing reporting button (if any):
  Product / tool:            [e.g. Microsoft Report Phish add-in]
  Reports go to:             [security mailbox / IT support]

Business Email Compromise (BEC) — finance protections:
  Bank detail change rule:   any change to supplier bank details must be verified by phone, using a number sourced independently of the email request
  Verification owner:        [bursar / business manager name]
  Dual approval threshold:   payments over [£amount] require two signatories
  Recent training date:      [date]`;

const BEC_TEMPLATE = `SCHOOL-SPECIFIC BEC / INVOICE FRAUD NOTES

Bank fraud-line contacts (per account the school holds):
  Main school account bank:    [bank name]
    Fraud line (24/7):         [phone]
    Account number / sort code: [reference held securely]
  Trust / federation account:  [bank name, fraud line]
  Payroll bureau:              [name, contact]

Supplier-payment verification policy:
  Threshold above which dual authorisation required: £[amount]
  Bank-detail changes verified by call-back to:      [known supplier phone number on file]
  Pending-payments queue review owner:               [bursar / finance officer name]

Authority to call the bank fraud line (out-of-hours):
  Primary:                     [name, role, mobile]
  Deputy:                      [name, role, mobile]
  Out-of-hours fall-back:      [name, mobile]

Mail-rule / delegate audit (run for every account that handles finance):
  Bursar / finance officer mailbox: [reviewer, date]
  Headteacher mailbox:              [reviewer, date]
  Trust CEO / business manager:     [reviewer, date]
  School office shared inbox:       [reviewer, date]

Incident reference numbers (capture immediately — needed for claims):
  Police crime reference (Report Fraud 0300 123 2040, 24/7): [obtain immediately]
  LA cyber cover / insurer claim reference:                   [date, contact, ref]
  Bank recall request reference:                              [date, time, ref]
  Amount at risk:                                             £[amount]
  Amount recovered:                                           £[amount]

Lessons / control improvements:
  Was dual-authorisation in force at the threshold?           [yes/no]
  Was supplier verified via known phone number?               [yes/no]
  Were mail-forwarding / delegate / OAuth rules audited periodically? [yes/no, frequency]
  Staff training on BEC delivered in last 12 months?          [yes/no, date]`;

const AI_EXTORTION_TEMPLATE = `SCHOOL-SPECIFIC AI EXTORTION NOTES

This is a safeguarding incident first. DSL leads. Never engage with the perpetrator.

Designated Safeguarding Lead (DSL):
  Name:                       [DSL name]
  In-hours phone / email:     [contact]
  Out-of-hours / weekend:     [mobile, alternative]
  Deputy DSL:                 [name, contact]

Evidence capture (do NOT download the media):
  Owner:                       [DSL + IT lead]
  Capture method:              [screenshot URL + platform + username + timestamp; photograph the screen on a separate device if needed]
  Evidence storage location:   [secure, restricted folder; named individuals only]

Referral routes (multiple may apply):
  IWF Report Remove (imagery of children under 18): iwf.org.uk/our-technology/report-remove
  Report Harmful Content (non-illegal):             reportharmfulcontent.com
  Social media platform takedown:                   [direct link per platform]
  LADO (if a staff member is named):                [name, phone]
  Children's social care (if pupil is at risk):     [LA route, contact]
  Cyber PROTECT (regional ROCU):                    [ROCU name + contact — see external contacts]
  Police (if a criminal offence is suspected):      [101 / 999 / Report Fraud 0300 123 2040]

Communication discipline:
  Internal awareness limited to:                    [named CIRT + DSL only, in first 24h]
  Pupil / parent contact lead:                      [DSL or trained safeguarding staff]
  Wider staff briefing (if needed):                 [drafted by DSL + comms lead, approved by Headteacher]
  Press / media statement:                          [withhold unless asked; route via comms lead]

Decisions (record clearly):
  Do NOT pay or respond to the perpetrator:         confirmed [yes / by whom / when]
  Do NOT download or forward the media:             confirmed [yes / by whom / when]
  Safeguarding referrals completed:                 [yes / dates / references]
  Police / Cyber PROTECT report logged:             [date, ref]

Aftercare (pupil welfare):
  Named welfare lead for the affected pupil(s):     [name, role]
  Counselling / external support offered:           [provider, contact]
  Follow-up review date:                            [date — typical: 2 weeks + 6 weeks]

Lessons / control improvements:
  Was the school's response time to the safeguarding pathway under 1 hour?   [yes / no]
  Were the DSL contact details accessible to the right people out-of-hours?  [yes / no]
  Has the school's AUP / safeguarding policy been updated to reference AI-generated imagery? [yes / no, date]
  Has age-appropriate pupil training on AI / synthetic media been delivered in the last 12 months? [yes / no, date]`;

const DOS_TEMPLATE = `SCHOOL-SPECIFIC DENIAL-OF-SERVICE NOTES

Broadband / connectivity supplier:
  Supplier:                  [LGfL / RM / Schools Broadband / other]
  Account number:            [reference]
  In-hours contact:          [phone, email]
  Out-of-hours contact:      [phone]

DDoS mitigation / CDN (if any):
  Service:                   [e.g. Cloudflare, none]
  Account owner:             [name]
  Login details location:    [secure store, never plain]

What is hosted where:
  School website:            [provider, e.g. Schudio]
  Email:                     [M365 / Google / on-prem]
  MIS:                       [SIMS Cloud / Bromcom / Arbor / on-prem]

Backup parent communications channel (if website is down):
  Primary:                   [e.g. ParentPay broadcast]
  Secondary:                 [e.g. SMS service, name of provider]
  Class Dojo / similar:      [yes/no, owner]

Public statement template (school website, when restored):
  Approved by:               [comms lead / SLT]
  Stored at:                 [location]`;

const INSIDER_TEMPLATE = `SCHOOL-SPECIFIC INSIDER THREAT NOTES

Joiner / Mover / Leaver process:
  Owner:                     [name, role]
  Removal SLA on leaving:    [e.g. same day for SLT, within 24h for teaching staff]
  Documented at:             [link to JML procedure]

HR contact:
  Internal HR / external provider: [name, organisation]
  In-hours contact:          [phone, email]
  Confidentiality protocol:  [link or steps]

Audit logs that evidence misuse:
  File access (M365 / Google): retention = [default / extended]
  Login history:             retention = [default / extended]
  Print logs:                [yes/no, system]
  CCTV (physical access):    retention = [days]
  Owner who can extract logs: [name, role]

Evidence preservation before alerting the individual:
  Process owner:             [name, role]
  Legal advice contact:      [name, organisation]

Safeguarding / LADO involvement:
  DSL contact:               [name, phone]
  LADO threshold:            any incident involving an adult working with children where there is a concern about safeguarding
  LADO contact (LA):         [name, phone]

Designated safeguarding lead's role if pupil data is affected: [steps]`;

const SAAS_TEMPLATE = `SCHOOL-SPECIFIC SAAS SUPPLIER INCIDENT NOTES

Supplier identification:
  Affected supplier:           [name, e.g. Arbor]
  System(s) affected:          [e.g. MIS, parent portal]
  School's data categories held there: [pupil records, attendance, contact details, safeguarding flags, etc.]
  Volume (approx.):            [number of pupils / staff / parents affected]
  Data Processing Agreement:   [stored at — e.g. SharePoint /Contracts/Arbor-DPA-2024.pdf]

Supplier verification:
  Verified the incident is real via:  [supplier's published page, phone call to account manager, official email from known sender]
  Supplier incident contact (24/7):   [phone, email]
  Supplier incident reference number: [if issued]
  Date/time school became aware:      [date, time — this is when the 72-hour clock starts]

Initial scoping:
  School data categories affected:    [list]
  Confidentiality / integrity / availability impact: [which dimensions are affected]
  Special category data involved (health, ALN/ASN, safeguarding)?  [yes/no — if yes, escalate to DPO immediately]
  Children's data involved?           [yes — for almost all school SaaS systems]

ICO notifiability assessment (DPO-led):
  Risk to rights and freedoms of data subjects:  [low / medium / high]
  Decision to notify ICO:             [yes / no, recorded with rationale]
  ICO reference (if filed):           [reference number]
  Filed by:                           [name, role]
  Filed at:                           [date, time within 72 hours of awareness]

Affected-individuals notification (Article 34, if high risk):
  Method (letter / email / SMS):      [chosen]
  Drafted by:                         [name, role]
  Approved by:                        [DPO + SLT]
  Sent on:                            [date]
  Helpline / FAQ for parents:         [phone, web page]

Wales-specific notifications:
  Local authority cyber lead:         [name, phone, email]
  Regional ROCU Cyber PROTECT (TARIAN / NWROCU): [contact]
  Welsh Government / consortium digital education contact (if applicable): [name, phone]

Data continuity:
  Latest copy of school's data held by school: [date, location — confirm this exists, or request it]
  Supplier's recovery timeline:        [as advised by supplier]
  Manual fallback if supplier unavailable: [e.g. paper register for attendance, paper safeguarding log]

Contract / commercial review:
  Supplier's official incident report received: [date]
  Root cause stated:                   [summary]
  Remedial actions stated:             [summary]
  School's view on continuing the contract: [continue / continue with conditions / migrate]
  Procurement / SLT decision-maker:    [name, role]
  Date of decision:                    [date]

Lessons / control improvements:
  Was DPA up to date?                  [yes/no, last reviewed]
  Did school have a current data copy? [yes/no — and what changed]
  Is supplier on Cyber Essentials / CE+ / ISO 27001? [yes/no]
  Update to school's asset register (Section 9): [done / pending]`;

// ---------------------------------------------------------------------------

export const PLAYBOOKS: PlaybookContent[] = [
  {
    key: 'ransomware',
    title: 'Ransomware',
    desc: 'The most common high-impact incident type for Welsh schools. A working ransomware playbook is the single most valuable component of this plan.',
    defaultEnabled: true,
    whyMatters: `The NCSC has issued repeated alerts since 2020 about <a href="https://www.ncsc.gov.uk/news/alert-targeted-ransomware-attacks-on-uk-education-sector" target="_blank" rel="noopener noreferrer">targeted ransomware attacks on the UK education sector</a>, including incidents that resulted in the loss of student coursework, school financial records and other critical data. The 2025 Cyber Security Breaches Survey found that <a href="https://www.gov.uk/government/statistics/cyber-security-breaches-survey-2025/cyber-security-breaches-survey-2025-education-institutions-findings" target="_blank" rel="noopener noreferrer">71% of secondary schools reported a cybersecurity incident in the last 12 months</a>. Welsh schools should contact their regional ROCU Cyber PROTECT team for free pre-incident advice: <a href="https://www.tarianrccu.org.uk/" target="_blank" rel="noopener noreferrer">TARIAN</a> (South Wales, Gwent, Dyfed-Powys) or <a href="https://www.nwrocu.police.uk/" target="_blank" rel="noopener noreferrer">NWROCU</a> (North Wales). Once an incident is in progress, your local authority cyber lead and / or commercial cyber insurer should be the first call before engaging external incident responders.`,
    examples: [
      'Who has authority to physically pull the network cable / switch off the core switch out of hours, and how to reach them',
      'Where the immutable / off-site backups live and the exact contact at the supplier (incl. account ref and out-of-hours number)',
      'Order of priority for recovery — typically safeguarding records, then MIS (e.g. SIMS, Bromcom, Arbor), finance, then teaching apps',
      'Any locally-hosted servers that need physical access to isolate (server room key holder, location)',
      'Which year groups / parents to communicate with first, and who drafts the parent letter',
      'Whether to keep the school open or close — named decision-maker',
    ],
    template: RANSOMWARE_TEMPLATE,
  },
  {
    key: 'dataBreach',
    title: 'Personal data breach',
    desc: 'Any incident involving suspected exposure of personal data. UK GDPR 72-hour ICO deadline starts from when you become aware.',
    defaultEnabled: true,
    whyMatters: `Schools hold high-volume, high-sensitivity personal data — safeguarding records, ALN/ASN, FSM, medical, payroll — which makes a personal data breach one of the most consequential incident types. The 72-hour ICO notification window starts from when the school <em>becomes aware</em>, not when the breach is confirmed. Failure to report a notifiable breach can attract regulatory action. Use the <a href="https://ico.org.uk/for-organisations/report-a-breach/personal-data-breach-assessment/" target="_blank" rel="noopener noreferrer">ICO's self-assessment</a> to judge notifiability, and report at <a href="https://ico.org.uk/for-organisations/report-a-breach/" target="_blank" rel="noopener noreferrer">ico.org.uk/for-organisations/report-a-breach</a>. Increasingly, exfiltrated personal data is used as extortion leverage even when systems remain operational — treat the breach response and the ransomware response as parallel workstreams, not sequential.`,
    examples: [
      'DPO contact details and their out-of-hours availability (especially holidays)',
      "Where the school's record of processing activities (ROPA) is kept — needed to assess scope quickly",
      'Categories of pupil data the school holds (ALN/ASN, FSM, safeguarding, medical, photographs) and where each lives',
      "Process for notifying affected pupils' parents/carers — who drafts, who approves, who sends",
      'Whether the local authority, federation / consortium, or Welsh Government need to be informed (and at what threshold)',
      "Local interpretation of 'high risk' for parental notification — agreed with DPO",
    ],
    template: DATA_BREACH_TEMPLATE,
  },
  {
    key: 'accountCompromise',
    title: 'Account compromise (staff)',
    desc: 'Phishing-driven email / Microsoft / Google account takeover. Often the precursor to ransomware or data exfiltration.',
    defaultEnabled: true,
    whyMatters: `Staff account compromise is the single most common entry point into a school network. The NCSC's guidance on <a href="https://www.ncsc.gov.uk/guidance/phishing" target="_blank" rel="noopener noreferrer">phishing attacks: defending your organisation</a> notes that account takeover frequently leads to onward attacks — including ransomware deployment and data exfiltration — days or weeks after the initial compromise. Detection requires actively monitoring for signs of compromise (mailbox forwarding rules, unfamiliar OAuth consents, unusual login geography) rather than waiting for the user to notice. Welsh schools' regional ROCU Cyber PROTECT teams (TARIAN, NWROCU) can advise on detection and response practice for free.`,
    examples: [
      'Who can disable a Microsoft 365 / Google Workspace account at short notice (incl. out-of-hours)',
      'Process for forced password reset across the estate — and how staff are notified',
      'Where the audit log is and how far back it retains (default M365 = 90 days, Google = 6 months)',
      'Whether the school uses conditional access policies and who can adjust them',
      'Process for checking mailbox forwarding rules — these are the #1 sign of BEC',
      'Who reviews shared SharePoint / OneDrive activity for the affected user',
    ],
    template: ACCOUNT_COMPROMISE_TEMPLATE,
  },
  {
    key: 'phishing',
    title: 'Phishing campaign',
    desc: 'Targeted phishing against staff, particularly business email compromise (BEC) targeting finance staff.',
    defaultEnabled: true,
    whyMatters: `Phishing — particularly business email compromise (BEC) targeting bursars and business managers — remains the highest-volume threat to Welsh schools. Report Fraud and the regional Cyber PROTECT Network repeatedly highlight invoice-redirection fraud and CEO-impersonation as common patterns in the sector. The NCSC provides <a href="https://www.ncsc.gov.uk/guidance/phishing" target="_blank" rel="noopener noreferrer">specific guidance on defending against phishing</a>. The bank-detail-change verification rule (always verify by phone, on an independently-sourced number) is the single most effective control for BEC. Where phishing succeeds against finance staff, contact your local authority cyber lead and your regional ROCU Cyber PROTECT team (TARIAN or NWROCU) for sector-specific advice on response and onward investigation.`,
    examples: [
      'Who can search and remove emails across all staff mailboxes (M365 Content Search, Google Vault)',
      'Process for blocking sender domains at the email gateway',
      "Standard phrasing for the staff alert ('do not click', 'do not reply', what to look for)",
      'Whether the school uses an external phishing reporting button — and where reports go',
      'Specific risk: invoice fraud / supplier impersonation targeting the bursar/business manager — bank account verification process',
      'Finance team rule for any change to bank details (e.g. always verify by phone using independently-sourced number)',
    ],
    template: PHISHING_TEMPLATE,
  },
  {
    key: 'bec',
    title: 'Business email compromise (BEC) / invoice fraud',
    desc: "An attacker uses a compromised or spoofed email account to redirect a school payment, change supplier bank details, or impersonate the headteacher requesting an urgent transfer. Time-to-bank-recall is the single biggest determinant of whether the money comes back.",
    defaultEnabled: true,
    whyMatters: `BEC against UK schools is high-cost and increasingly common — supplier-invoice fraud, payroll-redirection, and headteacher impersonation requesting urgent wire transfers all feature in incidents reported across the sector, including in Welsh schools and consortia. <strong>Time-to-bank-recall is the single biggest determinant of whether the money comes back.</strong> NCSC recommends a specific workflow that schools should rehearse before a finance officer is targeted in real time. Treat BEC as distinct from account compromise: containment is about the bank and the payment, not about recovering the mailbox. The 24/7 <a href="https://www.reportfraud.police.uk/" target="_blank" rel="noopener noreferrer">Report Fraud live-attack line (0300 123 2040)</a> produces a police crime reference number that is required for any local authority cyber cover / insurance claim and for bank-recall escalation. Your regional ROCU Cyber PROTECT team (<a href="https://www.tarianrccu.org.uk/" target="_blank" rel="noopener noreferrer">TARIAN</a> for South Wales / Gwent / Dyfed-Powys; <a href="https://www.nwrocu.police.uk/" target="_blank" rel="noopener noreferrer">NWROCU</a> for North Wales) can also advise on patterns affecting other Welsh schools.`,
    examples: [
      "Named decision-maker who can authorise an urgent call to the bank's fraud line out-of-hours — including who has account details to hand",
      "Supplier verification policy: any change to bank details must be confirmed by a phone call to the supplier's known number on file, NOT the number on the new invoice or in the email",
      'Dual-authorisation threshold above which the bursar cannot pay alone — typical school threshold is £500 to £5,000',
      "Which mailbox audit to run after a BEC attempt: mail-forwarding rules, inbox rules, delegate-access settings, app passwords / OAuth grants — on the bursar's, headteacher's, business manager's and finance officer's mailboxes",
      'School bank account fraud-line number(s) and the account / sort code — the person making the call will be asked for these',
      'Local authority cyber cover / cyber insurer notification process — most arrangements require notification before engaging external incident responders, and a police crime reference number for any claim',
    ],
    template: BEC_TEMPLATE,
  },
  {
    key: 'aiExtortion',
    title: 'Extortion via AI (deepfake / synthetic media)',
    desc: 'A perpetrator threatens the school using AI-generated imagery, voice or video of pupils or staff. Safeguarding-first: treat all media as fabricated until verified, never engage with the perpetrator, and route through DSL and Cyber Protect Officers.',
    defaultEnabled: true,
    whyMatters: `AI-generated imagery and voice are now cheap and ubiquitous, and UK schools — including Welsh schools — are increasingly the target of extortion campaigns that <em>fabricate</em> abuse material featuring named pupils. Three principles apply: <strong>(1) treat all media as fabricated until verified by trained professionals</strong>, <strong>(2) do not engage with the perpetrator or pay</strong>, and <strong>(3) route through the Designated Safeguarding Lead</strong> because this is a safeguarding incident first and a cyber incident second. The <a href="https://reportharmfulcontent.com/" target="_blank" rel="noopener noreferrer">Report Harmful Content service</a> and the <a href="https://www.iwf.org.uk/" target="_blank" rel="noopener noreferrer">Internet Watch Foundation's Report Remove tool</a> are the takedown routes for any imagery of children. Capturing URLs, usernames and platforms as evidence (without downloading content) supports both safeguarding referrals and Cyber PROTECT investigation by your regional ROCU (<a href="https://www.tarianrccu.org.uk/" target="_blank" rel="noopener noreferrer">TARIAN</a> for South Wales / Gwent / Dyfed-Powys; <a href="https://www.nwrocu.police.uk/" target="_blank" rel="noopener noreferrer">NWROCU</a> for North Wales).`,
    examples: [
      'Designated Safeguarding Lead (DSL) is the lead, not the IT team — named DSL and deputy with out-of-hours route',
      "Evidence capture <strong>without</strong> downloading or forwarding the content: screenshot the URL and metadata only, record platform / username / timestamp, take a photo of the screen on a separate device if needed",
      'Pre-agreed wording for an immediate parent / pupil welfare call (safeguarding first — the pupil may already be aware and distressed)',
      "Referral routes: IWF Report Remove for imagery of children, Report Harmful Content for non-illegal material, social media platforms' own takedown forms, LADO if a staff member is named, Cyber PROTECT via regional ROCU",
      "Decision: do NOT pay; do NOT respond to or 'negotiate' with the perpetrator — engagement validates the demand and is documented as evidence of further offences",
      'Communications discipline: limit internal awareness to the CIRT until safeguarding referrals are made — rumours spread fast and add harm to the pupil',
    ],
    template: AI_EXTORTION_TEMPLATE,
  },
  {
    key: 'denialOfService',
    title: 'Denial of service',
    desc: 'DDoS or other availability attack on school services or website.',
    defaultEnabled: false,
    whyMatters: `The NCSC's <a href="https://www.ncsc.gov.uk/collection/denial-service-dos-guidance-collection" target="_blank" rel="noopener noreferrer">Denial of Service guidance</a> notes that schools are increasingly targeted by DDoS attacks — sometimes by current or former pupils using booter / stresser services. The <a href="https://www.nationalcrimeagency.gov.uk/what-we-do/crime-threats/cyber-crime/cyber-choices" target="_blank" rel="noopener noreferrer">National Crime Agency's Cyber Choices programme</a>, run with the ROCUs, exists partly to deter young people from this kind of activity. Knowing your broadband supplier's emergency contact and having a backup channel for parent communications (when the school website goes down) makes the difference between hours and days of disruption.`,
    examples: [
      'Broadband / connectivity supplier emergency contact and account number (LGfL, RM, Schools Broadband, etc.)',
      'Whether the school uses a CDN or DDoS-mitigation service (e.g. Cloudflare) and who manages it',
      'Backup channel for parent communications if the school website is unavailable (SMS, ParentPay, Class Dojo, etc.)',
      'Whether SaaS services (M365, Google Workspace, MIS) are likely affected or independent',
      'Public statement template for the school website (when restored) and social media',
    ],
    template: DOS_TEMPLATE,
  },
  {
    key: 'insiderThreat',
    title: 'Insider threat / misuse',
    desc: 'Misuse of access by a current or former staff member, contractor or student.',
    defaultEnabled: false,
    whyMatters: `Insider misuse can range from a leaver who retained access for weeks after departure, to a current employee inappropriately accessing safeguarding records, to pupils circumventing controls. The NCSC's <a href="https://www.ncsc.gov.uk/collection/board-toolkit/managing-cyber-security-as-a-business-risk/insider-risk" target="_blank" rel="noopener noreferrer">guidance on insider risk</a> frames it as a personnel-security and access-management issue rather than a purely technical one — meaning the joiner/mover/leaver process, audit log retention and HR coordination matter more than tooling. Where the suspected individual works with children, LADO involvement may be required; treat the safeguarding angle as the primary lens.`,
    examples: [
      'Standard joiner/mover/leaver process — who removes access and on what timescale',
      'HR contact (or HR provider) and how confidentiality is preserved during the early stages of investigation',
      'Where audit logs are kept that would evidence misuse (file access, print logs, login history)',
      'Process for capturing evidence before the individual is alerted (legal / employment law considerations)',
      'Whether the LADO (Local Authority Designated Officer) needs involving if the suspected individual works with children',
      'Safeguarding lead involvement if the issue affects pupil data or welfare',
    ],
    template: INSIDER_TEMPLATE,
  },
  {
    key: 'saasSupplierIncident',
    title: 'SaaS supplier incident (Arbor / SIMS / Bromcom / ParentPay / CPOMS / M365 / Hwb services etc.)',
    desc: "Your supplier had the breach, but the school is still the data controller — UK GDPR's 72-hour ICO clock falls on you.",
    defaultEnabled: true,
    whyMatters: `When a SaaS supplier (Arbor, SIMS, Bromcom, ParentPay, CPOMS, M365, Google Workspace, your finance system, Hwb-hosted services) suffers a cyber incident, schools often assume "the supplier is handling it." Under UK GDPR they're not — the school is the <strong>data controller</strong>, the supplier is the <strong>data processor</strong>, and the obligations to <strong>notify the ICO within 72 hours of becoming aware</strong>, to <strong>inform affected data subjects</strong> (parents, pupils, staff), and to <strong>obtain a copy of the affected data</strong> all sit with the school. Your supplier has its own response, but yours runs in parallel and is legally separate. Most schools don't have this playbook, and it's the most common gap a DPO will flag in a breach review. The <a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/personal-data-breaches/" target="_blank" rel="noopener noreferrer">ICO's guidance on personal data breaches</a> confirms the controller obligations apply regardless of whether the breach occurred at the controller or processor. Welsh schools should also notify their <strong>local authority cyber lead</strong> and the relevant <strong>ROCU Cyber PROTECT team</strong> (TARIAN for South Wales, Gwent, Dyfed-Powys; NWROCU for North Wales).`,
    examples: [
      'Confirm the incident is real (phishing pretending to be a supplier breach is common) — verify via the supplier\'s official channel, not via the email that told you',
      "Get the supplier's official Incident Notification / Records of Processing Activities update in writing — this becomes part of the school's evidence pack",
      "Determine the scope of <em>your school's</em> data affected — categories (pupil records, safeguarding, finance, contact details), volume, and pupil/staff numbers",
      'ICO 72-hour clock: starts when you become aware, not when the supplier does. DPO assesses notifiability under UK GDPR Article 33; if notifiable, school files at <a href="https://ico.org.uk/for-organisations/report-a-breach/" target="_blank" rel="noopener noreferrer">ico.org.uk/for-organisations/report-a-breach</a>',
      "Parent / staff notification: if the breach is high-risk to data subjects, school must inform them directly (Article 34) — supplier's notification to the school does not satisfy the school's obligation to its data subjects",
      'Get a copy of your data: under the data-controller / data-processor relationship, you have the contractual right to a current copy of all data the supplier holds on your behalf — exercise this so that even if the supplier service is degraded, the school has its records',
      'Notify your local authority cyber lead and your regional ROCU Cyber PROTECT team (TARIAN or NWROCU) — they may be aware of wider supplier incidents affecting other Welsh schools',
      "Decide on continuing the contract: review the supplier's incident report, root cause, remedial actions, and any change to their security posture. A breach isn't always a reason to switch, but it's always a reason to scrutinise",
    ],
    template: SAAS_TEMPLATE,
  },
];

export const PLAYBOOK_BY_KEY: Record<PlaybookKey, PlaybookContent> = PLAYBOOKS.reduce(
  (acc, p) => {
    acc[p.key] = p;
    return acc;
  },
  {} as Record<PlaybookKey, PlaybookContent>,
);
