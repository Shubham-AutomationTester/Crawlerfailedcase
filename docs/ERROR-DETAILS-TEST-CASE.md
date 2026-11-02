# TestRail-ready consolidated test case - v4

**Title:** Validate sanitized crawl Error details, edge cases and existing remediation

**Preconditions:** Dedicated QA app; implementation deployed; confirmed schema/mappings; authorized access to saved manager messages and Studio Backend responses. Use only synthetic credentials. Agree malformed-type/robustness behavior with Engineering. The site supplies inputs, not real product verdicts.

| Step | Expected result |
| --- | --- |
| 1. Crawl FD00, then positive controls FD20-FD23/FD25 with compatible schema. | Normal data, Unicode, zero, false, one comma-containing string and missing optional fields do not cause false failures. |
| 2. Run the relevant unknown-field, missing/empty/null, single-value, numeric/date and type-shape cases FD01-FD19/FD24/FD26-FD27 individually. Check extracted values, destination constraints, terminal status and saved message. | Intended failures are confirmed before UI assessment. Normalization/coercion is recorded as Not reproduced, not as a display failure. JSON null/object cases use JSON-LD, not XPath. |
| 3. For confirmed failed jobs, compare the saved message, real sanitized backend response and Error details. | Saved affected field names/reasons remain; original error code, summary and troubleshooting guidance remain visible for the same job. |
| 4. Execute credential/URL inputs SM07-SM09/SM15/SM19-SM26/SM30/SM32/SM38-SM40 through the authorized real backend path. | Credentials and sensitive values are absent from the entire response, visible details and optional copy/export. Safe field names are not over-redacted. |
| 5. Test SM12-SM14/SM16 and legacy/empty transitions WF02/WF07. Distinguish the nonempty literal string in SM33. | Missing/null/empty details produce no empty section, loading error or stale content. The literal string is handled per the agreed nonempty-message contract. |
| 6. Test literal markup, entities, Markdown, Unicode, multiline and long text with SM10/SM11/SM17/SM27-SM31 and WF10. | Actual DOM renders text, not message-created elements/scripts/links. Text remains usable at mobile width, zoom and keyboard navigation under approved length rules. |
| 7. Run malformed-type inputs SM34-SM37 and guided API/race checks WF05/WF06 once their contract is agreed. | Graceful handling without raw secret leakage, stale response overwrite or a misleading healthy state; preserve available guidance. |
| 8. Use fixed/control variants; navigate between failed A, failed B, no-details and successful runs. Reload/direct-link/login as covered by WF03/WF04/WF09. | Recovery does not alter old history. Details always match the selected account/app/crawler/job; no stale failed text on success. |
| 9. Verify WF01/WF08/WF11/WF12, then regression-check the original site. | Existing guidance and authorization remain intact. Original 15,000 + 292 inventory and dashboard navigation remain unchanged. Optional features not present are Not applicable. |

**Detailed dataset:** `docs/ERROR-DETAILS-CASE-MATRIX.md` contains all 80 definitions and exact setup/expectations.

**Evidence:** Build/environment, app/crawler/job IDs, actual selector/schema, redacted saved message and API response, UI/DOM evidence, actual result, Pass/Fail/Blocked/Not reproduced/Not applicable and bug link. Fixture previews and local unit-test passes are not SearchStax acceptance evidence.
