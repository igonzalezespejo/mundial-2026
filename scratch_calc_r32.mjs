import fs from 'fs';
import { normalizeTeamName } from './src/scoring/teamAliases.js';

const preds = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const actual = JSON.parse(fs.readFileSync('data/actual_knockout_bracket.json', 'utf8'));

const targets = ["Javier Alcala", "PAULA"];

const actualTeams = new Set();
actual.matches.filter(m => m.round === 'R32').forEach(m => {
    actualTeams.add(normalizeTeamName(m.homeTeam));
    actualTeams.add(normalizeTeamName(m.awayTeam));
});

for (const pName of targets) {
    const pPreds = preds.filter(p => p.participantId === pName && p.round === 'R32');
    
    let basePts = 0;
    let exactPts = 0;
    let bonusPts = 0;
    
    console.log(`\n--- Participant: ${pName} ---`);
    for (const p of pPreds) {
        const aMatch = actual.matches.find(m => m.slotId === p.slotId);
        
        const predHome = normalizeTeamName(p.predictedHomeTeam);
        const predAway = normalizeTeamName(p.predictedAwayTeam);
        const actHome = normalizeTeamName(aMatch.homeTeam);
        const actAway = normalizeTeamName(aMatch.awayTeam);
        
        let matchPts = 0;
        let homeExact = false;
        let awayExact = false;
        
        if (predHome) {
            if (predHome === actHome) {
                basePts += 10;
                exactPts += 10;
                matchPts += 20;
                homeExact = true;
            } else if (actualTeams.has(predHome)) {
                basePts += 10;
                matchPts += 10;
            } else {
                console.log(`  MISS: ${predHome} (Predicted Home, Slot ${p.slotId}) did not advance`);
            }
        }
        
        if (predAway) {
            if (predAway === actAway) {
                basePts += 10;
                exactPts += 10;
                matchPts += 20;
                awayExact = true;
            } else if (actualTeams.has(predAway)) {
                basePts += 10;
                matchPts += 10;
            } else {
                console.log(`  MISS: ${predAway} (Predicted Away, Slot ${p.slotId}) did not advance`);
            }
        }
        
        if (homeExact && awayExact && p.predictedHomeGoals !== null && p.predictedAwayGoals !== null && aMatch.homeGoals !== null && aMatch.awayGoals !== null) {
            if (p.predictedHomeGoals === aMatch.homeGoals && p.predictedAwayGoals === aMatch.awayGoals) {
                if (normalizeTeamName(p.predictedWinner) === normalizeTeamName(aMatch.winner)) {
                    bonusPts += 20;
                    matchPts += 20;
                    console.log(`  BONUS: Exact score for ${predHome} vs ${predAway}`);
                }
            }
        }
    }
    
    const total = basePts + exactPts + bonusPts;
    console.log(`Base: ${basePts}, Exact: ${exactPts}, Bonus: ${bonusPts} => Total: ${total}`);
}
