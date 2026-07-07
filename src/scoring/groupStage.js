export function getSign(homeGoals, awayGoals) {
  if (homeGoals > awayGoals) return 'HOME';
  if (homeGoals < awayGoals) return 'AWAY';
  return 'DRAW';
}

export function scoreGroupMatch(prediction, result) {
  if (!result || typeof result.homeGoals !== 'number' || typeof result.awayGoals !== 'number') {
    return { points: 0, status: 'PENDING', message: 'Result not available or invalid' };
  }

  if (!prediction || typeof prediction.predictedHomeGoals !== 'number' || typeof prediction.predictedAwayGoals !== 'number') {
    return { points: 0, status: 'WARNING', message: 'Prediction missing or invalid' };
  }

  const pHome = prediction.predictedHomeGoals;
  const pAway = prediction.predictedAwayGoals;
  const rHome = result.homeGoals;
  const rAway = result.awayGoals;

  const isExact = pHome === rHome && pAway === rAway;
  const isDraw = rHome === rAway;
  const predSign = getSign(pHome, pAway);
  const realSign = getSign(rHome, rAway);
  const isSignCorrect = predSign === realSign;

  if (isExact && !isDraw) return { points: 15, status: 'SCORED' };
  if (isExact && isDraw) return { points: 20, status: 'SCORED' };
  if (isSignCorrect && !isDraw) return { points: 5, status: 'SCORED' };
  if (isSignCorrect && isDraw) return { points: 10, status: 'SCORED' };

  return { points: 0, status: 'SCORED' };
}

export function scoreGroupStageParticipant(predictions, results) {
  let totalPoints = 0;
  const matchScores = [];

  for (const pred of predictions) {
    const result = results.find(r => r.matchId === pred.matchId);
    const score = scoreGroupMatch(pred, result);
    totalPoints += score.points;
    matchScores.push({
      matchId: pred.matchId,
      points: score.points,
      status: score.status,
      message: score.message
    });
  }

  return { totalPoints, matchScores };
}
