import fs from 'fs';

const predictionsFile = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const manualResultsFile = JSON.parse(fs.readFileSync('data/manual_results.json', 'utf8'));

// Actual teams that reached R16 are the winners of R32 matches
const actualR16Teams = new Set();
for (const m of manualResultsFile.knockoutResults) {
    if (m.round === 'R32' && m.status === 'FINISHED' && m.winner) {
        actualR16Teams.add(m.winner);
    }
}

console.log("Teams in R16:", Array.from(actualR16Teams));

for (const p of ["Juan Ruiz Torres", "La_Gran_Porra_De_Isra", "Antequera"]) {
    // A team is predicted to reach R16 if it's the predictedWinner of an R32 match
    const r32Preds = predictionsFile.filter(x => (x.participantId === p || x.username === p) && x.round === 'R32');
    let predictedR16Teams = new Set();
    for (const pred of r32Preds) {
        if (pred.predictedWinner) predictedR16Teams.add(pred.predictedWinner);
    }

    let correctR16Teams = 0;
    for (const team of predictedR16Teams) {
        if (actualR16Teams.has(team)) correctR16Teams++;
    }
    
    console.log(`${p}: ${correctR16Teams} correct teams advanced to R16`);
}
