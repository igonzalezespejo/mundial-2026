export function computeGroupStandings(groupPredictions, groupMatches, participantKnockoutPreds, bracketTemplate) {
    const standings = {};
    const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
    
    // Initialize
    for (const groupChar of groups) {
        standings[groupChar] = {};
    }
    
    // Find the teams for each group
    for (const m of groupMatches) {
        const groupChar = m.group;
        if (!groupChar || !standings[groupChar]) continue;
        
        if (!standings[groupChar][m.homeTeam]) standings[groupChar][m.homeTeam] = { team: m.homeTeam, group: groupChar, points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
        if (!standings[groupChar][m.awayTeam]) standings[groupChar][m.awayTeam] = { team: m.awayTeam, group: groupChar, points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 };
    }
    
    // Tally points
    for (const pred of groupPredictions) {
        const match = groupMatches.find(m => m.matchId === pred.matchId);
        if (!match || !match.group) continue;
        
        const home = match.homeTeam;
        const away = match.awayTeam;
        const hg = pred.predictedHomeGoals;
        const ag = pred.predictedAwayGoals;
        const g = match.group;
        
        if (hg === null || ag === null) continue; // Pending/Unpredicted
        
        standings[g][home].goalsFor += hg;
        standings[g][home].goalsAgainst += ag;
        standings[g][away].goalsFor += ag;
        standings[g][away].goalsAgainst += hg;
        
        if (hg > ag) standings[g][home].points += 3;
        else if (hg < ag) standings[g][away].points += 3;
        else {
            standings[g][home].points += 1;
            standings[g][away].points += 1;
        }
    }

    // Build the mapped knockout sources from the participant's predictions
    // e.g. { "México": "2A", "Canadá": "2B" }
    const teamToExtractedSource = {};
    if (participantKnockoutPreds && bracketTemplate) {
        for (const kp of participantKnockoutPreds) {
            if (kp.round === 'R32') {
                const slotDef = bracketTemplate.find(s => s.slotId === kp.slotId);
                if (slotDef) {
                    if (kp.predictedHomeTeam) teamToExtractedSource[kp.predictedHomeTeam] = slotDef.homeSource;
                    if (kp.predictedAwayTeam) teamToExtractedSource[kp.predictedAwayTeam] = slotDef.awaySource;
                }
            }
        }
    }
    
    const finalStandings = [];
    
    for (const g of groups) {
        const teams = Object.values(standings[g]);
        teams.forEach(t => t.goalDifference = t.goalsFor - t.goalsAgainst);
        
        teams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            
            // Tiebreaker via extracted knockout slot
            const sourceA = teamToExtractedSource[a.team];
            const sourceB = teamToExtractedSource[b.team];
            
            // sourceA might be "1A", "2A", "3A", etc.
            if (sourceA && sourceA.endsWith(g) && (!sourceB || !sourceB.endsWith(g))) return -1;
            if (sourceB && sourceB.endsWith(g) && (!sourceA || !sourceA.endsWith(g))) return 1;
            
            if (sourceA && sourceB && sourceA.endsWith(g) && sourceB.endsWith(g)) {
                // e.g. "1A" vs "2A" -> "1A" is better (smaller number)
                const posA = parseInt(sourceA[0]);
                const posB = parseInt(sourceB[0]);
                if (posA !== posB) return posA - posB;
            }
            
            // Fallback deterministic (Alphabetical)
            a.tieBreakSource = "fallback_warning";
            b.tieBreakSource = "fallback_warning";
            return a.team.localeCompare(b.team);
        });
        
        for (let i = 0; i < teams.length; i++) {
            const teamInfo = teams[i];
            const pos = `${i+1}${g}`;
            
            let tbSource = "computed";
            if (teamInfo.tieBreakSource === "fallback_warning") {
                tbSource = "fallback_warning";
            } else {
                // Check if tied with prev or next
                const tiedWithPrev = i > 0 && 
                                     teamInfo.points === teams[i-1].points && 
                                     teamInfo.goalDifference === teams[i-1].goalDifference && 
                                     teamInfo.goalsFor === teams[i-1].goalsFor;
                const tiedWithNext = i < teams.length - 1 && 
                                     teamInfo.points === teams[i+1].points && 
                                     teamInfo.goalDifference === teams[i+1].goalDifference && 
                                     teamInfo.goalsFor === teams[i+1].goalsFor;
                                     
                if (tiedWithPrev || tiedWithNext) {
                    tbSource = "extracted_knockout_slot";
                }
            }

            finalStandings.push({
                group: g,
                position: pos,
                team: teamInfo.team,
                points: teamInfo.points,
                goalDifference: teamInfo.goalDifference,
                goalsFor: teamInfo.goalsFor,
                tieBreakSource: tbSource
            });
        }
    }
    
    return finalStandings;
}

export function computeBestThirds(groupStandings, thirdPlaceMatrix) {
    const thirds = groupStandings.filter(s => s.position.startsWith('3'));
    
    thirds.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.team.localeCompare(b.team);
    });
    
    const best8 = thirds.slice(0, 8);
    const groupsString = best8.map(t => t.group).sort().join('');
    
    return {
        bestThirds: best8,
        combinationString: groupsString,
        matrixMapping: thirdPlaceMatrix ? thirdPlaceMatrix[groupsString] : null
    };
}
