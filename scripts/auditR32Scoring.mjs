import fs from 'fs';
import path from 'path';

// Load necessary files
const predictionsFile = JSON.parse(fs.readFileSync('data/knockout_predictions.json', 'utf8'));
const manualResultsFile = JSON.parse(fs.readFileSync('data/manual_results.json', 'utf8'));
const bracketTemplate = JSON.parse(fs.readFileSync('data/bracket_template_2026.json', 'utf8'));

// Convert bracketTemplate to dictionary by slotId
const bracketDict = {};
for (const match of bracketTemplate) {
    bracketDict[match.slotId] = match;
}

// Build actualKnockoutContext for R32
const actualMatches = {};
const teamsByRound = { 'R32': new Set() };

for (const matchId in bracketDict) {
    const templateMatch = bracketDict[matchId];
    if (templateMatch.round !== 'R32') continue;

    const manualResult = manualResultsFile.knockoutResults.find(m => m.matchNo === templateMatch.matchNo);
    
    if (manualResult && manualResult.status === 'FINISHED') {
        actualMatches[matchId] = {
            status: 'FINISHED',
            homeTeam: manualResult.homeTeam,
            awayTeam: manualResult.awayTeam,
            homeGoals: manualResult.homeGoals,
            awayGoals: manualResult.awayGoals
        };
        teamsByRound['R32'].add(manualResult.homeTeam);
        teamsByRound['R32'].add(manualResult.awayTeam);
    } else {
        actualMatches[matchId] = { status: 'PENDING' };
    }
}

const getPointsDef = (round) => {
    switch (round) {
        case 'R32': return { base: 10, exactPos: 10, bonus: 20 };
        default: return null;
    }
};

const expectedControl = {
  "Juan Ruiz Torres": 500,
  "La_Gran_Porra_De_Isra": 470,
  "Antequera": 500
};

const participantsToAudit = process.argv.slice(2);
if (participantsToAudit.length === 0) {
    console.error("Please provide at least one participant name.");
    process.exit(1);
}

for (const participantName of participantsToAudit) {
    const predictions = predictionsFile.filter(p => p.participantId === participantName || p.username === participantName);
    
    if (predictions.length === 0) {
        console.log(`Participant not found: ${participantName}`);
        continue;
    }

    let totalR32 = 0;
    console.log(`\nParticipant: ${participantName}`);
    if (expectedControl[participantName] !== undefined) {
        console.log(`Expected/control R32 if provided: ${expectedControl[participantName]}`);
    }

    const tableRows = [];

    for (const pred of predictions) {
        if (pred.round !== 'R32') continue;
        const slotId = pred.slotId;
        const templateMatch = bracketDict[slotId];
        const actualSlot = actualMatches[slotId];
        
        if (!actualSlot || actualSlot.status === 'PENDING') {
            continue;
        }

        const def = getPointsDef('R32');
        let pts = 0;
        let homePts = 0;
        let awayPts = 0;
        let scoreBonus = 0;
        const roundTeams = teamsByRound['R32'];

        let homeExactPos = false;
        let awayExactPos = false;
        let reason = [];

        if (pred.predictedHomeTeam) {
            if (actualSlot.homeTeam === pred.predictedHomeTeam) {
                homePts = def.base + def.exactPos;
                homeExactPos = true;
                reason.push("home exact");
            } else if (roundTeams.has(pred.predictedHomeTeam)) {
                homePts = def.base;
                reason.push("home in round");
            } else {
                reason.push("home missing");
            }
        }

        if (pred.predictedAwayTeam) {
            if (actualSlot.awayTeam === pred.predictedAwayTeam) {
                awayPts = def.base + def.exactPos;
                awayExactPos = true;
                reason.push("away exact");
            } else if (roundTeams.has(pred.predictedAwayTeam)) {
                awayPts = def.base;
                reason.push("away in round");
            } else {
                reason.push("away missing");
            }
        }

        if (homeExactPos && awayExactPos) {
            if (pred.predictedHomeGoals !== null && pred.predictedAwayGoals !== null &&
                actualSlot.homeGoals !== null && actualSlot.awayGoals !== null) {
                if (pred.predictedHomeGoals === actualSlot.homeGoals &&
                    pred.predictedAwayGoals === actualSlot.awayGoals) {
                    scoreBonus = def.bonus;
                    reason.push("score exact");
                }
            }
        }

        pts = homePts + awayPts + scoreBonus;
        totalR32 += pts;

        tableRows.push({
            slotId,
            matchNo: templateMatch.matchNo,
            source: templateMatch.source || `${templateMatch.homeSource} vs ${templateMatch.awaySource}`,
            predHome: pred.predictedHomeTeam,
            predAway: pred.predictedAwayTeam,
            predScore: `${pred.predictedHomeGoals}-${pred.predictedAwayGoals}`,
            actualHome: actualSlot.homeTeam,
            actualAway: actualSlot.awayTeam,
            actualScore: `${actualSlot.homeGoals}-${actualSlot.awayGoals}`,
            homePts,
            awayPts,
            scoreBonus,
            slotTotal: pts,
            reason: reason.join(", ")
        });
    }

    console.log(`Current JS R32: ${totalR32}\n`);
    
    // Print table
    console.log("slotId | matchNo | source | predHome | predAway | predScore | actualHome | actualAway | actualScore | homePts | awayPts | scoreBonus | slotTotal | reason");
    for (const row of tableRows) {
        console.log(`${row.slotId} | ${row.matchNo} | ${row.source} | ${row.predHome} | ${row.predAway} | ${row.predScore} | ${row.actualHome} | ${row.actualAway} | ${row.actualScore} | ${row.homePts} | ${row.awayPts} | ${row.scoreBonus} | ${row.slotTotal} | ${row.reason}`);
    }
    console.log(`\nTOTAL R32 = ${totalR32}`);
    
    if (expectedControl[participantName] !== undefined) {
        console.log(`\n${participantName}: JS ${totalR32} vs expected ${expectedControl[participantName]} => diff ${totalR32 - expectedControl[participantName]}`);
    }
}
