import { isDeepStrictEqual } from 'node:util';

export function readPath(value, path) {
  let current = value;
  for (const part of path.split('.')) {
    if (!part || current === null || typeof current !== 'object' || !Object.hasOwn(current, part)) return { found:false };
    current = current[part];
  }
  return { found:true, value:current };
}

/** Bounded alternate views for known canaries only; not a sanitizer or a secret classifier. */
function canaryViews(response) {
  const values = [JSON.stringify(response)];
  const pending = [response];
  while (pending.length) {
    const value = pending.pop();
    if (typeof value === 'string') values.push(value);
    else if (value && typeof value === 'object') pending.push(...Object.values(value));
  }
  const views = new Set(values);
  for (let round=0; round<3; round++) {
    for (const input of [...views]) {
      const decoded = input
        .replace(/%([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h,16)))
        .replace(/&#x([0-9a-f]+);/gi, (m,h) => { const n=parseInt(h,16); return n<=0x10ffff ? String.fromCodePoint(n) : m; })
        .replace(/&#(\d+);/g, (m,d) => { const n=Number(d); return n<=0x10ffff ? String.fromCodePoint(n) : m; })
        .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
        .replace(/\\u([0-9a-f]{4})/gi, (_,h) => String.fromCharCode(parseInt(h,16)))
        .replace(/\\x([0-9a-f]{2})/gi, (_,h) => String.fromCharCode(parseInt(h,16)));
      views.add(decoded);
    }
  }
  return [...views];
}

/** Checks a CAPTURED backend response. Does not call SearchStax or validate its UI. */
export function checkErrorDetails(response, fixture, { detailsPath, baseline, preservePaths = [] } = {}) {
  if (!detailsPath) throw new Error('The real sanitized-details response path is required.');
  if (!fixture?.expected) throw new Error('A fixture with expected assertions is required.');
  if (!response || typeof response !== 'object') throw new Error('Response must be a parsed JSON object or array.');
  if (preservePaths.length && baseline === undefined) throw new Error('Preservation checks need a baseline response.');
  const checks = [];
  const add = (name, passed) => checks.push({ name, passed:Boolean(passed) });
  const entry = readPath(response, detailsPath);
  const text = typeof entry.value === 'string' ? entry.value : '';
  if (fixture.expected.show_details) {
    add('Details exist as a nonempty string', entry.found && typeof entry.value === 'string' && Boolean(text.trim()));
    for (const fragment of fixture.expected.must_contain) add(`Retains expected text: ${fragment}`, text.includes(fragment));
  } else {
    add('No meaningful details for empty saved input', !entry.found || entry.value === null || (typeof entry.value === 'string' && !entry.value.trim()));
  }
  const views = canaryViews(response);
  fixture.expected.must_not_contain.forEach((secret, i) => add(`Synthetic secret marker ${i+1} absent from entire response and bounded decoded views`, !views.some(text => text.includes(secret))));
  for (const path of preservePaths) {
    const before = readPath(baseline, path), after = readPath(response, path);
    add(`Original property preserved: ${path}`, before.found && after.found && isDeepStrictEqual(before.value, after.value));
  }
  return {
    fixture:fixture.id,
    fixture_scope:fixture.scope || 'Saved-message integration',
    api_checks_passed:checks.every(check => check.passed),
    preservation_checked:preservePaths.length > 0,
    ui_validated:false,
    checks,
    limits:[
      'Checks only a supplied response snapshot against selected test assertions.',
      'No claim about real crawl execution, data persistence or backend provenance.',
      'Synthetic canary checks include up to three percent/entity/escape decoding passes; they are not a complete arbitrary-secret detector or general base64 decoder.',
      'Inspect real Studio DOM, visibility, loading state, layout and historical runs separately.',
      ...(preservePaths.length ? [] : ['Existing code/summary/guidance preservation was NOT checked. Supply baseline and preserve-paths.'])
    ]
  };
}
