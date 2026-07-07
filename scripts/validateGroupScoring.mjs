import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scoreGroupStageParticipant } from '../src/scoring/groupStage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

async function validate() {
  const participants = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'participants.json'), 'utf8'));
  const matches = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'matches.json'), 'utf8'));
  const predictions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'predictions.json'), 'utf8'));
  const results = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'results.json'), 'utf8'));
  const excelPointsSnapshot = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'excel_points_snapshot.json'), 'utf8'));

  let participantExactMatches = 0;
  let participantDiscrepancies = 0;
  
  let perMatchExactMatches = 0;
  let perMatchDiscrepancies = 0;
  
  const participantDetails = [];
  const perMatchDiscrepancyDetails = [];

  for (const p of participants) {
    const pPreds = predictions.filter(pred => pred.participantId === p.participantId);
    
    const jsResult = scoreGroupStageParticipant(pPreds, results);
    const jsTotal = jsResult.totalPoints;
    
    // Per-match validation
    for (const jsScore of jsResult.matchScores) {
      const excelObj = excelPointsSnapshot.find(snap => snap.participantId === p.participantId && snap.matchId === jsScore.matchId);
      const exPts = excelObj ? (excelObj.points || 0) : 0;
      
      if (exPts === jsScore.points) {
        perMatchExactMatches++;
      } else {
        perMatchDiscrepancies++;
        const matchInfo = matches.find(m => m.matchId === jsScore.matchId);
        const predInfo = pPreds.find(pr => pr.matchId === jsScore.matchId);
        const resInfo = results.find(r => r.matchId === jsScore.matchId);
        
        perMatchDiscrepancyDetails.push({
          participantId: p.participantId,
          matchId: jsScore.matchId,
          homeTeam: matchInfo ? matchInfo.homeTeam : 'Unknown',
          awayTeam: matchInfo ? matchInfo.awayTeam : 'Unknown',
          prediction: predInfo ? `${predInfo.predictedHomeGoals}-${predInfo.predictedAwayGoals}` : 'None',
          result: resInfo ? `${resInfo.homeGoals}-${resInfo.awayGoals}` : 'None',
          excelPoints: exPts,
          jsPoints: jsScore.points,
          diff: Math.abs(exPts - jsScore.points)
        });
      }
    }

    const excelTotalObj = excelPointsSnapshot.find(snap => snap.participantId === p.participantId && snap.matchId === 'TOTAL_GROUP');
    let excelTotal = 0;
    if (excelTotalObj && typeof excelTotalObj.points === 'number') {
      excelTotal = excelTotalObj.points;
    } else {
      const matchPoints = excelPointsSnapshot.filter(snap => snap.participantId === p.participantId && snap.matchId !== 'TOTAL_GROUP');
      excelTotal = matchPoints.reduce((acc, curr) => acc + (curr.points || 0), 0);
    }
    
    const diff = Math.abs(jsTotal - excelTotal);
    
    if (diff === 0) {
      participantExactMatches++;
    } else {
      participantDiscrepancies++;
    }

    participantDetails.push({
      participantId: p.participantId,
      excelTotal,
      jsTotal,
      diff
    });
  }

  const summary = {
    participantsCount: participants.length,
    groupMatchesCount: matches.length,
    resultsCount: results.length,
    predictionsCount: predictions.length,
    participantTotalExactMatches: participantExactMatches,
    participantTotalDiscrepancies: participantDiscrepancies,
    perMatchExactMatches,
    perMatchDiscrepancies
  };

  fs.writeFileSync(path.join(DATA_DIR, 'scoring_validation.json'), JSON.stringify({
    summary,
    participantDetails,
    perMatchDiscrepancyDetails
  }, null, 2));

  console.log('=== Validation Summary Phase 1B ===');
  console.log(`Participants: ${summary.participantsCount}`);
  console.log(`Predictions: ${summary.predictionsCount}`);
  console.log(`Per-Match Exact: ${summary.perMatchExactMatches}`);
  console.log(`Per-Match Discrepancies: ${summary.perMatchDiscrepancies}`);
  console.log(`Participant Total Exact: ${summary.participantTotalExactMatches}`);
  console.log(`Participant Total Discrepancies: ${summary.participantTotalDiscrepancies}`);
  
  if (summary.perMatchDiscrepancies > 0) {
    console.log('\\nTop Per-Match Discrepancies:');
    perMatchDiscrepancyDetails.slice(0, 10).forEach(d => {
      console.log(`- ${d.participantId} @ ${d.matchId} (${d.homeTeam} vs ${d.awayTeam}): Pred=${d.prediction}, Res=${d.result} -> Excel=${d.excelPoints}, JS=${d.jsPoints}`);
    });
  }
}

validate().catch(console.error);
