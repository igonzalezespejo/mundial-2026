import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

const map = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'excel_row_match_map.json'), 'utf8'));
const preds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'predictions.json'), 'utf8'));
const kPreds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'knockout_predictions.json'), 'utf8'));
const results = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'results.json'), 'utf8'));
const bracket = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'bracket_template_2026.json'), 'utf8'));

let errors = 0;

// Duplicates in map
const matchNos = map.map(m => m.matchNo);
const duplicates = matchNos.filter((item, index) => matchNos.indexOf(item) !== index);
if (duplicates.length > 0) {
    console.error(`ERROR: Duplicated matchNos found in map: ${[...new Set(duplicates)]}`);
    errors++;
}

// Apuestas sin matchNo
for (const p of preds) {
    if (!p.matchNo) {
        console.error(`ERROR: Prediction without matchNo: ${JSON.stringify(p)}`);
        errors++;
    }
}
for (const p of kPreds) {
    if (['R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL'].includes(p.round) && !p.matchNo) {
        console.error(`ERROR: Knockout Prediction without matchNo: ${JSON.stringify(p)}`);
        errors++;
    }
}

// matchId generado por orden (e.g. GROUP-xxx instead of MATCH-xxx)
for (const p of preds) {
    if (p.matchId.startsWith('GROUP-')) {
        console.error(`ERROR: matchId uses old GROUP- format: ${p.matchId}`);
        errors++;
    }
}

// slotId que no coincide con matchNo en la plantilla
for (const p of kPreds) {
    if (['R32', 'R16', 'QF', 'SF'].includes(p.round)) {
        const tSlot = bracket.find(t => t.slotId === p.slotId);
        if (tSlot && tSlot.matchNo !== p.matchNo) {
            console.error(`ERROR: Knockout Prediction slotId ${p.slotId} has matchNo ${p.matchNo} but template has ${tSlot.matchNo}`);
            errors++;
        }
    }
}

if (errors > 0) {
    console.error(`Match mapping integrity check failed with ${errors} errors.`);
    process.exit(1);
} else {
    console.log(`Match mapping integrity check passed.`);
}
