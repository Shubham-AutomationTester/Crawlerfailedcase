# v4 local validation report

**Website Creator : Shubham Sharma**

## Scope and verdict

This report validates the delivered fixture project locally. **No SearchStax crawl, Studio Backend sanitization, Studio UI acceptance, Datadog comparison, GitHub deployment or Render deployment was executed.** The project does not set internal manager job status or status_message.

## Checks executed

| Check | Result | Evidence |
| --- | --- | --- |
| Dependency install / lockfile | `npm ci` succeeded; no runtime dependencies | `package.json`, `package-lock.json` |
| Automated Node tests | **180 passed; 0 failed; 0 skipped** | `v4-unit-tests.tap` |
| Original valid URL HTTP scan | **15,000 valid URLs; 15,020 total checks; 0 failures** | `v4-origin-verification.json` |
| Original suite / hosting-file preservation | **11 compared files byte-for-byte unchanged from v3** | `v4-preservation-check.json` |
| Offline browser DOM, filters and layout | **30 checks passed; no JavaScript errors** | `v4-offline-browser-validation.json` |
| Live browser click-through | **Blocked by environment**, not a product failure | `v4-browser-validation.json` |
| SearchStax acceptance criteria | **Not run** | Requires your authorized QA environment |

## What the automated tests cover

Original discovery, manifest and sitemap counts; original HTTP fixtures and pagination-helper regressions; every new source/fixed URL and valid JSON-LD; all setup/message/workflow pages; noindex separation; no outgoing crawler anchors on error-fixture documents; exact absent/empty/null/array distinctions; object/scalar representation; numeric boundary values; zero/false controls; 80 unique case IDs; JSON snapshots; known synthetic-secret detection including bounded encoded views; original summary/code/guidance preservation checks; malformed-message test inputs; read-only API and HEAD handling.

Prepared reference messages satisfying the checker prove only fixture/checker consistency. They are not output from the actual SearchStax sanitizer.

## Browser limitation and completed alternative checks

Chromium refused navigation to the local HTTP service with `net::ERR_BLOCKED_BY_ADMINISTRATOR`. This restriction was not bypassed. The failed attempt is retained in `v4-browser-validation.json`.

For layout/DOM QA, actual server HTML was fetched through the local HTTP service, then rendered offline with its own CSS/JavaScript inlined. This tested search, category filtering, clear/reset focus, no-result state, case-picker counts, literal-markup DOM safety and complete checklist rows. It also checked document-width overflow at **360, 390, 768 and 1440 pixels** for the dashboard, an integer-boundary setup page, a long-message page and the full checklist.

**Not verified in a live browser:** click-through navigation, clipboard permissions or real deployed-host behavior. HTTP routes and generated navigation targets are covered by source/route tests, but do not replace a browser deployment smoke check. Preview PNGs are offline renders of the site's actual HTML, not screenshots of SearchStax.

## Deployment smoke check to run after publishing

1. Open `/error-details`; search `FD12`; change category; clear filters.
2. Open a setup page; copy its Start URL; open its source document; use **Back to Error Details** and **Main dashboard**.
3. Open one saved-message case and one guided workflow from their pickers.
4. Open **All 80 cases** and download the matrix/guide; confirm the copied hostname is your real Render hostname.
5. In a dedicated SearchStax QA app, run FD00, then one configured negative case. Confirm the actual saved failed state before evaluating Error details.

Record the deployment commit, environment, job IDs and redacted evidence separately. Do not use this local report as a product release sign-off.
