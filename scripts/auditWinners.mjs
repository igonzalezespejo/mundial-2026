import fs from 'fs';
const predictionsFile = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const manualResultsFile = JSON.parse(fs.readFileSync('data/manual_results.json', 'utf8'));

const actualMatches = {};
for (const m of manualResultsFile.knockoutResults) {
    if (m.round === 'R32' && m.status === 'FINISHED') {
        actualMatches[m.slotId] = m.winner;
    }
}

for (const p of ["Juan Ruiz Torres", "La_Gran_Porra_De_Isra", "Antequera"]) {
    const preds = predictionsFile.filter(x => x.participantId === p || x.username === p).filter(x => x.round === 'R32');
    let correctWinners = 0;
    for (const pred of preds) {
        if (actualMatches[pred.slotId] && actualMatches[pred.slotId] === pred.predictedWinner) {
            correctWinners++;
        }
    }
    console.log(`${p}: ${correctWinners} winners correct in exact slot`);
}
