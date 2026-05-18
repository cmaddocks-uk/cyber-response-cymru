// Builder: Governor Report → IncidentReport document tree.
//
// Audience: governors / trustees. Pure composition — feeds the existing
// `getGovernorReportData` selector and reshapes its output into the
// exporter-agnostic document model. No styling, no rendering.

import type { PlanState, ReadinessState } from '~/data/plan-schema';
import { getGovernorReportData } from '~/lib/selectors/governor-report';
import { safeLogoSrc } from '~/lib/logo';
import type {
  BodySection,
  Block,
  CoverSection,
  IncidentReport,
  Severity,
  TableRow,
} from './types';
import { slugify } from '~/lib/download';
import { coverMetaForPlan } from './cover-helpers';

const VERDICT_TONE_TO_SEVERITY: Record<string, Severity> = {
  success: 'green',
  warning: 'amber',
  danger: 'red',
  muted: 'muted',
};

export function buildGovernorReport(
  plan: PlanState,
  readiness: ReadinessState,
  today: Date = new Date(),
): IncidentReport {
  const data = getGovernorReportData(plan, readiness, today);
  const schoolName = plan.meta.schoolName || 'Your school / college';

  void today;
  const cover: CoverSection = {
    kind: 'cover',
    title: 'Governor / Trustee Summary',
    subtitle: schoolName + (plan.meta.trustName ? ` · ${plan.meta.trustName}` : ''),
    logo: safeLogoSrc(plan.meta.schoolLogo),
    meta: coverMetaForPlan(plan),
  };

  // Empty-state report: cover + a single explainer body so the export is still
  // shippable rather than a broken half-document.
  if (data.totals.answered === 0) {
    return {
      documentTitle: 'Governor Summary',
      filenameBase: filename(schoolName, 'governor-summary'),
      sections: [
        cover,
        {
          kind: 'body',
          title: 'Readiness check not yet started',
          blocks: [
            {
              kind: 'paragraph',
              text: 'To generate a meaningful Governor / Trustee Report, the 16-question readiness check needs to be completed first. The report will then summarise readiness levels, surface priority areas, and produce Estyn-style assurance questions for governors to ask at the next meeting (Estyn does not currently inspect cyber security directly, but cyber response intersects with safeguarding and leadership and management aspects of inspection).',
              callout: 'navy',
            },
          ],
        },
      ],
      footer: schoolName,
    };
  }

  const verdictSeverity =
    VERDICT_TONE_TO_SEVERITY[data.verdict.tone] ?? 'navy';

  const sections: BodySection[] = [];

  // Executive Summary — cards up top so a busy governor can skim the
  // conclusion before the detail. Cards drive the headline numbers; a
  // progress bar gives a one-glance readiness gauge; the verdict text
  // appears as a tinted callout.
  const headlineCards: Block = {
    kind: 'metricCards',
    cards: [
      { label: 'Readiness', value: `${data.totals.pct}%`, hint: `${data.totals.total} of ${data.totals.max}`, severity: verdictSeverity },
      { label: 'Red gaps', value: String(data.totals.red), severity: data.totals.red > 0 ? 'red' : 'green' },
      { label: 'Amber areas', value: String(data.totals.amber), severity: data.totals.amber > 0 ? 'amber' : 'green' },
      { label: 'Maturity', value: data.maturity.band, severity: 'navy' },
    ],
  };

  sections.push({
    kind: 'body',
    title: 'Executive summary',
    lede: 'Headline assessment and ICO maturity band.',
    blocks: [
      headlineCards,
      { kind: 'progress', label: 'Overall readiness', value: data.totals.pct / 100, trailing: `${data.totals.pct}%`, severity: verdictSeverity },
      { kind: 'callout', severity: verdictSeverity, title: data.verdict.title, body: data.verdict.text },
      { kind: 'heading', level: 3, text: `ICO maturity · ${data.maturity.band}` },
      { kind: 'paragraph', text: data.maturity.description },
    ],
  });

  // Priority actions table — the meaty part of the report.
  if (data.priorityItems.length > 0) {
    const rows: TableRow[] = data.priorityItems.map((it) => ({
      severity: it.rag === 'red' ? 'red' : 'amber',
      cells: [it.rag.toUpperCase(), it.entry.label, it.entry.plain],
    }));
    sections.push({
      kind: 'body',
      title: 'Priority areas',
      lede: 'Top items where readiness is currently red or amber. Red items typically need attention within one term.',
      blocks: [
        {
          kind: 'table',
          columns: ['RAG', 'Area', 'What this means'],
          widths: [0.12, 0.28, 0.6],
          rows,
        },
      ],
    });
  }

  // Governor questions to ask at the next meeting.
  if (data.governorQuestions.length > 0) {
    sections.push({
      kind: 'body',
      title: 'Questions for governors to ask',
      lede: 'Use these at the next meeting to seek assurance from SLT against the red and amber items above.',
      blocks: [
        {
          kind: 'bullets',
          items: data.governorQuestions.map((q) => q.entry.govQ),
        },
      ],
    });
  }

  // Cyber Essentials assurance question — only surfaces when CE state warrants it.
  if (data.ceQuestion) {
    sections.push({
      kind: 'body',
      title: 'Cyber Essentials assurance',
      blocks: [
        {
          kind: 'callout',
          severity: 'navy',
          title: 'Question for SLT',
          body: data.ceQuestion,
        },
      ],
    });
  }

  return {
    documentTitle: 'Governor Summary',
    filenameBase: filename(schoolName, 'governor-summary'),
    sections: [cover, ...sections],
    footer: schoolName,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function filename(schoolName: string, base: string): string {
  const slug = slugify(schoolName || 'school');
  return `${base}-${slug}`;
}
