export function scoreChampion(predictedChamp, actualChamp) {
  if (!predictedChamp || !actualChamp) return 0;
  return predictedChamp.toLowerCase() === actualChamp.toLowerCase() ? 400 : 0;
}

export function scoreKnockoutParticipant(participantPredictions, actualKnockoutContext) {
  let totalKnockoutPoints = 0;
  let matchPoints = {};
  const roundPoints = {
      R32: 0, R16: 0, QF: 0, SF: 0, THIRD_PLACE: 0, FINAL: 0, CHAMPION: 0
  };

  if (!actualKnockoutContext || actualKnockoutContext.status === 'PENDING') {
      return { totalKnockoutPoints, matchPoints, roundPoints };
  }

  const teamsByRound = {};
  for (const matchId in actualKnockoutContext.matches) {
      const match = actualKnockoutContext.matches[matchId];
      if (match.status === 'PENDING') continue;
      
      if (!teamsByRound[match.round]) teamsByRound[match.round] = new Set();
      if (match.homeTeam) teamsByRound[match.round].add(match.homeTeam);
      if (match.awayTeam) teamsByRound[match.round].add(match.awayTeam);
  }

  const getPointsDef = (round) => {
      switch (round) {
          case 'R32': return { base: 10, exactPos: 10, bonus: 20 };
          case 'R16': return { base: 40, exactPos: 0, bonus: 40 };
          case 'QF':  return { base: 60, exactPos: 0, bonus: 60 };
          case 'SF':  return { base: 80, exactPos: 0, bonus: 80 };
          case 'THIRD_PLACE': return { base: 100, exactPos: 0, bonus: 100 };
          case 'FINAL': return { base: 150, exactPos: 0, bonus: 150 };
          default: return null;
      }
  };

  let predictedChamp = null;

  for (const pred of participantPredictions) {
      let pts = 0;
      
      if (pred.round === 'CHAMPION') {
          predictedChamp = pred.team;
          continue;
      }
      if (pred.round === 'PODIUM') {
          continue; 
      }

      const def = getPointsDef(pred.round);
      if (!def) continue;

      const actualSlot = actualKnockoutContext.matches[pred.slotId];
      if (!actualSlot || actualSlot.status === 'PENDING') {
          matchPoints[pred.slotId] = 0;
          continue;
      }

      const roundTeams = teamsByRound[pred.round] || new Set();

      let homeExactPos = false;
      let awayExactPos = false;

      // Base points for advancing to this round
      if (pred.predictedHomeTeam) {
          if (actualSlot.homeTeam === pred.predictedHomeTeam) {
              pts += def.base + def.exactPos;
              homeExactPos = true;
          } else if (roundTeams.has(pred.predictedHomeTeam)) {
              pts += def.base;
          }
      }

      if (pred.predictedAwayTeam) {
          if (actualSlot.awayTeam === pred.predictedAwayTeam) {
              pts += def.base + def.exactPos;
              awayExactPos = true;
          } else if (roundTeams.has(pred.predictedAwayTeam)) {
              pts += def.base;
          }
      }

      // Exact Matchup & Score Bonus
      if (homeExactPos && awayExactPos) {
          if (pred.predictedHomeGoals !== null && pred.predictedAwayGoals !== null &&
              actualSlot.homeGoals !== null && actualSlot.awayGoals !== null) {
              if (pred.predictedHomeGoals === actualSlot.homeGoals &&
                  pred.predictedAwayGoals === actualSlot.awayGoals) {
                  pts += def.bonus;
              }
          }
      }

      matchPoints[pred.slotId] = pts;
      totalKnockoutPoints += pts;
      roundPoints[pred.round] = (roundPoints[pred.round] || 0) + pts;
  }

  const champPts = scoreChampion(predictedChamp, actualKnockoutContext.champion);
  matchPoints['CHAMPION'] = champPts;
  totalKnockoutPoints += champPts;
  roundPoints['CHAMPION'] = champPts;

  return { totalKnockoutPoints, matchPoints, roundPoints };
}
