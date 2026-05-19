# Sample exports

Real `.docx` files generated from `tests/fixtures/current-v2-plan.json`.
Use them for QA, demos, and visual regression baselines.

## Regenerate

```bash
npm run examples
```

The script runs `scripts/generate-examples.mts` under `tsx`. It loads the
fixture, runs it through the schema migrator, and calls each builder. The
output of `buildDocxDocument()` is packed with `Packer.toBuffer()` (Node)
and written to this folder.

## What each file shows

| File | Demonstrates |
|------|--------------|
| `governor-summary-*.docx` | Executive cover, metric cards (Readiness/Red/Amber/Maturity), readiness progress bar, verdict callout, priority-actions table, CE assurance callout. |
| `action-plan-*.docx` | Executive cover, 4-card outstanding-action summary, "How to use" callout, full action register table with severity-tinted rows, LA cyber cover / NCSC timescales. |
| `cyber-incident-response-plan-*.docx` | Full 13-section plan: executive summary cards + completion progress, then sections 1–13 (Purpose, CIRT, External, Severity, Escalation, Process, Playbooks, Comms, Assets, Recovery, Review, Maintenance, Mapping). |
| `first-30-minutes-*.docx` | Readiness snapshot cards, 3-phase response timeline, per-phase contact tables, Do-NOT red callout, escalation chain ordered list. |
| `tabletop-*.docx` | Outcome cards (Steps completed / Plan gaps surfaced / Scenario), outcome callout, step-by-step timeline, all-gaps table. |

## Fidelity notes

- Files are real OOXML — open in Microsoft Word, LibreOffice, Google Docs, or Word Online.
- Page numbers appear in the footer (`Page X of Y`); school name appears left-aligned in the same footer.
- Headers / body fonts: **Fraunces** + **IBM Plex Sans**. If your viewer doesn't have these installed, Word substitutes Georgia + Calibri (still acceptable but not identical).
- Severity badges in Word render as **chip tables** — the closest Word can do to a CSS pill. Each badge carries a letter prefix (R / A / G / N / ·) so it stays legible in grayscale.

## Source-of-truth fixture

`tests/fixtures/current-v2-plan.json` is the canonical fully-populated v2 save.
Editing it changes every example simultaneously. The same file is also covered
by the round-trip tests at `tests/fixtures.test.ts`.
