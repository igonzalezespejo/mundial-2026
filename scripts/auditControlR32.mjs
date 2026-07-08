import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const rankingPath = path.join(ROOT_DIR, 'data', 'ranking.json');

if (!fs.existsSync(rankingPath)) {
    console.error('ranking.json not found!');
    process.exit(1);
}

const ranking = JSON.parse(fs.readFileSync(rankingPath, 'utf8'));

const expected = {
  "Juan Ruiz Torres": {
    groupPoints: 425,
    R32: 500
  },
  "La_Gran_Porra_De_Isra": {
    groupPoints: 375,
    R32: 470
  },
  "Antequera": {
    groupPoints: 325,
    R32: 500
  }
};

let errors = 0;

for (const participantId of Object.keys(expected)) {
    const entry = ranking.find(r => r.participantId === participantId);
    if (!entry) {
        console.error(`Participant ${participantId} not found in ranking.json`);
        errors++;
        continue;
    }

    const { groupPoints, R32 } = expected[participantId];
    let actualGroup = entry.groupPoints;
    let actualR32 = entry.roundPoints ? entry.roundPoints['R32'] : undefined;

    let groupOk = actualGroup === groupPoints;
    let r32Ok = actualR32 === R32;

    const groupStr = `group ${actualGroup} ` + (groupOk ? 'OK' : `FAIL (expected ${groupPoints})`);
    const r32Str = `R32 ${actualR32} ` + (r32Ok ? 'OK' : `FAIL (expected ${R32})`);

    console.log(`${participantId}: ${groupStr}, ${r32Str}`);

    if (!groupOk || !r32Ok) {
        errors++;
    }
}

if (errors > 0) {
    console.error(`\nValidation failed with ${errors} errors.`);
    process.exit(1);
}

console.log("\nAll controls passed successfully!");
