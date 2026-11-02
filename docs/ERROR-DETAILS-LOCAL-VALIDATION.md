> Historical evidence retained from the supplied v3 package. For this release, see [V4-LOCAL-VALIDATION.md](V4-LOCAL-VALIDATION.md).

# v3 local validation report

Scope: generated fixture website and helper scripts only. No deployment to the user's GitHub or Render account, no actual SearchStax crawl, and no Studio Backend/frontend acceptance run was performed.

## Executed checks

- `npm ci --ignore-scripts`: dependency-free package installed successfully.
- `npm test`: **85 tests passed; 0 failed**. Includes all 35 original tests and 50 new tests for routing, input values, safe fixture rendering, empty-message cases and response-checker behavior.
- Full local HTTP check: **15,020 checks passed; 0 failed**, requesting every one of the **15,000** original valid URLs. Original manifest remains 15,292 fixture URLs (15,000 valid + 292 extras).
- XPath/HTML and rendering checks: **122 passed; 0 failed**. Actual served HTML was compared with advertised selectors for all 8 source documents and their corrected variants. Desktop and mobile rendered layouts were inspected for horizontal overflow. Prepared text previews did not interpret the harmless markup as DOM.
- CLI synthetic response self-test passed; explicitly not a real platform response.

## Browser limitation

Browser policy blocked direct local URL navigation. HTML/CSS fetched from local server was rendered with set_content. Actual browser navigation/clipboard permission success was not end-to-end tested. HTTP routes and copy fallback were tested separately.

The completed browser checks verify the generated fixture's rendered content and copy fallback only, not the SearchStax UI. Dashboard-return destinations are covered by HTTP route and markup tests, but a full click-through browser navigation test must be performed after deployment.

## Reproduce core checks

```bash
npm ci
npm test
npm start
```

In another terminal, against your own authorized fixture service:

```bash
npm run verify -- --base http://localhost:3000 --all-valid --concurrency 8 --pause-ms 1 --out reports/origin-check.json
```

For a hosted free service, use a conservative rate rather than copying the local concurrency as a performance recommendation. Local origin checks create request observations; reset the old suite before a stateful crawler run. The new error-details pages themselves are stateless.

## Evidence files

- `v3-unit-tests.tap`
- `v3-origin-verification.json`
- `v3-browser-validation.json`
- `error-details-dashboard-preview.png`
- `error-details-mobile-preview.png`

All prepared expected-detail previews are illustrations. They do not demonstrate backend sanitization or successful SearchStax acceptance.
