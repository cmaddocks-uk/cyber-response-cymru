// Builder: Prioritised Action Plan → IncidentReport document tree.
//
// Audience: SLT / IT planning meetings. Auto-generated from the readiness
// check — every red and amber item becomes a row with the suggested action.

import type { PlanState, ReadinessState } from '~/data/plan-schema';
import { getActionPlanData } from '~/lib/selectors/action-plan';
import { safeLogoSrc } from '~/lib/logo';
import type {
  BodySection,
  CoverSection,
  IncidentReport,
  TableRow,
} from './types';
import { slugify } from '~/lib/download';
import { coverMetaForPlan } from './cover-helpers';

export function buildActionPlan(
  plan: PlanState,
  readiness: ReadinessState,
  today: Date = new Date(),
): IncidentReport {
  const data = getActionPlanData(readiness);
  const schoolName = plan.meta.schoolName || 'Your school / college';

  void today;
  const cover: CoverSection = {
    kind: 'cover',
    title: 'Prioritised Action Plan',
    subtitle: schoolName + (plan.meta.trustName ? ` · ${plan.meta.trustName}` : ''),
    logo: safeLogoSrc(plan.meta.schoolLogo),
    meta: coverMetaForPlan(plan),
  };

  // Empty / all-green / fully-answered branches.
  if (data.totalAnswered === 0) {
    return {
      documentTitle: 'Prioritised Action Plan',
      filenameBase: filename(schoolName, 'action-plan'),
      sections: [
        cover,
        {
          kind: 'body',
          title: 'Readiness check not yet started',
          blocks: [
            {
              kind: 'paragraph',
              text: 'The action plan is auto-generated from the readiness check. Complete the 16 questions first, and any red or amber items will appear here with a prioritised list of remediation actions.',
              callout: 'navy',
            },
          ],
        },
      ],
      footer: schoolName,
    };
  }
  if (data.rows.length === 0) {
    return {
      documentTitle: 'Prioritised Action Plan',
      filenameBase: filename(schoolName, 'action-plan'),
      sections: [
        cover,
        {
          kind: 'body',
          title: 'No remediation actions outstanding',
          blocks: [
            {
              kind: 'paragraph',
              text: 'Every answered readiness area is currently rated green. Continue annual review and testing, and re-run the assessment after any significant operational change.',
              callout: 'green',
            },
          ],
        },
      ],
      footer: schoolName,
    };
  }

  const rows: TableRow[] = data.rows.map((row, idx) => ({
    severity: row.rag === 'red' ? 'red' : 'amber',
    cells: [
      String(idx + 1),
      row.rag.toUpperCase(),
      `${row.label}\n${row.plain}\nAction: ${row.action}`,
      row.frameworks.length > 0 ? row.frameworks.join(' · ') : '—',
      '', // Owner column intentionally blank — filled by hand.
      '', // Target date — by hand.
      '', // Status — by hand.
    ],
  }));

  const headline: BodySection = {
    kind: 'body',
    title: 'Executive summary',
    lede: 'Outstanding remediation actions surfaced by the readiness check.',
    blocks: [
      {
        kind: 'metricCards',
        cards: [
          { label: 'Outstanding', value: String(data.rows.length), severity: data.rows.length > 0 ? 'amber' : 'green' },
          { label: 'Red', value: String(data.redCount), severity: data.redCount > 0 ? 'red' : 'green' },
          { label: 'Amber', value: String(data.amberCount), severity: data.amberCount > 0 ? 'amber' : 'green' },
          { label: 'Answered', value: String(data.totalAnswered), hint: 'of 16', severity: 'navy' },
        ],
      },
      {
        kind: 'callout',
        severity: 'navy',
        title: 'How to use this plan',
        body: 'Take this to the next SLT or IT planning meeting. Assign each action an owner, a target date and a status using the columns on the right. Red items typically need attention within one term; amber items within the academic year.',
      },
    ],
  };

  const table: BodySection = {
    kind: 'body',
    title: 'Action register',
    blocks: [
      {
        kind: 'table',
        columns: ['#', 'RAG', 'Area & recommended action', 'Framework', 'Owner', 'Target date', 'Status'],
        widths: [0.04, 0.06, 0.5, 0.1, 0.1, 0.1, 0.1],
        rows,
      },
    ],
  };

  const timescales: BodySection = {
    kind: 'body',
    title: 'Suggested timescales',
    lede: 'LA cyber cover / NCSC guidance.',
    blocks: [
      {
        kind: 'bullets',
        items: [
          'Red items — within one term (12 weeks). LA cyber cover expectations and NCSC fundamentals.',
          'Amber items — within the academic year. Maturity improvements that strengthen the response capability.',
          'All actions — re-run the readiness check after each closure to confirm the gap is closed, not just paper-resolved.',
        ],
      },
    ],
  };

  return {
    documentTitle: 'Prioritised Action Plan',
    filenameBase: filename(schoolName, 'action-plan'),
    sections: [cover, headline, table, timescales],
    footer: schoolName,
  };
}

function filename(schoolName: string, base: string): string {
  return `${base}-${slugify(schoolName || 'school')}`;
}
