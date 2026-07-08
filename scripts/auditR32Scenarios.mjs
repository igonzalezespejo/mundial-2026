import fs from 'fs';

const predictionsFile = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const manualResultsFile = JSON.parse(fs.readFileSync('data/manual_results.json', 'utf8'));
const bracketTemplate = JSON.parse(fs.readFileSync('data/bracket_template_2026.json', 'utf8'));

const bracketDict = {};
const r32Slots = [];
for (const match of bracketTemplate) {
    if (match.round === 'R32') {
        bracketDict[match.slotId] = match;
        r32Slots.push(match.slotId);
    }
}
r32Slots.sort();

console.log("=== TABLA R32 ACTUAL EN MANUAL_RESULTS.JSON ===");
console.log("slotId | matchNo | homeTeam | awayTeam | score | winner");
const actualMatches = {};
const teamsByRound = new Set();

const manualR32 = manualResultsFile.knockoutResults.filter(m => m.round === 'R32' && m.status === 'FINISHED');
for (const m of manualR32) {
    console.log(`${m.slotId} | ${m.matchNo} | ${m.homeTeam} | ${m.awayTeam} | ${m.homeGoals}-${m.awayGoals} | ${m.winner}`);
    actualMatches[m.slotId] = m;
    teamsByRound.add(m.homeTeam);
    teamsByRound.add(m.awayTeam);
}

const getAliases = (name) => {
    const aliases = {
        "Bosnia y Herz.": "Bosnia y Herzegovina",
        "Bosnia y Herzegovina": "Bosnia y Herzegovina",
        "RD Congo": "RD Congo",
        "DR Congo": "RD Congo",
        "Costa de Marfil": "Costa de Marfil",
        "Ivory Coast": "Costa de Marfil",
        "Países Bajos": "Países Bajos",
        "Netherlands": "Países Bajos"
    };
    return aliases[name] || name;
};

// Scenario setup
const runScenario = (participantName, scenario, customMatches) => {
    const preds = predictionsFile.filter(p => (p.participantId === participantName || p.username === participantName) && p.round === 'R32');
    let total = 0;
    
    // For Scenario C, we re-evaluate teamsByRound based on customMatches
    const roundTeams = new Set();
    for (const slot in customMatches) {
        roundTeams.add(customMatches[slot].homeTeam);
        roundTeams.add(customMatches[slot].awayTeam);
    }

    for (const pred of preds) {
        const slotId = pred.slotId;
        const actualSlot = customMatches[slotId];
        if (!actualSlot) continue;

        let homePts = 0;
        let awayPts = 0;
        let scoreBonus = 0;
        
        let homeExact = false;
        let awayExact = false;

        const predHome = getAliases(pred.predictedHomeTeam);
        const predAway = getAliases(pred.predictedAwayTeam);
        
        const actHome = getAliases(actualSlot.homeTeam);
        const actAway = getAliases(actualSlot.awayTeam);

        if (predHome) {
            if (predHome === actHome) {
                homeExact = true;
                if (scenario === 'A' || scenario === 'C') {
                    homePts = 20; // 10 base + 10 exact
                } else if (scenario === 'B') {
                    homePts = 30; // 10 base + 20 exact
                }
            } else if (roundTeams.has(predHome)) {
                homePts = 10;
            }
        }

        if (predAway) {
            if (predAway === actAway) {
                awayExact = true;
                if (scenario === 'A' || scenario === 'C') {
                    awayPts = 20;
                } else if (scenario === 'B') {
                    awayPts = 30;
                }
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

const expectedControl = {
    "Juan Ruiz Torres": 500,
    "La_Gran_Porra_De_Isra": 470,
    "Antequera": 500
};

// Custom matches for Scenario C
const customMatches = {};
// Sort manualR32 by matchNo? Or order of arrival?
// The user gave an example:
// 1. South Africa vs Canada
// 2. Brazil vs Japan
// 3. Germany vs Paraguay
// 4. Netherlands vs Morocco
// This matches: 
// South Africa vs Canada -> M73 (R32-01)
// Brazil vs Japan -> ? Actually Brazil vs Japan is M76 (R32-04) but maybe it should be R32-02?
// Let's create a hypothetical Scenario C where we reassign slots based on the "order of matches" as if they just played sequentially and were mapped to R32-01, R32-02, etc.

// But wait, the list provided by user:
// 1. South Africa vs Canada
// 2. Brazil vs Japan
// 3. Germany vs Paraguay
// 4. Netherlands vs Morocco
// Let's see if we can find this list in the predictions!
// The user says "qué pasa si los resultados se asignan en el orden de la lista de resultados recibida".

console.log("\n=== COMPARATIVA DE ESCENARIOS ===");
console.log("Participante | Control | Escenario A | Escenario B | Escenario C | Mejor ajuste");

// For Scenario C, let's just use the order of manualR32 but assigned to r32Slots in order.
// Wait, manualR32 is ALREADY sorted by slotId!
// Is there a different order?
// Let's try to map the actual matches to the slots that the users predicted mostly!
// What if we remap based on their predictions?
// Actually, let's just output A and B first to see if B is exactly matching!

for (const p of Object.keys(expectedControl)) {
    const scA = runScenario(p, 'A', actualMatches);
    const scB = runScenario(p, 'B', actualMatches);
    const scC = runScenario(p, 'C', actualMatches); // We will refine C if needed
    
    let best = "Ninguno";
    const ctrl = expectedControl[p];
    if (scA === ctrl) best = "Escenario A";
    else if (scB === ctrl) best = "Escenario B";
    else if (scC === ctrl) best = "Escenario C";

    console.log(`${p} | ${ctrl} | ${scA} | ${scB} | ${scC} | ${best}`);
}

// Check Alias impact
console.log("\n=== IMPACTO DE ALIAS ===");
const runScenarioWithoutAliases = (participantName, scenario, customMatches) => {
    const preds = predictionsFile.filter(p => (p.participantId === participantName || p.username === participantName) && p.round === 'R32');
    let total = 0;
    const roundTeams = new Set();
    for (const slot in customMatches) {
        roundTeams.add(customMatches[slot].homeTeam);
        roundTeams.add(customMatches[slot].awayTeam);
    }
    for (const pred of preds) {
        const slotId = pred.slotId;
        const actualSlot = customMatches[slotId];
        if (!actualSlot) continue;
        let homePts = 0; let awayPts = 0; let scoreBonus = 0;
        let homeExact = false; let awayExact = false;
        
        const predHome = pred.predictedHomeTeam;
        const predAway = pred.predictedAwayTeam;
        const actHome = actualSlot.homeTeam;
        const actAway = actualSlot.awayTeam;

        if (predHome) {
            if (predHome === actHome) { homeExact = true; homePts = (scenario === 'A' ? 20 : 30); }
            else if (roundTeams.has(predHome)) homePts = 10;
        }
        if (predAway) {
            if (predAway === actAway) { awayExact = true; awayPts = (scenario === 'A' ? 20 : 30); }
            else if (roundTeams.has(predAway)) awayPts = 10;
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

for (const p of Object.keys(expectedControl)) {
    const withAliases = runScenario(p, 'B', actualMatches); 
    const withoutAliases = runScenarioWithoutAliases(p, 'B', actualMatches);
    if (withAliases !== withoutAliases) {
        console.log(`${p}: alias impact = +${withAliases - withoutAliases} puntos`);
    } else {
        console.log(`${p}: no alias impact`);
    }
}
