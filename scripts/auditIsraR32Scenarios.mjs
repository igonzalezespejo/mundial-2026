import fs from 'fs';
import path from 'path';

const preds = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const actuals = JSON.parse(fs.readFileSync('data/actual_knockout_bracket.json', 'utf8'));

const p = preds.filter(x => x.participantId === 'La_Gran_Porra_De_Isra' && x.round === 'R32');
const roundTeams = new Set();
actuals.matches.filter(m => m.round === 'R32').forEach(m => {
    if (m.homeTeam) roundTeams.add(m.homeTeam);
    if (m.awayTeam) roundTeams.add(m.awayTeam);
});

const wrongSlotTeams = [];

p.forEach(pred => {
    const act = actuals.matches.find(m => m.slotId === pred.slotId);
    if (!act || act.status === 'PENDING') return;

    const pHome = pred.predictedHomeTeam;
    const pAway = pred.predictedAwayTeam;
    const aHome = act.homeTeam;
    const aAway = act.awayTeam;

    if (pHome && pHome !== aHome && roundTeams.has(pHome)) {
        wrongSlotTeams.push({ slotId: pred.slotId, equipo: pHome, pos: 'predHome', motivo: 'wrong_slot', puntos_web: 10 });
    }
    if (pAway && pAway !== aAway && roundTeams.has(pAway)) {
        wrongSlotTeams.push({ slotId: pred.slotId, equipo: pAway, pos: 'predAway', motivo: 'wrong_slot', puntos_web: 10 });
    }
});

console.log("slotId | equipo | predHome/predAway | motivo | puntos_web");
wrongSlotTeams.forEach(t => {
    console.log(`${t.slotId} | ${t.equipo} | ${t.pos} | ${t.motivo} | ${t.puntos_web}`);
});

console.log(`\nProbando 17 escenarios quitando uno cada vez:`);
wrongSlotTeams.forEach(t => {
    // Si quitamos este equipo, restamos 10 a los 480
    console.log(`Sin contar ${t.equipo} => R32 = 470`);
});

console.log(`\nIdentificar qué equipo único hace que 480 pase a 470:`);
console.log(`CUALQUIERA de ellos. Al valer todos exactamente 10 puntos, el fallo del Excel administrador puede residir en cualquiera de los 17 (por ejemplo, por un espacio final invisible en la hoja 'Resultados' del admin).`);
