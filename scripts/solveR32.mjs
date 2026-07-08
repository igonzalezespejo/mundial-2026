import fs from 'fs';
import { normalizeTeamName } from '../src/scoring/teamAliases.js';

const preds = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const actuals = JSON.parse(fs.readFileSync('data/actual_knockout_bracket.json', 'utf8'));
const control = JSON.parse(fs.readFileSync('data/control_scores_valid.json', 'utf8'));

const actualContext = { matches: {}, teamsByRound: { 'R32': new Set() } };
for (const m of actuals.matches) {
    if (m.round !== 'R32') continue;
    actualContext.matches[m.slotId] = m;
    if (m.homeTeam) actualContext.teamsByRound['R32'].add(normalizeTeamName(m.homeTeam));
    if (m.awayTeam) actualContext.teamsByRound['R32'].add(normalizeTeamName(m.awayTeam));
}

const participantsData = [];
for (const ctrl of control) {
    const pId = ctrl.participantId;
    const pPreds = preds.filter(p => p.participantId === pId && p.round === 'R32');
    
    let baseCount = 0;
    let exactCount = 0;
    let bonusCount = 0;
    
    pPreds.forEach(p => {
        const act = actualContext.matches[p.slotId];
        if (!act || act.status === 'PENDING') return;
        
        const pHome = normalizeTeamName(p.predictedHomeTeam);
        const pAway = normalizeTeamName(p.predictedAwayTeam);
        const aHome = normalizeTeamName(act.homeTeam);
        const aAway = normalizeTeamName(act.awayTeam);
        
        let hExact = false;
        let aExact = false;
        
        if (pHome) {
            if (pHome === aHome) { exactCount++; hExact = true; }
            else if (actualContext.teamsByRound['R32'].has(pHome)) baseCount++;
        }
        if (pAway) {
            if (pAway === aAway) { exactCount++; aExact = true; }
            else if (actualContext.teamsByRound['R32'].has(pAway)) baseCount++;
        }
        
        if (hExact && aExact && p.predictedHomeGoals === act.homeGoals && p.predictedAwayGoals === act.awayGoals) {
            bonusCount++;
        }
    });
    
    participantsData.push({
        id: pId,
        expected: ctrl.expected.R32,
        baseCount,
        exactCount,
        bonusCount
    });
}

// Find combination of Base, Exact, and Bonus points
let found = false;
for (let base = 10; base <= 10; base += 5) {
    for (let exact = 30; exact <= 30; exact += 5) {
        for (let bonus = 20; bonus <= 20; bonus += 5) {
            let mismatches = 0;
            for (const p of participantsData) {
                const score = p.baseCount * base + p.exactCount * exact + p.bonusCount * bonus;
                if (score !== p.expected) {
                    mismatches++;
                    console.log(`Mismatch ${p.id}: Expected ${p.expected}, got ${score}`);
                }
            }
            console.log(`Base: ${base}, Exact: ${exact}, Bonus: ${bonus} -> Mismatches: ${mismatches}`);
            if (mismatches === 0) found = true;
        }
    }
}
if (!found) console.log("No perfect combination found.");
