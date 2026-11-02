import test, {before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createApp} from '../server.mjs';
import {configuration} from '../lib/catalog.mjs';
import {FIELDS,SCENARIOS,getDocument,startPath} from '../lib/error-details-data.mjs';
import {getSavedCases} from '../lib/error-details-messages.mjs';
import {WORKFLOWS} from '../lib/error-details-workflows.mjs';
import {checkErrorDetails} from '../lib/error-details-checker.mjs';
let app,base;
before(async()=>{
 app=await createApp(configuration({ADMIN_TOKEN:'LOCAL_TEST_ONLY',DELAY_MS:'25'}));
 await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 base=`http://127.0.0.1:${app.server.address().port}`;
});
after(async()=>{app.server.closeAllConnections();await new Promise(resolve=>app.server.close(resolve));});
const get=p=>fetch(base+p);
const ld=t=>JSON.parse(t.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

test('v4 defines 80 unique cases with distinct IDs',()=>{
 const ids=[...SCENARIOS.map(x=>x.caseId),...getSavedCases(base).map(x=>x.id),...WORKFLOWS.map(x=>x.id)];
 assert.equal(ids.length,80);assert.equal(new Set(ids).size,80);
 assert.equal(WORKFLOWS.length,12);
});
test('v4 dashboard includes filters, truthful counters and all categories',async()=>{
 const text=await get('/error-details').then(r=>r.text());
 for(const token of ['id="case-search"','id="category-filter"','id="clear-filters"','id="workflow-picker"','All 80 cases','<strong>28</strong>','<strong>40</strong>','<strong>12</strong>']) assert.ok(text.includes(token),token);
 assert.equal([...text.matchAll(/data-case-card/g)].length,28);
});
test('checklist and markdown exports cover all IDs without remote scripts',async()=>{
 for(const path of ['/error-details/checklist','/error-details/case-matrix.md']){
  const r=await get(path);assert.equal(r.status,200);assert.match(r.headers.get('x-robots-tag'),/noindex/);
  const text=await r.text();for(const id of ['FD27','SM40','WF12'])assert.ok(text.includes(id));
 }
});
for(const w of WORKFLOWS){
 test(`${w.id} guided instructions render with noindex and navigation`,async()=>{
  const r=await get(`/error-details/workflows/${w.id}`);assert.equal(r.status,200);assert.match(r.headers.get('x-robots-tag'),/noindex/);
  const text=await r.text();assert.ok(text.includes(w.id));assert.ok(text.includes('Expected result'));assert.ok(text.includes('data-go="/error-details"'));assert.ok(text.includes('Website Creator : Shubham Sharma'));
 });
}
test('workflow API is descriptive, HEAD-safe, noindex and read-only',async()=>{
 const r=await get('/api/error-details/workflows');const json=await r.json();assert.equal(json.cases.length,12);assert.match(json.warning,/not executed/);
 const head=await fetch(base+'/api/error-details/workflows',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
 const post=await fetch(base+'/api/error-details/workflows',{method:'POST'});assert.equal(post.status,405);
 assert.equal((await get('/error-details/workflows/WF99')).status,404);
});
test('null, absent, empty string and empty array are distinct inputs',async()=>{
 const paths=['required-null','required-missing','required-empty','required-empty-array'];const docs={};
 for(const id of paths){const text=await get('/error-fixtures/'+id).then(r=>r.text());docs[id]=ld(text);if(id==='required-null')assert.ok(!text.includes('data-qa-field="required"'));}
 assert.ok(Object.hasOwn(docs['required-null'],'qaRequired'));assert.equal(docs['required-null'].qaRequired,null);
 assert.ok(!Object.hasOwn(docs['required-missing'],'qaRequired'));assert.equal(docs['required-empty'].qaRequired,'');assert.deepEqual(docs['required-empty-array'].qaCategory,[]);
});
test('object-valued input emits JSON object, not a fake scalar XPath',async()=>{
 const text=await get('/error-fixtures/object-as-scalar').then(r=>r.text());assert.deepEqual(ld(text).qaNumber,{value:42});assert.ok(!text.includes('data-qa-field="number"'));
 const setup=await get('/error-details/scenarios/object-as-scalar').then(r=>r.text());assert.ok(setup.includes('JSON-LD only'));assert.ok(setup.includes('Do not use the displayed XPath'));
});
test('numeric limits are exact strings and fixed values are actual boundaries',()=>{
 assert.equal(getDocument('integer-overflow').data.qaNumber,'2147483648');assert.equal(getDocument('integer-overflow',true).data.qaNumber,'2147483647');
 assert.equal(getDocument('integer-underflow').data.qaNumber,'-2147483649');assert.equal(getDocument('integer-underflow',true).data.qaNumber,'-2147483648');
});
test('positive zero and false survive source rendering and fixed controls',async()=>{
 for(const [id,key,val] of [['zero-value','qaNumber',0],['false-value','qaFlag',false]]){
  for(const fixed of [false,true]){
   const s=SCENARIOS.find(s=>s.id===id);const text=await get(startPath(s,fixed)).then(r=>r.text());assert.equal(ld(text)[key],val);
  }
 }
});
test('cardinality cases model distinct one, two and 24-value inputs',()=>{
 assert.equal(getDocument('comma-single-string').data.qaCategory.length,1);
 assert.deepEqual(getDocument('duplicate-values').data.qaCategory,['Cardiology','Cardiology']);
 assert.equal(getDocument('many-values').data.qaCategory.length,24);assert.equal(new Set(getDocument('many-values').data.qaCategory).size,24);
});
test('mixed numeric array corrects only intended invalid member',()=>{
 assert.deepEqual(getDocument('mixed-integer-array').data.qaScores,[10,'NOT_AN_INTEGER',30]);
 assert.deepEqual(getDocument('mixed-integer-array',true).data.qaScores,[10,20,30]);
});
test('all sources have field descriptors and do not mutate shared controls',()=>{
 const names=new Set(FIELDS.map(f=>f.source));
 for(const s of SCENARIOS){for(const key of s.map)assert.ok(names.has(key));const d=getDocument(s.id);d.data.qaCategory.push('MUTATION');assert.ok(!getDocument(s.id).data.qaCategory.includes('MUTATION'));}
});
test('repository JSON snapshots match current scenario and workflow inventories',async()=>{
 const load=async name=>JSON.parse(await readFile(new URL('../data/'+name,import.meta.url),'utf8'));
 const live=await load('error-details-scenarios.json');assert.equal(live.scenarios.length,28);assert.deepEqual(live.fields,FIELDS);
 for(const s of live.scenarios)assert.deepEqual(s.values,getDocument(s.id).data);
 const saved=await load('error-details-saved-messages.json');assert.deepEqual(saved.cases,getSavedCases('https://YOUR-SERVICE.onrender.com'));
 const workflows=await load('error-details-workflows.json');assert.deepEqual(workflows.cases,WORKFLOWS);
});
const canary='QA_ONLY_PERCENT_SECRET';
const percent=s=>[...s].map(c=>'%'+c.charCodeAt(0).toString(16)).join('');
for(const [label,encode] of [
 ['percent',percent],['double percent',s=>percent(percent(s))],['numeric entity',s=>[...s].map(c=>'&#'+c.charCodeAt(0)+';').join('')],['hex entity',s=>[...s].map(c=>'&#x'+c.charCodeAt(0).toString(16)+';').join('')],['unicode escape',s=>[...s].map(c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')).join('')]
]){
 test(`checker rejects ${label}-encoded canary in a secondary response property`,()=>{
  const fixture=getSavedCases(base).find(s=>s.id==='SM23');
  const response={details:fixture.reference_details,debug:{context:encode(canary)}};
  const report=checkErrorDetails(response,fixture,{detailsPath:'details'});assert.equal(report.api_checks_passed,false);
  assert.ok(!JSON.stringify(report).includes(canary),'Report must not echo the secret');
 });
}
test('unexpected input type fixtures load without trimming non-strings',()=>{
 const saved=getSavedCases(base);for(const id of ['SM34','SM35','SM36','SM37']){
  const s=saved.find(s=>s.id===id);assert.equal(s.expected.show_details,false);assert.match(s.scope,/contract/);
  assert.equal(checkErrorDetails({details:null},s,{detailsPath:'details'}).api_checks_passed,true);
  assert.equal(checkErrorDetails({details:s.manager_saved_fields.status_message},s,{detailsPath:'details'}).api_checks_passed,false);
 }
});
test('literal null string is different from JSON null',()=>{
 const saved=getSavedCases(base);const literal=saved.find(s=>s.id==='SM33');
 assert.equal(literal.expected.show_details,true);assert.equal(checkErrorDetails({details:null},literal,{detailsPath:'details'}).api_checks_passed,false);
 assert.equal(checkErrorDetails({details:'null'},literal,{detailsPath:'details'}).api_checks_passed,true);
});
test('checker detects known Basic authorization canary without generic decoding',()=>{
 const s=getSavedCases(base).find(s=>s.id==='SM39');assert.equal(checkErrorDetails({details:s.reference_details,debug:s.manager_saved_fields.status_message},s,{detailsPath:'details'}).api_checks_passed,false);
});
test('tail secret and sensitive-looking field identities are checked independently',()=>{
 for(const id of ['SM32','SM40']){
  const s=getSavedCases(base).find(s=>s.id===id);assert.equal(checkErrorDetails({details:s.manager_saved_fields.status_message},s,{detailsPath:'details'}).api_checks_passed,false);
  assert.equal(checkErrorDetails({details:s.reference_details},s,{detailsPath:'details'}).api_checks_passed,true);
 }
});
