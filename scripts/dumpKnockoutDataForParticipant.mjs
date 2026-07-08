import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

const targetName = process.argv[2];

if (!targetName) {
    console.error('Usage: node scripts/dumpKnockoutDataForParticipant.mjs "Nombre Participante"');
    process.exit(1);
}

const predictions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'knockout_predictions.json'), 'utf8'));
const manualResults = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'manual_results.json'), 'utf8'));
const actualBracket = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'actual_knockout_bracket.json'), 'utf8'));
const bracketTemplate = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'bracket_template_2026.json'), 'utf8'));

const userPreds = predictions.filter(p => p.participantId === targetName && p.round === 'R32');

console.log(`\n=== A) Predicciones R32 de ${targetName} ===`);
console.log(`slotId | predHome | predAway | predScore`);
for (const p of userPreds) {
    console.log(`${p.slotId.padEnd(8)} | ${p.predictedHomeTeam?.padEnd(15)} | ${p.predictedAwayTeam?.padEnd(15)} | ${p.predictedHomeGoals}-${p.predictedAwayGoals}`);
}

console.log(`\n=== B) Resultados R32 manuales ===`);
console.log(`slotId | matchNo | homeTeam | awayTeam | score | winner`);
const manualR32 = manualResults.knockoutResults.filter(r => r.round === 'R32');
for (const r of manualR32) {
    console.log(`${r.slotId.padEnd(8)} | ${String(r.matchNo).padEnd(7)} | ${r.homeTeam?.padEnd(15)} | ${r.awayTeam?.padEnd(15)} | ${r.homeGoals}-${r.awayGoals} | ${r.winner}`);
}

console.log(`\n=== C) Actual Knockout Bracket R32 ===`);
console.log(`slotId | matchNo | homeTeam | awayTeam | score | winner`);
for (const slotId in actualBracket.matches) {
    const m = actualBracket.matches[slotId];
    if (m.round === 'R32') {
        console.log(`${slotId.padEnd(8)} | ${String(m.matchNo).padEnd(7)} | ${m.homeTeam?.padEnd(15)} | ${m.awayTeam?.padEnd(15)} | ${m.homeGoals}-${m.awayGoals} | ${m.winner}`);
    }
}

console.log(`\n=== D) Bracket Template R32 ===`);
console.log(`slotId | matchNo | homeSource | awaySource`);
const templateR32 = bracketTemplate.filter(t => t.round === 'R32');
for (const t of templateR32) {
    console.log(`${t.slotId.padEnd(8)} | ${String(t.matchNo).padEnd(7)} | ${t.homeSource?.padEnd(20)} | ${t.awaySource?.padEnd(20)}`);
}
