# v4 changelog

- Retained the original 15,000-valid + 292-additional suite and all original failure-lab routes.
- Expanded crawler cases from 8 to 28, saved-message inputs from 18 to 40, and added 12 guided product checks: 80 total definitions, 54 new.
- Added empty/null/array distinctions, numeric limits, calendar/timezone edges, duplicate/large arrays, JSON shapes, Boolean coercion and false-positive controls.
- Added nested/encoded/signed/malformed URL inputs, literal markup/entities, long tail-secret input, Basic auth, malformed message types and over-redaction checks.
- Added searchable/category-filtered catalog, full checklist, workflow pages, Markdown downloads and workflow JSON API.
- Enhanced known-canary checking using bounded decoded views; retained explicit limitations and same-run guidance preservation checks.
- Kept creator credit, return-to-dashboard buttons and GitHub/Render settings.

Product results are not inferred from local fixture validation. See V4-LOCAL-VALIDATION.md for actual local execution evidence.
