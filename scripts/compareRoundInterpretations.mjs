import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const targetDisplayName = args[0];
const targetRound = args[1] || 'R16';

const DATA_DIR = path.join(process.cwd(), 'data');
const preds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'knockout_predictions.json'), 'utf8'));
const actual = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'actual_knockout_bracket.json'), 'utf8'));
const participants = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'participants.json'), 'utf8'));
const ranking = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ranking.json'), 'utf8'));

const participant = participants.find(p => p.displayName === targetDisplayName);
if (!participant) {
    console.error(`Participant ${targetDisplayName} not found`);
    process.exit(1);
}

const pId = participant.participantId;
const pRanking = ranking.find(r => r.participantId === pId);
const currentMatchPoints = pRanking.knockoutMatchPoints;

const roundPreds = preds.filter(p => p.participantId === pId && p.round === targetRound);
roundPreds.sort((a,b) => a.slotId.localeCompare(b.slotId));

console.log(`Comparativa ${targetRound} para ${targetDisplayName}:`);
console.log(`slotId | apuesta | real | puntos_actual_web | puntos_interpretacion_por_equipo | diferencia | motivo`);

let nextRound = 'QF'; // for R16
if (targetRound === 'QF') nextRound = 'SF';
if (targetRound === 'SF') nextRound = 'FINAL';

// Find his bets for next round to simulate current logic if needed, but we already have points in ranking.
// Let's implement the alternative interpretation:
// "Por cada equipo acertado en el partido/cruce: +40."
// En R16 la base es 40. Para R32 era 10 + 20 etc, we'll focus on R16 as requested.

roundPreds.forEach(p => {
    const act = actual.matches.find(m => m.slotId === p.slotId);
    if (!act || act.status === 'PENDING') return;

    let apuestaStr = `${p.predictedHomeTeam || '?'}-${p.predictedAwayTeam || '?'}`;
    let realStr = `${act.homeTeam || '?'}-${act.awayTeam || '?'}`;
    
    let ptsActual = currentMatchPoints[p.slotId] || 0;
    
    // Interpretación alternativa:
    let ptsAlternativo = 0;
    let motivoArr = [];
    
    let betTeams = new Set();
    if (p.predictedHomeTeam) betTeams.add(p.predictedHomeTeam.trim());
    if (p.predictedAwayTeam) betTeams.add(p.predictedAwayTeam.trim());
    
    let actTeams = new Set();
    if (act.homeTeam) actTeams.add(act.homeTeam.trim());
    if (act.awayTeam) actTeams.add(act.awayTeam.trim());

    betTeams.forEach(t => {
        if (actTeams.has(t)) {
            ptsAlternativo += 40; // Base para R16
            motivoArr.push(`${t} acertado en cruce`);
        }
    });

    // Check bonus
    if (p.predictedHomeTeam === act.homeTeam && p.predictedAwayTeam === act.awayTeam) {
        if (p.predictedHomeGoals === act.homeGoals && p.predictedAwayGoals === act.awayGoals) {
            if (p.predictedWinner === act.winner) {
                ptsAlternativo += 40;
                motivoArr.push(`Bonus cruzado y resultado exacto`);
            }
        }
    }
    
    if (motivoArr.length === 0) motivoArr.push('Nada acertado en cruce');
    let diff = ptsAlternativo - ptsActual;
    let diffStr = diff > 0 ? `+${diff}` : `${diff}`;

    console.log(`${p.slotId} | ${apuestaStr} | ${realStr} | ${ptsActual} | ${ptsAlternativo} | ${diffStr} | ${motivoArr.join(', ')}`);
});
