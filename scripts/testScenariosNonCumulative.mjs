import fs from 'fs';
import path from 'path';

const predictionsFile = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const manualResultsFile = JSON.parse(fs.readFileSync('data/manual_results.json', 'utf8'));

// The mapping based on the visual Excel rows that we just discovered:
// Row 79 (R32-01) -> M73
// Row 80 (R32-02) -> M76
// Row 81 (R32-03) -> M74
// Row 82 (R32-04) -> M75
// (Assuming the rest are strictly M77 to M88 in order, let's just re-map the first 4 since they are the ones we identified as swapped)

// Let's build the "Remap" dictionary where R32-02 maps to M76, R32-03 to M74, R32-04 to M75
const remapMatches = {};
const baseMatches = {};

// Fill baseMatches
for (const m of manualResultsFile.knockoutResults.filter(m => m.round === 'R32' && m.status === 'FINISHED')) {
    baseMatches[m.slotId] = m;
}

// Fill remapMatches based on actual matchNos
const matchesByNo = {};
for (const m of manualResultsFile.knockoutResults.filter(m => m.round === 'R32' && m.status === 'FINISHED')) {
    matchesByNo[m.matchNo] = m;
}

remapMatches["R32-01"] = matchesByNo[73];
remapMatches["R32-02"] = matchesByNo[76]; // Brasil vs Japón
remapMatches["R32-03"] = matchesByNo[74]; // Alemania vs Paraguay
remapMatches["R32-04"] = matchesByNo[75]; // Países Bajos vs Marruecos
// The rest we map sequentially 77 to 88
for (let i = 5; i <= 16; i++) {
    const slotId = `R32-${String(i).padStart(2, '0')}`;
    const matchNo = 72 + i; // 5 -> 77, 16 -> 88
    remapMatches[slotId] = matchesByNo[matchNo];
}

const getAliases = (name) => {
    const aliases = {
        "Bosnia y Herz.": "Bosnia y Herzegovina",
        "RD Congo": "RD Congo",
        "DR Congo": "RD Congo",
        "Costa de Marfil": "Costa de Marfil",
        "Ivory Coast": "Costa de Marfil"
    };
    return aliases[name] || name;
};

const runScenario = (participantName, useAlias, useRemap) => {
    const preds = predictionsFile.filter(p => (p.participantId === participantName || p.username === participantName) && p.round === 'R32');
    let total = 0;
    
    const mappingToUse = useRemap ? remapMatches : baseMatches;
    const roundTeams = new Set();
    
    for (const slot in mappingToUse) {
        if (mappingToUse[slot]) {
            roundTeams.add(mappingToUse[slot].homeTeam);
            roundTeams.add(mappingToUse[slot].awayTeam);
        }
    }

    for (const pred of preds) {
        const slotId = pred.slotId;
        const actualSlot = mappingToUse[slotId];
        if (!actualSlot) continue;

        let homePts = 0;
        let awayPts = 0;
        let scoreBonus = 0;

        const predHome = useAlias ? getAliases(pred.predictedHomeTeam) : pred.predictedHomeTeam;
        const predAway = useAlias ? getAliases(pred.predictedAwayTeam) : pred.predictedAwayTeam;
        const actHome = useAlias ? getAliases(actualSlot.homeTeam) : actualSlot.homeTeam;
        const actAway = useAlias ? getAliases(actualSlot.awayTeam) : actualSlot.awayTeam;

        let homeExact = false;
        let awayExact = false;

        if (predHome) {
            if (predHome === actHome) {
                homeExact = true;
                homePts = 20; // 20 TOTAL
            } else if (roundTeams.has(predHome)) {
                homePts = 10;
            }
        }

        if (predAway) {
            if (predAway === actAway) {
                awayExact = true;
                awayPts = 20; // 20 TOTAL
            } else if (roundTeams.has(predAway)) {
                awayPts = 10;
            }
        }

        if (homeExact && awayExact) {
            if (pred.predictedHomeGoals === actualSlot.homeGoals && pred.predictedAwayGoals === actualSlot.awayGoals) {
                scoreBonus = 20;
            }
        }

        total += homePts + awayPts + scoreBonus;
    }
    return total;
};

const controls = { "Juan Ruiz Torres": 500, "La_Gran_Porra_De_Isra": 470, "Antequera": 500 };

console.log("Participante | Control | Actual JS | Solo alias | Solo remap slots | Alias + remap | ¿cuadra?");
for (const p of Object.keys(controls)) {
    const ctrl = controls[p];
    const actualJS = runScenario(p, false, false);
    const soloAlias = runScenario(p, true, false);
    const soloRemap = runScenario(p, false, true);
    const aliasRemap = runScenario(p, true, true);
    
    const cuadra = (aliasRemap === ctrl) ? "SÍ" : "NO";
    
    console.log(`${p.padEnd(20)} | ${String(ctrl).padEnd(7)} | ${String(actualJS).padEnd(9)} | ${String(soloAlias).padEnd(10)} | ${String(soloRemap).padEnd(16)} | ${String(aliasRemap).padEnd(13)} | ${cuadra}`);
}

