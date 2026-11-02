# Crawl Failure Error Details - QA site guide

**Website Creator : Shubham Sharma**

This v4 extension adds focused tests for the supplied Error details acceptance criteria. It does not rename the new requirement as STUDIO-5619: that original ticket is the separate scale/pagination suite. No new Jira number was supplied for Error details.

## Start here

1. Deploy this complete project to a Render **Web Service**. Existing-service settings stay `npm ci` / `npm start`; health check `/healthz`.
2. Open `https://YOUR-SERVICE.onrender.com/error-details`, or choose **Open Error Details Lab** on the main dashboard.
3. Select **FD00 - Valid control** first. Open its instructions and copy its **Start URL**.
4. Use a **dedicated QA app and crawler**. Configure the required field mappings, validate the URL and run a full crawl.
5. Run one negative case at a time using that case's instructions. Verify the job is **Failed** and inspect the saved manager `status_message` before judging Error details.
6. Compare the real Studio Backend response and real Studio failure page. Use the corrected-data URL for a new recovery run.
7. For absent/empty messages, raw HTML, synthetic secrets and controlled multi-field errors, ask a developer to seed the supplied saved-message fixture through an authorized backend test harness. A public website cannot set those internal records.

**Important:** adding a 404/500 page does not itself generate a field-validation message or guarantee the whole crawl fails. These new fixture documents deliberately return **HTTP 200** so a normal fetch does not prevent extraction. Content, field mapping, schema, validation policy and saved status all matter.

## What changed in this version

- **28 isolated source scenarios** (FD00-FD27), each with a fixed/control variant.
- **40 synthetic saved-message inputs** (SM01-SM40) for Manager -> Studio Backend -> Studio tests.
- **12 guided product checks** (WF01-WF12) for history navigation, races, recovery, authorization and usability.
- Search/category filters and a complete 80-case checklist at `/error-details/checklist`.
- Dedicated `/error-details` dashboard, per-case setup instructions and working return-to-dashboard buttons.
- JSON-LD and XPath sources, sample values, expected behavior and remediation guidance.
- A local response checker for captured, real Studio Backend responses.
- Creator credit on the main dashboard, original fixture pages and new lab pages.
- **Unchanged original scope:** 15,000 valid documents + 292 original additional fixtures; the new documents are NOT appended to `/crawl` or its sitemaps. No original inventory count is redefined.


## v4 additions: choose the right edge case

| Group | Cases | Purpose |
| --- | --- | --- |
| Empty source values | FD08-FD11 | Distinguish empty string, whitespace, explicit JSON null, empty array and absent property |
| Numeric boundaries | FD12-FD14 | Signed 32-bit overflow/underflow and a decimal sent to Integer; fixed boundary controls included |
| Calendar/timezone | FD15-FD16, FD27 | Impossible date, missing timezone, non-leap February 29; actual parser policy determines rejection |
| Cardinality / type shape | FD17-FD19, FD24, FD26 | Identical duplicates, 24 separate values, object vs scalar, Boolean coercion and mixed-type numeric array |
| False-positive controls | FD20-FD23, FD25 | Unicode, zero, one comma-containing string, missing optional field and Boolean false |
| Redaction/encoding | SM19-SM26, SM30, SM32, SM38-SM40 | JSON-shaped context, fragments, nested encoded URLs, entities, signed parameters, already-redacted input, malformed URLs, Basic credentials, tail secrets and over-redaction |
| Text/layout/type boundaries | SM27-SM29, SM31, SM33-SM37 | Unicode, literal entities, Markdown-as-text, unbroken text, literal "null", malformed non-string status_message |
| Real product regression | WF01-WF12 | Existing guidance, stale histories, recovery, out-of-order requests, unavailable API, legacy records, access control, direct links, mobile/keyboard and optional copy/export |

The website now contains **80 case definitions** (28 + 40 + 12). This is not a claim that 80 SearchStax tests have passed. The new set adds **54 definitions** beyond v3 (20 crawler + 22 saved-message + 12 guided checks).

### Important boundaries, not automatic failures

- A required string can accept `""` or whitespace unless an extraction/validation policy treats it as missing. Do not invent a nonblank requirement.
- FD10 **explicit JSON null** and FD19 **object vs scalar** require the JSON-LD selector. Their HTML view intentionally does not emit a scalar extraction node for that value. FD02 still omits the property entirely.
- FD12/FD13 target a confirmed signed 32-bit integer. A 64-bit Long accepts the out-of-32-bit-range inputs; that is not a bug.
- Calendar/timezone parsing can be strict or lenient. Record normalization instead of asserting an automatic failed crawl.
- Solr BoolField can coerce noncanonical strings to false. FD24 is a coercion/strict-upstream-validator check, not a guaranteed Solr failure.
- Identical arrays may be deduplicated, object values dropped, or invalid optional values omitted. Confirm the actual extracted/submitted data before assessing Error details.
- Positive controls deliberately include zero and false. A truthiness test must not accidentally treat those legitimate values as absent.
- SM34-SM37 are proposed robustness cases for malformed upstream types. Agree the contract with Engineering before using safe-omission expectations as release gates.
- URL fragments in SM20 are saved-message inputs only: they are not sent to an HTTP origin during an ordinary crawl.

### Finding and running cases

Open `/error-details`. Search by case ID, field name or title; choose a category; use **Clear filters** to restore all cases. Saved messages and guided product checks have separate pickers. **All 80 cases** opens a complete linked checklist. Every page retains Main dashboard / Back to Error Details navigation and creator credit.

The full matrix is also available at `/error-details/case-matrix.md`. The concise TestRail case is `/error-details/test-case.md`. Raw data:

```text
/api/error-details/scenarios
/api/error-details/saved-messages
/api/error-details/workflows
```

Download JSON uses the current host for sample URLs. Repository snapshots use a clearly labeled placeholder. Regenerate snapshots and the matrix after editing case data:

```bash
npm run export:error-details
npm test
```

### Stronger local response checks

The captured-response checker still makes no network requests or remote writes. It now checks known synthetic canaries across the whole response and up to **three bounded decoding passes** for percent-encoding, HTML entities and JSON-style escapes. It also tests the explicit Basic-authorization canary. It is **not** a complete arbitrary-secret detector, general base64 decoder, sanitizer or browser tester. Reports never echo the raw response or secret canary values.

Provide a same-run baseline and actual property paths to test preservation of code/summary/guidance. A synthetic reference passing the checker proves only that the checker and fixture agree.


## GitHub and Render deployment

### Update the existing repository

Extract the ZIP. Copy the **contents** of `studio-5619-crawl-lab` into the repository, keeping all subfolders. Do not upload only the ZIP. Commit the changed/new files and deploy the new commit from Render. A deployment replaces your running source, and a process restart resets the old suite's in-memory retry counters; do not deploy during a test run.

This is a complete project, not just an HTML page. Important additions are `lib/error-details*.mjs`, `public/error-details.js`, `public/error-details.css`, `scripts/check-error-details.mjs`, `tests/error-details.test.mjs` and this guide. `server.mjs` and `public/index.html` are also updated.

For a **new** repository, upload the extracted project contents so `package.json`, `package-lock.json`, `server.mjs` and `render.yaml` are at repository root. In Render choose **New > Web Service**, connect that repository and set:

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Root Directory | Blank if package.json is at repository root |
| Build | `npm ci` |
| Start | `npm start` |
| Health Check | `/healthz` |
| Node | Included `.node-version` selects 24; project supports 22-24 |
| Instances | One for the original stateful fixtures |
| ADMIN_TOKEN | Keep your existing secret, or generate one for the old reset feature |

Render's `RENDER_EXTERNAL_URL` or the incoming host supplies the public origin for copied URLs. Set `BASE_URL` to your exact HTTPS origin only when an override is needed. No placeholder hostname is embedded in live fixture URLs.

**No admin token and no reset are needed for the new error-details pages.** They are stateless. The original reset form remains for the original retry scenarios. Do not enter SearchStax API tokens or real credentials into this site. A Blueprint deployment can generate ADMIN_TOKEN; a manually created service needs your own configured secret. Do not commit `.env` or real secrets.

Free Render services can spin down after 15 idle minutes. Open `/healthz` before testing and distinguish cold-start fetch problems from field-validation failures. This guide does not establish a crawler timing SLA.

Local start:

```bash
npm ci
npm test
npm start
```

Open `http://localhost:3000/error-details`. A hosted crawler cannot reach your laptop's localhost; use the deployed HTTPS URL for a SearchStax run.

## Choose the right Start URL

```text
Main dashboard:       https://YOUR-SERVICE.onrender.com/
Error details lab:    https://YOUR-SERVICE.onrender.com/error-details
Valid control:        https://YOUR-SERVICE.onrender.com/error-fixtures/valid-control
Single-value test:    https://YOUR-SERVICE.onrender.com/error-fixtures/single-value
Corrected variant:   https://YOUR-SERVICE.onrender.com/error-fixtures/single-value?variant=fixed
```

**Do not use either dashboard or `/crawl` as the Start URL for this requirement.** Copy the document URL on its setup page. Allow that exact scenario path, and allow its query parameters when applicable. Disable automatic whole-site sitemap discovery for these isolated runs, or restrict inclusions tightly enough that old suite URLs cannot be processed. Do not use the old `/sitemap.xml` for this suite. The new documents have no outgoing anchor links; navigation is via UI-only buttons. Dashboard and instruction pages are noindex/nofollow, with `/error-details` disallowed in robots.txt; `/error-fixtures/` is not blocked.

Each test document and corrected variant is HTTP 200, server-rendered and has valid JSON-LD. Even negative cases are **valid HTML/JSON**: the intended mismatch is the extracted value versus the destination field, not broken markup.

## Common preconditions

Use a dedicated QA application, one run per case, and record the app ID, crawler ID, job ID and run time. Do not apply required-field or schema changes to the app serving the original 15,000-URL run or to production.

Keep the normal URL, title and content mappings. Add only the custom mapping(s) needed by the selected case. Choose **one extraction method per field**; adding the same mapping twice can introduce unintended duplicates.

The names `qa_required_s`, `qa_single_s`, `qa_number_i`, `qa_published_dt`, and `qa_unmapped_probe` are **example destination names**, not built-in or guaranteed SearchStax field names. Studio can add type/language suffixes. Inspect the generated field name and actual schema, then compare messages against those real names. A display label is not enough to establish single-/multi-valued behavior.

Run FD00 with compatible mappings before a negative test. Confirm extraction in preview or authorized diagnostics. If a prerequisite cannot be arranged, record **Blocked / requires developer setup**, not Passed or Failed for the new display feature.

## Extraction reference

| Value | XPath | JSON-LD path | Example destination / setup |
| --- | --- | --- | --- |
| Required marker | `//*[@data-qa-field="required"]/text()` | `$.qaRequired` | `qa_required_s`; required, single, no default |
| Category values | `//*[@data-qa-field="category"]/text()` | `$.qaCategory[*]` | `qa_single_s`; destination single-valued |
| Number | `//*[@data-qa-field="number"]/text()` | `$.qaNumber` | `qa_number_i`; Integer |
| Published date | `//*[@data-qa-field="published"]/text()` | `$.qaPublished` | `qa_published_dt`; Date |
| Unknown marker | `//*[@data-qa-field="unknown"]/text()` | `$.qaUnknown` | `qa_unmapped_probe`; deliberately absent from allowed schema |
| Optional marker | `//*[@data-qa-field="optional"]/text()` | `$.qaOptional` | `qa_optional_s`; explicitly optional |
| Boolean value | `//*[@data-qa-field="flag"]/text()` | `$.qaFlag` | `qa_flag_b`; confirm actual coercion/validation policy |
| Numeric array | `//*[@data-qa-field="scores"]/text()` | `$.qaScores[*]` | `qa_scores_is`; actual multivalued Integer destination |

Fixed variants normally use `QA_REQUIRED_PRESENT`, `["Cardiology"]`, `42`, and `2026-01-15T12:00:00Z`. Boundary and positive-control cases can override these values: FD12 uses 2147483647, FD13 uses -2147483648, FD15 uses 2026-02-28, FD27 uses the valid leap day 2024-02-29. Check the case instructions/JSON for exact values. The source JSON-LD values are available from `/api/error-details/scenarios` and in each instruction page.

## Live crawler scenarios

| Case / document suffix | Setup and source data | Expected check | Correction |
| --- | --- | --- | --- |
| FD00 `/valid-control` | Compatible schema and selectors; all values valid | Successful control; no failed-run Error details | Already valid |
| FD01 `/unknown-field` | Developer prepares a mapping to an actual unknown destination, unmatched by explicit/dynamic rules or auto-creation | If the saved message names an unknown field, display that name. Preflight can fail before a request reaches this site | Correct/remove the mismatch or add the intended schema field; page change alone may not suffice |
| FD02 `/required-missing` | Developer makes a dedicated field required with no default; selected property and element are entirely absent | Saved reason names the missing required field | Use `?variant=fixed` with identical mapping/schema |
| FD03 `/single-value` | Extract both Cardiology and Neurology as separate values; destination accepts one | Saved reason identifies the field and multiple-values constraint | Fixed variant contains only Cardiology |
| FD04 `/invalid-integer` | Map `NOT_AN_INTEGER` to an integer validator/destination | Saved field and invalid-integer reason are shown | Fixed variant uses 42 |
| FD05 `/invalid-date` | Map `NOT_A_DATE` to a date validator/destination | Saved field and invalid-date reason are shown | Fixed variant uses valid date |
| FD06 `/sample-url` | Copy the full URL with synthetic query secrets; invalid integer causes validation input | When the saved message includes the URL, show safe URL text and remove credentials/sensitive values at the backend boundary | Correct the value and verify synthetic-secret handling independently |
| FD07 `/multiple-fields` | Invalid integer and date in one document | Preserve every name/reason actually present in the saved message; do not demand errors the validator never saved | Fix both fields and rerun |

Every suffix in this table is under `/error-fixtures`. This table retains the original eight cases; the full 28-case inventory with steps, expected results and remediation is in **[ERROR-DETAILS-CASE-MATRIX.md](ERROR-DETAILS-CASE-MATRIX.md)** and the live **`/error-details/checklist`** page.

### Why a negative case can still finish successfully

A crawler may drop invalid optional values, convert them, take the first extracted match, join values, or reject an invalid configuration before saving a runnable job. That behavior can prevent the intended failed-job state. Do not describe a successful crawl as a failure of the new Error details UI without confirming the saved record.

For the array case, **two comma-separated words in one string are not two values**. Check that two separate values reach the single-valued destination. For the unknown-field case, a dynamic `*_s` rule or automatic field creation can make a seemingly new name valid. For the missing case, removing the HTML title is not a reliable substitute for an explicitly required destination field.

Where the UI prevents the mismatch, ask a developer for an authorized staging fixture or use the saved-message test inputs. Do not bypass production safeguards.

## Execute and inspect the real product

1. Confirm the source URL returns HTTP 200 and that the configured selector yields the intended value(s).
2. Save the crawler configuration, record the exact mapping/schema, and launch one full crawl using the scenario URL.
3. Record the terminal job status. To test the failed-run details feature, confirm **Failed** and capture the saved manager `status_message` through authorized tooling.
4. Open **Crawler > History > the failed run**. Capture the existing code, summary and How to Fix This guidance.
5. In browser DevTools Network or an authorized API client, inspect the **real Studio Backend response** for that run. The sanitized details property name is not specified by the requirement; obtain it from the implementation, not this site.
6. Check that the backend returns sanitized saved details. Check the entire returned response for synthetic canaries; hiding raw details only in the browser is insufficient.
7. Verify the UI's **Error details** section contains the saved field names/reasons and sanitized sample URL where present. Expect text, not interpreted HTML. Existing code, summary and troubleshooting guidance remain.
8. For missing/empty messages, verify there is no empty heading/panel, spinner error, undefined/null text, or loss of the existing guidance.
9. Open the fixed variant with the corrected mapping/schema and run again. Confirm recovery; open the older failed run to verify its historical details still refer to the correct job. Also navigate between two different failures and back to check stale content.

SearchStax documents `SOLR_SCHEMA_PREFLIGHT_FAILED` for schema mismatch and `SOLR_DOCUMENT_REJECTED` for rejected document fields. Parsing failures can have a different code. These are investigation pointers, **not guarantees** that any particular fixture always produces a particular code. Preserve the actual existing code for the run.

The feature described by the acceptance criteria exposes sanitized saved technical details. It does **not** promise newly generated remediation prose. This lab supplies QA remediation notes to help assess clarity, while the product's existing troubleshooting guidance remains the expected source of remediation.

## Controlled saved-message cases

Download from `/api/error-details/saved-messages` for live-origin sample URLs, or use `data/error-details-saved-messages.json` for repository examples. The latter uses an obvious placeholder host; replace it in your authorized harness where needed.

These are **inputs**, not real API responses and not routes that mark the crawler Failed. Each case contains `manager_saved_fields`, `message_state`, `expected` assertions, and `reference_details`. The reference is a prepared illustration, not output from a sanitizer.

| Cases | Coverage |
| --- | --- |
| SM01-SM02 | One / several unknown fields |
| SM03-SM06 | Missing required value, multiple values, invalid integer, invalid date |
| SM07 | Sample URL with fake username/password and token/API-key parameters |
| SM08 | Percent-encoded parameter name, mixed case, repeated keys and signature |
| SM09 | Fake credentials outside a URL, including Authorization and password |
| SM10 | Harmless HTML/DOM probe; must be rendered as literal text |
| SM11 | Multiline, multi-field saved reason |
| SM12-SM14 | Absent property, null, empty string |
| SM15 | More than one URL in the saved message |
| SM16 | Whitespace-only message; confirm agreed empty-value policy |
| SM17 | Long message and responsive layout; apply approved truncation policy |
| SM18 | Saved details with no sample URL; do not invent one |

### Developer-assisted arrangement

Use the approved method to create or modify a **failed QA job record** with the selected `status_message` state, while retaining its real code/summary/guidance and identity. The provided JSON is not a complete manager record or invented endpoint contract. For SM12, remove the property; merging `{}` does not remove an existing message. Do not change production/customer records.

For an end-to-end backend test, send this saved value through the real Studio Backend serialization/sanitization path, then load that failed run in Studio. Mocking only the final frontend response covers UI rendering but cannot prove the backend removed secrets. Use only dummy credentials. This project performs no remote writes and does not modify SearchStax or Jira.

For SM10, inspect the real Error details DOM. There must be **no `<b>` or `<img>` element generated by the message** and `window.__qa_error_details_probe` must not be set by its rendering. The probe has no network-exfiltration logic. A Content Security Policy blocking an event handler is not a pass when the HTML element was still created. The original synthetic markup should be displayed as text according to the agreed plain-text policy.

### Local response checker

Save an authorized capture of the real Studio Backend response to a local JSON file. Do not commit captured customer data or tokens. Use the actual sanitized-details property path from your implementation:

```bash
npm run check:error-details -- \
  --response reports/actual-response.json \
  --case SM07 \
  --details-path data.ACTUAL_SANITIZED_DETAILS_FIELD \
  --baseline reports/before-response.json \
  --preserve-paths data.ACTUAL_CODE_FIELD,data.ACTUAL_SUMMARY_FIELD,data.ACTUAL_GUIDANCE_FIELD \
  --out reports/error-details-check.json
```

All `ACTUAL_*` names are placeholders. Replace them with real JSON paths; remove `data.` if your response does not use that wrapper. Dot-separated numeric components can address array items. JSON property names containing literal dots are not supported by this small checker.

If your schema field names differ, copy the saved-message JSON, update its synthetic messages and `expected.must_contain` assertions, and pass `--fixtures path/to/your-fixtures.json`. Never store genuine credentials in a fixture.

The script checks a nonempty string or expected empty state, selected field/reason fragments, synthetic-secret absence across the whole response and, when supplied, equality of the baseline code/summary/guidance fields. It **does not** assert product UI layout, DOM safety, real crawl execution, complete arbitrary-secret detection or source provenance. No baseline means preservation is explicitly reported as unchecked. Exit codes: 0 selected API checks passed; 1 failed; 2 setup/input error. No network calls are made.

Self-test with a clearly labeled synthetic response:

```bash
npm run check:error-details -- \
  --response examples/error-details-response.SYNTHETIC.json \
  --case SM07 \
  --details-path data.example_details
```

A pass here tests the checker only; it is not evidence that SearchStax passes.

## Acceptance coverage and evidence

| AC | Execution / evidence |
| --- | --- |
| 1 - Saved technical details | Actual Failed job + saved message + sanitized backend response + Studio screenshot |
| 2 - Unknown field names | FD01 with authorized schema mismatch, or SM01/SM02 via real backend path; compare names from saved message |
| 3 - Field and validation reason | FD02/FD03 plus optional FD04/FD05; SM03-SM06 and SM11 for controlled inputs |
| 4 - Sanitized sample URL | FD06 when manager saves URL; SM07/SM08/SM15 for deterministic edge cases |
| 5 - Missing/empty details | SM12-SM14, SM16; verify no empty section/loading error and preserved guidance |
| 6 - Existing guidance and safe text | Same-run code/summary/guidance comparison; backend canary checks; SM10 DOM check |

Record for each case: environment/build, app/crawler/job IDs, selector, actual destination schema, source variant, saved message (redacted for sharing), response (redacted), UI observation, expected result, actual result, Pass/Fail/Blocked and any bug link. Do not mark a case passed from this lab's prepared preview.

## Regression and boundaries

- Valid control still crawls, parses and indexes with compatible configuration.
- A fixed new run succeeds without changing the historical failed run's details.
- Existing summary, error code and troubleshooting guidance remain visible.
- Missing details do not create an empty section, loading error or literal undefined/null.
- Reopening/navigating between failed runs does not retain another job's details.
- Long text wraps/scrolls inside its panel; desktop/mobile and keyboard navigation remain usable.
- Every new scenario offers a deterministic dashboard return; no browser history is required.
- Old manifest counts, /crawl discovery, retry behavior and admin reset still pass local regression tests.

## Files and where to edit

| File | Purpose |
| --- | --- |
| `lib/error-details-data.mjs` | Source values, selectors, case instructions and corrected variants |
| `lib/error-details-messages.mjs` | Synthetic saved technical messages and assertions |
| `lib/error-details-workflows.mjs` | Twelve guided Studio/integration checks |
| `scripts/export-error-details.mjs` | Regenerate JSON snapshots and complete Markdown matrix |
| `lib/error-details.mjs` | Server-rendered new dashboard, instructions, fixture documents and JSON downloads |
| `public/error-details.css` | New lab layout |
| `public/error-details.js` | Copy and dashboard-return buttons |
| `lib/error-details-checker.mjs` | Captured-response assertion helper |
| `public/index.html` | Original dashboard + new lab launch panel + creator footer |
| `server.mjs` | Server and module integration |
| `tests/error-details.test.mjs` | Local routing/data/UI-source and checker regression tests |

## Sources and scope

Public documentation consulted for platform behavior and deployment mechanics:

- SearchStax Crawler (field extraction, type/suffix behavior, failure navigation): https://support.searchstax.com/hc/en-us/articles/40065270509069-Crawler
- SearchStax Crawler Failure Reference (schema-preflight and document-rejection codes): https://support.searchstax.com/hc/en-us/articles/49643967423373-Crawler-Failure-Reference
- SearchStax Crawler Field Map: https://support.searchstax.com/hc/en-us/articles/40065305169037-Crawler-Field-Map
- Apache Solr field properties: https://solr.apache.org/guide/solr/9_8/indexing-guide/fields.html
- Apache Solr dynamic-field concepts: https://solr.apache.org/guide/solr/10_0/indexing-guide/dynamic-fields.html
- Render Web Service deployment: https://render.com/docs/your-first-deploy
- Render environment variables: https://render.com/docs/configure-environment-variables
- Render Free service behavior: https://render.com/docs/free

Solr references explain the general constraints; they do not assert that your app runs the cited Solr version. The supplied acceptance criteria, actual deployed schema and saved message are the test authority. Local fixture tests do not prove SearchStax or Datadog acceptance.


Additional v4 references (checked November 2, 2026):

- Solr numeric width and Boolean coercion: https://solr.apache.org/guide/solr/latest/indexing-guide/field-types-included-with-solr.html
- Safe text rendering concepts: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- Source field mappings: https://support.searchstax.com/hc/en-us/articles/40065305169037-Crawler-Field-Map

The actual deployed product version and schema take precedence over a general reference. These references do not establish additional acceptance criteria or a new remediation-generation feature.
