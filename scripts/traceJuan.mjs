import fs from 'fs';
import { normalizeTeamName } from './src/scoring/teamAliases.js';

const preds = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const actuals = JSON.parse(fs.readFileSync('data/actual_knockout_bracket.json', 'utf8'));
const juan = preds.filter(p => p.participantId === 'Juan Ruiz Torres');

const participantTeamsByRound = {};
for (const p of juan) {
    if (!participantTeamsByRound[p.round]) participantTeamsByRound[p.round] = new Set();
    if (p.predictedHomeTeam) participantTeamsByRound[p.round].add(normalizeTeamName(p.predictedHomeTeam));
    if (p.predictedAwayTeam) participantTeamsByRound[p.round].add(normalizeTeamName(p.predictedAwayTeam));
}

let totalR16 = 0;

for (const pred of juan) {
    if (pred.round !== 'R16') continue;
    let pts = 0;
    const def = { base: 40, exactPos: 0, bonus: 40 };
    const actualSlot = actuals.matches[pred.slotId];

    if (!actualSlot || actualSlot.status === 'PENDING') continue;

    const predHome = normalizeTeamName(pred.predictedHomeTeam);
    const predAway = normalizeTeamName(pred.predictedAwayTeam);
    const actHome = normalizeTeamName(actualSlot.homeTeam);
    const actAway = normalizeTeamName(actualSlot.awayTeam);

    if (predHome && predAway && actHome === predHome && actAway === predAway) {
        if (pred.predictedHomeGoals !== null && pred.predictedAwayGoals !== null &&
            actualSlot.homeGoals !== null && actualSlot.awayGoals !== null) {
            if (pred.predictedHomeGoals === actualSlot.homeGoals &&
                pred.predictedAwayGoals === actualSlot.awayGoals) {
                pts += def.bonus;
                console.log(`Bonus added for ${pred.slotId}`);
            }
        }
    }

    if (actualSlot.winner && participantTeamsByRound['QF'] && participantTeamsByRound['QF'].has(normalizeTeamName(actualSlot.winner))) {
        pts += def.base;
        console.log(`Base added for ${pred.slotId}: ${actualSlot.winner}`);
    }

    totalR16 += pts;
    console.log(`Match ${pred.slotId} total points: ${pts}`);
}

console.log(`Total R16 points for Juan: ${totalR16}`);
