// Builder: First 30 Minutes laminate card → IncidentReport.
//
// The screen version of this is a dense, single-A4 layout with bespoke CSS
// — see First30Card.tsx. The exportable document model version is the same
// content rearranged into normal sections, so Word output, print and PDF
// all share one document tree.

import type { PlanState } from '~/data/plan-schema';
import { getFirst30Data, type First30Contact } from '~/lib/selectors/first30-card';
import { safeLogoSrc } from '~/lib/logo';
import type { CoverSection, IncidentReport, TableRow } from './types';
import { slugify } from '~/lib/download';
import { coverMetaForPlan } from './cover-helpers';

export function buildFirst30Report(
  plan: PlanState,
  today: Date = new Date(),
): IncidentReport {
  void today;
  const data = getFirst30Data(plan);
  const schoolName = plan.meta.schoolName || 'Your school / college';

  const cover: CoverSection = {
    kind: 'cover',
    title: 'First 30 Minutes',
    subtitle: schoolName + (plan.meta.trustName ? ` · ${plan.meta.trustName}` : ''),
    logo: safeLogoSrc(plan.meta.schoolLogo),
    meta: coverMetaForPlan(plan),
  };

  // "Coverage" of the rapid-response contacts — used to drive the headline
  // cards on the second page so the SLT can see at a glance whether the
  // First 30 sheet is laminate-ready.
  const phase1Filled =
    contactCount(data.phase1.sltLead) + contactCount(data.phase1.deputy);
  const phase2Filled =
    contactCount(data.phase2.itLead) +
    contactCount(data.phase2.commsLead) +
    contactCount(data.phase2.dpo) +
    contactCount(data.phase2.sltSponsor);
  const phase3Filled =
    (data.phase3.itSupport ? 1 : 0) +
    (data.phase3.insurer ? 1 : 0) +
    (data.phase3.broadband ? 1 : 0) +
    (data.phase3.externalDpo ? 1 : 0);

  return {
    documentTitle: 'First 30 Minutes — Cyber Incident',
    filenameBase: filename(schoolName),
    sections: [
      cover,
      {
        kind: 'body',
        title: 'Readiness snapshot',
        lede: 'Are the right people listed in each phase of the response card?',
        blocks: [
          {
            kind: 'metricCards',
            cards: [
              { label: '0–5 min contacts', value: `${phase1Filled} / 2`, severity: phase1Filled === 2 ? 'green' : phase1Filled > 0 ? 'amber' : 'red' },
              { label: '5–15 min contacts', value: `${phase2Filled} / 4`, severity: phase2Filled === 4 ? 'green' : phase2Filled > 0 ? 'amber' : 'red' },
              { label: '15–30 min routes', value: `${phase3Filled} / 4`, severity: phase3Filled === 4 ? 'green' : phase3Filled > 0 ? 'amber' : 'red' },
              { label: 'Approver', value: plan.meta.approvedBy || '[not set]', severity: plan.meta.approvedBy ? 'navy' : 'amber' },
            ],
          },
          {
            kind: 'callout',
            severity: 'navy',
            title: 'Why this matters',
            body: "The first 30 minutes shape the incident. If the laminate card on the wall is missing a name or number, the response stalls. Aim for every row to be green before printing.",
          },
        ],
      },
      {
        kind: 'body',
        title: 'Response timeline',
        lede: 'Three phases. Each runs on a clock that doesn\'t pause for hesitation.',
        blocks: [
          {
            kind: 'timeline',
            events: [
              { time: '0–5 min', title: 'First responder (whoever spotted it)', severity: 'red',   body: 'Disconnect device · DO NOT power off · stop using it · call the SLT digital lead by phone.' },
              { time: '5–15 min', title: 'SLT digital lead', severity: 'amber', body: 'Convene CIRT · assess severity S1–S4 · open the incident log · disable compromised accounts.' },
              { time: '15–30 min', title: 'Incident lead', severity: 'green', body: 'If S1/S2 call your LA cyber lead / insurer (number from External Contacts) · start ICO 72-hour clock if data involved · brief Headteacher · first parent comms.' },
            ],
          },
        ],
      },
      {
        kind: 'body',
        title: 'Phase 1 contacts · 0–5 min',
        blocks: [
          contactTable([
            { label: 'SLT digital lead', contact: data.phase1.sltLead },
            { label: 'Deputy', contact: data.phase1.deputy },
          ]),
        ],
      },
      {
        kind: 'body',
        title: 'Phase 2 contacts · 5–15 min',
        blocks: [
          contactTable([
            { label: 'IT Lead', contact: data.phase2.itLead },
            { label: 'Comms Lead', contact: data.phase2.commsLead },
            { label: 'DPO', contact: data.phase2.dpo },
            { label: 'SLT Sponsor', contact: data.phase2.sltSponsor },
          ]),
        ],
      },
      {
        kind: 'body',
        title: 'Phase 3 contacts · 15–30 min',
        blocks: [
          {
            kind: 'keyValue',
            rows: [
              { label: 'IT support / MSP', value: data.phase3.itSupport ?? '[not set]' },
              { label: 'LA cyber lead / insurer', value: data.phase3.insurer ?? '[not set]' },
              { label: 'Broadband supplier', value: data.phase3.broadband ?? '[not set]' },
              { label: 'External DPO', value: data.phase3.externalDpo ?? '[not set]' },
            ],
          },
        ],
      },
      {
        kind: 'body',
        title: 'Do NOT',
        blocks: [
          {
            kind: 'callout',
            severity: 'red',
            title: 'Five rules that hold under pressure',
            body: 'These are the actions that turn a recoverable incident into a worse one. Burn them in.',
          },
          {
            kind: 'bullets',
            items: [
              'Pay any ransom (NCSC and Welsh Government strongly advise against).',
              'Power off affected devices (loses forensic evidence).',
              'Contact or negotiate with the attackers.',
              'Communicate via email systems that may be compromised.',
              'Wipe or restore systems before a forensic snapshot.',
            ],
          },
        ],
      },
      {
        kind: 'body',
        title: 'Escalation chain',
        blocks: [
          {
            kind: 'bullets',
            ordered: true,
            items: [
              'Internal: SLT digital lead → Headteacher → Chair of Governors.',
              'Insurer: LA cyber cover / cyber insurer (number from External Contacts).',
              'Regulator: ICO breach reporting (within 72 hours if data is involved).',
              'Crime: Report Fraud 0300 123 2040 + report to NCSC.',
              'Regional support: TARIAN (South Wales / Gwent / Dyfed-Powys) or NWROCU (North Wales) Cyber PROTECT team — free advice.',
            ],
          },
        ],
      },
    ],
    footer: schoolName,
  };
}

function contactCount(c: First30Contact): number {
  return (c.name ?? '').trim() !== '' || (c.phone ?? '').trim() !== '' ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function filename(schoolName: string): string {
  return `first-30-minutes-${slugify(schoolName || 'school')}`;
}

interface ContactRow {
  label: string;
  contact: First30Contact;
}

function contactTable(rows: ContactRow[]): {
  kind: 'table';
  columns: string[];
  widths: number[];
  rows: TableRow[];
} {
  return {
    kind: 'table',
    columns: ['Role', 'Name', 'Phone'],
    widths: [0.3, 0.4, 0.3],
    rows: rows.map(({ label, contact }): TableRow => {
      const hasName = (contact.name ?? '').trim() !== '';
      const hasPhone = (contact.phone ?? '').trim() !== '';
      const filled = hasName || hasPhone;
      return {
        severity: filled ? 'navy' : 'amber',
        cells: [
          label,
          hasName ? (contact.name as string) : '[not set]',
          hasPhone ? (contact.phone as string) : '[not set]',
        ],
      };
    }),
  };
}
