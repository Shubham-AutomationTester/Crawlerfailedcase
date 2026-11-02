// QA fixtures only. Actual schema, extraction and saved messages determine product outcomes.
export const FIELDS = [
  {
    "source": "qaRequired",
    "xpath": "//*[@data-qa-field=\"required\"]/text()",
    "jsonpath": "$.qaRequired",
    "target": "qa_required_s",
    "type": "String",
    "schema": "Required; single-valued; no default or fallback."
  },
  {
    "source": "qaCategory",
    "xpath": "//*[@data-qa-field=\"category\"]/text()",
    "jsonpath": "$.qaCategory[*]",
    "target": "qa_single_s",
    "type": "String",
    "schema": "Single-valued at the destination; preserve both extracted values for the negative case."
  },
  {
    "source": "qaNumber",
    "xpath": "//*[@data-qa-field=\"number\"]/text()",
    "jsonpath": "$.qaNumber",
    "target": "qa_number_i",
    "type": "Integer",
    "schema": "Integer destination. Confirm invalid values reach the relevant validator instead of being dropped."
  },
  {
    "source": "qaPublished",
    "xpath": "//*[@data-qa-field=\"published\"]/text()",
    "jsonpath": "$.qaPublished",
    "target": "qa_published_dt",
    "type": "Date",
    "schema": "Date destination. Confirm invalid values are not silently omitted or replaced."
  },
  {
    "source": "qaUnknown",
    "xpath": "//*[@data-qa-field=\"unknown\"]/text()",
    "jsonpath": "$.qaUnknown",
    "target": "qa_unmapped_probe",
    "type": "Custom / controlled schema mismatch",
    "schema": "Must be absent from explicit AND dynamic schema; disable field auto-creation in the authorized test setup."
  },
  {
    "source": "qaOptional",
    "xpath": "//*[@data-qa-field=\"optional\"]/text()",
    "jsonpath": "$.qaOptional",
    "target": "qa_optional_s",
    "type": "String",
    "schema": "Optional, with no required constraint or other dependent validator."
  },
  {
    "source": "qaFlag",
    "xpath": "//*[@data-qa-field=\"flag\"]/text()",
    "jsonpath": "$.qaFlag",
    "target": "qa_flag_b",
    "type": "Boolean",
    "schema": "Confirm actual Boolean coercion/validation policy. False is a real value, not missing. Solr BoolField may coerce arbitrary strings rather than reject them."
  },
  {
    "source": "qaScores",
    "xpath": "//*[@data-qa-field=\"scores\"]/text()",
    "jsonpath": "$.qaScores[*]",
    "target": "qa_scores_is",
    "type": "Integer / multi-valued",
    "schema": "Actual destination must be multi-valued Integer; preserve every extracted member. The suffix here is illustrative."
  }
];
export const SCENARIOS = [
  {
    "id": "valid-control",
    "caseId": "FD00",
    "title": "Valid control",
    "category": "Positive control",
    "ac": "Regression / AC 6",
    "mode": "Crawler setup",
    "lead": "Start here. Confirm that the extraction rules work before trying invalid field values.",
    "changes": {},
    "map": [
      "qaRequired",
      "qaCategory",
      "qaNumber",
      "qaPublished"
    ],
    "setup": [
      "Use a dedicated QA app, not a customer or production app. Configure only the supported mappings you are verifying.",
      "Use the exact destination names reported by your app. The qa_* names in this lab are examples, not built-in SearchStax fields.",
      "Check the extraction preview: required=QA_REQUIRED_PRESENT, category=[Cardiology], number=42, published=2026-01-15T12:00:00Z."
    ],
    "expected": "With compatible mappings and schema, this document should index successfully. No failure-details section should be created for a successful run.",
    "remediation": "Resolve environment or mapping errors here before using the negative cases.",
    "code": "None expected with compatible schema and mappings",
    "saved": "",
    "fixedNote": "This page is already valid. The fixed variant has the same values.",
    "outcome": "Success control",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "unknown-field",
    "caseId": "FD01",
    "title": "Unknown destination field",
    "category": "Schema mismatch",
    "ac": "AC 1, 2, 6",
    "mode": "Developer setup",
    "lead": "Provide a field that an authorized test mapping sends to a destination the schema does not accept.",
    "changes": {
      "qaUnknown": "QA_UNKNOWN_FIELD_VALUE"
    },
    "map": [
      "qaUnknown"
    ],
    "setup": [
      "Ask a developer to prepare a mismatch between the saved crawler field mapping and the QA app schema. Map qaUnknown to the actual deliberately absent destination name.",
      "Check explicit fields, dynamic-field rules, and auto-create behavior. Simply adding a new field in Studio can create a valid typed field and may NOT reproduce this failure.",
      "A schema preflight can fail before this website is requested. Capture the saved manager status_message for that failed job. If the UI prevents this setup, use saved-message case SM01 with an authorized integration harness."
    ],
    "expected": "For a failed run with a saved unknown-field message, Error details names the field actually reported. If the message names several fields, all reported names must remain visible.",
    "remediation": "Correct the mapping to an accepted field, or have the schema owner add the intended field. Retry after the schema and mapping agree.",
    "code": "SOLR_SCHEMA_PREFLIGHT_FAILED or SOLR_DOCUMENT_REJECTED, depending on where the platform detects it",
    "saved": "SM01",
    "fixedNote": "Correct the mapping/schema as well as using the fixed page. Changing page content alone does not fix a preflight schema mismatch.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "required-missing",
    "caseId": "FD02",
    "title": "Missing required value",
    "category": "Field validation",
    "ac": "AC 1, 3, 6",
    "mode": "Developer schema setup",
    "lead": "Omit one dedicated required field while keeping normal page content and the other test values valid.",
    "changes": {
      "qaRequired": null
    },
    "map": [
      "qaRequired"
    ],
    "setup": [
      "Ask the schema owner to configure the dedicated QA destination as required, with no default value. Do not change production fields.",
      "Map the supplied XPath or JSON-LD path to that destination. This page has no qaRequired property and no matching HTML element.",
      "Confirm no fallback, transformation or generated value fills the field. An optional missing field is NOT a valid reproduction. If schema changes are unavailable, use SM03 in an authorized harness."
    ],
    "expected": "The saved validation reason identifies the actual required field and explains that a required value is missing. Existing error code, summary and How to Fix This guidance remain.",
    "remediation": "Supply the missing value or correct the extraction selector. Change the required constraint only when the data model permits it.",
    "code": "SOLR_DOCUMENT_REJECTED when rejected during indexing; use the actual observed code",
    "saved": "SM03",
    "fixedNote": "The fixed variant supplies QA_REQUIRED_PRESENT. Keep the same mapping and schema to prove recovery.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "single-value",
    "caseId": "FD03",
    "title": "Multiple values in a single-valued field",
    "category": "Field validation",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "Extract two distinct values, then send them to a destination configured to accept only one.",
    "changes": {
      "qaCategory": [
        "Cardiology",
        "Neurology"
      ]
    },
    "map": [
      "qaCategory"
    ],
    "setup": [
      "Ensure the destination is truly single-valued in the live QA schema; do not rely only on its name or a UI label.",
      "Use the supplied XPath or $.qaCategory[*]. Verify the extraction preview contains TWO separate values, not one comma-separated string.",
      "If the crawler keeps only the first value, joins values, or prevents the mapping, this site alone cannot reproduce the destination rejection. Use an authorized payload injection or SM04 instead."
    ],
    "expected": "Error details contains the actual field name and the saved reason that multiple values were supplied for a single-valued field.",
    "remediation": "Extract one value, or change to an appropriate multi-valued field through the supported schema process.",
    "code": "SOLR_DOCUMENT_REJECTED when rejected during indexing; use the actual observed code",
    "saved": "SM04",
    "fixedNote": "The fixed variant supplies only Cardiology. Repeat the run with the same configuration.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "invalid-integer",
    "caseId": "FD04",
    "title": "Invalid integer value",
    "category": "Field validation",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler setup",
    "lead": "Send NOT_AN_INTEGER as a field value instead of a valid integer.",
    "changes": {
      "qaNumber": "NOT_AN_INTEGER"
    },
    "map": [
      "qaNumber"
    ],
    "setup": [
      "Map qaNumber to an Integer destination. Keep the rest of the default extraction configuration unchanged.",
      "Check the preview or approved diagnostics to confirm the invalid text is extracted. Record whether it is rejected in parsing or indexing.",
      "If the implementation drops invalid values and completes, record that outcome. Do not call this a failed-crawl UI test without a failed job and saved message; use SM05 for controlled coverage."
    ],
    "expected": "For a failed job whose saved message describes the invalid number, Error details retains the field name and validation reason.",
    "remediation": "Provide a valid integer or correct the mapping type/selector for the source data.",
    "code": "SOLR_DOCUMENT_REJECTED or PARSER_PROCESSING_FAILED; confirm the actual stage",
    "saved": "SM05",
    "fixedNote": "The fixed variant supplies the integer 42.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "invalid-date",
    "caseId": "FD05",
    "title": "Invalid date value",
    "category": "Field validation",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler setup",
    "lead": "Supply NOT_A_DATE instead of a valid date.",
    "changes": {
      "qaPublished": "NOT_A_DATE"
    },
    "map": [
      "qaPublished"
    ],
    "setup": [
      "Map qaPublished to a Date destination. Use the provided XPath or JSON-LD path.",
      "Confirm the value reaches the relevant validator without being replaced by crawl time or another fallback.",
      "Record the actual failed stage and saved message. If invalid dates are skipped rather than failing the job, use SM06 for the Error details integration test."
    ],
    "expected": "The actual date field and saved invalid-date reason appear under Error details for a failed run.",
    "remediation": "Supply a date accepted by the configured field type and correct the extraction rule.",
    "code": "SOLR_DOCUMENT_REJECTED or PARSER_PROCESSING_FAILED; confirm the actual stage",
    "saved": "SM06",
    "fixedNote": "The fixed variant supplies 2026-01-15T12:00:00Z.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "sample-url",
    "caseId": "FD06",
    "title": "Sample URL with synthetic secrets",
    "category": "Sanitization",
    "ac": "AC 1, 3, 4, 6",
    "mode": "Crawler + saved-message check",
    "lead": "Use an invalid integer on a URL containing clearly fake query secrets. Never use real credentials.",
    "changes": {
      "qaNumber": "NOT_AN_INTEGER"
    },
    "map": [
      "qaNumber"
    ],
    "query": "case=FD06&access_token=QA_ONLY_ACCESS_TOKEN&api_key=QA_ONLY_API_KEY&doc=sample",
    "setup": [
      "Use the exact copied Start URL, including its fake query parameters, and map qaNumber to an Integer destination.",
      "After the run fails, confirm whether the SAVED manager status_message actually includes the sample URL. Its absence is not evidence that sanitization passed.",
      "Use SM07-SM09 and SM15 for deterministic user-info, encoded/repeated query parameters, credentials and multiple-URL tests through the authorized backend boundary. Browser fetches of credential-bearing URLs are not required."
    ],
    "expected": "When the saved message contains a URL, Error details retains the safe host/path while removing credentials and sensitive parameter values. The Studio Backend response itself must not leak them.",
    "remediation": "Fix the invalid integer. Separately verify backend redaction; do not rely on client-side hiding.",
    "code": "Use the actual validation failure code; redaction must not replace it",
    "saved": "SM07",
    "fixedNote": "The fixed variant corrects the integer but keeps only synthetic query values for repeatability.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "multiple-fields",
    "caseId": "FD07",
    "title": "Several invalid values",
    "category": "Edge case",
    "ac": "AC 1, 2, 3, 6",
    "mode": "Crawler setup",
    "lead": "Include invalid integer and date values in one document to inspect multi-field or first-error behavior.",
    "changes": {
      "qaNumber": "NOT_AN_INTEGER",
      "qaPublished": "NOT_A_DATE"
    },
    "map": [
      "qaNumber",
      "qaPublished"
    ],
    "setup": [
      "Map both qaNumber and qaPublished to their respective destination types.",
      "Check what the manager actually saves. A validator may stop at the first error; this is not automatically a display defect.",
      "Use SM02 or SM11 to require several names when the saved message definitely includes them. The frontend should not invent fields absent from that message."
    ],
    "expected": "Every affected field name and reason present in the saved message remains visible after sanitization. Do not require a list of errors the backend never saved.",
    "remediation": "Correct every reported value, rerun, and check for any subsequent validation error.",
    "code": "Use the observed code and original summary/guidance",
    "saved": "SM11",
    "fixedNote": "Both the integer and date are valid in the fixed variant.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "required-empty",
    "caseId": "FD08",
    "title": "Empty string in a required field",
    "category": "Empty values",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "Empty string in a required field. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaRequired": ""
    },
    "map": [
      "qaRequired"
    ],
    "setup": [
      "Use a dedicated required field with no default or fallback. This source has a present JSON-LD property with an empty string, not an absent property.",
      "Prefer JSON-LD $.qaRequired to distinguish the empty string. An empty HTML element has no text node for the supplied XPath.",
      "Confirm whether empty strings are accepted as present, converted to missing, or rejected by your validation policy. A required Solr string alone does not imply a nonblank constraint."
    ],
    "expected": "If rejected, retain the affected field and saved empty/missing-value reason. If accepted by the configured policy, record that behavior without asserting a missing Error details defect.",
    "remediation": "Supply a nonempty value or correct an extraction rule that returns an empty string.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "required-whitespace",
    "caseId": "FD09",
    "title": "Whitespace-only required value",
    "category": "Empty values",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "Whitespace-only required value. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaRequired": "   \t   "
    },
    "map": [
      "qaRequired"
    ],
    "setup": [
      "Configure a required destination with no fallback and record whether extraction trims whitespace.",
      "Compare the raw source with the extracted value. Add a nonblank validator only through an approved QA configuration if that is the behavior under test.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "When the saved message reports a blank value, show the actual field and reason. A schema that accepts whitespace need not fail.",
    "remediation": "Supply meaningful text and verify the trimming and blank-value policy.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "required-null",
    "caseId": "FD10",
    "title": "Explicit JSON null, not a missing property",
    "category": "Empty values",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "Explicit JSON null, not a missing property. Compare source extraction with the actual saved manager message.",
    "changes": {},
    "map": [
      "qaRequired"
    ],
    "setup": [
      "Use JSON-LD $.qaRequired. The property is explicitly null in the source JSON; XPath cannot represent JSON null.",
      "Configure the destination as required without a default. Record whether extraction omits null, rejects it, or incorrectly converts it to the literal string \"null\".",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "For a resulting failure, preserve the actual required-field reason. Distinguish JSON null, an absent property, an empty string, and the literal text \"null\".",
    "remediation": "Provide the required scalar value. Do not substitute the string \"null\" for missing data.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "nullFields": [
      "qaRequired"
    ],
    "extraction": "JSON-LD only"
  },
  {
    "id": "required-empty-array",
    "caseId": "FD11",
    "title": "Empty array mapped to a required field",
    "category": "Empty values",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "Empty array mapped to a required field. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaCategory": []
    },
    "map": [
      "qaCategory"
    ],
    "setup": [
      "Use $.qaCategory[*] or the category XPath. The source array contains zero entries and there are zero category text nodes.",
      "Configure the destination as required with no default. Single/multi-valued alone does not make a field required.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "If the empty extraction causes rejection, details reports the field and the saved missing-value reason, not a fabricated multiple-value error.",
    "remediation": "Supply at least one valid value or correct the selector; retain the intended schema constraint.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "integer-overflow",
    "caseId": "FD12",
    "title": "32-bit integer: one above the maximum",
    "category": "Numeric boundaries",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "32-bit integer: one above the maximum. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaNumber": "2147483648"
    },
    "map": [
      "qaNumber"
    ],
    "setup": [
      "Confirm an actual signed 32-bit Integer destination, such as IntPointField. A 64-bit Long accepts this value and is not the intended negative configuration.",
      "Keep the source as an exact decimal string. Confirm it is not dropped or converted to a different type before validation.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "If the value is rejected by the confirmed 32-bit destination, details retains the field and saved out-of-range/parse reason. The fixed boundary 2147483647 should be accepted by that numeric constraint.",
    "remediation": "Use a value in the supported range or deliberately choose a wider destination type.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "fixedChanges": {
      "qaNumber": "2147483647"
    },
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "integer-underflow",
    "caseId": "FD13",
    "title": "32-bit integer: one below the minimum",
    "category": "Numeric boundaries",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "32-bit integer: one below the minimum. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaNumber": "-2147483649"
    },
    "map": [
      "qaNumber"
    ],
    "setup": [
      "Confirm the destination is signed 32-bit Integer, not Long or String.",
      "Verify the negative sign and complete digits survive extraction without normalization.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "A confirmed 32-bit rejection preserves the field and underflow/parse reason. The fixed boundary -2147483648 should be accepted by that numeric constraint.",
    "remediation": "Correct the source range or use an appropriate wider numeric type.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "fixedChanges": {
      "qaNumber": "-2147483648"
    },
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "decimal-as-integer",
    "caseId": "FD14",
    "title": "Decimal sent to an integer destination",
    "category": "Numeric boundaries",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "Decimal sent to an integer destination. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaNumber": "42.5"
    },
    "map": [
      "qaNumber"
    ],
    "setup": [
      "Map qaNumber to Integer and disable custom rounding/truncation only when the intended QA configuration permits it.",
      "Observe whether the crawler rejects, drops, rounds or truncates the decimal. Do not assume a particular preprocessing policy.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "For rejection, display the integer field and exact saved reason. Intentional conversion to an integer is a separate extraction behavior, not a missing-details defect.",
    "remediation": "Supply an integer or use the appropriate decimal field type.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "invalid-calendar-date",
    "caseId": "FD15",
    "title": "Impossible calendar date",
    "category": "Date boundaries",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "Impossible calendar date. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaPublished": "2026-02-30T12:00:00Z"
    },
    "map": [
      "qaPublished"
    ],
    "setup": [
      "Map to Date and record whether the actual parser uses strict or lenient calendar validation.",
      "Check the extracted/indexed value; some date parsers normalize an impossible day rather than rejecting it.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "If a strict validator rejects February 30, details includes the date field and saved reason. Record normalization separately when the actual parser permits it.",
    "remediation": "Correct the day and verify the expected calendar parsing policy.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "fixedChanges": {
      "qaPublished": "2026-02-28T12:00:00Z"
    },
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "date-without-timezone",
    "caseId": "FD16",
    "title": "Date-time without timezone information",
    "category": "Date boundaries",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "Date-time without timezone information. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaPublished": "2026-01-15T12:00:00"
    },
    "map": [
      "qaPublished"
    ],
    "setup": [
      "Map to Date and determine whether the crawler adds a default timezone before sending the value downstream.",
      "Require a timezone only if that is the documented contract of the actual validator. Record conversion instead of assuming failure.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "A timezone-related rejection must preserve the field and saved reason. An accepted, intentionally normalized timestamp is not a failed-details case.",
    "remediation": "Use the required timezone representation or correct the configured date transformation.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "duplicate-values",
    "caseId": "FD17",
    "title": "Two identical values in a single-valued field",
    "category": "Cardinality",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "Two identical values in a single-valued field. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaCategory": [
        "Cardiology",
        "Cardiology"
      ]
    },
    "map": [
      "qaCategory"
    ],
    "setup": [
      "Configure a genuinely single-valued destination and extract both category nodes.",
      "Verify whether duplicate removal leaves one value. Do not infer a two-value rejection from the raw source alone.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "If two values reach and are rejected by a single-valued destination, preserve the field/cardinality reason. A deduplicated accepted value is an observation, not a display bug.",
    "remediation": "Extract one intended value or use a supported multivalued mapping.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "many-values",
    "caseId": "FD18",
    "title": "Many distinct values in a single-valued field",
    "category": "Cardinality",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "Many distinct values in a single-valued field. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaCategory": [
        "Category-01",
        "Category-02",
        "Category-03",
        "Category-04",
        "Category-05",
        "Category-06",
        "Category-07",
        "Category-08",
        "Category-09",
        "Category-10",
        "Category-11",
        "Category-12",
        "Category-13",
        "Category-14",
        "Category-15",
        "Category-16",
        "Category-17",
        "Category-18",
        "Category-19",
        "Category-20",
        "Category-21",
        "Category-22",
        "Category-23",
        "Category-24"
      ]
    },
    "map": [
      "qaCategory"
    ],
    "setup": [
      "Confirm extraction returns 24 separate category values and the destination is single-valued.",
      "Ensure no first-match or join transformation collapses the array before validation.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "A rejection shows the affected field and saved cardinality reason. Long value lists must remain readable under the agreed truncation policy; 24 is test data, not a product limit.",
    "remediation": "Extract only the intended value or use an appropriate multivalued destination.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "object-as-scalar",
    "caseId": "FD19",
    "title": "JSON object supplied where a scalar is expected",
    "category": "Type shape",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "JSON object supplied where a scalar is expected. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaNumber": {
        "value": 42
      }
    },
    "map": [
      "qaNumber"
    ],
    "setup": [
      "Use JSON-LD $.qaNumber, not $.qaNumber.value. The selected node is an object rather than the scalar 42.",
      "Map to the intended scalar Integer destination and observe whether extraction rejects, drops or stringifies the object. The HTML block intentionally has no scalar data-qa-field text for this value.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "When the actual saved message reports a shape/type error, display that field and reason; do not silently invent a nested scalar in the UI.",
    "remediation": "Select $.qaNumber.value for this nested structure, or use the fixed scalar source.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "extraction": "JSON-LD only"
  },
  {
    "id": "unicode-value",
    "caseId": "FD20",
    "title": "Unicode text is valid data",
    "category": "Positive control",
    "ac": "Regression / AC 6",
    "mode": "Crawler + schema setup",
    "lead": "Unicode text is valid data. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaRequired": "Clinic - Caf\u00e9 \u0939\u093f\u0902\u0926\u0940 \u6771\u4eac"
    },
    "map": [
      "qaRequired"
    ],
    "setup": [
      "Use a compatible required string destination and UTF-8 extraction without a restrictive business validator.",
      "Compare the extracted value with the supplied multilingual text and run to completion."
    ],
    "expected": "Unicode alone must not create a failure. With compatible schema/mappings, index the text without corruption. Use SM27 separately to test Unicode in a saved failure message.",
    "remediation": "Investigate encoding or an unrelated validation constraint instead of replacing legitimate text.",
    "code": "None expected with compatible schema and mappings",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Success control",
    "fixedChanges": {
      "qaRequired": "Clinic - Caf\u00e9 \u0939\u093f\u0902\u0926\u0940 \u6771\u4eac"
    },
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "zero-value",
    "caseId": "FD21",
    "title": "Zero is a value, not missing",
    "category": "Positive control",
    "ac": "Regression / AC 6",
    "mode": "Crawler + schema setup",
    "lead": "Zero is a value, not missing. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaNumber": 0
    },
    "map": [
      "qaNumber"
    ],
    "setup": [
      "Use a compatible Integer destination; a required constraint can be enabled to catch incorrect truthiness-based omission.",
      "Ensure no business rule prohibits zero. Compare extraction and indexing with the numeric zero."
    ],
    "expected": "Zero should survive extraction and be accepted under this schema. It must not be mistaken for an absent value, and no failure panel should be fabricated.",
    "remediation": "Fix truthiness-based dropping or an incorrect business-rule configuration.",
    "code": "None expected with compatible schema and mappings",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Success control",
    "fixedChanges": {
      "qaNumber": 0
    },
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "comma-single-string",
    "caseId": "FD22",
    "title": "Comma-separated words remain one source value",
    "category": "Positive control",
    "ac": "Regression / AC 6",
    "mode": "Crawler + schema setup",
    "lead": "Comma-separated words remain one source value. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaCategory": [
        "Cardiology, Neurology"
      ]
    },
    "map": [
      "qaCategory"
    ],
    "setup": [
      "Use the category selector and a single-valued string destination without a delimiter-splitting transformation.",
      "Verify exactly one extracted array member/text node. Contrast with FD03, which supplies two separate members."
    ],
    "expected": "One string containing a comma should be accepted by the single-value constraint. If a configured splitter creates two values, record that separate configuration.",
    "remediation": "Remove an unintended splitting transformation or select the correct destination type.",
    "code": "None expected with compatible schema and mappings",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Success control",
    "fixedChanges": {
      "qaCategory": [
        "Cardiology, Neurology"
      ]
    },
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "optional-missing",
    "caseId": "FD23",
    "title": "Absent optional field must not fail the crawl",
    "category": "Positive control",
    "ac": "Regression / AC 6",
    "mode": "Crawler + schema setup",
    "lead": "Absent optional field must not fail the crawl. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaOptional": null
    },
    "map": [
      "qaOptional"
    ],
    "setup": [
      "Use a destination that is optional, with no business rule requiring its presence.",
      "The qaOptional property and its HTML node are absent; leave normal system-field mappings intact."
    ],
    "expected": "An absent optional field alone should not fail the document or generate Error details. Confirm the normal document indexes successfully.",
    "remediation": "Check that the destination was not unintentionally configured as required.",
    "code": "None expected with compatible schema and mappings",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Success control",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "boolean-coercion",
    "caseId": "FD24",
    "title": "Noncanonical Boolean input and coercion",
    "category": "Type shape",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "Noncanonical Boolean input and coercion. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaFlag": "NOT_A_BOOLEAN"
    },
    "map": [
      "qaFlag"
    ],
    "setup": [
      "Map to the actual Boolean destination and determine the parser/validator policy first.",
      "Solr BoolField can coerce strings to false instead of rejecting them. Use an authorized strict upstream Boolean validator only when that is the intended component under test.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "Record coercion to false when supported; do not expect a guaranteed failure. For a genuine strict-validation failure, details must preserve the actual field and reason.",
    "remediation": "Use canonical true/false input or correct the chosen validation/mapping policy.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "false-value",
    "caseId": "FD25",
    "title": "Boolean false is not an empty value",
    "category": "Positive control",
    "ac": "Regression / AC 6",
    "mode": "Crawler + schema setup",
    "lead": "Boolean false is not an empty value. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaFlag": false
    },
    "map": [
      "qaFlag"
    ],
    "setup": [
      "Prefer JSON-LD $.qaFlag to preserve the Boolean false type. The HTML equivalent is the literal text false.",
      "Use a compatible Boolean destination, optionally required, and ensure no business rule requires true."
    ],
    "expected": "False should not be omitted by a truthiness check or reported as a missing required value. A compatible crawl succeeds.",
    "remediation": "Preserve false as a value and fix any inappropriate fallback/omission rule.",
    "code": "None expected with compatible schema and mappings",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Success control",
    "fixedChanges": {
      "qaFlag": false
    },
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "mixed-integer-array",
    "caseId": "FD26",
    "title": "One invalid member of a numeric array",
    "category": "Type shape",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "One invalid member of a numeric array. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaScores": [
        10,
        "NOT_AN_INTEGER",
        30
      ]
    },
    "map": [
      "qaScores"
    ],
    "setup": [
      "Use $.qaScores[*] or all score text nodes and a truly multivalued Integer destination.",
      "Confirm three values are extracted and the invalid member is not silently dropped. A single-valued destination would test the wrong constraint.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "If rejected, details identifies the actual numeric-array field and saved member/type reason, not an invented single-value constraint.",
    "remediation": "Correct the invalid member; the fixed variant supplies [10, 20, 30].",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "fixedChanges": {
      "qaScores": [
        10,
        20,
        30
      ]
    },
    "extraction": "XPath or JSON-LD"
  },
  {
    "id": "invalid-leap-date",
    "caseId": "FD27",
    "title": "February 29 in a non-leap year",
    "category": "Date boundaries",
    "ac": "AC 1, 3, 6",
    "mode": "Crawler + schema setup",
    "lead": "February 29 in a non-leap year. Compare source extraction with the actual saved manager message.",
    "changes": {
      "qaPublished": "2025-02-29T12:00:00Z"
    },
    "map": [
      "qaPublished"
    ],
    "setup": [
      "Map to Date and record strict versus lenient calendar behavior.",
      "The fixed variant uses 2024-02-29T12:00:00Z, a valid leap day. Check actual normalized values as well as final status.",
      "Only assess Error details after the job is Failed and a technical message is saved. If normalization or value-dropping prevents this state, record Not reproduced / setup blocked, not a display failure."
    ],
    "expected": "A strict invalid-leap-day rejection retains the field and saved reason. A lenient parser may normalize the source; that does not demonstrate a missing-details bug.",
    "remediation": "Provide a real calendar date and use the agreed parsing policy.",
    "code": "Use the actual saved failure code, if a failure occurs; do not invent a code.",
    "saved": "",
    "fixedNote": "The fixed variant restores compatible values. Keep the mapping/schema unchanged unless this case explicitly requires a configuration correction.",
    "outcome": "Conditional validation",
    "fixedChanges": {
      "qaPublished": "2024-02-29T12:00:00Z"
    },
    "extraction": "XPath or JSON-LD"
  }
];
const validValues = {"qaRequired": "QA_REQUIRED_PRESENT", "qaCategory": ["Cardiology"], "qaNumber": 42, "qaPublished": "2026-01-15T12:00:00Z", "qaOptional": "QA_OPTIONAL_PRESENT", "qaFlag": true, "qaScores": [10, 20, 30]};
export function getDocument(id, fixed = false) {
  const scenario = SCENARIOS.find(item => item.id === id);
  if (!scenario) return null;
  const data = structuredClone(validValues);
  // V3 used null in changes to mean omitted. Keep that contract; nullFields models JSON null explicitly.
  const changes = fixed ? (scenario.fixedChanges || {}) : scenario.changes;
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) delete data[key]; else data[key] = structuredClone(value);
  }
  if (!fixed) for (const key of scenario.nullFields || []) data[key] = null;
  return { scenario, data, fixed };
}
export function startPath(scenario, fixed = false) {
  const query = new URLSearchParams(scenario.query || '');
  if (fixed) query.set('variant', 'fixed');
  return `/error-fixtures/${scenario.id}${query.size ? '?' + query : ''}`;
}
