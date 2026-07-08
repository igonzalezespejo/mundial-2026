import fs from 'fs';
const preds = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const israPreds = preds.filter(p => p.participantId === 'La_Gran_Porra_De_Isra' && p.round === 'R32');

const actuals = JSON.parse(fs.readFileSync('data/manual_results.json', 'utf8'));
const r32Actuals = actuals.knockoutResults.filter(r => r.round === 'R32' && r.status === 'FINISHED');

const matchMap = {};
for (const r of r32Actuals) {
    matchMap[r.slotId] = r;
}

const teamsRound = new Set();
for (const r of r32Actuals) {
    teamsRound.add(r.homeTeam);
    teamsRound.add(r.awayTeam);
}

let total = 0;
for (const p of israPreds) {
    const act = matchMap[p.slotId];
    if (!act) continue;

    let pts = 0;
    let he = false, ae = false;
    if (p.predictedHomeTeam) {
        if (p.predictedHomeTeam === act.homeTeam) {
            pts += 30; he = true;
        } else if (teamsRound.has(p.predictedHomeTeam)) {
            pts += 10;
        }
    }
    if (p.predictedAwayTeam) {
        if (p.predictedAwayTeam === act.awayTeam) {
            pts += 30; ae = true;
        } else if (teamsRound.has(p.predictedAwayTeam)) {
            pts += 10;
        }
    }
    if (he && ae && p.predictedHomeGoals === act.homeGoals && p.predictedAwayGoals === act.awayGoals) {
        pts += 20;
    }
    console.log(`${p.slotId}: Pred ${p.predictedHomeTeam} vs ${p.predictedAwayTeam} (${p.predictedHomeGoals}-${p.predictedAwayGoals}) | Act ${act.homeTeam} vs ${act.awayTeam} (${act.homeGoals}-${act.awayGoals}) -> ${pts}`);
    total += pts;
}
console.log(`Total Isra R32: ${total}`);
