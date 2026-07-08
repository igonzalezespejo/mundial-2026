import { scoreKnockoutParticipant } from './knockout.js';
import { scoreGroupStageParticipant } from './groupStage.js';

export function calculateGlobalRanking(participants, groupPredictions, groupResults, knockoutPredictions, knockoutContext) {
  const ranking = [];

  for (const participant of participants) {
    const pId = participant.participantId;
    
    // Group Stage
    const pGroupPreds = groupPredictions.filter(p => p.participantId === pId);
    const groupPts = scoreGroupStageParticipant(pGroupPreds, groupResults);
    
    // Knockout Stage
    const pKnockPreds = knockoutPredictions.filter(p => p.participantId === pId);
    let totalKnockoutPoints = 0;
    let roundPoints = { R32: 0, R16: 0, QF: 0, SF: 0, THIRD_PLACE: 0, FINAL: 0, CHAMPION: 0 };
    let knockoutMatchPoints = {};

    if (knockoutContext) {
       if (knockoutContext.allParticipantStandings) {
           const pSt = knockoutContext.allParticipantStandings.find(x => x.participantId === pId);
           knockoutContext.participantStandings = pSt ? pSt.standings : null;
       }

       const koScoring = scoreKnockoutParticipant(pKnockPreds, knockoutContext);
       totalKnockoutPoints = koScoring.totalKnockoutPoints;
       roundPoints = koScoring.roundPoints || roundPoints;
       knockoutMatchPoints = koScoring.matchPoints || {};
    }
    
    const totalPoints = groupPts.totalPoints + totalKnockoutPoints;

    const groupMatchPoints = {};
    groupPts.matchScores.forEach(ms => {
      groupMatchPoints[ms.matchId] = ms.points;
    });

    ranking.push({
      participantId: pId,
      displayName: participant.displayName,
      groupPoints: groupPts.totalPoints,
      groupMatchPoints,
      roundPoints,
      knockoutMatchPoints,
      knockoutPoints: totalKnockoutPoints,
      totalPoints
    });
  }

  // Sort by Total (desc), Group (desc), DisplayName (asc)
  ranking.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.groupPoints !== a.groupPoints) return b.groupPoints - a.groupPoints;
    return a.displayName.localeCompare(b.displayName);
  });

  // Assign Rank
  let currentRank = 1;
  for (let i = 0; i < ranking.length; i++) {
    if (i > 0 && 
        ranking[i].totalPoints === ranking[i-1].totalPoints && 
        ranking[i].groupPoints === ranking[i-1].groupPoints) {
      ranking[i].rank = ranking[i-1].rank;
    } else {
      ranking[i].rank = currentRank;
    }
    currentRank++;
  }

  return ranking;
}
