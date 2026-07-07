import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const SRC_DIR = path.join(ROOT_DIR, 'src');

function main() {
    let errors = [];

    // 1. Files existence
    const requiredFiles = [
        'index.html',
        'styles/main.css',
        'src/app.js',
        'src/dataLoader.js',
        'src/rankingView.js',
        'src/participantView.js',
        'src/groupView.js',
        'src/bracketView.js',
        'src/utils.js',
        'data/ranking.json',
        'data/participants.json',
        'data/predictions.json',
        'data/knockout_predictions.json',
        'data/group_standings_predictions.json',
        'data/bracket_template_2026.json',
        'data/actual_knockout_bracket.json'
    ];

    requiredFiles.forEach(file => {
        if (!fs.existsSync(path.join(ROOT_DIR, file))) {
            errors.push(`Missing file: ${file}`);
        }
    });

    if (errors.length > 0) {
        console.error("Frontend Check Failed (Missing Files):", errors);
        process.exit(1);
    }

    // 2. Data validation
    const ranking = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ranking.json'), 'utf8'));
    const participants = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'participants.json'), 'utf8'));
    const groupPreds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'predictions.json'), 'utf8'));
    const koPreds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'knockout_predictions.json'), 'utf8'));

    if (ranking.length === 0) errors.push("ranking.json is empty");
    
    ranking.forEach(r => {
        if (!participants.find(p => p.participantId === r.participantId)) {
            errors.push(`Ranking participant ${r.participantId} not found in participants.json`);
        }
        if (!r.roundPoints) {
            errors.push(`Ranking participant ${r.participantId} has no roundPoints object`);
        } else {
            const requiredRounds = ['R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL', 'CHAMPION'];
            requiredRounds.forEach(round => {
                if (typeof r.roundPoints[round] !== 'number') {
                    errors.push(`Ranking participant ${r.participantId} roundPoints missing ${round}`);
                }
            });
        }
    });

    if (groupPreds.length === 0) errors.push("No group predictions found");
    if (koPreds.length === 0) errors.push("No knockout predictions found");

    koPreds.forEach(p => {
        if (p.round === 'CHAMPION') {
            if (p.team && !isNaN(Number(p.team))) {
                errors.push(`CHAMPION prediction for ${p.participantId} is numeric/date: ${p.team}`);
            }
        }
    });

    // 3. Absolute path check in dataLoader
    const dataLoaderContent = fs.readFileSync(path.join(SRC_DIR, 'dataLoader.js'), 'utf8');
    if (dataLoaderContent.includes("fetch('/data/")) {
        errors.push("dataLoader.js contains absolute paths to /data/. Use relative paths (./data/).");
    }

    if (errors.length > 0) {
        console.error("Frontend Check Failed (Data/Paths):", errors);
        process.exit(1);
    }

    console.log("Frontend Check Complete. Status: OK");
}

main();
