import fs from 'fs';
import { normalizeTeamName } from './src/scoring/teamAliases.js';

const preds = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const actual = JSON.parse(fs.readFileSync('data/actual_knockout_bracket.json', 'utf8'));
const ranking = JSON.parse(fs.readFileSync('data/ranking.json', 'utf8'));

const targets = ["Javier Alcala", "Brioso", "Cristóbal López", "Manucostcorron", "PAULA"];

for (const pName of targets) {
    const entry = ranking.find(r => r.participantId === pName || r.displayName === pName);
    if (!entry) {
        console.log("NOT FOUND:", pName);
        continue;
    }
    
    const pPreds = preds.filter(p => p.participantId === entry.participantId && p.round === 'R32');
    console.log(`\n--- Participant: ${pName} ---`);
    for (const p of pPreds) {
        const aMatch = actual.matches.find(m => m.slotId === p.slotId);
        if (!aMatch) continue;
        
        const pts = entry.knockoutMatchPoints[p.slotId] || 0;
        
        // We are looking for cases where they predicted a team that actually advanced, but maybe exactPos logic failed
        // Wait, 20 points missing means they missed EXACT_POS or BASE.
        // Let's just print matches where they scored less than 40 and see their teams vs actual teams
        if (pts < 40 && pts > 0) { // Scored 20 maybe? Or scored 0 but they had a team that advanced?
             console.log(`${p.slotId} - Points: ${pts}`);
             console.log(`  Pred: ${p.predictedHomeTeam} vs ${p.predictedAwayTeam}`);
             console.log(`  Act : ${aMatch.homeTeam} vs ${aMatch.awayTeam}`);
             console.log(`  Winner Pred: ${p.predictedWinner}, Winner Act: ${aMatch.winner}`);
        } else if (pts === 0) {
             // Maybe they scored 0 but they should have scored 20?
             // Let's check if any of their predicted teams advanced
             const predHome = normalizeTeamName(p.predictedHomeTeam);
             const predAway = normalizeTeamName(p.predictedAwayTeam);
             const actHome = normalizeTeamName(aMatch.homeTeam);
             const actAway = normalizeTeamName(aMatch.awayTeam);
             if (predHome === actHome || predHome === actAway || predAway === actHome || predAway === actAway) {
                 console.log(`POTENTIAL MISS: ${p.slotId} - Points: 0`);
                 console.log(`  Pred: ${p.predictedHomeTeam} vs ${p.predictedAwayTeam}`);
                 console.log(`  Act : ${aMatch.homeTeam} vs ${aMatch.awayTeam}`);
             }
        }
    }
}
