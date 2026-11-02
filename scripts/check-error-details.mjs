import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { getSavedCases } from '../lib/error-details-messages.mjs';
import { checkErrorDetails } from '../lib/error-details-checker.mjs';

const help = `Check a captured Studio Backend response (no network calls).
Usage:
  npm run check:error-details -- --response actual.json --case SM07 --details-path data.YOUR_DETAILS_FIELD
Optional:
  --baseline before.json --preserve-paths data.YOUR_CODE,data.YOUR_SUMMARY,data.YOUR_GUIDANCE
  --fixtures custom-saved-message-fixtures.json
  --out reports/error-details-check.json
Use actual response paths, not the illustrative names above. UI checks remain manual.
Exit codes: 0 selected API assertions passed, 1 assertions failed, 2 input/setup error.`;
try {
  const args = process.argv.slice(2);
  if (args.includes('--help')) { console.log(help); process.exit(0); }
  const allowed = new Set(['response','case','details-path','baseline','preserve-paths','fixtures','out']);
  const options = {};
  for (let i=0;i<args.length;i+=2) {
    const key = args[i].replace(/^--/, '');
    if (!args[i].startsWith('--') || !allowed.has(key) || !args[i+1] || args[i+1].startsWith('--')) throw new Error('Unknown or incomplete option. Use --help.');
    options[key]=args[i+1];
  }
  for (const key of ['response','case','details-path']) if (!options[key]) throw new Error(`Missing --${key}. Use --help.`);
  if (Boolean(options.baseline) !== Boolean(options['preserve-paths'])) throw new Error('Use --baseline and --preserve-paths together.');
  const load = async path => JSON.parse(await readFile(path,'utf8'));
  const response = await load(options.response);
  const fixtures = options.fixtures ? (await load(options.fixtures)).cases : getSavedCases('https://YOUR-SERVICE.onrender.com');
  if (!Array.isArray(fixtures)) throw new Error('Fixture JSON needs a cases array.');
  const fixture = fixtures.find(c => c.id === options.case);
  if (!fixture) throw new Error('Unknown saved-message case.');
  const report = checkErrorDetails(response, fixture, {
    detailsPath:options['details-path'],
    baseline:options.baseline ? await load(options.baseline) : undefined,
    preservePaths:options['preserve-paths'] ? options['preserve-paths'].split(',').map(x => x.trim()).filter(Boolean) : []
  });
  if (options.out) { await mkdir(dirname(options.out), {recursive:true}); await writeFile(options.out,JSON.stringify(report,null,2)+'\n'); }
  console.log(JSON.stringify(report,null,2));
  process.exitCode = report.api_checks_passed ? 0 : 1;
} catch (error) {
  console.error(`Error-details checker setup error: ${error.message}`);
  process.exitCode=2;
}
