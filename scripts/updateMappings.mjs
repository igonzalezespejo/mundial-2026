import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const manualPath = path.join(ROOT_DIR, 'data', 'manual_results.json');
const bracketPath = path.join(ROOT_DIR, 'data', 'bracket_template_2026.json');

const manualData = JSON.parse(fs.readFileSync(manualPath, 'utf8'));
const bracketData = JSON.parse(fs.readFileSync(bracketPath, 'utf8'));

// Swap in manual_results.json
// We want:
// R32-02 -> Brasil vs Japón (Match 76)
// R32-03 -> Alemania vs Paraguay (Match 74)
// R32-04 -> Países Bajos vs Marruecos (Match 75)

const m76 = manualData.knockoutResults.find(m => m.matchNo === 76);
const m74 = manualData.knockoutResults.find(m => m.matchNo === 74);
const m75 = manualData.knockoutResults.find(m => m.matchNo === 75);

m76.slotId = 'R32-02';
m74.slotId = 'R32-03';
m75.slotId = 'R32-04';

// Sort by slotId within round
manualData.knockoutResults.sort((a, b) => {
    if (a.round === b.round) {
        return a.slotId.localeCompare(b.slotId);
    }
    return 0; // simplistic, sufficient here
});

fs.writeFileSync(manualPath, JSON.stringify(manualData, null, 2), 'utf8');

// Also update bracket_template_2026.json
const b76 = bracketData.find(m => m.matchNo === 76);
const b74 = bracketData.find(m => m.matchNo === 74);
const b75 = bracketData.find(m => m.matchNo === 75);

b76.slotId = 'R32-02';
b74.slotId = 'R32-03';
b75.slotId = 'R32-04';

fs.writeFileSync(bracketPath, JSON.stringify(bracketData, null, 2), 'utf8');

console.log("Mappings updated!");
