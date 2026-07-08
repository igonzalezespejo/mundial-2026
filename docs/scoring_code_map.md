# Mapa de Código del Scoring

## Fase de grupos
- **Archivo:** `src/scoring/group.js`
- **Función:** `scoreGroupMatch(prediction, actualMatch)`
- **JSONs que lee:** `data/predictions.json`, `data/results.json`
- **JSONs que genera:** N/A (calculado en memoria o validación temporal)

## Eliminatorias
- **Archivo:** `src/scoring/knockout.js`
- **Función:** `scoreKnockoutParticipant(participantPredictions, actualKnockoutContext)`, `scoreChampion(predictedChamp, actualChamp)`
- **JSONs que lee:** `data/knockout_predictions.json`, `data/actual_knockout_bracket.json`
- **JSONs que genera:** N/A (calculado en memoria por scripts)

## Ranking
- **Archivo:** `src/scoring/ranking.js`
- **Función:** `calculateRanking(participants, groupMatches, groupPredictions, knockoutMatches, knockoutPredictions)`
- **JSONs que lee:** `data/participants.json`, `data/results.json`, `data/predictions.json`, `data/actual_knockout_bracket.json`, `data/knockout_predictions.json`
- **JSONs que genera:** `data/ranking.json`, `data/group_standings_actual.json`, `data/group_standings_predictions.json`

## Resultados manuales
- **Archivo:** `scripts/buildActualResults.mjs`
- **Función:** `main()`
- **JSONs que lee:** `data/manual_results.json`, `data/bracket_template_2026.json`, `data/matches.json`
- **JSONs que genera:** `data/actual_knockout_bracket.json`, `data/manual_results_validation.json`, `data/results.json` (actualiza fase de grupos si hay datos)
