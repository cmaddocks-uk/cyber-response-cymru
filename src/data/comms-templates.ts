// Sample communication drafts. Scaffold for now — the long sample drafts
// (parent letter, ICO Article 33 notification, governor briefing etc.) port
// across in a follow-up. The Plan Builder's comms section reads from this
// list to decide which "Use this draft" inserter buttons to show; empty
// strings mean no inserter for that field yet.

import type { PlanState } from '~/data/plan-schema';

export type CommsField = keyof PlanState['comms'];

export interface CommsTemplate {
  field: CommsField;
  /** Title shown above the "examples" disclosure. */
  examplesTitle: string;
  /** Bullet-point examples shown in the disclosure. */
  examples: string[];
  /** Full sample text inserted by the "Use this draft" button. Empty = no button. */
  draft: string;
}

// Sample drafts ported verbatim from the v1.x build. Square-bracketed
// placeholders (e.g. [date], [name]) are intentional — the user replaces them
// with their school's actual details.

const HOLDING_PAGE_DRAFT = `[Date] — IT systems update

We are aware of an issue affecting some of our IT services and are working to resolve it. The school remains open and pupils are safe. We will provide further updates here as we have them.

If you need to contact the school urgently, please [phone number / alternative method].`;

const PARENT_LETTER_DRAFT = `Dear parents and carers,

I am writing to inform you that on [date] the school identified [a cyber security incident / unusual activity affecting our IT systems]. We acted immediately to contain the issue and engaged [our IT support / external specialists / our local authority cyber lead / our cyber insurer].

At this stage we [do / do not] believe that personal data has been affected. We will write again as soon as we have confirmed the position. The Information Commissioner's Office has been notified where required.

In the meantime, please be aware that [list of practical impacts: e.g. our usual email may be unavailable, ParentPay may be temporarily offline, certain school services may be disrupted].

We are sorry for the disruption this is causing and we will keep you updated as the situation develops.

Yours sincerely,
[Headteacher]`;

const STAFF_BRIEFING_DRAFT = `STAFF BRIEFING — [date/time] — INTERNAL ONLY

We are responding to a cyber security incident first detected at [time]. Please follow the instructions below carefully:

1. [Specific instructions e.g. "Do not log in to the network" / "Use only the school-issued mobile phones for now"]
2. Do not discuss the incident on social media or with the press. All external enquiries should be referred to [name].
3. If you see anything unusual on a school device, report it immediately to [IT support contact].
4. We will brief you again at [time] via [channel].

Thank you for your patience and discretion.

[SLT name]`;

const ICO_NOTIFICATION_DRAFT = `Notification under Article 33, UK GDPR

Organisation: [School name, URN]
DPO contact: [name, email, phone]

1. Nature of the breach: [brief factual description]
2. Date of incident: [when it happened] — Date of awareness: [when school became aware]
3. Categories of personal data affected: [e.g. pupil names, contact details, ALN/ASN data, safeguarding records]
4. Approximate number of data subjects affected: [number or range]
5. Likely consequences: [what harm could result]
6. Measures taken or proposed: [containment, recovery, notifications]
7. Has the data subject been informed: [yes/no/pending]

Please contact the DPO above for any further information.`;

const GOVERNOR_BRIEFING_DRAFT = `CONFIDENTIAL — Governor / Trustee Briefing

Date: [date]
Severity: [1 Critical / 2 Major / 3 Moderate / 4 Minor]
Status: [Active / Contained / Closed]

Summary: [one-paragraph factual summary of what happened]

Impact on the school: [operational, data, financial, reputational]
Action taken so far: [bullet list of actions and decisions]
Outstanding decisions: [any decisions still required from SLT or governors]
External notifications: [ICO / NCSC / Report Fraud / LA cyber lead / Welsh Gov contact — stated as done or pending]

Next update: [time/date]`;

export const COMMS_TEMPLATES: CommsTemplate[] = [
  {
    field: 'websiteHoldingPage',
    examplesTitle: 'Examples to consider for a website holding statement',
    examples: [
      'Keep it short — 2-3 sentences maximum',
      'State the school remains open / pupils are safe (if true)',
      "Confirm you are aware and working on it — don't speculate on cause",
      'Provide an alternative way to contact the school if email is down',
      "Avoid technical detail and don't promise specific resolution times",
    ],
    draft: HOLDING_PAGE_DRAFT,
  },
  {
    field: 'parentTemplate',
    examplesTitle: 'Examples to consider for a parent / carer letter',
    examples: [
      "Lead with what's happened in plain language — no jargon",
      "Be honest about what you don't yet know — overstating reassurance backfires later",
      'List concrete impacts they need to act on (ParentPay down, no email, etc.)',
      'Confirm whether personal data is or may be affected (and ICO notification status)',
      'Tell them when and how the next update will arrive — and stick to it',
      'Provide an alternative contact route if normal email is unavailable',
    ],
    draft: PARENT_LETTER_DRAFT,
  },
  {
    field: 'staffTemplate',
    examplesTitle: 'Examples to consider for a staff briefing',
    examples: [
      'Be explicit that the briefing is internal — staff often forward these',
      "Tell staff what they should and should NOT do (e.g. don't log in, don't discuss on social media)",
      'Name the single point of contact for external enquiries (typically Head or comms lead)',
      'Include the time of the next briefing — staff will fill information gaps with rumour',
      'If staff personal data is affected, say so — they have the same rights as parents',
    ],
    draft: STAFF_BRIEFING_DRAFT,
  },
  {
    field: 'icoTemplate',
    examplesTitle: 'Examples to consider for an ICO notification',
    examples: [
      'The 72-hour clock starts when the school becomes *aware* of the breach, not when it happened',
      'ICO accepts notifications via their breach reporting form online or by phone (0303 123 1113)',
      "If you can't gather all the facts in 72 hours, submit a partial notification and follow up — don't miss the deadline",
      'Cover the 7 elements: nature, date, categories of data, number affected, likely consequences, measures taken, contact',
      'Have the DPO sign off before submission — this is a legal notification',
      'Keep a record of the notification (or your reasoning for not notifying) regardless',
    ],
    draft: ICO_NOTIFICATION_DRAFT,
  },
  {
    field: 'governorTemplate',
    examplesTitle: 'Examples to consider for a governor briefing',
    examples: [
      'Mark it CONFIDENTIAL — governors will reasonably ask family/colleagues, but they should know not to',
      'Use a consistent severity grading so governors can compare incidents over time',
      "Be explicit about what's contained vs what's still active",
      'List outstanding decisions so governors know what they may need to authorise',
      'Note all external notifications (ICO, NCSC, LA cyber lead, Welsh Gov) — governors are accountable for compliance',
      "Schedule the next update so governors aren't asking 'any news?' on email mid-incident",
    ],
    draft: GOVERNOR_BRIEFING_DRAFT,
  },
];

export const COMMS_TEMPLATE_BY_FIELD: Partial<Record<CommsField, CommsTemplate>> = COMMS_TEMPLATES.reduce(
  (acc, t) => {
    acc[t.field] = t;
    return acc;
  },
  {} as Partial<Record<CommsField, CommsTemplate>>,
);
