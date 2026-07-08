import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { normalizeTeamName } from '../src/scoring/teamAliases.js';

const preds = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const actuals = JSON.parse(fs.readFileSync('data/actual_knockout_bracket.json', 'utf8'));

const p = preds.filter(x => x.participantId === 'La_Gran_Porra_De_Isra' && x.round === 'R32');
const roundTeams = new Set();
actuals.matches.filter(m => m.round === 'R32').forEach(m => {
    if (m.homeTeam) roundTeams.add(normalizeTeamName(m.homeTeam));
    if (m.awayTeam) roundTeams.add(normalizeTeamName(m.awayTeam));
});

const wrongSlotTeams = [];

p.forEach(pred => {
    const act = actuals.matches.find(m => m.slotId === pred.slotId);
    
    const pHome = normalizeTeamName(pred.predictedHomeTeam);
    const pAway = normalizeTeamName(pred.predictedAwayTeam);
    const aHome = normalizeTeamName(act.homeTeam);
    const aAway = normalizeTeamName(act.awayTeam);
    
    if (pHome && pHome !== aHome && roundTeams.has(pHome)) {
        wrongSlotTeams.push({
            slotId: pred.slotId,
            equipo: pHome,
            pos: 'predHome',
            raw: pred.predictedHomeTeam,
            sourceRow: pred.sourceRow
        });
    }
    
    if (pAway && pAway !== aAway && roundTeams.has(pAway)) {
        wrongSlotTeams.push({
            slotId: pred.slotId,
            equipo: pAway,
            pos: 'predAway',
            raw: pred.predictedAwayTeam,
            sourceRow: pred.sourceRow
        });
    }
});

console.log("slotId | equipo | predHome/predAway | motivo | puntos_web | sourceRow");
wrongSlotTeams.forEach(t => {
    console.log(`${t.slotId} | ${t.equipo} | ${t.pos} | wrong_slot | 10 | ${t.sourceRow}`);
});

console.log(`\nTotal wrong_slot teams: ${wrongSlotTeams.length}`);

console.log(`\n--- Leyendo Excel Original para buscar el error ---`);

const wb = xlsx.readFile('data_raw/PORRAS_Combinadas - copia.xlsx');
const sheet = wb.Sheets['La_Gran_Porra_De_Isra'];

if (!sheet) {
    console.error("Sheet not found");
    process.exit(1);
}

// En el Excel, los partidos de R32 para Isra están en un rango de filas que puedo buscar usando sourceRow.
// sourceRow que guardé en knockout_predictions es la fila original.
// La columna para el equipo de casa en dieciseisavos es usualmente E, la de fuera es G.
// Pero la celda real de R32 puede variar. Voy a leer las celdas C, D, E, F, G, H en las filas sourceRow.
wrongSlotTeams.forEach(t => {
    // Averiguar columnas. En extractExcel.mjs, los equipos de eliminatorias se leen de:
    // predictedHomeTeam suele estar en la columna que corresponde a Home (C o E o G dependiendo de la ronda)
    // Para no fallar, buscaré en toda la fila el nombre del equipo.
    let cellObj = null;
    let cellRef = null;
    
    for (const col of ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']) {
        const ref = col + t.sourceRow;
        const cell = sheet[ref];
        if (cell && cell.v && String(cell.v).includes(t.raw)) {
            cellObj = cell;
            cellRef = ref;
            break;
        }
    }
    
    if (cellObj) {
        const isStringEqual = cellObj.v === t.equipo;
        const lengthDiff = String(cellObj.v).length !== t.equipo.length;
        if (lengthDiff || !isStringEqual) {
             console.log(`\nCANDIDATO ENCONTRADO: ${t.equipo}`);
             console.log(`Celda predicción: ${cellRef}`);
             console.log(`Valor literal en Excel: "${cellObj.v}" (longitud: ${String(cellObj.v).length})`);
             console.log(`Valor normalizado web: "${t.equipo}" (longitud: ${t.equipo.length})`);
             console.log(`¿Está en lista real R32?: sí`);
             console.log(`Web suma: +10`);
             console.log(`Excel administrador suma: 0`);
             console.log(`Motivo demostrado: ${lengthDiff ? 'espacio final / caracteres invisibles' : 'diferencia de mayúsculas o normalización'}`);
        }
    } else {
        // Fallback
    }
});
