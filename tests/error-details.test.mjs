import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.mjs';
import { configuration } from '../lib/catalog.mjs';
import { SCENARIOS, FIELDS, getDocument, startPath } from '../lib/error-details-data.mjs';
import { getSavedCases } from '../lib/error-details-messages.mjs';
import { checkErrorDetails } from '../lib/error-details-checker.mjs';

let app, base;
before(async () => {
  app=await createApp(configuration({ADMIN_TOKEN:'LOCAL_TEST_ONLY',DELAY_MS:'25'}));
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  base=`http://127.0.0.1:${app.server.address().port}`;
});
after(async()=>{app.server.closeAllConnections();await new Promise(resolve=>app.server.close(resolve));});
const get=path=>fetch(base+path);
const ld=html=>JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

test('new dashboard and source-data APIs load with noindex protection',async()=>{
  for (const path of ['/error-details','/error-details/','/error-details/guide.md','/assets/error-details.css','/assets/error-details.js','/api/error-details/scenarios','/api/error-details/saved-messages']) {
    const response=await get(path); assert.equal(response.status,200,path); assert.match(response.headers.get('x-robots-tag'),/noindex/); await response.text();
  }
});
test('main dashboard links the new lab and preserves creator credit',async()=>{
  const html=await get('/').then(r=>r.text()); assert.ok(html.includes('href="/error-details"'));assert.ok(html.includes('Website Creator : Shubham Sharma'));
});
test('exact scenario and saved-message counts and unique IDs',()=>{
  assert.equal(SCENARIOS.length,28);assert.equal(new Set(SCENARIOS.map(s=>s.id)).size,28);
  const cases=getSavedCases(base);assert.equal(cases.length,40);assert.equal(new Set(cases.map(s=>s.id)).size,40);
  assert.equal(FIELDS.length,8);
});
for (const scenario of SCENARIOS) {
  test(`${scenario.caseId} source and fixed documents are crawlable HTTP 200 with valid JSON-LD`,async()=>{
    for (const fixed of [false,true]) {
      const response=await get(startPath(scenario,fixed));assert.equal(response.status,200);
      assert.equal(response.headers.get('x-robots-tag'),null);
      assert.equal(response.headers.get('x-qa-scenario'),scenario.id);
      const html=await response.text(); const data=ld(html);
      assert.equal(data['@type'],'Article');
      const expected=getDocument(scenario.id,fixed).data;
      for (const field of FIELDS) {
        if (Object.hasOwn(expected,field.source)) assert.deepEqual(data[field.source],expected[field.source]);
        else assert.ok(!Object.hasOwn(data,field.source));
      }
      assert.ok(!/<a\s/i.test(html),'No crawlable outgoing anchors');
      assert.ok(html.includes('data-go="/error-details"'));assert.ok(html.includes('data-go="/"'));
      assert.ok(html.includes('Website Creator : Shubham Sharma'));
    }
  });
  test(`${scenario.caseId} setup page has absolute current-host URLs and noindex`,async()=>{
    const response=await get(`/error-details/scenarios/${scenario.id}`);const html=await response.text();
    assert.equal(response.status,200);assert.match(response.headers.get('x-robots-tag'),/noindex/);
    assert.ok(html.includes(base));assert.ok(!html.includes('YOUR-SERVICE'));
    assert.ok(html.includes('Copy fixed URL'));assert.ok(html.includes('Expected')||html.includes('EXPECTED'));
  });
}
test('required source is genuinely absent and fixed variant supplies it',async()=>{
  const raw=await get('/error-fixtures/required-missing').then(r=>r.text());assert.ok(!raw.includes('data-qa-field="required"'));
  assert.ok(!Object.hasOwn(ld(raw),'qaRequired'));
  const fixed=await get('/error-fixtures/required-missing?variant=fixed').then(r=>r.text());assert.ok(fixed.includes('data-qa-field="required"'));
});
test('single-value fixture contains two separate DOM values and array entries',async()=>{
  const raw=await get('/error-fixtures/single-value').then(r=>r.text());assert.equal([...raw.matchAll(/data-qa-field="category"/g)].length,2);
  assert.deepEqual(ld(raw).qaCategory,['Cardiology','Neurology']);
});
test('all saved-message pages escape probes and retain navigation',async()=>{
  for (const fixture of getSavedCases(base)) {
    const response=await get(`/error-details/messages/${fixture.id}`);const html=await response.text();
    assert.equal(response.status,200);assert.ok(html.includes('data-go="/error-details"'));
    assert.ok(!/<img\s/i.test(html));assert.ok(!/<b>qa_single_s<\/b>/.test(html));
    if (fixture.expected.show_details) assert.ok(html.includes('id="reference-details"'));
    else assert.ok(!html.includes('id="reference-details"'));
  }
});
test('source responses are HEAD-compatible and all new routes reject writes',async()=>{
  for (const path of ['/error-details','/error-fixtures/single-value','/api/error-details/saved-messages']) {
    const head=await fetch(base+path,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
    const post=await fetch(base+path,{method:'POST'});assert.equal(post.status,405);await post.text();
  }
});
test('invalid case and invalid variant are explicit errors',async()=>{
  for(const path of ['/error-details/scenarios/absent','/error-details/messages/SM99','/error-fixtures/absent']) {
    const response=await get(path);assert.equal(response.status,404);await response.text();
  }
  const response=await get('/error-fixtures/single-value?variant=typo');assert.equal(response.status,400);await response.text();
});
test('robots excludes new instruction pages but not new source documents',async()=>{
  const robots=await get('/robots.txt').then(r=>r.text());assert.ok(robots.includes('Disallow: /error-details'));
  assert.ok(!robots.includes('Disallow: /error-fixtures'));
});
test('new fixtures do not enter original manifest or sitemaps',async()=>{
  const manifest=await get('/api/manifest?profile=mixed').then(r=>r.json());assert.equal(manifest.records.length,15292);
  assert.ok(manifest.records.every(row=>!row.path.startsWith('/error-')));
  const sitemap=await get('/sitemaps/cases.xml').then(r=>r.text());assert.ok(!sitemap.includes('/error-fixtures/'));
});
for(const fixture of getSavedCases('https://example.invalid')) {
  test(`${fixture.id} prepared reference satisfies selected checker assertions (not product acceptance)`,()=>{
    const response={data:{details:fixture.expected.show_details?fixture.reference_details:null}};
    const report=checkErrorDetails(response,fixture,{detailsPath:'data.details'});
    assert.ok(report.api_checks_passed,JSON.stringify(report));assert.equal(report.ui_validated,false);assert.equal(report.preservation_checked,false);
  });
}
test('checker rejects missing details for a nonempty saved message',()=>{
  const fixture=getSavedCases(base)[0];assert.equal(checkErrorDetails({},fixture,{detailsPath:'data.details'}).api_checks_passed,false);
});
test('checker rejects a non-string details object',()=>{
  const fixture=getSavedCases(base)[0];assert.equal(checkErrorDetails({details:{message:fixture.reference_details}},fixture,{detailsPath:'details'}).api_checks_passed,false);
});
test('checker detects raw secret duplication outside the details property',()=>{
  const fixture=getSavedCases(base).find(f=>f.id==='SM07');
  const response={details:fixture.reference_details,raw:fixture.manager_saved_fields.status_message};
  assert.equal(checkErrorDetails(response,fixture,{detailsPath:'details'}).api_checks_passed,false);
});
test('checker flags stale details for empty-message fixture',()=>{
  const fixture=getSavedCases(base).find(f=>f.id==='SM14');
  assert.equal(checkErrorDetails({details:'stale previous-run error'},fixture,{detailsPath:'details'}).api_checks_passed,false);
});
test('checker verifies original code, summary and guidance and fails when changed',()=>{
  const fixture=getSavedCases(base)[0];const before={code:'EXAMPLE',summary:'Original summary',guidance:['Original guidance']};
  const after={...before,details:fixture.reference_details};
  const options={detailsPath:'details',baseline:before,preservePaths:['code','summary','guidance']};
  assert.equal(checkErrorDetails(after,fixture,options).api_checks_passed,true);
  assert.equal(checkErrorDetails({...after,summary:'Changed'},fixture,options).api_checks_passed,false);
  assert.equal(checkErrorDetails(after,fixture,{...options,preservePaths:['missing.path']}).api_checks_passed,false);
});
test('checker fails setup with unresolved response path or missing preservation baseline',()=>{
  const fixture=getSavedCases(base)[0];assert.throws(()=>checkErrorDetails({},fixture));
  assert.throws(()=>checkErrorDetails({},fixture,{detailsPath:'details',preservePaths:['code']}));
});
