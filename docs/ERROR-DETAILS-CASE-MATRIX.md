# Error Details v4 - Complete QA case matrix

**Website Creator : Shubham Sharma**

**80 cases:** 28 crawler source scenarios, 40 synthetic saved-message inputs, 12 guided product checks. All product results are **Not run** until supported by actual QA evidence.

## Execution rules

- Use a dedicated QA application and one scenario per run. Start with FD00. Confirm the exact mapping/schema, extracted values and terminal job state.
- A negative input does not guarantee a Failed job. A normalizer may accept, drop or transform it. Record **Not reproduced / setup blocked** rather than a false display defect.
- For a Failed job with saved details, compare manager status_message, the real sanitized Studio Backend response and the real Studio Error details DOM. Preserve existing code, summary and guidance.
- SM cases require an authorized saved-record/integration harness. A frontend-only mock does not prove backend sanitization. Never use real secrets.
- WF cases run in Studio or an authorized test harness, not this website. Robustness extensions require contract agreement; optional features may be Not applicable.

For each execution record: build/environment, app/crawler/job ID, actual destination field, selector, source variant, redacted saved message/API evidence, UI evidence, actual result, status and bug link.

## A. Crawler input cases

Paths below are relative to your deployed host. Each case also has a fixed URL, shown in its instructions. All source documents return HTTP 200; they are not fake product failures.

| Case | Scenario and Start path | Data / setup | Expected result | Remediation |
| --- | --- | --- | --- | --- |
| FD00 | **Valid control**<br>`/error-fixtures/valid-control` | XPath or JSON-LD. Use a dedicated QA app, not a customer or production app. Configure only the supported mappings you are verifying. | With compatible mappings and schema, this document should index successfully. No failure-details section should be created for a successful run. | Resolve environment or mapping errors here before using the negative cases. |
| FD01 | **Unknown destination field**<br>`/error-fixtures/unknown-field` | XPath or JSON-LD. Ask a developer to prepare a mismatch between the saved crawler field mapping and the QA app schema. Map qaUnknown to the actual deliberately absent destination name. | For a failed run with a saved unknown-field message, Error details names the field actually reported. If the message names several fields, all reported names must remain visible. | Correct the mapping to an accepted field, or have the schema owner add the intended field. Retry after the schema and mapping agree. |
| FD02 | **Missing required value**<br>`/error-fixtures/required-missing` | XPath or JSON-LD. Ask the schema owner to configure the dedicated QA destination as required, with no default value. Do not change production fields. | The saved validation reason identifies the actual required field and explains that a required value is missing. Existing error code, summary and How to Fix This guidance remain. | Supply the missing value or correct the extraction selector. Change the required constraint only when the data model permits it. |
| FD03 | **Multiple values in a single-valued field**<br>`/error-fixtures/single-value` | XPath or JSON-LD. Ensure the destination is truly single-valued in the live QA schema; do not rely only on its name or a UI label. | Error details contains the actual field name and the saved reason that multiple values were supplied for a single-valued field. | Extract one value, or change to an appropriate multi-valued field through the supported schema process. |
| FD04 | **Invalid integer value**<br>`/error-fixtures/invalid-integer` | XPath or JSON-LD. Map qaNumber to an Integer destination. Keep the rest of the default extraction configuration unchanged. | For a failed job whose saved message describes the invalid number, Error details retains the field name and validation reason. | Provide a valid integer or correct the mapping type/selector for the source data. |
| FD05 | **Invalid date value**<br>`/error-fixtures/invalid-date` | XPath or JSON-LD. Map qaPublished to a Date destination. Use the provided XPath or JSON-LD path. | The actual date field and saved invalid-date reason appear under Error details for a failed run. | Supply a date accepted by the configured field type and correct the extraction rule. |
| FD06 | **Sample URL with synthetic secrets**<br>`/error-fixtures/sample-url?case=FD06&access_token=QA_ONLY_ACCESS_TOKEN&api_key=QA_ONLY_API_KEY&doc=sample` | XPath or JSON-LD. Use the exact copied Start URL, including its fake query parameters, and map qaNumber to an Integer destination. | When the saved message contains a URL, Error details retains the safe host/path while removing credentials and sensitive parameter values. The Studio Backend response itself must not leak them. | Fix the invalid integer. Separately verify backend redaction; do not rely on client-side hiding. |
| FD07 | **Several invalid values**<br>`/error-fixtures/multiple-fields` | XPath or JSON-LD. Map both qaNumber and qaPublished to their respective destination types. | Every affected field name and reason present in the saved message remains visible after sanitization. Do not require a list of errors the backend never saved. | Correct every reported value, rerun, and check for any subsequent validation error. |
| FD08 | **Empty string in a required field**<br>`/error-fixtures/required-empty` | XPath or JSON-LD. Use a dedicated required field with no default or fallback. This source has a present JSON-LD property with an empty string, not an absent property. | If rejected, retain the affected field and saved empty/missing-value reason. If accepted by the configured policy, record that behavior without asserting a missing Error details defect. | Supply a nonempty value or correct an extraction rule that returns an empty string. |
| FD09 | **Whitespace-only required value**<br>`/error-fixtures/required-whitespace` | XPath or JSON-LD. Configure a required destination with no fallback and record whether extraction trims whitespace. | When the saved message reports a blank value, show the actual field and reason. A schema that accepts whitespace need not fail. | Supply meaningful text and verify the trimming and blank-value policy. |
| FD10 | **Explicit JSON null, not a missing property**<br>`/error-fixtures/required-null` | JSON-LD only. Use JSON-LD $.qaRequired. The property is explicitly null in the source JSON; XPath cannot represent JSON null. | For a resulting failure, preserve the actual required-field reason. Distinguish JSON null, an absent property, an empty string, and the literal text "null". | Provide the required scalar value. Do not substitute the string "null" for missing data. |
| FD11 | **Empty array mapped to a required field**<br>`/error-fixtures/required-empty-array` | XPath or JSON-LD. Use $.qaCategory[*] or the category XPath. The source array contains zero entries and there are zero category text nodes. | If the empty extraction causes rejection, details reports the field and the saved missing-value reason, not a fabricated multiple-value error. | Supply at least one valid value or correct the selector; retain the intended schema constraint. |
| FD12 | **32-bit integer: one above the maximum**<br>`/error-fixtures/integer-overflow` | XPath or JSON-LD. Confirm an actual signed 32-bit Integer destination, such as IntPointField. A 64-bit Long accepts this value and is not the intended negative configuration. | If the value is rejected by the confirmed 32-bit destination, details retains the field and saved out-of-range/parse reason. The fixed boundary 2147483647 should be accepted by that numeric constraint. | Use a value in the supported range or deliberately choose a wider destination type. |
| FD13 | **32-bit integer: one below the minimum**<br>`/error-fixtures/integer-underflow` | XPath or JSON-LD. Confirm the destination is signed 32-bit Integer, not Long or String. | A confirmed 32-bit rejection preserves the field and underflow/parse reason. The fixed boundary -2147483648 should be accepted by that numeric constraint. | Correct the source range or use an appropriate wider numeric type. |
| FD14 | **Decimal sent to an integer destination**<br>`/error-fixtures/decimal-as-integer` | XPath or JSON-LD. Map qaNumber to Integer and disable custom rounding/truncation only when the intended QA configuration permits it. | For rejection, display the integer field and exact saved reason. Intentional conversion to an integer is a separate extraction behavior, not a missing-details defect. | Supply an integer or use the appropriate decimal field type. |
| FD15 | **Impossible calendar date**<br>`/error-fixtures/invalid-calendar-date` | XPath or JSON-LD. Map to Date and record whether the actual parser uses strict or lenient calendar validation. | If a strict validator rejects February 30, details includes the date field and saved reason. Record normalization separately when the actual parser permits it. | Correct the day and verify the expected calendar parsing policy. |
| FD16 | **Date-time without timezone information**<br>`/error-fixtures/date-without-timezone` | XPath or JSON-LD. Map to Date and determine whether the crawler adds a default timezone before sending the value downstream. | A timezone-related rejection must preserve the field and saved reason. An accepted, intentionally normalized timestamp is not a failed-details case. | Use the required timezone representation or correct the configured date transformation. |
| FD17 | **Two identical values in a single-valued field**<br>`/error-fixtures/duplicate-values` | XPath or JSON-LD. Configure a genuinely single-valued destination and extract both category nodes. | If two values reach and are rejected by a single-valued destination, preserve the field/cardinality reason. A deduplicated accepted value is an observation, not a display bug. | Extract one intended value or use a supported multivalued mapping. |
| FD18 | **Many distinct values in a single-valued field**<br>`/error-fixtures/many-values` | XPath or JSON-LD. Confirm extraction returns 24 separate category values and the destination is single-valued. | A rejection shows the affected field and saved cardinality reason. Long value lists must remain readable under the agreed truncation policy; 24 is test data, not a product limit. | Extract only the intended value or use an appropriate multivalued destination. |
| FD19 | **JSON object supplied where a scalar is expected**<br>`/error-fixtures/object-as-scalar` | JSON-LD only. Use JSON-LD $.qaNumber, not $.qaNumber.value. The selected node is an object rather than the scalar 42. | When the actual saved message reports a shape/type error, display that field and reason; do not silently invent a nested scalar in the UI. | Select $.qaNumber.value for this nested structure, or use the fixed scalar source. |
| FD20 | **Unicode text is valid data**<br>`/error-fixtures/unicode-value` | XPath or JSON-LD. Use a compatible required string destination and UTF-8 extraction without a restrictive business validator. | Unicode alone must not create a failure. With compatible schema/mappings, index the text without corruption. Use SM27 separately to test Unicode in a saved failure message. | Investigate encoding or an unrelated validation constraint instead of replacing legitimate text. |
| FD21 | **Zero is a value, not missing**<br>`/error-fixtures/zero-value` | XPath or JSON-LD. Use a compatible Integer destination; a required constraint can be enabled to catch incorrect truthiness-based omission. | Zero should survive extraction and be accepted under this schema. It must not be mistaken for an absent value, and no failure panel should be fabricated. | Fix truthiness-based dropping or an incorrect business-rule configuration. |
| FD22 | **Comma-separated words remain one source value**<br>`/error-fixtures/comma-single-string` | XPath or JSON-LD. Use the category selector and a single-valued string destination without a delimiter-splitting transformation. | One string containing a comma should be accepted by the single-value constraint. If a configured splitter creates two values, record that separate configuration. | Remove an unintended splitting transformation or select the correct destination type. |
| FD23 | **Absent optional field must not fail the crawl**<br>`/error-fixtures/optional-missing` | XPath or JSON-LD. Use a destination that is optional, with no business rule requiring its presence. | An absent optional field alone should not fail the document or generate Error details. Confirm the normal document indexes successfully. | Check that the destination was not unintentionally configured as required. |
| FD24 | **Noncanonical Boolean input and coercion**<br>`/error-fixtures/boolean-coercion` | XPath or JSON-LD. Map to the actual Boolean destination and determine the parser/validator policy first. | Record coercion to false when supported; do not expect a guaranteed failure. For a genuine strict-validation failure, details must preserve the actual field and reason. | Use canonical true/false input or correct the chosen validation/mapping policy. |
| FD25 | **Boolean false is not an empty value**<br>`/error-fixtures/false-value` | XPath or JSON-LD. Prefer JSON-LD $.qaFlag to preserve the Boolean false type. The HTML equivalent is the literal text false. | False should not be omitted by a truthiness check or reported as a missing required value. A compatible crawl succeeds. | Preserve false as a value and fix any inappropriate fallback/omission rule. |
| FD26 | **One invalid member of a numeric array**<br>`/error-fixtures/mixed-integer-array` | XPath or JSON-LD. Use $.qaScores[*] or all score text nodes and a truly multivalued Integer destination. | If rejected, details identifies the actual numeric-array field and saved member/type reason, not an invented single-value constraint. | Correct the invalid member; the fixed variant supplies [10, 20, 30]. |
| FD27 | **February 29 in a non-leap year**<br>`/error-fixtures/invalid-leap-date` | XPath or JSON-LD. Map to Date and record strict versus lenient calendar behavior. | A strict invalid-leap-day rejection retains the field and saved reason. A lenient parser may normalize the source; that does not demonstrate a missing-details bug. | Provide a real calendar date and use the agreed parsing policy. |

## B. Saved-message inputs

Open `/error-details/messages/SMxx`. Download the live-origin fixture JSON from `/api/error-details/saved-messages`. These inputs are not a complete manager-record schema.

| Case | Scenario | Saved state / coverage | Expected checks |
| --- | --- | --- | --- |
| SM01 | One unknown field | nonempty; AC 1, 2, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Wording and redaction markers are illustrative. Compare to the actual saved message and the agreed sanitization policy. |
| SM02 | Several unknown fields | nonempty; AC 1, 2, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Wording and redaction markers are illustrative. Compare to the actual saved message and the agreed sanitization policy. |
| SM03 | Required value missing | nonempty; AC 1, 3, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Wording and redaction markers are illustrative. Compare to the actual saved message and the agreed sanitization policy. |
| SM04 | Single-valued destination | nonempty; AC 1, 3, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Wording and redaction markers are illustrative. Compare to the actual saved message and the agreed sanitization policy. |
| SM05 | Integer validation | nonempty; AC 1, 3, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Wording and redaction markers are illustrative. Compare to the actual saved message and the agreed sanitization policy. |
| SM06 | Date validation | nonempty; AC 1, 3, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Wording and redaction markers are illustrative. Compare to the actual saved message and the agreed sanitization policy. |
| SM07 | Sample URL: user info and query secrets | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Wording and redaction markers are illustrative. Compare to the actual saved message and the agreed sanitization policy. |
| SM08 | Encoded, repeated and mixed-case parameters | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Wording and redaction markers are illustrative. Compare to the actual saved message and the agreed sanitization policy. |
| SM09 | Credentials outside a URL | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Wording and redaction markers are illustrative. Compare to the actual saved message and the agreed sanitization policy. |
| SM10 | Markup must render as plain text | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Harmless local DOM probe only. Inspect the real Studio details DOM: no b/img node may be created from this message; no probe code may execute. A CSP blocking execution does not prove text-only rendering. The CLI cannot verify DOM safety. |
| SM11 | Multiline message with several fields | nonempty; AC 1, 3, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Wording and redaction markers are illustrative. Compare to the actual saved message and the agreed sanitization policy. |
| SM12 | Saved property absent | absent; AC 5, 6; Saved-message integration | No meaningful details or empty section; preserve existing guidance. Remove status_message from the authorized test record; merging an empty object does NOT delete an existing value. No Error details section or loading error. Existing summary and guidance remain. |
| SM13 | Saved message is null | null; AC 5, 6; Saved-message integration | No meaningful details or empty section; preserve existing guidance. A failed record with status_message=null must retain its existing summary/guidance without an empty Error details section. |
| SM14 | Saved message is an empty string | empty_or_whitespace; AC 5, 6; Saved-message integration | No meaningful details or empty section; preserve existing guidance. A failed record with status_message="" must retain its existing summary/guidance without an empty Error details section. |
| SM15 | Two sample URLs | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Wording and redaction markers are illustrative. Compare to the actual saved message and the agreed sanitization policy. |
| SM16 | Whitespace-only saved message | empty_or_whitespace; AC 5, 6; Saved-message integration | No meaningful details or empty section; preserve existing guidance. Whitespace-only content is empty for this QA expectation: hide Error details and preserve existing summary/guidance. Confirm with Product if the implementation defines a different empty-value contract. |
| SM17 | Long diagnostic message | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. UI must remain usable at mobile and desktop sizes. Apply the product-approved length/truncation rule; this fixture does not prescribe an unsupported maximum or require unbounded rendering. |
| SM18 | Saved message without a URL | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Show saved details without inventing a sample URL or an additional remediation sentence. Existing guidance remains the authoritative remediation. |
| SM19 | Credentials in a JSON-shaped diagnostic string | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. This is a string containing JSON-shaped context, not an object-valued status_message. Redact credentials without discarding the saved validation reason. |
| SM20 | Secret in a saved URL fragment | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Harness-only: a URL fragment is not sent in an HTTP request, so an ordinary crawl cannot make the origin see it. Seed the saved message through the authorized backend path. |
| SM21 | Nested percent-encoded URL containing a secret | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. The outer return_url value contains a complete encoded URL. Remove or safely redact the sensitive nested value; do not require one particular redaction marker. |
| SM22 | HTML-entity query separator in saved text | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Treat the saved message as text. A secret is still sensitive when a separator was HTML-escaped upstream; do not interpret the message as HTML. |
| SM23 | Percent-encoded secret value | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. The local checker inspects bounded percent/HTML/JSON-unescaped views for known synthetic canaries. This is not a general-purpose secret detector. |
| SM24 | Signed URL parameters | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Synthetic signed-URL parameters only; no cloud account is involved. Validate the agreed sensitive-parameter policy, not just a literal token key. |
| SM25 | Safe URL text and an ordinary field name | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Do not redact an affected field name merely because it includes token. This case does not require preservation of every harmless query parameter if the approved policy removes the query string. |
| SM26 | Already-redacted credentials | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Sanitizing an already-redacted message must not restore credentials or damage the field/reason. Exact placeholder spelling is not prescribed. |
| SM27 | Unicode in field names and validation reasons | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. The harness supplies this text independently of schema support for these names. Preserve the characters actually saved; do not invent transliterations. |
| SM28 | Literal entities and angle brackets | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Inspect textContent in Studio: entities in saved plain text should not become markup, and HTML escaping used for transport/rendering must not corrupt the displayed original characters. |
| SM29 | Markdown and a non-HTTP link remain text | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. No Markdown renderer, message-created strong element or executable link. Inspect the actual DOM; a screenshot alone cannot prove text-only handling. |
| SM30 | CRLF, tabs, quotes and a credential | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Preserve readable field/reason text while redacting credentials across line boundaries. CRLF is diagnostic text, not a separate status record. |
| SM31 | Long unbroken token and responsive layout | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. The 8192-character token is test data, not a declared product limit. Wrap or contain it within the details panel; check the approved truncation rule, keyboard access, mobile width and zoom. |
| SM32 | Secret near the end of a long message | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Inspect the entire frontend-facing API response, not just the visible excerpt. Truncation in Studio must not conceal an unsanitized raw response property. |
| SM33 | Literal string null is not JSON null | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. The saved value is a nonempty string containing four letters, not null. Under the supplied nonempty-message requirement it is shown as text; confirm any additional placeholder-suppression rule with Product. |
| SM34 | Unexpected object-valued message | unexpected_object; AC 1, 4, 6; Robustness / contract agreement | No meaningful details or empty section; preserve existing guidance. Robustness extension, not an explicit AC: agree the invalid-type contract with Engineering. Proposed expectation is safe omission, preserved guidance and no [object Object], crash or raw-object leak. Not a string-valued saved-message test. |
| SM35 | Unexpected numeric message | unexpected_number; AC 1, 4, 6; Robustness / contract agreement | No meaningful details or empty section; preserve existing guidance. Robustness extension requiring contract agreement. Proposed handling is safe omission rather than treating a numeric manager value as a meaningful diagnostic string. No loading error. |
| SM36 | Unexpected Boolean message | unexpected_boolean; AC 1, 4, 6; Robustness / contract agreement | No meaningful details or empty section; preserve existing guidance. Robustness extension requiring contract agreement. Distinguish false in a malformed status_message from the valid Boolean document value tested in FD25. Proposed handling: safe omission and no loading error. |
| SM37 | Unexpected array-valued message | unexpected_array; AC 1, 4, 6; Robustness / contract agreement | No meaningful details or empty section; preserve existing guidance. Robustness extension requiring contract agreement. Do not join or stringify an unexpected array and leak credentials. Proposed handling is safe omission while retaining existing guidance. |
| SM38 | Malformed sample URL with credentials | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. A failed URL parse must not fall back to returning the raw credential-bearing string. Keep the useful field/reason and apply the agreed malformed-URL replacement policy. |
| SM39 | Basic authorization value | nonempty; AC 1, 4, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. The encoded credential is itself sensitive. This checker knows this exact synthetic Basic canary; it does not generally decode arbitrary base64 strings. |
| SM40 | Sensitive-looking field names beside a real fake secret | nonempty; AC 1, 2, 6; Saved-message integration | Show sanitized plain-text details, retaining the saved field/reason. Preserve field identities from the saved error while removing the nearby credential value. Over-redacting the field names breaks unknown-field diagnosis. |

## C. Guided product and integration checks

### WF01 - Existing code, summary and guidance survive

**Coverage:** AC 1, 6. **Scope:** Product regression.

**Precondition:** Use a Failed QA job with a saved technical reason and a same-record baseline of the existing summary/code/guidance.

1. Read the manager saved message and call the real Studio Backend through authorized access.
2. Compare the original properties against the same job after details exposure.
3. Open its Studio failure view and inspect Error details as well as existing guidance.

**Expected:** Sanitized saved details are added without replacing or changing the same job's existing code, summary or troubleshooting guidance. A baseline from a different run is not equivalent evidence.

### WF02 - Empty messages after a populated failure

**Coverage:** AC 5, 6. **Scope:** Product regression.

**Precondition:** Prepare failed QA records for SM12, SM13, SM14 and SM16, plus a failed record with visible details.

1. Open the record with meaningful details first.
2. Navigate to each absent/null/empty/whitespace record.
3. Wait for the selected record's request to complete and inspect the API and DOM.

**Expected:** No empty heading/panel, stale previous message, literal undefined, perpetual spinner or loading error; the existing summary/guidance stays visible. Confirm the whitespace policy with Product.

### WF03 - Failure A to B to no-details record

**Coverage:** AC 1, 5, 6. **Scope:** Product regression.

**Precondition:** Prepare three distinguishable QA job IDs: A with qa_number_i, B with qa_published_dt, C with no saved message.

1. Open A, then B, then C using Studio navigation.
2. Return to A and reload B directly.
3. Check each response/job identity and the displayed field names.

**Expected:** Each page shows only the selected job's details. C does not inherit A/B text. Returning to a failed job retrieves its own historical message.

### WF04 - Recovery does not rewrite historical failure

**Coverage:** AC 1, 6. **Scope:** Product regression.

**Precondition:** Use FD03 or FD04 in a dedicated QA crawler with a reproducible failed run.

1. Record the failed job ID, code, summary and sanitized saved details.
2. Run the corresponding fixed URL with compatible mappings/schema as a new job.
3. Confirm successful recovery, then revisit the old failed job.

**Expected:** The fixed run does not fabricate a failure panel. The previous failed run retains its own historical details. Updating a crawler configuration does not relabel the old failure as the new outcome.

### WF05 - Out-of-order responses while switching runs

**Coverage:** AC 1, 5, 6. **Scope:** UI integration harness.

**Precondition:** Use an approved staging UI test harness/network interceptor to delay job A's details response. No origin URL can create this race reliably.

1. Open A and hold its response.
2. Navigate to B and deliver B's response first.
3. Release A's delayed response while B remains selected.

**Expected:** A's stale response never overwrites B. The selected run ID, summary, code and details remain aligned; no indefinite loading indicator.

### WF06 - Details retrieval failure and retry

**Coverage:** AC 5, 6 + robustness. **Scope:** Robustness / contract agreement.

**Precondition:** Use an authorized harness to simulate a network error or denied/unavailable response on the actual relevant API.

1. Load an authorized failed job, then trigger the supported details-request failure mode.
2. Observe the error/loading state and use the supported retry action, if available.
3. Restore a valid response and verify the selected job's details load.

**Expected:** No stale or secret-bearing fallback details. If summary/guidance are independently loaded, keep them usable. If the whole record request fails, use the product-approved error state rather than falsely showing a healthy/empty record. Exact retry UI/status contract requires Engineering agreement.

### WF07 - Legacy failed record without the new property

**Coverage:** AC 5, 6. **Scope:** Product regression.

**Precondition:** Use an older failed test record where status_message is absent; do not merely set it to an empty value.

1. Read the older record via the new Studio Backend.
2. Load its history entry, then refresh or reopen the page.
3. Compare the visible legacy code, summary and guidance.

**Expected:** Backward compatibility: no serialization failure, blank Error details section or loading error. Existing troubleshooting content still explains the failure.

### WF08 - Account, application and role isolation

**Coverage:** Security regression / AC 6. **Scope:** Authorized security regression.

**Precondition:** Use two authorized QA accounts/apps and test users with known permitted/denied access. Never probe customer records.

1. Read a failed job as a user allowed to access it.
2. Switch to the other app/account or the designated non-authorized test user and request the same QA job through the normal UI/API.
3. Inspect the response and any cached details.

**Expected:** Existing authorization boundaries also protect technical details. Denied access must not expose the previous account's message. Use the product's established unauthorized/not-found behavior; this case does not prescribe a new status code.

### WF09 - Direct link, reload and session restoration

**Coverage:** AC 1, 6. **Scope:** Product regression.

**Precondition:** Use a known failed QA run with a stable saved message and the product's normal authentication flow.

1. Open the failed-run URL directly, then reload.
2. Repeat after a normal logout/login cycle with the same authorized user.
3. Compare the selected app/crawler/job and sanitized details.

**Expected:** The normal authentication flow is retained. The correct failed run and sanitized details load without requiring prior navigation or stale browser state.

### WF10 - Long text, mobile width, zoom and keyboard

**Coverage:** AC 6 + usability. **Scope:** Manual UI validation.

**Precondition:** Use SM10, SM17, SM28, SM29 and SM31 in the real Studio view.

1. Inspect the actual details DOM for message-created markup or executable links.
2. Review at a narrow mobile width and 200% zoom; navigate all relevant controls by keyboard.
3. Check wrapping/contained scrolling and the product-approved truncation/expand behavior.

**Expected:** Text-only rendering; no script/markup creation. Long content does not hide the summary/guidance or make navigation unusable. Do not require an expand control if the product design does not have one.

### WF11 - Copy or export must not reintroduce raw secrets

**Coverage:** AC 4, 6 + regression. **Scope:** Conditional product feature.

**Precondition:** Use SM07, SM23, SM32 and SM39. Apply only if the actual product provides a copy/export/share action for details.

1. Copy/export using the actual supported control.
2. Inspect the resulting text/file locally in the authorized QA environment.
3. Compare with the sanitized API response and verify all synthetic markers are absent.

**Expected:** Copied/exported text is sanitized too; a safe visible panel must not conceal an unsafe raw clipboard value. Mark Not applicable if no such feature exists; the ticket does not require adding one.

### WF12 - Check all response properties, not just the panel

**Coverage:** AC 1, 4, 6. **Scope:** Product regression.

**Precondition:** Run a synthetic secret case through the real backend, with authorized access to capture the frontend-facing response.

1. Inspect the entire JSON response including debug/nested properties, not only the selected details path.
2. Use the supplied checker on the capture, including the real property path and a same-run baseline.
3. Inspect the actual rendered DOM separately; do not use the fixture's safe preview as evidence.

**Expected:** No raw duplicate or encoded synthetic credential in a secondary response property. The displayed field/reason remains useful. The checker can validate known canaries only; UI and source-provenance checks remain separate.

## Acceptance criteria mapping

| AC | Primary coverage |
| --- | --- |
| 1 - Saved details exposed and displayed | Negative FD cases once Failed; SM01-SM11; WF01, WF03-WF05, WF09 |
| 2 - Unknown-field names retained | FD01; SM01, SM02, SM25, SM40 |
| 3 - Field and validation reason retained | FD02-FD19, FD24, FD26-FD27 when the intended failure occurs; SM03-SM06, SM11 |
| 4 - Sanitized sample URL | FD06 when a URL is actually saved; SM07, SM08, SM15, SM20-SM24, SM38 |
| 5 - No empty section/loading error | SM12-SM14, SM16; WF02, WF07 |
| 6 - Existing guidance plus safe plain text | All failed-run checks; SM09, SM10, SM17, SM19, SM26-SM32, SM39-SM40; WF01, WF08, WF10-WF12 |

SM34-SM37 and request-error/race/authorization cases broaden regression coverage; they are not new acceptance criteria silently added to the ticket.

## Original suite remains separate

The STUDIO-5619 manifest remains **15,000 valid + 292 additional fixtures**. New error-details URLs are not appended to `/crawl` or its sitemaps. Keep original indexing/pagination regression separate from one-case-per-run failure diagnostics.
