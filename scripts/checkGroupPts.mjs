import fs from 'fs';
import { calculateGlobalRanking } from '../src/scoring/ranking.js';

const participants = JSON.parse(fs.readFileSync('../data/participants.json', 'utf8'));
const groupPredictions = JSON.parse(fs.readFileSync('../data/predictions.json', 'utf8'));
const groupResults = JSON.parse(fs.readFileSync('../data/manual_results.json', 'utf8')).groupResults;
const knockoutPredictions = JSON.parse(fs.readFileSync('../data/knockout_predictions.json', 'utf8'));
const manualResults = JSON.parse(fs.readFileSync('../data/manual_results.json', 'utf8'));

const bracketTemplate = JSON.parse(fs.readFileSync('../data/bracket_template_2026.json', 'utf8'));

// Build knockoutContext
const actualMatches = {};
const teamsByRound = { 'R32': new Set() };
for (const templateMatch of bracketTemplate) {
    if (templateMatch.round !== 'R32') continue;
    const manualResult = manualResults.knockoutResults.find(m => m.matchNo === templateMatch.matchNo);
    if (manualResult && manualResult.status === 'FINISHED') {
        actualMatches[templateMatch.slotId] = {
            status: 'FINISHED',
            homeTeam: manualResult.homeTeam,
            awayTeam: manualResult.awayTeam,
            homeGoals: manualResult.homeGoals,
            awayGoals: manualResult.awayGoals
        };
        teamsByRound['R32'].add(manualResult.homeTeam);
        teamsByRound['R32'].add(manualResult.awayTeam);
    } else {
        actualMatches[templateMatch.slotId] = { status: 'PENDING' };
    }
}
const knockoutContext = { status: 'IN_PROGRESS', matches: actualMatches };

const ranking = calculateGlobalRanking(participants, groupPredictions, groupResults, knockoutPredictions, knockoutContext);

for (const p of ["Juan Ruiz Torres", "La_Gran_Porra_De_Isra", "Antequera"]) {
    const rankData = ranking.find(r => r.displayName === p);
    if (rankData) {
        console.log(`${p}: GroupPts=${rankData.groupPoints}, R32Pts=${rankData.roundPoints.R32}`);
    }
}
