# v3 - Error details lab extension

Adds `/error-details` and `/error-fixtures/*` without changing the original STUDIO-5619 catalog or sitemap membership. The new requirement has no Jira number in the supplied description, so it is not represented as new STUDIO-5619 acceptance criteria.

Eight scenario documents have corrected variants. Eighteen synthetic manager-message cases cover details visibility, affected fields, reasons, URL/credential redaction, empty inputs, plain-text safety and long/multiline content. Includes a captured-response checker and dedicated guide/test case.

Creator credit: Website Creator : Shubham Sharma.

The new lab is stateless and requires no reset token. Original admin reset authentication and stateful retry behavior are unchanged. Replacing server code causes a process restart and resets original in-memory counters.

No actual crawler, SearchStax backend, Studio frontend, schema, Jira or Render account was modified by generating this project. Local validation is reported separately in ERROR-DETAILS-LOCAL-VALIDATION.md.
