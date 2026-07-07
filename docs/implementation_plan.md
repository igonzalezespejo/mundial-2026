# Implementation Plan: Porra Mundial 2026 - Phase 1

This plan details the initial architecture and data extraction phase for the static public web application of the Porra Mundial 2026 project.

## Goal Description

The objective of Phase 1 is to create a reproducible Node.js project that can parse the provided Excel file (`PORRAS_Combinadas - copia.xlsx`), extract participant bets and actual results, implement a pure JavaScript scoring engine for the group stage, and validate the JS-calculated points against the points already calculated inside the Excel file. This sets up the foundational data layer before moving to the UI and GitHub Pages deployment.

## User Review Required

> [!IMPORTANT]
> The structure of the project and the contracts for data extraction and scoring are defined below. Please review the proposed architecture and commands.

## Open Questions

> [!WARNING]
> The Excel sheet seems to include timestamps for matches. Do we want to format these to ISO 8601 strings in our JSON exports or keep them as epoch milliseconds? (I will plan to convert them to ISO 8601 for easier reading, unless specified otherwise).

## Proposed Changes

### Project Setup and Architecture

The project will use standard Node.js with ES modules (`type: "module"`). We will use `xlsx` for parsing the Excel file and `vitest` for automated testing.

#### [NEW] package.json
Initialize the Node project, set `"type": "module"`, and add dependencies (`xlsx`) and devDependencies (`vitest`). Define scripts: `extract`, `validate`, and `test`.

#### [NEW] README.md & .gitignore
Standard project documentation and gitignore (ignoring `node_modules` and potentially sensitive raw data depending on user preference, though `data_raw` is kept local).

### Data Extraction Module

A script to read the Excel file and generate clean JSON files.

#### [NEW] scripts/extractExcel.mjs
Reads `data_raw/PORRAS_Combinadas - copia.xlsx`.
- Identifies auxiliary sheets (`Resumen`, `Resultados`, `Evolucion_Puntos`, `Evolucion_Ranking`) and participant sheets.
- Extracts participants list.
- Extracts the match list and real results from the sheets.
- Extracts predictions for each participant.
- Extracts the current points calculated in the Excel for validation.
- Saves data to `data/participants.json`, `data/matches.json`, `data/predictions.json`, `data/results.json`, and `data/excel_points_snapshot.json`.

### Scoring Engine

A pure JavaScript module to handle group stage scoring.

#### [NEW] src/scoring/groupStage.js
Implements:
- `getSign(homeGoals, awayGoals)`
- `scoreGroupMatch(prediction, result)`
- `scoreGroupStageParticipant(predictions, results)`

#### [NEW] src/scoring/utils.js
Helper functions for the scoring engine.

### Validation Script

A script to compare JS scoring against Excel scoring.

#### [NEW] scripts/validateGroupScoring.mjs
Reads the extracted JSON files, recalculates group stage points using `src/scoring/groupStage.js`, compares them with `data/excel_points_snapshot.json`, outputs a summary to the console, and generates `data/scoring_validation.json`.

### Tests

#### [NEW] tests/groupStage.test.js
Unit tests for the scoring rules (exact match, sign match, draw match, etc.).

#### [NEW] tests/extraction.test.js
Basic tests to ensure the extraction logic processes data structures correctly.

### Documentation

#### [NEW] docs/audit_excel_structure.md
Audit report of the Excel file structure, sheets, ranges, columns, and formulas detected (based on extraction findings).

#### [NEW] docs/scoring_contract.md
Documentation of group stage rules, knockout stage planned rules, and differences (if any).

#### [NEW] docs/extraction_contract.md
Documentation of the JSON schemas, ID generation, and handling of invalid/missing data.

#### [NEW] docs/privacy_report.md
Report on any personal data (e.g., emails) detected during extraction.

#### [NEW] docs/next_steps.md
Outline of remaining tasks for future phases.

## Verification Plan

### Automated Tests
- `npm test` to run Vitest unit tests on the scoring engine.

### Manual Verification
- Run `npm run extract` to generate JSON files.
- Run `npm run validate` and review the console output and `data/scoring_validation.json` to ensure 100% match with Excel logic (or explicitly documented discrepancies).
- Review generated documentation in `docs/` for completeness.
