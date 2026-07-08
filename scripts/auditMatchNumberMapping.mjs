import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

const participantId = process.argv[2] || 'Menuda_Porra_la_de_AHR';

const map = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'excel_row_match_map.json'), 'utf8'));
const preds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'knockout_predictions.json'), 'utf8'));
const actual = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'actual_knockout_bracket.json'), 'utf8'));

const pPreds = preds.filter(p => p.participantId === participantId && ['R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL'].includes(p.round));

console.log('sourceRow | visualOrder | matchNo | round | slotId | participantExample | predHome | predAway | actualHome | actualAway | puntos');

pPreds.sort((a,b) => a.sourceRow - b.sourceRow);

for (const p of pPreds) {
    const mapEntry = map.find(m => m.sourceRow === p.sourceRow);
    const visualOrder = mapEntry ? mapEntry.visualOrder : '?';
    const matchNo = p.matchNo || (mapEntry ? mapEntry.matchNo : '?');
    
    const actMatch = actual.matches.find(m => m.slotId === p.slotId);
    const actHome = actMatch ? actMatch.homeTeam : '-';
    const actAway = actMatch ? actMatch.awayTeam : '-';
    
    // Puntos (approximation or via snapshot if needed)
    // we just put '-' since we don't have the live points here unless we load ranking.
    // The prompt just asks for "puntos" in the final output for AMG 87 and 88.
    
    console.log(`${p.sourceRow} | ${visualOrder} | ${matchNo} | ${p.round} | ${p.slotId} | ${participantId} | ${p.predictedHomeTeam} | ${p.predictedAwayTeam} | ${actHome} | ${actAway} | -`);
}
