# v0.1.0 archive

Snapshot of the **single-file** v0.1.0 build of cyber-response-cymru, preserved here for reference. v2.0.0-alpha.0 ported the tool onto the Astro + React + Tailwind v2.x line of its English sister tool, and the original v0.1 files were moved here rather than deleted.

These files are **not** part of the live build. They are archival only — the original wording of the Welsh-context fork before the architecture port.

## What's here

- `index.html` — the entire v0.1 single-file build (5,557 lines, 411 KB). All Welsh-context strings, framework references, playbooks and tabletop scenarios are sourced from this file. Useful when re-checking that the v2.x content swap (carried out across `src/data/*.ts` and the components) faithfully reflects the v0.1 intent.
- `README.v0.1.md` — the v0.1 project README. Establishes the original two-phase delivery framing (Phase 1 framework swap, Phase 2 full Welsh translation). Mentions `FRAMEWORK_SWAP.md` and `TRANSLATION.md` as planned documents — these were never written before the architecture port.
- `SECURITY.md` — the v0.1 security policy.
- `404.html`, `robots.txt`, `security-test.js`, `test.js` — supporting files from the v0.1 single-file build.

## Not authoritative

For the current Welsh-context wording, see:

- `src/data/*.ts` — readiness questions, plan schema, playbooks, scenarios, comms templates, governor questions.
- `src/components/`, `src/pages/`, `src/layouts/` — visible UI copy.
- `src/lib/document-model/build-*.ts` — Word `.docx` export content.

Phase 2 (full Welsh-language translation by a fluent Welsh translator with sector knowledge) remains the v3.0.0 milestone.
