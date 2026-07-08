import fs from 'fs';

const predictionsFile = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const manualResultsFile = JSON.parse(fs.readFileSync('data/manual_results.json', 'utf8'));

// Escenario C mapping: Map slots according to the user's order in predictions?
// Let's look at what the user predicted for the first 8 slots.
// If the Excel was evaluated in a specific order, let's just create a custom mapping based on the actual matches but permuted to match the participant's slots where applicable!
// Actually, let's just find the exact matching match for each prediction.
// Wait, the "lista de resultados recibida" might be:
// 1. South Africa vs Canada (M73) -> R32-01
// 2. Brazil vs Japan (M76) -> R32-02
// 3. Germany vs Paraguay (M74) -> R32-03
// 4. Netherlands vs Morocco (M75) -> R32-04
// Let's just create this custom map.

const baseMatches = {};
for (const m of manualResultsFile.knockoutResults.filter(m => m.round === 'R32' && m.status === 'FINISHED')) {
    baseMatches[m.matchNo] = m;
}

// Custom R32 mapping based on hypothesis
const customMatchesC = {
    "R32-01": baseMatches[73], // Sudáfrica vs Canadá
    "R32-02": baseMatches[76], // Brasil vs Japón
    "R32-03": baseMatches[74], // Alemania vs Paraguay
    "R32-04": baseMatches[75], // Países Bajos vs Marruecos
    "R32-05": baseMatches[77], // Francia vs Suecia
    "R32-06": baseMatches[78], // Costa de Marfil vs Noruega
    "R32-07": baseMatches[79], // México vs Ecuador
    "R32-08": baseMatches[80], // Inglaterra vs RD Congo
    "R32-09": baseMatches[81], // Estados Unidos vs Bosnia
    "R32-10": baseMatches[82], // Bélgica vs Senegal
    "R32-11": baseMatches[83], // Portugal vs Croacia
    "R32-12": baseMatches[84], // España vs Austria
    "R32-13": baseMatches[85], // Suiza vs Argelia
    "R32-14": baseMatches[86], // Argentina vs Cabo Verde
    "R32-15": baseMatches[87], // Colombia vs Ghana
    "R32-16": baseMatches[88]  // Australia vs Egipto
};

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

const runScenario = (participantName, isCumulative, matchMapping) => {
    const preds = predictionsFile.filter(p => (p.participantId === participantName || p.username === participantName) && p.round === 'R32');
    let total = 0;
    
    const roundTeams = new Set();
    for (const slot in matchMapping) {
        if (matchMapping[slot]) {
            roundTeams.add(matchMapping[slot].homeTeam);
            roundTeams.add(matchMapping[slot].awayTeam);
        }
    }

    for (const pred of preds) {
        const slotId = pred.slotId;
        const actualSlot = matchMapping[slotId];
        if (!actualSlot) continue;

        let homePts = 0;
        let awayPts = 0;
        let scoreBonus = 0;

        const predHome = getAliases(pred.predictedHomeTeam);
        const predAway = getAliases(pred.predictedAwayTeam);
        const actHome = getAliases(actualSlot.homeTeam);
        const actAway = getAliases(actualSlot.awayTeam);

        let homeExact = false;
        let awayExact = false;

        if (predHome) {
            if (predHome === actHome) {
                homeExact = true;
                homePts = isCumulative ? 30 : 20;
            } else if (roundTeams.has(predHome)) {
                homePts = 10;
            }
        }

        if (predAway) {
            if (predAway === actAway) {
                awayExact = true;
                awayPts = isCumulative ? 30 : 20;
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

// Base mapping (A)
const baseMapping = {};
for (const m of manualResultsFile.knockoutResults.filter(m => m.round === 'R32')) {
    baseMapping[m.slotId] = m;
}

console.log("Participante | Control | Escenario A | Escenario B | Escenario C (Normal) | Escenario C (Acumulativo) | Mejor ajuste");
const controls = { "Juan Ruiz Torres": 500, "La_Gran_Porra_De_Isra": 470, "Antequera": 500 };

for (const p of Object.keys(controls)) {
    const scA = runScenario(p, false, baseMapping);
    const scB = runScenario(p, true, baseMapping);
    const scCNormal = runScenario(p, false, customMatchesC);
    const scCAccum = runScenario(p, true, customMatchesC);
    
    let best = "Ninguno";
    const ctrl = controls[p];
    if (scA === ctrl) best = "Escenario A";
    else if (scB === ctrl) best = "Escenario B";
    else if (scCNormal === ctrl) best = "Escenario C (Normal)";
    else if (scCAccum === ctrl) best = "Escenario C (Acumulativo)";

    console.log(`${p} | ${ctrl} | ${scA} | ${scB} | ${scCNormal} | ${scCAccum} | ${best}`);
}
