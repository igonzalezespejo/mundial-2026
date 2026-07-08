import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

function main() {
    const args = process.argv.slice(2);
    let roundFilter = null;
    if (args.includes('--round')) {
        const roundIdx = args.indexOf('--round') + 1;
        if (roundIdx < args.length) {
            roundFilter = args[roundIdx];
        }
    }

    console.log(`Comparing ranking against valid control table${roundFilter ? ` for ${roundFilter}` : ''}...\n`);

    const controlPath = path.join(DATA_DIR, 'control_scores_valid.json');
    const rankingPath = path.join(DATA_DIR, 'ranking.json');

    if (!fs.existsSync(controlPath) || !fs.existsSync(rankingPath)) {
        console.error('Missing control_scores_valid.json or ranking.json');
        process.exit(1);
    }

    const controlData = JSON.parse(fs.readFileSync(controlPath, 'utf8'));
    const rankingData = JSON.parse(fs.readFileSync(rankingPath, 'utf8'));

    const rankingMap = new Map(rankingData.map(r => [r.participantId, r]));

    let matched = 0;
    let missing = 0;
    let mismatches = 0;

    console.log("Participante | R32 esperado | R32 actual | diff");
    console.log('-'.repeat(80));

    for (const ctrl of controlData) {
        const actual = rankingMap.get(ctrl.participantId);
        if (!actual) {
            console.log(`${ctrl.participantId} | MISSING | - | - | -`);
            missing++;
            continue;
        }

        const roundKey = roundFilter || 'R32'; // Fallback to R32 if none provided, though usually we pass it
        const expR32 = ctrl.expected[roundKey];
        const actR32 = actual.roundPoints[roundKey];

        if (expR32 !== actR32) {
            const diff = actR32 - expR32;
            console.log(`${ctrl.participantId.padEnd(25)} | ${String(expR32).padEnd(12)} | ${String(actR32).padEnd(10)} | ${diff > 0 ? '+' : ''}${diff}`);
            mismatches++;
        }
        
        matched++;
    }

    console.log('-'.repeat(80));
    console.log(`Participantes control: ${controlData.length}`);
    console.log(`Participantes encontrados: ${matched}`);
    console.log(`Participantes missing: ${missing}`);
    console.log(`Mismatches ${roundFilter || 'TOTAL'}: ${mismatches}`);

    if (missing > 0) {
        console.error(`\n[ERROR] Faltan ${missing} participantes en el ranking frente al control.`);
        process.exit(1);
    }

    if (mismatches > 0) {
        process.exit(1);
    }
}

main();
