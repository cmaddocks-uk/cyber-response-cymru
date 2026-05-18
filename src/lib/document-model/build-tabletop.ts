// Builder: Tabletop scenario summary → IncidentReport.
//
// Audience: LA cyber-cover evidence of plan testing. Consumes the
// tabletop-run selector for gap classification; the builder shapes those
// records into the cover + body sections both the screen renderer and the
// docx exporter consume.

import type { Incident } from '~/data/plan-schema';
import type { Scenario } from '~/data/scenarios';
import { getTabletopRunData } from '~/lib/selectors/tabletop-run';
import { safeLogoSrc } from '~/lib/logo';
import type {
  Block,
  BodySection,
  CoverSection,
  IncidentReport,
  TableRow,
} from './types';
import { slugify } from '~/lib/download';
import { formatUkDate } from './cover-helpers';

export function buildTabletopReport(
  scenario: Scenario,
  incident: Incident,
  answers: Record<string, string>,
  completedDate: string,
  today: Date = new Date(),
): IncidentReport {
  void today;
  const run = getTabletopRunData(scenario, incident);
  const schoolName = incident.plan.meta.schoolName || 'Your school / college';

  // Tabletop has its own metadata row — "Conducted" + plan version.
  const meta: { value: string }[] = [];
  if (incident.plan.meta.planVersion) meta.push({ value: `Plan version ${incident.plan.meta.planVersion}` });
  if (completedDate) meta.push({ value: `Conducted ${formatUkDate(completedDate)}` });
  if (scenario.sourceLabel) meta.push({ value: scenario.sourceLabel });

  const cover: CoverSection = {
    kind: 'cover',
    title: scenario.title,
    subtitle: schoolName + (incident.plan.meta.trustName ? ` · ${incident.plan.meta.trustName}` : ''),
    logo: safeLogoSrc(incident.plan.meta.schoolLogo),
    meta,
  };

  const totalSteps = run.steps.length;
  const stepsWithAnswers = run.steps.filter((s) => (answers[s.step.id] ?? '').trim() !== '').length;

  const headline: BodySection = {
    kind: 'body',
    title: 'Exercise outcome',
    lede: 'A one-page snapshot of what the scenario tested and where the plan was silent.',
    blocks: [
      {
        kind: 'metricCards',
        cards: [
          { label: 'Steps completed', value: `${stepsWithAnswers} / ${totalSteps}`, severity: stepsWithAnswers === totalSteps ? 'green' : stepsWithAnswers > 0 ? 'amber' : 'red' },
          { label: 'Plan gaps surfaced', value: String(run.allGaps.length), severity: run.allGreen ? 'green' : 'amber' },
          { label: 'Scenario', value: scenario.sourceLabel, severity: 'navy' },
        ],
      },
      {
        kind: 'callout',
        severity: run.allGreen ? 'green' : 'amber',
        title: run.allGreen ? 'No plan gaps surfaced' : `${run.allGaps.length} plan gap${run.allGaps.length === 1 ? '' : 's'} surfaced`,
        body: run.allGreen
          ? 'Every field this scenario tested has a value. Note that this confirms the plan is populated for these situations, not that the values are current or correct.'
          : 'The scenario surfaced fields in your plan that are currently blank. These are gaps where, if this scenario happened to your school, your plan would be silent. Close them in the plan builder before the next test.',
      },
    ],
  };

  // Per-step record — rendered as a timeline so the exercise reads as a
  // chronological narrative rather than a stack of cards.
  const timelineSection: BodySection = {
    kind: 'body',
    title: 'Step-by-step record',
    lede: 'Each step the team worked through, with the question and the response captured at the time.',
    blocks: [
      {
        kind: 'timeline',
        events: run.steps.map(({ step, index, gaps: stepGaps }) => {
          const ans = answers[step.id] ?? '';
          const summary: string[] = [`Q: ${step.prompt}`];
          summary.push(`Response: ${ans ? ans : '(no response captured)'}`);
          if (stepGaps.length > 0) {
            summary.push(
              `Gaps: ${stepGaps.map((g) => g.label).join(' · ')}`,
            );
          }
          return {
            time: step.time || `Step ${index + 1}`,
            title: `Step ${index + 1} · ${step.title}`,
            body: summary.join('\n'),
            severity: stepGaps.length > 0 ? 'amber' : ans ? 'green' : 'muted',
          };
        }),
      },
    ],
  };

  const allGapsTable: BodySection | null = run.allGaps.length > 0
    ? {
        kind: 'body',
        title: 'All plan gaps identified',
        lede: 'Every blank field this scenario referenced, de-duplicated across steps.',
        blocks: [
          {
            kind: 'table',
            columns: ['#', 'Plan field'],
            widths: [0.08, 0.92],
            rows: run.allGaps.map(
              (g, i): TableRow => ({
                severity: 'red',
                cells: [String(i + 1), g.label],
              }),
            ),
          } as Block,
        ],
      }
    : null;

  return {
    documentTitle: 'Tabletop Exercise Summary',
    filenameBase: `tabletop-${slugify(scenario.title)}-${slugify(schoolName)}`,
    sections: [
      cover,
      headline,
      timelineSection,
      ...(allGapsTable ? [allGapsTable] : []),
    ],
    footer: `${schoolName} · Evidence of cyber plan testing for local authority cyber cover.`,
  };
}

