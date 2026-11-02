// Synthetic manager saved-message examples. Never submit real credentials here.
// These are test inputs, NOT fabricated responses from a SearchStax endpoint.
export function getSavedCases(base) {
  const host = new URL(base).host;
  const scheme = new URL(base).protocol;
  const safeUrl = `${base}/error-fixtures/sample-url?doc=sample`;
  const result = [];
  function add(id, title, message, reference, mustContain = [], mustNotContain = [], note = '') {
    const absent = message === undefined;
    result.push({
      id, title,
      manager_saved_fields: absent ? {} : { status_message: message },
      message_state: absent ? 'absent' : message === null ? 'null' : typeof message !== 'string' ? 'unexpected_' + (Array.isArray(message) ? 'array' : typeof message) : message.trim() ? 'nonempty' : 'empty_or_whitespace',
      expected: { show_details: typeof message === 'string' && Boolean(message.trim()), must_contain: mustContain, must_not_contain: mustNotContain, preserve_existing_code_summary_guidance: true },
      reference_details: reference,
      note: note || 'Wording and redaction markers are illustrative. Compare to the actual saved message and the agreed sanitization policy.'
    });
  }
  add('SM01', 'One unknown field', "Schema validation failed: unknown field 'qa_unmapped_probe'.", "Schema validation failed: unknown field 'qa_unmapped_probe'.", ['qa_unmapped_probe']);
  add('SM02', 'Several unknown fields', "Schema validation failed: unknown fields 'qa_unmapped_probe' and 'qa_other_unmapped_probe'.", "Schema validation failed: unknown fields 'qa_unmapped_probe' and 'qa_other_unmapped_probe'.", ['qa_unmapped_probe', 'qa_other_unmapped_probe']);
  add('SM03', 'Required value missing', "Document rejected: missing required field 'qa_required_s'.", "Document rejected: missing required field 'qa_required_s'.", ['qa_required_s', 'required']);
  add('SM04', 'Single-valued destination', "Document rejected: multiple values encountered for single-valued field 'qa_single_s': [Cardiology, Neurology].", "Document rejected: multiple values encountered for single-valued field 'qa_single_s': [Cardiology, Neurology].", ['qa_single_s', 'multiple', 'single-valued']);
  add('SM05', 'Integer validation', "Document rejected: field 'qa_number_i' cannot parse 'NOT_AN_INTEGER' as an integer.", "Document rejected: field 'qa_number_i' cannot parse 'NOT_AN_INTEGER' as an integer.", ['qa_number_i', 'integer']);
  add('SM06', 'Date validation', "Document rejected: field 'qa_published_dt' has an invalid date: NOT_A_DATE.", "Document rejected: field 'qa_published_dt' has an invalid date: NOT_A_DATE.", ['qa_published_dt', 'invalid date']);
  add('SM07', 'Sample URL: user info and query secrets',
    `Document rejected: field 'qa_number_i' cannot parse an integer. Sample URL: ${scheme}//QA_ONLY_USER:QA_ONLY_PASSWORD@${host}/error-fixtures/sample-url?access_token=QA_ONLY_ACCESS_TOKEN&api_key=QA_ONLY_API_KEY&doc=sample`,
    `Document rejected: field 'qa_number_i' cannot parse an integer. Sample URL: ${safeUrl}`,
    ['qa_number_i', '/error-fixtures/sample-url'], ['QA_ONLY_USER', 'QA_ONLY_PASSWORD', 'QA_ONLY_ACCESS_TOKEN', 'QA_ONLY_API_KEY']);
  add('SM08', 'Encoded, repeated and mixed-case parameters',
    `Field 'qa_number_i' is invalid. Sample URL: ${base}/error-fixtures/sample-url?%61ccess_token=QA_ONLY_ENCODED_TOKEN&API_KEY=QA_ONLY_MIXED_KEY&token=QA_ONLY_REPEAT_A&token=QA_ONLY_REPEAT_B&signature=QA_ONLY_SIGNATURE&doc=sample`,
    `Field 'qa_number_i' is invalid. Sample URL: ${safeUrl}`,
    ['qa_number_i', '/error-fixtures/sample-url'], ['QA_ONLY_ENCODED_TOKEN','QA_ONLY_MIXED_KEY','QA_ONLY_REPEAT_A','QA_ONLY_REPEAT_B','QA_ONLY_SIGNATURE']);
  add('SM09', 'Credentials outside a URL',
    "Document rejected: field 'qa_required_s' is missing. Authorization: Bearer QA_ONLY_BEARER_SECRET; username=QA_ONLY_USERNAME; password=QA_ONLY_PASSWORD_VALUE; client_secret=QA_ONLY_CLIENT_SECRET.",
    "Document rejected: field 'qa_required_s' is missing. Authorization: [REDACTED]; username=[REDACTED]; password=[REDACTED]; client_secret=[REDACTED].",
    ['qa_required_s', 'missing'], ['QA_ONLY_BEARER_SECRET','QA_ONLY_USERNAME','QA_ONLY_PASSWORD_VALUE','QA_ONLY_CLIENT_SECRET']);
  add('SM10', 'Markup must render as plain text',
    'Validation failed for <b>qa_single_s</b>. Literal probe: <img src=x onerror="window.__qa_error_details_probe=true">. Expected one value.',
    'Validation failed for <b>qa_single_s</b>. Literal probe: <img src=x onerror="window.__qa_error_details_probe=true">. Expected one value.',
    ['qa_single_s', 'Expected one value'], [],
    'Harmless local DOM probe only. Inspect the real Studio details DOM: no b/img node may be created from this message; no probe code may execute. A CSP blocking execution does not prove text-only rendering. The CLI cannot verify DOM safety.');
  add('SM11', 'Multiline message with several fields',
    "Validation failed:\n- qa_number_i: invalid integer.\n- qa_published_dt: invalid date.\n- qa_required_s: missing required value.",
    "Validation failed:\n- qa_number_i: invalid integer.\n- qa_published_dt: invalid date.\n- qa_required_s: missing required value.",
    ['qa_number_i','qa_published_dt','qa_required_s','invalid integer','invalid date','required']);
  add('SM12', 'Saved property absent', undefined, '', [], [], 'Remove status_message from the authorized test record; merging an empty object does NOT delete an existing value. No Error details section or loading error. Existing summary and guidance remain.');
  add('SM13', 'Saved message is null', null, '', [], [], 'A failed record with status_message=null must retain its existing summary/guidance without an empty Error details section.');
  add('SM14', 'Saved message is an empty string', '', '', [], [], 'A failed record with status_message="" must retain its existing summary/guidance without an empty Error details section.');
  add('SM15', 'Two sample URLs',
    `qa_number_i: invalid integer. URL 1: ${base}/error-fixtures/invalid-integer?token=QA_ONLY_FIRST_URL_SECRET ; URL 2: ${base}/error-fixtures/sample-url?password=QA_ONLY_SECOND_URL_SECRET`,
    `qa_number_i: invalid integer. URL 1: ${base}/error-fixtures/invalid-integer ; URL 2: ${base}/error-fixtures/sample-url`,
    ['qa_number_i','/error-fixtures/invalid-integer','/error-fixtures/sample-url'], ['QA_ONLY_FIRST_URL_SECRET','QA_ONLY_SECOND_URL_SECRET']);
  add('SM16', 'Whitespace-only saved message', ' \n\t\r ', '', [], [], 'Whitespace-only content is empty for this QA expectation: hide Error details and preserve existing summary/guidance. Confirm with Product if the implementation defines a different empty-value contract.');
  const long = 'Validation failed: qa_number_i is not an integer.\n' + 'Repeated diagnostic context; no real customer data. '.repeat(150) + '\nAffected field: qa_number_i.';
  add('SM17', 'Long diagnostic message', long, long, ['qa_number_i'], [], 'UI must remain usable at mobile and desktop sizes. Apply the product-approved length/truncation rule; this fixture does not prescribe an unsupported maximum or require unbounded rendering.');
  add('SM18', 'Saved message without a URL', 'Processing failed: unable to validate field qa_number_i. No sample URL was recorded.', 'Processing failed: unable to validate field qa_number_i. No sample URL was recorded.', ['qa_number_i'], [], 'Show saved details without inventing a sample URL or an additional remediation sentence. Existing guidance remains the authoritative remediation.');

  add('SM19', 'Credentials in a JSON-shaped diagnostic string',
    'qa_number_i: invalid integer. Context: {"password":"QA_ONLY_JSON_PASSWORD","api_key":"QA_ONLY_JSON_KEY","reason":"validation"}',
    'qa_number_i: invalid integer. Context: {"password":"[REDACTED]","api_key":"[REDACTED]","reason":"validation"}',
    ['qa_number_i', 'invalid integer'], ['QA_ONLY_JSON_PASSWORD', 'QA_ONLY_JSON_KEY'],
    'This is a string containing JSON-shaped context, not an object-valued status_message. Redact credentials without discarding the saved validation reason.');
  add('SM20', 'Secret in a saved URL fragment',
    `qa_number_i: invalid integer. Sample URL: ${base}/error-fixtures/sample-url?doc=sample#access_token=QA_ONLY_FRAGMENT_SECRET`,
    `qa_number_i: invalid integer. Sample URL: ${safeUrl}`,
    ['qa_number_i','/error-fixtures/sample-url'], ['QA_ONLY_FRAGMENT_SECRET'],
    'Harness-only: a URL fragment is not sent in an HTTP request, so an ordinary crawl cannot make the origin see it. Seed the saved message through the authorized backend path.');
  const nested = `${base}/error-fixtures/invalid-integer?token=QA_ONLY_NESTED_SECRET`;
  add('SM21', 'Nested percent-encoded URL containing a secret',
    `qa_number_i: invalid integer. Sample URL: ${base}/error-fixtures/sample-url?return_url=${encodeURIComponent(nested)}&doc=sample`,
    `qa_number_i: invalid integer. Sample URL: ${safeUrl}`,
    ['qa_number_i','/error-fixtures/sample-url'], ['QA_ONLY_NESTED_SECRET'],
    'The outer return_url value contains a complete encoded URL. Remove or safely redact the sensitive nested value; do not require one particular redaction marker.');
  add('SM22', 'HTML-entity query separator in saved text',
    `qa_number_i: invalid integer. Sample URL: ${base}/error-fixtures/sample-url?doc=sample&amp;token=QA_ONLY_ENTITY_SECRET`,
    `qa_number_i: invalid integer. Sample URL: ${safeUrl}`,
    ['qa_number_i','/error-fixtures/sample-url'], ['QA_ONLY_ENTITY_SECRET'],
    'Treat the saved message as text. A secret is still sensitive when a separator was HTML-escaped upstream; do not interpret the message as HTML.');
  const encodedSecret = [...'QA_ONLY_PERCENT_SECRET'].map(c=>'%' + c.charCodeAt(0).toString(16).padStart(2,'0')).join('');
  add('SM23', 'Percent-encoded secret value',
    `qa_number_i: invalid integer. Sample URL: ${base}/error-fixtures/sample-url?token=${encodedSecret}&doc=sample`,
    `qa_number_i: invalid integer. Sample URL: ${safeUrl}`,
    ['qa_number_i','/error-fixtures/sample-url'], ['QA_ONLY_PERCENT_SECRET'],
    'The local checker inspects bounded percent/HTML/JSON-unescaped views for known synthetic canaries. This is not a general-purpose secret detector.');
  add('SM24', 'Signed URL parameters',
    `qa_number_i: invalid integer. Sample URL: ${base}/error-fixtures/sample-url?X-Amz-Credential=QA_ONLY_SIGNED_CREDENTIAL&X-Amz-Signature=QA_ONLY_SIGNED_SIGNATURE&X-Amz-Security-Token=QA_ONLY_SIGNED_SESSION&doc=sample`,
    `qa_number_i: invalid integer. Sample URL: ${safeUrl}`,
    ['qa_number_i','/error-fixtures/sample-url'], ['QA_ONLY_SIGNED_CREDENTIAL','QA_ONLY_SIGNED_SIGNATURE','QA_ONLY_SIGNED_SESSION'],
    'Synthetic signed-URL parameters only; no cloud account is involved. Validate the agreed sensitive-parameter policy, not just a literal token key.');
  add('SM25', 'Safe URL text and an ordinary field name',
    `Field qa_api_token_count_i: invalid integer. Sample URL: ${base}/error-fixtures/invalid-integer?doc=public-sample&category=cardiology`,
    `Field qa_api_token_count_i: invalid integer. Sample URL: ${base}/error-fixtures/invalid-integer?doc=public-sample&category=cardiology`,
    ['qa_api_token_count_i','invalid integer','/error-fixtures/invalid-integer'], [],
    'Do not redact an affected field name merely because it includes token. This case does not require preservation of every harmless query parameter if the approved policy removes the query string.');
  add('SM26', 'Already-redacted credentials',
    'qa_required_s: missing required value. Authorization: [REDACTED]; password=[REDACTED].',
    'qa_required_s: missing required value. Authorization: [REDACTED]; password=[REDACTED].',
    ['qa_required_s','required'], [],
    'Sanitizing an already-redacted message must not restore credentials or damage the field/reason. Exact placeholder spelling is not prescribed.');
  add('SM27', 'Unicode in field names and validation reasons',
    'Validation failed: qa_caf\u00e9_s; reason: missing value for \u0936\u0940\u0930\u094d\u0937\u0915 / \u6771\u4eac. Diagnostic marker: \u2713.',
    'Validation failed: qa_caf\u00e9_s; reason: missing value for \u0936\u0940\u0930\u094d\u0937\u0915 / \u6771\u4eac. Diagnostic marker: \u2713.',
    ['qa_caf\u00e9_s','missing value','\u0936\u0940\u0930\u094d\u0937\u0915','\u6771\u4eac'], [],
    'The harness supplies this text independently of schema support for these names. Preserve the characters actually saved; do not invent transliterations.');
  add('SM28', 'Literal entities and angle brackets',
    'qa_single_s: expected one value. Literal entity: &lt;b&gt;field&lt;/b&gt;; comparison: count < 2 & count > 0.',
    'qa_single_s: expected one value. Literal entity: &lt;b&gt;field&lt;/b&gt;; comparison: count < 2 & count > 0.',
    ['qa_single_s','expected one value','&lt;b&gt;field&lt;/b&gt;'], [],
    'Inspect textContent in Studio: entities in saved plain text should not become markup, and HTML escaping used for transport/rendering must not corrupt the displayed original characters.');
  add('SM29', 'Markdown and a non-HTTP link remain text',
    'qa_single_s: expected one value. **Diagnostic** [not a fix](javascript:void(0)) <strong>literal</strong>.',
    'qa_single_s: expected one value. **Diagnostic** [not a fix](javascript:void(0)) <strong>literal</strong>.',
    ['qa_single_s','expected one value'], [],
    'No Markdown renderer, message-created strong element or executable link. Inspect the actual DOM; a screenshot alone cannot prove text-only handling.');
  add('SM30', 'CRLF, tabs, quotes and a credential',
    'Validation failed:\r\n\tqa_number_i: "invalid integer".\r\npassword="QA_ONLY_CRLF_PASSWORD"',
    'Validation failed:\r\n\tqa_number_i: "invalid integer".\r\npassword="[REDACTED]"',
    ['qa_number_i','invalid integer'], ['QA_ONLY_CRLF_PASSWORD'],
    'Preserve readable field/reason text while redacting credentials across line boundaries. CRLF is diagnostic text, not a separate status record.');
  const unbroken = 'qa_number_i: invalid integer. Diagnostic context: ' + 'X'.repeat(8192);
  add('SM31', 'Long unbroken token and responsive layout', unbroken, unbroken,
    ['qa_number_i','invalid integer'], [],
    'The 8192-character token is test data, not a declared product limit. Wrap or contain it within the details panel; check the approved truncation rule, keyboard access, mobile width and zoom.');
  const tail = 'qa_number_i: invalid integer. ' + 'Context '.repeat(1200) + ' password=QA_ONLY_TAIL_SECRET';
  add('SM32', 'Secret near the end of a long message', tail, tail.replace('QA_ONLY_TAIL_SECRET','[REDACTED]'),
    ['qa_number_i','invalid integer'], ['QA_ONLY_TAIL_SECRET'],
    'Inspect the entire frontend-facing API response, not just the visible excerpt. Truncation in Studio must not conceal an unsanitized raw response property.');
  add('SM33', 'Literal string null is not JSON null', 'null', 'null', ['null'], [],
    'The saved value is a nonempty string containing four letters, not null. Under the supplied nonempty-message requirement it is shown as text; confirm any additional placeholder-suppression rule with Product.');
  add('SM34', 'Unexpected object-valued message', { reason:'qa_number_i invalid', password:'QA_ONLY_OBJECT_SECRET' }, '', [], ['QA_ONLY_OBJECT_SECRET'],
    'Robustness extension, not an explicit AC: agree the invalid-type contract with Engineering. Proposed expectation is safe omission, preserved guidance and no [object Object], crash or raw-object leak. Not a string-valued saved-message test.');
  add('SM35', 'Unexpected numeric message', 42, '', [], [],
    'Robustness extension requiring contract agreement. Proposed handling is safe omission rather than treating a numeric manager value as a meaningful diagnostic string. No loading error.');
  add('SM36', 'Unexpected Boolean message', false, '', [], [],
    'Robustness extension requiring contract agreement. Distinguish false in a malformed status_message from the valid Boolean document value tested in FD25. Proposed handling: safe omission and no loading error.');
  add('SM37', 'Unexpected array-valued message', ['qa_number_i invalid','password=QA_ONLY_ARRAY_SECRET'], '', [], ['QA_ONLY_ARRAY_SECRET'],
    'Robustness extension requiring contract agreement. Do not join or stringify an unexpected array and leak credentials. Proposed handling is safe omission while retaining existing guidance.');
  add('SM38', 'Malformed sample URL with credentials',
    'qa_number_i: invalid integer. Sample URL: https://QA_ONLY_BADURL_USER:QA_ONLY_BADURL_PASSWORD@/broken?token=QA_ONLY_BADURL_TOKEN',
    'qa_number_i: invalid integer. Sample URL: [invalid URL removed]',
    ['qa_number_i','invalid integer'], ['QA_ONLY_BADURL_USER','QA_ONLY_BADURL_PASSWORD','QA_ONLY_BADURL_TOKEN'],
    'A failed URL parse must not fall back to returning the raw credential-bearing string. Keep the useful field/reason and apply the agreed malformed-URL replacement policy.');
  const basic = Buffer.from('QA_ONLY_BASIC_USER:QA_ONLY_BASIC_PASSWORD').toString('base64');
  add('SM39', 'Basic authorization value',
    `qa_required_s: missing required value. Authorization: Basic ${basic}`,
    'qa_required_s: missing required value. Authorization: [REDACTED]',
    ['qa_required_s','required'], [basic,'QA_ONLY_BASIC_USER','QA_ONLY_BASIC_PASSWORD'],
    'The encoded credential is itself sensitive. This checker knows this exact synthetic Basic canary; it does not generally decode arbitrary base64 strings.');
  add('SM40', 'Sensitive-looking field names beside a real fake secret',
    'Unknown fields: password_policy_s, api_token_count_i, authorization_mode_s. Diagnostic password=QA_ONLY_NEARBY_PASSWORD.',
    'Unknown fields: password_policy_s, api_token_count_i, authorization_mode_s. Diagnostic password=[REDACTED].',
    ['password_policy_s','api_token_count_i','authorization_mode_s','Unknown fields'], ['QA_ONLY_NEARBY_PASSWORD'],
    'Preserve field identities from the saved error while removing the nearby credential value. Over-redacting the field names breaks unknown-field diagnosis.');
  for (const item of result) {
    item.ac = ['SM12','SM13','SM14','SM16'].includes(item.id) ? 'AC 5, 6' : 'AC 1, 4, 6';
    if (['SM01','SM02','SM40'].includes(item.id)) item.ac = 'AC 1, 2, 6';
    if (['SM03','SM04','SM05','SM06','SM11'].includes(item.id)) item.ac = 'AC 1, 3, 6';
    item.scope = ['SM34','SM35','SM36','SM37'].includes(item.id) ? 'Robustness / contract agreement' : 'Saved-message integration';
  }

  return result;
}
