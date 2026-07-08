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
        
        if (!r.groupMatchPoints) {
            errors.push(`Ranking participant ${r.participantId} has no groupMatchPoints object`);
        } else {
            let groupSum = 0;
            for (const key in r.groupMatchPoints) {
                groupSum += r.groupMatchPoints[key];
            }
            if (groupSum !== r.groupPoints) {
                errors.push(`Ranking participant ${r.participantId} groupMatchPoints sum (${groupSum}) does not match groupPoints (${r.groupPoints})`);
            }
        }
        
        if (!r.knockoutMatchPoints) {
            errors.push(`Ranking participant ${r.participantId} has no knockoutMatchPoints object`);
        } else {
            // Validate sum for R32
            let r32Sum = 0;
            for (let i = 1; i <= 16; i++) {
                const slot = `R32-${i.toString().padStart(2, '0')}`;
                if (typeof r.knockoutMatchPoints[slot] === 'number') {
                    r32Sum += r.knockoutMatchPoints[slot];
                }
            }
            if (r32Sum !== (r.roundPoints.R32 || 0)) {
                errors.push(`Ranking participant ${r.participantId} R32 sum (${r32Sum}) does not match roundPoints.R32 (${r.roundPoints.R32})`);
            }

            // Validate sum for R16
            let r16Sum = 0;
            for (let i = 1; i <= 8; i++) {
                const slot = `R16-${i.toString().padStart(2, '0')}`;
                if (typeof r.knockoutMatchPoints[slot] === 'number') {
                    r16Sum += r.knockoutMatchPoints[slot];
                }
            }
            if (r16Sum !== (r.roundPoints.R16 || 0)) {
                errors.push(`Ranking participant ${r.participantId} R16 sum (${r16Sum}) does not match roundPoints.R16 (${r.roundPoints.R16})`);
            }
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

    // 4. Import validation for appData in app.js
    const appJsContent = fs.readFileSync(path.join(SRC_DIR, 'app.js'), 'utf8');
    if (appJsContent.includes('appData')) {
        const hasImport = appJsContent.includes("import {") && 
                          appJsContent.includes("appData") && 
                          appJsContent.includes("dataLoader.js");
        const exactMatch = /import\s+{[^}]*appData[^}]*}\s+from\s+['"].*dataLoader\.js['"]/.test(appJsContent);
        if (!exactMatch) {
            errors.push("src/app.js uses appData but does not import it correctly from dataLoader.js");
        }
    }

    if (errors.length > 0) {
        console.error("Frontend Check Failed (Data/Paths):", errors);
        process.exit(1);
    }

    console.log("Frontend Check Complete. Status: OK");
}

main();
