// Builder: Your Plan (full Cyber Incident Response Plan) → IncidentReport.
//
// Translates every plan slice into the document model so the screen view,
// print path and docx exporter all consume the same tree. The shape mirrors
// the 13 sections in the original output/sections.tsx — Purpose, CIRT,
// External contacts, Severity bands, Escalation, Process, Playbooks, Comms,
// Assets, Recovery, Review, Maintenance, Mapping.

import type { PlanState } from '~/data/plan-schema';
import { PLAYBOOK_STEPS } from '~/data/playbook-steps';
import { safeLogoSrc } from '~/lib/logo';
import { getCeStatus, getOverallStatus } from '~/lib/selectors/plan-status';
import { slugify } from '~/lib/download';
import type {
  Block,
  CoverSection,
  IncidentReport,
} from './types';
import { coverMetaForPlan } from './cover-helpers';

const PLACEHOLDER = '[to be completed]';

export function buildPlanReport(plan: PlanState, today: Date = new Date()): IncidentReport {
  const schoolName = plan.meta.schoolName || 'Your school / college';

  // The numbered sections carry stable anchor IDs (`plan-sec-1`..`plan-sec-13`)
  // so the on-page TOC scrollspy continues to work after the migration to
  // DocumentRenderer.
  const numbered = [
    sectionPurpose(plan),
    sectionCirt(plan),
    sectionExternal(plan),
    sectionSeverity(plan),
    sectionEscalation(plan),
    sectionProcess(plan),
    sectionPlaybooks(plan),
    sectionComms(plan),
    sectionAssets(plan),
    sectionRecovery(plan),
    sectionReview(plan),
    sectionMaintenance(plan),
    sectionMapping(),
  ].map((s, i) => ({ ...s, anchor: `plan-sec-${i + 1}` }));

  return {
    documentTitle: 'Cyber Incident Response Plan',
    filenameBase: `cyber-incident-response-plan-${slugify(schoolName)}`,
    sections: [buildCover(plan, today), executiveSummary(plan, today), ...numbered],
    footer: schoolName,
  };
}

// ---------------------------------------------------------------------------
// Executive summary — exec-grade cards + completion progress + CE callout.
// ---------------------------------------------------------------------------

function executiveSummary(plan: PlanState, today: Date): { kind: 'body'; title: string; lede: string; blocks: Block[] } {
  const overall = getOverallStatus(plan);
  const pct = overall.total === 0 ? 0 : Math.round((overall.filled / overall.total) * 100);
  const ce = getCeStatus(plan.meta, today);
  const enabledPlaybooks = Object.values(plan.playbooks).filter((p) => p.enabled).length;

  const completionSeverity = pct >= 80 ? 'green' : pct >= 50 ? 'amber' : 'red';

  const blocks: Block[] = [
    {
      kind: 'metricCards',
      cards: [
        { label: 'Completion', value: `${pct}%`, hint: `${overall.filled} of ${overall.total} fields`, severity: completionSeverity },
        { label: 'Playbooks enabled', value: String(enabledPlaybooks), hint: 'of 9 available', severity: enabledPlaybooks > 0 ? 'navy' : 'amber' },
        { label: 'CE status', value: ce.visible && ce.statusLabel ? shortCe(ce.statusLabel) : 'Not set', severity: ce.visible && (ce.statusLabel === 'Cyber Essentials' || ce.statusLabel === 'Cyber Essentials Plus') ? 'green' : 'amber' },
        { label: 'Next review', value: plan.meta.nextReview || PLACEHOLDER, severity: plan.meta.nextReview ? 'navy' : 'muted' },
      ],
    },
    {
      kind: 'progress',
      label: 'Plan completion',
      value: pct / 100,
      trailing: `${pct}%`,
      severity: completionSeverity,
    },
  ];

  if (!plan.meta.approvedBy) {
    blocks.push({
      kind: 'callout',
      severity: 'amber',
      title: 'Awaiting approval',
      body: 'No approver name is recorded on the cover page. Plans typically require sign-off from the Headteacher, CEO or Chair of Governors before being adopted.',
    });
  }
  if (ce.renewalDeadline && 'lapsed' in ce.renewalDeadline && ce.renewalDeadline.lapsed) {
    blocks.push({
      kind: 'callout',
      severity: 'red',
      title: 'Cyber Essentials lapsed',
      body: `Certification expired ${ce.renewalDeadline.daysSince} day${ce.renewalDeadline.daysSince === 1 ? '' : 's'} ago. LA cyber cover and most Welsh-context assurance expectations require valid CE — recertify urgently.`,
    });
  }

  return {
    kind: 'body',
    title: 'Executive summary',
    lede: 'Headline plan status for governors and SLT.',
    blocks,
  };
}

function shortCe(label: string): string {
  if (label === 'Cyber Essentials Plus') return 'CE Plus';
  if (label === 'Cyber Essentials') return 'CE';
  return label;
}

// ---------------------------------------------------------------------------
// Cover
// ---------------------------------------------------------------------------

function buildCover(plan: PlanState, today: Date): CoverSection {
  // v2.5.2 editorial cover: hero (logo, title, school, audience) + single
  // inline metadata row (Version • Approved • Next review) + bottom
  // "Prepared by …". No cards, no panels.
  void today;
  return {
    kind: 'cover',
    title: 'Cyber Incident Response Plan',
    subtitle:
      (plan.meta.schoolName || 'School name not set') +
      (plan.meta.trustName ? ` · ${plan.meta.trustName}` : ''),
    logo: safeLogoSrc(plan.meta.schoolLogo),
    meta: coverMetaForPlan(plan),
  };
}

// ---------------------------------------------------------------------------
// 1. Purpose & scope
// ---------------------------------------------------------------------------

function sectionPurpose(plan: PlanState): { kind: 'body'; title: string; blocks: Block[] } {
  const school = plan.meta.schoolName || 'the school';
  return {
    kind: 'body',
    title: '1. Purpose & scope',
    blocks: [
      {
        kind: 'paragraph',
        text: `This Cyber Incident Response Plan sets out how ${school} responds to a suspected or confirmed cyber security incident. It is intended to be used by the Cyber Incident Response Team named below and by any staff who detect or are involved in responding to an incident.`,
      },
      {
        kind: 'paragraph',
        text: 'It maps to the NCSC Incident Management collection, the Welsh Government Cyber Resilient Wales strategy, the NCSC Cyber Assessment Framework (CAF) being piloted across Welsh local authorities, and the cyber incident expectations of most local authority cyber cover arrangements in Wales.',
      },
      {
        kind: 'paragraph',
        callout: 'navy',
        text: "This plan should be used in conjunction with: the school's Business Continuity and Disaster Recovery Plan, the Data Protection Policy, the Acceptable Use Policy, and any local authority- or insurer-specified incident notification process.",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 2. Cyber Incident Response Team
// ---------------------------------------------------------------------------

function sectionCirt(plan: PlanState): { kind: 'body'; title: string; blocks: Block[] } {
  const t = plan.team;
  const rows = [
    { role: 'Incident Lead', name: t.leadName, sub: t.leadRole, phone: t.leadPhone, email: t.leadEmail, alt: t.leadAlt },
    { role: 'Deputy Lead', name: t.deputyName, sub: t.deputyRole, phone: t.deputyPhone, email: t.deputyEmail, alt: t.deputyAlt },
    { role: 'Technical Lead', name: t.itLeadName, sub: t.itLeadRole, phone: t.itLeadPhone, email: t.itLeadEmail, alt: t.itLeadAlt },
    { role: 'Data Protection Officer', name: t.dpoName, sub: t.dpoOrg, phone: t.dpoPhone, email: t.dpoEmail, alt: t.dpoAlt },
    { role: 'Communications Lead', name: t.commsLeadName, sub: t.commsLeadRole, phone: t.commsLeadPhone, email: t.commsLeadEmail, alt: t.commsLeadAlt },
    ...t.members.map((m) => ({ role: m.role || 'Team member', name: m.name, sub: '', phone: m.phone, email: m.email, alt: m.alt })),
  ];
  return {
    kind: 'body',
    title: '2. Cyber Incident Response Team (CIRT)',
    blocks: [
      {
        kind: 'table',
        columns: ['Role', 'Name', 'Phone', 'Email', 'Alternative'],
        widths: [0.2, 0.25, 0.18, 0.22, 0.15],
        rows: rows.map((r) => ({
          severity: nonEmpty(r.name) ? 'navy' : 'amber',
          cells: [
            r.sub ? `${r.role}\n${r.sub}` : r.role,
            r.name || PLACEHOLDER,
            r.phone || PLACEHOLDER,
            r.email || PLACEHOLDER,
            r.alt || '[alt contact]',
          ],
        })),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 3. External contacts
// ---------------------------------------------------------------------------

function sectionExternal(plan: PlanState): { kind: 'body'; title: string; blocks: Block[] } {
  const e = plan.external;
  return {
    kind: 'body',
    title: '3. External contacts',
    blocks: [
      { kind: 'heading', level: 3, text: '3.1 IT support provider' },
      {
        kind: 'keyValue',
        rows: [
          { label: 'Provider', value: e.itProvider.name || PLACEHOLDER },
          { label: 'Account contact', value: e.itProvider.contact || PLACEHOLDER },
          { label: 'Phone', value: e.itProvider.phone || PLACEHOLDER },
          { label: 'Email', value: e.itProvider.email || PLACEHOLDER },
          { label: 'Out-of-hours / emergency', value: e.itProvider.outOfHours || PLACEHOLDER },
        ],
      },
      { kind: 'heading', level: 3, text: '3.2 UK reporting routes' },
      {
        kind: 'keyValue',
        rows: [
          { label: 'NCSC', value: e.ncscReport || PLACEHOLDER },
          { label: 'Action Fraud', value: e.actionFraud || PLACEHOLDER },
          { label: "ICO (Information Commissioner's Office)", value: e.ico || PLACEHOLDER },
          { label: 'Welsh Gov / consortium digital education contact', value: e.welshGovContact || PLACEHOLDER },
          { label: 'ROCU Cyber PROTECT (TARIAN / NWROCU)', value: e.rocuCyberProtect || PLACEHOLDER },
        ],
      },
      { kind: 'heading', level: 3, text: '3.3 Insurance & cover' },
      {
        kind: 'keyValue',
        rows: [
          { label: 'Local authority cyber cover / insurance arrangement', value: e.rpa || PLACEHOLDER },
          { label: 'Cyber insurance (commercial)', value: e.cyberInsurer || PLACEHOLDER },
        ],
      },
      { kind: 'heading', level: 3, text: '3.4 Other key contacts' },
      {
        kind: 'keyValue',
        rows: [
          { label: 'Local authority', value: e.localAuthority || PLACEHOLDER },
          { label: 'MIS supplier', value: e.miSupplier || PLACEHOLDER },
          { label: 'Broadband / connectivity', value: e.broadbandSupplier || PLACEHOLDER },
          { label: 'Legal adviser', value: e.legalAdviser || PLACEHOLDER },
          ...(e.otherSuppliers ?? []).map((s) => ({
            label: s.name || 'Other supplier',
            value: [s.service, s.phone, s.email].filter(Boolean).join(' · ') || PLACEHOLDER,
          })),
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 4. Severity bands
// ---------------------------------------------------------------------------

function sectionSeverity(plan: PlanState): { kind: 'body'; title: string; blocks: Block[] } {
  const s = plan.severity;
  return {
    kind: 'body',
    title: '4. Severity bands',
    blocks: [
      {
        kind: 'paragraph',
        text: 'The Incident Lead classifies the incident at the earliest opportunity and re-assesses as the picture develops. Severity drives the level of internal escalation and external notifications.',
      },
      {
        kind: 'table',
        columns: ['Severity', 'Description'],
        widths: [0.18, 0.82],
        rows: [
          { severity: 'red', cells: ['S1 — Critical', s.s1Desc || PLACEHOLDER] },
          { severity: 'amber', cells: ['S2 — Major', s.s2Desc || PLACEHOLDER] },
          { severity: 'amber', cells: ['S3 — Limited', s.s3Desc || PLACEHOLDER] },
          { severity: 'green', cells: ['S4 — Minor', s.s4Desc || PLACEHOLDER] },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 5. Escalation & decision authority
// ---------------------------------------------------------------------------

function sectionEscalation(plan: PlanState): { kind: 'body'; title: string; blocks: Block[] } {
  const e = plan.escalation;
  return {
    kind: 'body',
    title: '5. Escalation & decision authority',
    blocks: [
      {
        kind: 'table',
        columns: ['Decision', 'Authorising role', 'Deputy'],
        widths: [0.5, 0.25, 0.25],
        rows: [
          { cells: ['Take systems offline', e.decisionTakeOffline || PLACEHOLDER, e.decisionTakeOfflineDeputy || PLACEHOLDER] },
          { cells: ['Engage external responder / forensics', e.decisionEngageExternal || PLACEHOLDER, e.decisionEngageExternalDeputy || PLACEHOLDER] },
          { cells: ['Decline / refuse ransom (NCSC + Welsh Gov: do not pay)', e.decisionRansomware || PLACEHOLDER, '—'] },
          { cells: ['Public / press communications', e.decisionPress || PLACEHOLDER, e.decisionPressDeputy || PLACEHOLDER] },
          { cells: ['Notify the ICO (within 72h if data involved)', e.decisionICO || PLACEHOLDER, e.decisionICODeputy || PLACEHOLDER] },
        ],
      },
      {
        kind: 'keyValue',
        rows: [{ label: 'Incident conference line', value: e.conferenceLine || PLACEHOLDER }],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 6. Incident response process
// ---------------------------------------------------------------------------

function sectionProcess(_plan: PlanState): { kind: 'body'; title: string; blocks: Block[] } {
  return {
    kind: 'body',
    title: '6. Incident response process',
    blocks: [
      {
        kind: 'bullets',
        ordered: true,
        items: [
          'Detect & report — whoever spots the issue contacts the Incident Lead by phone (not email).',
          'Triage & classify — Incident Lead assigns a severity band and opens the incident log.',
          'Contain — isolate affected systems; preserve forensic state; do NOT power off devices.',
          'Eradicate — remove the root cause; rotate credentials; patch the vulnerability.',
          'Recover — restore from known-good backups; verify integrity before bringing back online.',
          'Communicate — keep staff, parents, governors, ICO, your local authority cyber lead and the press informed at the cadence the plan defines.',
          'Review — after action, capture lessons learned and update the plan within 30 days.',
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 7. Playbooks
// ---------------------------------------------------------------------------

function sectionPlaybooks(plan: PlanState): { kind: 'body'; title: string; blocks: Block[] } {
  const blocks: Block[] = [
    {
      kind: 'paragraph',
      text: 'Each playbook is a short, role-specific checklist for one incident type. The plan owner enables the playbooks that apply to your school. Tick once tested.',
    },
  ];
  for (const [key, flag] of Object.entries(plan.playbooks)) {
    if (!flag.enabled) continue;
    const def = PLAYBOOK_STEPS[key as keyof typeof PLAYBOOK_STEPS];
    blocks.push({ kind: 'heading', level: 3, text: def?.title ?? playbookTitle(key) });
    if (flag.notes) {
      blocks.push({ kind: 'paragraph', text: flag.notes });
    }
    if (def?.steps?.length) {
      blocks.push({ kind: 'bullets', ordered: true, items: def.steps });
    }
  }
  if (blocks.length === 1) {
    blocks.push({
      kind: 'paragraph',
      callout: 'amber',
      text: 'No playbooks enabled. Enable the incident types relevant to your school in the plan builder.',
    });
  }
  return { kind: 'body', title: '7. Playbooks', blocks };
}

function playbookTitle(key: string): string {
  const titles: Record<string, string> = {
    ransomware: 'Ransomware',
    dataBreach: 'Data breach',
    accountCompromise: 'Account compromise',
    phishing: 'Phishing / social engineering',
    bec: 'Business email compromise',
    aiExtortion: 'AI-assisted extortion',
    denialOfService: 'Denial-of-service attack',
    insiderThreat: 'Insider threat',
    saasSupplierIncident: 'SaaS / supplier incident',
  };
  return titles[key] ?? key;
}

// ---------------------------------------------------------------------------
// 8. Communications
// ---------------------------------------------------------------------------

function sectionComms(plan: PlanState): { kind: 'body'; title: string; blocks: Block[] } {
  const c = plan.comms;
  return {
    kind: 'body',
    title: '8. Communications',
    blocks: [
      {
        kind: 'keyValue',
        rows: [
          { label: 'Primary channel if email is down', value: c.primaryChannelDown || PLACEHOLDER },
          { label: 'Alternate channel', value: c.alternateChannel || PLACEHOLDER },
          { label: 'Website holding-page text', value: c.websiteHoldingPage || PLACEHOLDER },
        ],
      },
      { kind: 'heading', level: 3, text: 'Parent communication template' },
      { kind: 'paragraph', text: c.parentTemplate || PLACEHOLDER },
      { kind: 'heading', level: 3, text: 'Staff communication template' },
      { kind: 'paragraph', text: c.staffTemplate || PLACEHOLDER },
      { kind: 'heading', level: 3, text: 'ICO notification template' },
      { kind: 'paragraph', text: c.icoTemplate || PLACEHOLDER },
      { kind: 'heading', level: 3, text: 'Governor / trustee briefing template' },
      { kind: 'paragraph', text: c.governorTemplate || PLACEHOLDER },
    ],
  };
}

// ---------------------------------------------------------------------------
// 9. Critical systems & Business Impact Analysis
// ---------------------------------------------------------------------------

function sectionAssets(plan: PlanState): { kind: 'body'; title: string; blocks: Block[] } {
  const systems = plan.assets.systems ?? [];
  const blocks: Block[] = [
    {
      kind: 'paragraph',
      text: 'A short asset register identifying the systems that must come back online first if an incident takes them down. RTO is the maximum acceptable downtime; priority is the order of restoration.',
    },
    {
      kind: 'table',
      columns: ['System', 'Supplier', 'Data held', 'Hosting', 'RTO', 'Priority', 'Incident contact'],
      widths: [0.16, 0.14, 0.16, 0.1, 0.08, 0.1, 0.26],
      rows: systems.map((s) => ({
        severity: s.supplier ? 'navy' : 'amber',
        cells: [
          s.name || PLACEHOLDER,
          s.supplier || PLACEHOLDER,
          s.dataHeld || PLACEHOLDER,
          s.hosting || PLACEHOLDER,
          s.rto || PLACEHOLDER,
          s.priority || PLACEHOLDER,
          s.incidentContact || PLACEHOLDER,
        ],
      })),
    },
    { kind: 'heading', level: 3, text: 'Business Impact Analysis notes' },
    { kind: 'paragraph', text: plan.assets.biaNotes || PLACEHOLDER },
  ];
  return { kind: 'body', title: '9. Critical systems & Business Impact Analysis', blocks };
}

// ---------------------------------------------------------------------------
// 10. Recovery
// ---------------------------------------------------------------------------

function sectionRecovery(plan: PlanState): { kind: 'body'; title: string; blocks: Block[] } {
  const r = plan.recovery;
  return {
    kind: 'body',
    title: '10. Recovery',
    blocks: [
      {
        kind: 'keyValue',
        rows: [
          { label: 'Whole-school RTO', value: r.rto || PLACEHOLDER },
          { label: 'Whole-school RPO', value: r.rpo || PLACEHOLDER },
          { label: 'Backup locations', value: r.backupLocations || PLACEHOLDER },
          { label: 'Backup owner', value: r.backupOwner || PLACEHOLDER },
          { label: 'Backup test frequency', value: r.backupTestFrequency || PLACEHOLDER },
          { label: 'Priority restore order', value: r.priorityRestoreOrder || PLACEHOLDER },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 11. Post-incident review
// ---------------------------------------------------------------------------

function sectionReview(plan: PlanState): { kind: 'body'; title: string; blocks: Block[] } {
  const r = plan.review;
  return {
    kind: 'body',
    title: '11. Post-incident review',
    blocks: [
      {
        kind: 'keyValue',
        rows: [
          { label: 'Review lead', value: r.reviewLead || PLACEHOLDER },
          { label: 'Review deadline after incident closure', value: r.reviewDeadline || PLACEHOLDER },
          { label: 'Form / template location', value: r.formLocation || PLACEHOLDER },
          { label: 'Lessons-learned process', value: r.learningProcess || PLACEHOLDER },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 12. Plan maintenance
// ---------------------------------------------------------------------------

function sectionMaintenance(plan: PlanState): { kind: 'body'; title: string; blocks: Block[] } {
  const m = plan.maintenance;
  return {
    kind: 'body',
    title: '12. Plan maintenance',
    blocks: [
      {
        kind: 'keyValue',
        rows: [
          { label: 'Owner', value: m.owner || PLACEHOLDER },
          { label: 'Review frequency', value: m.reviewFrequency || PLACEHOLDER },
          { label: 'Last reviewed', value: m.lastReviewed || PLACEHOLDER },
          { label: 'Next review', value: m.nextReview || PLACEHOLDER },
          { label: 'Distribution list', value: m.distribution || PLACEHOLDER },
          { label: 'Offline copy location', value: m.offlineCopyLocation || PLACEHOLDER },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// 13. Framework mapping
// ---------------------------------------------------------------------------

function sectionMapping(): { kind: 'body'; title: string; blocks: Block[] } {
  return {
    kind: 'body',
    title: '13. Framework mapping',
    blocks: [
      {
        kind: 'paragraph',
        text: 'This plan addresses the cyber incident response expectations across the following Wales-context frameworks:',
      },
      {
        kind: 'bullets',
        items: [
          'NCSC Incident Management collection — preparation, response, recovery and review phases.',
          'Welsh Government Cyber Resilient Wales strategy — public-sector cyber security backdrop, with the NCSC Cyber Assessment Framework (CAF) piloted across Welsh local authorities.',
          'Local authority cyber cover / insurance arrangement — annual testing and notification expectations under your LA cover terms.',
          'ICO Information & Cyber Security toolkit — assurance evidence for data protection oversight.',
          'Cyber Essentials / Cyber Essentials Plus — five technical controls; CE Plus has a 3-month window after CE for the on-site audit.',
          'Estyn inspection arrangements — cyber response intersects with safeguarding and leadership and management aspects of inspection, providing governor / trustee assurance evidence.',
          'Regional ROCU Cyber PROTECT — TARIAN (South Wales, Gwent, Dyfed-Powys) or NWROCU (North Wales) — free pre-incident advice, training and exercises.',
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nonEmpty(s: string | undefined | null): boolean {
  return !!(s && s.trim());
}
