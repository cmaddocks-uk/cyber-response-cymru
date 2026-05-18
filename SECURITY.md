# Security Policy

**Tool:** Cyber Incident Response Planner — Welsh Schools & Colleges (Cymru)
**Live site:** [cmaddocks-uk.github.io/cyber-response-cymru](https://cmaddocks-uk.github.io/cyber-response-cymru)
**Version covered:** v2.0.0-alpha onward (Astro architecture port + Welsh-context framework swap). v0.1.0 single-file is superseded.

---

## Reporting a security issue

If you find a security issue with this tool, please report it via:

- GitHub issue (if non-sensitive): [github.com/cmaddocks-uk/cyber-response-cymru/issues](https://github.com/cmaddocks-uk/cyber-response-cymru/issues)
- Direct email (if sensitive): the contact listed on the [author's GitHub profile](https://github.com/cmaddocks-uk)

Please **do not post exploit details publicly** before the issue is fixed. Realistic response time for a single-maintainer project is a few days, not a few hours.

---

## Threat model

The tool is a **static site** built with Astro and hosted on GitHub Pages. There is no server, no database, no user accounts, no remote API beyond a single privacy-friendly analytics beacon. Plan data is held in the user's browser session only and never leaves their device unless they explicitly export it as a JSON file.

### In scope — actively mitigated

| Threat | Mitigation |
|---|---|
| **Cross-site scripting (XSS)** via plan content | React escapes by default; any `dangerouslySetInnerHTML` or Astro `set:html` usage is explicitly auditable. Strict CSP: `default-src 'none'; script-src 'self' 'unsafe-inline' https://gc.zgo.at; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://cyber-response.goatcounter.com; connect-src https://cyber-response.goatcounter.com; form-action 'none'; base-uri 'none';` |
| **Prototype pollution / type confusion via JSON import** | All imported JSON files validated against a strict schema (`deepMergeSchema`). Unknown keys are dropped; type mismatches reject the import. Object prototypes never modified during merge. |
| **Hostile image upload via the school-logo field** | SVG explicitly rejected (can contain `<script>`). PNG/JPEG/WebP only, validated by MIME type and a strict data-URI regex (`safeLogoSrc`). 2 MB upload cap. The image is re-decoded through `<canvas>` and re-encoded, which strips any embedded metadata or EXIF payloads. |
| **Dynamic script injection (`document.createElement('script')`, `script.src = …`)** | Production CSP enforces `require-trusted-types-for 'script'` + a strict default Trusted Types policy. `createScript` (inline script creation) hard-rejects. `createScriptURL` is allowlisted to GoatCounter's `count.js` only. Enforced in Chrome and Edge; Firefox/Safari ignore the directive but the codebase has no runtime script-injection paths regardless. |
| **Open redirects via external links** | Every `target="_blank"` link uses `rel="noopener noreferrer"`. |
| **Form-action hijacking** | CSP `form-action 'none'` blocks any form from submitting to a remote endpoint. |
| **`<base>` tag injection** | CSP `base-uri 'none'` prevents an attacker from rebasing relative URLs. |
| **MIME sniffing** | `X-Content-Type-Options: nosniff` (via meta tag). |
| **Referer leakage** | `Referrer-Policy: strict-origin-when-cross-origin` (via meta tag). |
| **Browser feature abuse** | `Permissions-Policy` denies geolocation, camera, microphone, accelerometer, gyroscope, magnetometer, payment, USB. |
| **Domain abuse / fake URLs** | See dedicated section below. |

### Not mitigated — hosting-layer limitation

| Threat | Status |
|---|---|
| **Clickjacking / iframe embedding** | Not enforced. The `frame-ancestors` CSP directive only works as an HTTP response header, and GitHub Pages does not allow custom response headers to be set. Risk is treated as low because the tool has no authentication, no server-held secrets, no state that survives the browser session, and no destructive actions an attacker could trick a victim into clicking. If the tool is ever moved off GitHub Pages, `frame-ancestors 'none'` should be set at the host level on day one. |

### Out of scope

- **Compromise of the user's own browser or device.**
- **Loss / theft of the user's exported plan JSON file.** Plans are saved as plain JSON to the user's filesystem. Treat saved plans as you would any sensitive school document.
- **Phishing emails referring to the tool.** A phishing email could plausibly link to the real tool — that's not something this site can prevent. The tool itself only loads from `cmaddocks-uk.github.io/cyber-response-cymru`; verify the URL.
- **Malicious browser extensions.**

---

## Domain abuse — fake URLs using `cmaddocks-uk.github.io`

GitHub Pages serves any path under the site's base URL, falling through to the configured 404 page if no file matches. This means a third party could spread a fake URL like:

```
cmaddocks-uk.github.io/cyber-response-cymru/powerautomate/your-flow-here
cmaddocks-uk.github.io/cyber-response-cymru/api/auth/microsoft
cmaddocks-uk.github.io/cyber-response-cymru/webhook/triggers/...
```

…and anyone clicking it would arrive at this domain. The site never hosts these endpoints.

### Mitigations

1. **Custom 404 page** (`src/pages/404.astro`) explicitly disclaims Power Automate / webhook / payment / OAuth endpoints by name.
2. **`robots.txt`** disallows search-engine indexing of common abuse path patterns.
3. **No client-side routing.** Unknown paths fall through to 404, not silently rewritten.
4. **`frame-ancestors 'none'`** prevents framing inside another site.
5. **GoatCounter analytics** records hits per path for post-hoc detection of suspicious patterns.

### If you receive a suspicious URL using this domain

1. **Do not click it.** The real tool is at `cmaddocks-uk.github.io/cyber-response-cymru` with **no further path components**.
2. Forward the email to [Report Suspicious Email](https://www.ncsc.gov.uk/collection/phishing-scams/report-suspicious-emails) (`report@phishing.gov.uk`).
3. Report to [Report Fraud](https://www.reportfraud.police.uk/) (`0300 123 2040`) if money or data has been lost.
4. Notify the author via the GitHub issue route.

---

## Privacy

- No cookies. No fingerprinting. No advertising trackers.
- One external connection: anonymous page-view counts via [GoatCounter](https://www.goatcounter.com/help/gdpr).
- Plan data lives in browser sessionStorage only.
- JSON exports go directly to the user's filesystem via the browser's download mechanism.

---

## Last reviewed

Reviewed at each minor version bump. Last reviewed: **v2.0.0-alpha.1 (18 May 2026)** — Welsh-context architecture port from cyber-response v2.6.5 + forward-port of v2.6.6 and v2.6.7 (multi-line text fix, changelog page redesign). The security posture mirrors the upstream English tool at v2.6.7 (full codebase pass plus Trusted Types defence-in-depth). Confirmed: no `eval` / `new Function` / string-based timers anywhere in the source; `dangerouslySetInnerHTML` is bounded to compile-time trusted playbook content only; no user input flows into `href` / `src` attributes; logo upload pipeline rejects SVG and re-encodes through `<canvas>` to strip metadata; JSON imports go through `deepMergeSchema` with a 1 MB cap, and the prototype-pollution test suite passes. Trusted Types enforces strict `createScript` / `createScriptURL` rules in Chrome and Edge. `frame-ancestors` mitigation noted as unavailable on the GitHub Pages host (see above). All other directives in the CSP enforce as expected.
