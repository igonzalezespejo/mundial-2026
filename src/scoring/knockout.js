import { normalizeTeamName } from './teamAliases.js';

export function scoreChampion(predictedChamp, actualChamp) {
  if (!predictedChamp || !actualChamp) return 0;
  return normalizeTeamName(predictedChamp).toLowerCase() === normalizeTeamName(actualChamp).toLowerCase() ? 400 : 0;
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
      if (match.homeTeam) teamsByRound[match.round].add(normalizeTeamName(match.homeTeam));
      if (match.awayTeam) teamsByRound[match.round].add(normalizeTeamName(match.awayTeam));
  }

  const getPointsDef = (round) => {
      switch (round) {
          case 'R32': return { base: 10, exactPos: 10, bonus: 20 };
          case 'R16': return { base: 40, exactPos: 0, bonus: 20 };
          case 'QF':  return { base: 60, exactPos: 0, bonus: 20 };
          case 'SF':  return { base: 80, exactPos: 0, bonus: 20 };
          case 'THIRD_PLACE': return { base: 100, exactPos: 0, bonus: 20 };
          case 'FINAL': return { base: 150, exactPos: 0, bonus: 20 };
          default: return null;
      }
  };

  let predictedChamp = null;

  const participantTeamsByRound = {};
  for (const p of participantPredictions) {
      if (!participantTeamsByRound[p.round]) participantTeamsByRound[p.round] = new Set();
      if (p.predictedHomeTeam) participantTeamsByRound[p.round].add(normalizeTeamName(p.predictedHomeTeam));
      if (p.predictedAwayTeam) participantTeamsByRound[p.round].add(normalizeTeamName(p.predictedAwayTeam));
  }

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
      if (!actualSlot) {
          matchPoints[pred.slotId] = 0;
          continue;
      }

      const roundTeams = teamsByRound[pred.round] || new Set();

      let homeExactPos = false;
      let awayExactPos = false;

      const predHome = normalizeTeamName(pred.predictedHomeTeam);
      const predAway = normalizeTeamName(pred.predictedAwayTeam);
      const actHome = normalizeTeamName(actualSlot.homeTeam);
      const actAway = normalizeTeamName(actualSlot.awayTeam);

      if (pred.round === 'R32') {
          // Base points for advancing to this round
          if (predHome) {
              if (actHome === predHome) {
                  pts += def.base + def.exactPos;
                  homeExactPos = true;
              } else if (roundTeams.has(predHome)) {
                  pts += def.base;
              }
          }

          if (predAway) {
              if (actAway === predAway) {
                  pts += def.base + def.exactPos;
                  awayExactPos = true;
              } else if (roundTeams.has(predAway)) {
                  pts += def.base;
              }
          }

          // Exact Matchup & Score Bonus
          if (homeExactPos && awayExactPos) {
              if (pred.predictedHomeGoals !== null && pred.predictedAwayGoals !== null &&
                  actualSlot.homeGoals !== null && actualSlot.awayGoals !== null) {
                  if (pred.predictedHomeGoals === actualSlot.homeGoals &&
                      pred.predictedAwayGoals === actualSlot.awayGoals) {
                      // Removed the condition to also predict the correct winner in case of penalties
                      pts += def.bonus;
                  }
              }
          }
      } else {
          // R16, QF, SF, THIRD_PLACE, FINAL
          

          if (predHome && roundTeams.has(predHome)) {
              pts += def.base;
          }

          if (predAway && roundTeams.has(predAway) && predAway !== predHome) {
              pts += def.base;
          }

          // Check exact matchup and score for bonus
          if (predHome && predAway && actHome === predHome && actAway === predAway) {
              if (pred.predictedHomeGoals !== null && pred.predictedAwayGoals !== null &&
                  actualSlot.homeGoals !== null && actualSlot.awayGoals !== null) {
                  if (pred.predictedHomeGoals === actualSlot.homeGoals &&
                      pred.predictedAwayGoals === actualSlot.awayGoals) {
                      pts += def.bonus;
                  }
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

