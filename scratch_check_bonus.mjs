import fs from 'fs';
import { normalizeTeamName } from './src/scoring/teamAliases.js';

const preds = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const actual = JSON.parse(fs.readFileSync('data/actual_knockout_bracket.json', 'utf8'));

const targets = ["Javier Alcala", "Brioso", "Cristóbal López", "Manucostcorron", "PAULA"];

for (const pName of targets) {
    const pPreds = preds.filter(p => p.participantId === pName && p.round === 'R32');
    for (const p of pPreds) {
        const aMatch = actual.matches.find(m => m.slotId === p.slotId);
        
        const predHome = normalizeTeamName(p.predictedHomeTeam);
        const predAway = normalizeTeamName(p.predictedAwayTeam);
        const actHome = normalizeTeamName(aMatch.homeTeam);
        const actAway = normalizeTeamName(aMatch.awayTeam);
        
        let homeExact = (predHome === actHome);
        let awayExact = (predAway === actAway);
        
        if (homeExact && awayExact && p.predictedHomeGoals !== null && p.predictedAwayGoals !== null && aMatch.homeGoals !== null && aMatch.awayGoals !== null) {
            if (p.predictedHomeGoals === aMatch.homeGoals && p.predictedAwayGoals === aMatch.awayGoals) {
                if (normalizeTeamName(p.predictedWinner) !== normalizeTeamName(aMatch.winner)) {
                    console.log(`${pName} - Slot ${p.slotId}: Exact score ${p.predictedHomeGoals}-${p.predictedAwayGoals} but missed winner! Pred Winner: ${p.predictedWinner}, Act Winner: ${aMatch.winner}`);
                }
            }
        }
    }
}
