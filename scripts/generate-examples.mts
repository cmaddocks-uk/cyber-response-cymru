// Node CLI: builds .docx samples for every report type using the fixture
// at tests/fixtures/current-v2-plan.json and writes them to examples/.
//
//   npm run examples
//
// Use this for:
//   - QA / customer demos (open the .docx in Word to eyeball the output)
//   - manual regression checks before each release
//   - sharing reference outputs with stakeholders
//
// Runs with tsx (zero-config TS execution), so it consumes the same code
// the production build does — no parallel rendering pipeline.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Packer } from 'docx';

import { initialIncident } from '../src/data/plan-schema.ts';
import { deepMergeSchema, migrateLegacyEntities } from '../src/lib/schema.ts';
import { SCENARIO_BY_ID } from '../src/data/scenarios.ts';
import { buildDocxDocument } from '../src/lib/document-model/word.ts';
import { buildGovernorReport } from '../src/lib/document-model/build-governor-report.ts';
import { buildActionPlan } from '../src/lib/document-model/build-action-plan.ts';
import { buildPlanReport } from '../src/lib/document-model/build-plan.ts';
import { buildFirst30Report } from '../src/lib/document-model/build-first30.ts';
import { buildTabletopReport } from '../src/lib/document-model/build-tabletop.ts';
import type { IncidentReport } from '../src/lib/document-model/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const FIXTURE = join(REPO_ROOT, 'tests', 'fixtures', 'current-v2-plan.json');
const OUT = join(REPO_ROOT, 'examples');

async function main() {
  console.log('Loading fixture:', FIXTURE);
  const raw = JSON.parse(await readFile(FIXTURE, 'utf8'));
  const incident = migrateLegacyEntities(deepMergeSchema(initialIncident(), raw));

  console.log('Output:', OUT);
  await mkdir(OUT, { recursive: true });

  const today = new Date('2026-05-15T12:00:00Z');

  // Governor / Trustee report.
  await emit(buildGovernorReport(incident.plan, incident.readiness, today));

  // Prioritised action plan.
  await emit(buildActionPlan(incident.plan, incident.readiness, today));

  // Full cyber incident response plan.
  await emit(buildPlanReport(incident.plan, today));

  // First 30 minutes rapid-response card.
  await emit(buildFirst30Report(incident.plan, today));

  // Tabletop summary — first scenario the fixture has answers for.
  const completedScenarioId = Object.keys(incident.tabletop.completed)[0];
  if (completedScenarioId && completedScenarioId in SCENARIO_BY_ID) {
    const scenario = SCENARIO_BY_ID[completedScenarioId as keyof typeof SCENARIO_BY_ID];
    const answers = incident.tabletop.scenarioAnswers[completedScenarioId as keyof typeof incident.tabletop.scenarioAnswers] ?? {};
    const completedDate = incident.tabletop.completed[completedScenarioId as keyof typeof incident.tabletop.completed] ?? '';
    await emit(buildTabletopReport(scenario, incident, answers, completedDate, today));
  }

  console.log('Done.');
}

async function emit(report: IncidentReport): Promise<void> {
  const doc = buildDocxDocument(report);
  const buffer = await Packer.toBuffer(doc);
  const file = join(OUT, `${report.filenameBase}.docx`);
  await writeFile(file, buffer);
  console.log(' wrote', file, `(${Math.round(buffer.length / 1024)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
