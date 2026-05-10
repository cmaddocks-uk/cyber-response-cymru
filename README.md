# Cyber Incident Response Planner — for UK Schools & Colleges

[![Security Policy](https://img.shields.io/badge/security-policy-green)](SECURITY.md)
[![Version](https://img.shields.io/badge/version-1.7.0-blue)](https://cmaddocks-uk.github.io/cyber-response/#changelog)

**Current version:** 1.7.0 — see [in-app changelog](https://cmaddocks-uk.github.io/cyber-response/#changelog).

A free, single-file, browser-based planning tool for UK schools and colleges. Assesses cyber response readiness and generates a tailored **Cyber Incident Response Plan** mapped to NCSC, DfE Digital Standards 2030, DfE Risk Protection Arrangement (RPA), the Ofsted Inspection Toolkit (where cyber response intersects with safeguarding and leadership), and the NCSC Cyber Assessment Framework (CAF). Designed to complement the [DfE Cyber Security Hub](https://cyber-security-hub.education.gov.uk/) — providing the operational planning layer that turns the Hub's templates, playbooks and case studies into a school-specific, governor-ready plan.

🌐 **Live tool:** [cmaddocks-uk.github.io/cyber-response](https://cmaddocks-uk.github.io/cyber-response)

🏴󠁧󠁢󠁷󠁬󠁳󠁿 **Welsh-context fork:** [cmaddocks-uk.github.io/cyber-response-cymru](https://cmaddocks-uk.github.io/cyber-response-cymru) (Phase 1 — Welsh frameworks, English UI; Phase 2 will deliver full Welsh-language translation).

Companion to the [DfE Digital Standards 2030 — Self-Assessment Tool](https://cmaddocks-uk.github.io/dfe-standards/).

---

## What it does

1. **Readiness check** — 12 RAG-scored questions on the current state of your incident response capability, mapped to NCSC, DfE, RPA and CAF expectations.
2. **Plan builder** — 11 structured sections covering school details, response team, external contacts, severity grading, escalation authority, playbooks, communications, **critical systems & business impact (asset register + BIA)**, recovery & backups, post-incident review, and plan maintenance (with annual cyber security calendar).
3. **Plan output** — generates a printable, governor-ready Cyber Incident Response Plan. Section 9 includes a structured asset register — particularly important for SaaS-hosted systems (Arbor, SIMS, Bromcom, ParentPay, CPOMS, M365, Google Workspace) where the school remains the data controller under UK GDPR.
4. **Seven playbooks** — ransomware, personal data breach, account compromise, phishing, denial of service, insider threat, and **SaaS supplier incident** (the realistic case where your MIS / finance / safeguarding supplier has the breach and the 72-hour ICO clock falls on you).
5. **Tabletop exercises** — five anonymised scenarios that walk your plan through realistic incidents step-by-step, surfacing gaps where your plan is silent. Doubles as evidence of annual plan testing.
6. **Governor / Trustee Report** — one-page summary using principles-based "How do you assure yourselves..." framing.
7. **First 30 Minutes card** — printable, laminate-and-pin rapid-response card with the contacts and DO-NOTs.
8. **Prioritised Action Plan** — auto-generated from the readiness check, with owner / target-date / status columns to fill in by hand.
9. **Word / LibreOffice export** — every output (plan, governor report, action plan, tabletop summary) exports as a `.doc` file that opens cleanly in Word / LibreOffice / Google Docs as an editable document.
10. **JSON save & restore** — save your working data to a local JSON file at any time and re-import later.

## Frameworks referenced

- [NCSC Incident Management collection](https://www.ncsc.gov.uk/collection/incident-management)
- [NCSC Cyber Assessment Framework (CAF)](https://www.ncsc.gov.uk/collection/cyber-assessment-framework) — Welsh and English LAs are increasingly piloting CAF as a voluntary cyber resilience baseline; the plan structure aligns with CAF Objectives A (asset register), C (detection) and D (minimising impact).
- [DfE Cyber Security Hub](https://cyber-security-hub.education.gov.uk/) — incident response playbooks (ransomware, BEC, extortion via AI), planning templates, case studies and the published 8-phase incident response process. This tool's plan structure is designed to interoperate with these resources.
- [DfE Cyber Security core standard](https://www.gov.uk/guidance/meeting-digital-and-technology-standards-in-schools-and-colleges/cyber-security-standards-for-schools-and-colleges) — one of six core Digital and Technology Standards by 2030.
- DfE Risk Protection Arrangement (RPA) Cyber Response Plan template.
- [Ofsted Inspection Toolkit (November 2025)](https://www.gov.uk/government/publications/education-inspection-framework/education-inspection-framework-for-use-from-november-2025) — indirect crossover via safeguarding and leadership and management.
- [Cyber Essentials (NCSC / IASME)](https://www.ncsc.gov.uk/cyberessentials/overview) — the prevention complement to this response tool.

## Privacy

- Runs entirely in your browser. Plan data never leaves your device.
- Data is held in browser sessionStorage only — closing the tab wipes it.
- Save progress to a local JSON file (and re-import later) when you want to persist.
- Anonymous page-view counts via [GoatCounter](https://www.goatcounter.com/help/gdpr) — privacy-friendly, GDPR-compliant, no cookies, no fingerprinting, no advertising trackers.

## Security

The tool is hardened against common single-page-app risks:

- Strict Content Security Policy (`default-src 'none'`) — only the GoatCounter analytics endpoint is permitted.
- JSON imports validated against a strict schema — blocks prototype pollution and type confusion.
- All user input HTML-escaped before rendering.
- External links use `rel="noopener noreferrer"`.
- `frame-ancestors 'none'` and `form-action 'none'` block clickjacking and form-action hijack.
- `robots.txt` disallows indexing of common abuse path patterns (`/powerautomate/`, `/api/`, `/webhook/`) to mitigate domain-abuse social engineering.
- Custom 404 page explicitly disclaims Power Automate, webhook, payment and OAuth endpoints — anyone arriving at a fake URL using this domain sees a clear "this site does not host that" message.

See [SECURITY.md](SECURITY.md) for the full threat model, what's in scope, what's out of scope, and how to report issues. An automated security test suite (`security-test.js`) covers XSS injection, prototype pollution, schema validation and link hardening — run with `node security-test.js`.

## Disclaimer

This tool is provided as-is, without warranty. It is not legal, regulatory or insurance advice. Always validate your plan with your IT support, DPO, SLT and insurer before relying on it. Not affiliated with the DfE, NCSC, RPA, Ofsted, ANME or any government body or insurer.

## Licence

MIT — see [LICENSE](LICENSE).

## Author

Christopher Maddocks (former ANME Ambassador). Built as a contribution to the UK education community.
