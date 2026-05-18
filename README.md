# Cyber Incident Response Planner — Wales / Cymru

[![Security Policy](https://img.shields.io/badge/security-policy-green)](SECURITY.md)
[![Version](https://img.shields.io/badge/version-2.0.0--alpha.1-orange)](https://cmaddocks-uk.github.io/cyber-response-cymru/#changelog)

**Current version:** 2.0.0-alpha.1 — Welsh-context Astro rebuild (Phase 1 framework swap) with upstream bugfixes forward-ported from English v2.6.6 / v2.6.7. See the [in-app changelog](https://cmaddocks-uk.github.io/cyber-response-cymru/#changelog).

A free, browser-based planning tool for **Welsh schools and colleges**. Assesses cyber response readiness and generates a tailored **Cyber Incident Response Plan** mapped to NCSC, the Welsh Government [*Cyber Resilient Wales* strategy](https://www.gov.wales/cyber-resilient-wales-strategy), local authority cyber cover arrangements, [Estyn](https://www.estyn.gov.wales/) inspection arrangements (where cyber response intersects with safeguarding and leadership and management), and the [NCSC Cyber Assessment Framework (CAF)](https://www.ncsc.gov.uk/collection/cyber-assessment-framework) which Welsh Government is piloting across local authorities. Signposts the relevant ROCU Cyber PROTECT team — [TARIAN](https://www.tarianrccu.org.uk/) for South Wales, Gwent and Dyfed-Powys; [NWROCU](https://www.nwrocu.police.uk/) for North Wales.

Wales has no DfE-Cyber-Security-Hub equivalent — sector-specific cyber response planning support for Welsh schools is a real gap. This tool exists to fill it.

🌐 **Live tool:** [cmaddocks-uk.github.io/cyber-response-cymru](https://cmaddocks-uk.github.io/cyber-response-cymru)

🇬🇧 **Sister tool (England):** [cmaddocks-uk.github.io/cyber-response](https://cmaddocks-uk.github.io/cyber-response) — the original English-context version (DfE Digital Standards 2030, RPA, Ofsted, DfE Cyber Security Hub).

---

## Two-phase delivery

- **Phase 1 (this release line, v2.x).** Framework swap. UI is in English; every framework reference, signposted contact and assurance question is Welsh-context. A useful interim product in itself — Welsh-medium English-language schools (the majority of mainstream schools in Wales) can use it directly. v2.0.0 is the architecture port from the single-file v0.1.0 to the Astro + React + Tailwind v2.x line that the English sister tool runs on, so future bug fixes and feature work can be applied to both tools symmetrically.
- **Phase 2 (planned, v3.0.0).** Full Welsh-language translation by a fluent Welsh translator with sector knowledge.

## What it does

1. **Readiness check** — 16 RAG-scored questions on the current state of your incident response capability, mapped to NCSC and Welsh-context expectations.
2. **Plan builder** — 11 structured sections covering school details, response team, external contacts (incl. local authority cyber lead, Welsh Government / consortium digital education contact, and ROCU Cyber PROTECT — TARIAN / NWROCU), severity grading, escalation authority, playbooks, communications, **critical systems & business impact (asset register + BIA, including Hwb-hosted services)**, recovery & backups, post-incident review, and plan maintenance (with annual cyber security calendar).
3. **Plan output** — generates a printable, governor-ready Cyber Incident Response Plan. Section 9 includes a structured asset register — particularly important for SaaS-hosted systems (Arbor, SIMS, Bromcom, ParentPay, CPOMS, M365, Google Workspace, Hwb-hosted services) where the school remains the data controller under UK GDPR.
4. **Nine playbooks** — ransomware, personal data breach, account compromise, phishing, business email compromise (BEC), AI-driven extortion, denial of service, insider threat, and **SaaS supplier incident** (with Wales-specific notification routes: LA cyber lead, TARIAN / NWROCU, Welsh Gov contact).
5. **Tabletop exercises** — six anonymised scenarios that walk your plan through realistic incidents step-by-step, surfacing gaps where your plan is silent.
6. **Governor / Trustee Report** — one-page summary using Estyn-compatible principles-based assurance language (Estyn does not currently inspect cyber security directly, but cyber response intersects with safeguarding and leadership and management aspects of inspection).
7. **First 30 Minutes card** — printable, laminate-and-pin rapid-response card with the TARIAN / NWROCU split signposted.
8. **Prioritised Action Plan** — auto-generated from the readiness check.
9. **Word `.docx` export** — every output exports as a Word document that opens cleanly in Word / LibreOffice / Google Docs as an editable document.
10. **JSON save & restore** — save your working data to a local JSON file at any time and re-import later.

## Frameworks referenced

- [NCSC Incident Management collection](https://www.ncsc.gov.uk/collection/incident-management)
- [NCSC Cyber Assessment Framework (CAF)](https://www.ncsc.gov.uk/collection/cyber-assessment-framework) — Welsh Government is piloting CAF across local authorities; the plan structure aligns with CAF Objectives A (asset register), C (detection) and D (minimising impact).
- [Welsh Government — Cyber Resilient Wales strategy](https://www.gov.wales/cyber-resilient-wales-strategy)
- [Cyber Action Plan for Wales](https://www.gov.wales/cyber-action-plan-wales-html)
- [TARIAN ROCU](https://www.tarianrccu.org.uk/) (South Wales, Gwent, Dyfed-Powys) and [NWROCU](https://www.nwrocu.police.uk/) (North Wales) — Cyber PROTECT teams.
- [Estyn — Inspection guidance & resources](https://www.estyn.gov.wales/inspection-guidance-resources)
- [HWB](https://hwb.gov.wales/) — Welsh Government's digital learning platform.
- Local authority cyber cover / insurance arrangements (varies by LA — record yours in External Contacts).
- [Cyber Essentials](https://www.ncsc.gov.uk/cyberessentials/overview) — UK-wide NCSC scheme delivered by IASME.
- [ICO Information & Cyber Security toolkit](https://ico.org.uk/for-organisations/advice-and-services/audits/data-protection-audit-framework/toolkits/information-and-cyber-security/) — UK-wide data protection oversight.

## Privacy

- Runs entirely in your browser. Plan data never leaves your device.
- Data is held in the browser session only — closing the tab wipes it.
- Save progress to a local JSON file (and re-import later) when you want to persist.
- Anonymous page-view counts via [GoatCounter](https://www.goatcounter.com/help/gdpr) — privacy-friendly, GDPR-compliant, no cookies, no fingerprinting, no advertising trackers.

## Security

- Strict Content Security Policy (`default-src 'none'`) — only the GoatCounter analytics endpoint is permitted.
- Trusted Types defence-in-depth: `require-trusted-types-for 'script'` plus a strict default policy that rejects dynamic script creation in Chrome and Edge.
- JSON imports validated against a strict schema (`deepMergeSchema`).
- All user input HTML-escaped before rendering.
- External links use `rel="noopener noreferrer"`.
- `form-action 'none'` blocks form-action hijack.
- `robots.txt` disallows indexing of common abuse paths (`/powerautomate/`, `/api/`, `/webhook/`).
- Custom 404 page explicitly disclaims Power Automate, webhook, payment and OAuth endpoints.

See [SECURITY.md](SECURITY.md) for the full threat model.

## Disclaimer

This tool is provided as-is, without warranty. It is not legal, regulatory or insurance advice. Always validate your plan with your IT support, DPO, SLT, local authority and insurer before relying on it. Not affiliated with the Welsh Government, NCSC, Estyn, TARIAN, NWROCU, HWB, ANME or any government body or insurer.

## Licence

MIT — see [LICENSE](LICENSE).

## Trademark Notice

> "CIRP", the CIRP logo, and related branding are trademarks or common-law marks of Christopher Maddocks.  
> The source code is licensed under the MIT License.  
> The project's name, logo, and branding are not included in that license.

## Author

Christopher Maddocks (former ANME Ambassador). Built as a contribution to the Welsh and wider UK education community. The Welsh fork is released without prior TARIAN / Welsh Government review — feedback from Welsh sector partners is welcomed and will shape v3.0.0.
