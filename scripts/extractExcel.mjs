import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { computeGroupStandings, computeBestThirds } from '../src/scoring/groupStandings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const RAW_DATA_PATH = path.join(ROOT_DIR, 'data_raw', 'PORRAS_Combinadas - copia.xlsx');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

const AUXILIARY_SHEETS = ['Resumen', 'Resultados', 'Evolucion_Puntos', 'Evolucion_Ranking'];

function cellText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function parseExcelDate(serial) {
  if (typeof serial !== 'number') return { date: null, time: null, dateTime: null };
  
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;                                        
  const dateObj = new Date(utc_value * 1000);
  const dateStr = dateObj.toISOString().split('T')[0];
  
  const fraction = serial - Math.floor(serial);
  let timeStr = null;
  let dateTimeStr = null;
  
  if (fraction > 0.0000001) {
    const totalSeconds = Math.round(fraction * 86400);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const ss = totalSeconds % 60;
    
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    timeStr = `${hh}:${mm}`;
    dateTimeStr = `${dateStr}T${timeStr}:${String(ss).padStart(2, '0')}`;
  }
  
  return { date: dateStr, time: timeStr, dateTime: dateTimeStr };
}

async function extract() {
  if (!fs.existsSync(RAW_DATA_PATH)) {
    console.error(`ERROR: Excel file not found at ${RAW_DATA_PATH}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(RAW_DATA_PATH, { cellDates: false });
  const allSheets = workbook.SheetNames;
  const participantSheets = workbook.SheetNames.filter(name => 
    !['Resumen', 'Evolucion_Puntos', 'Evolucion_Ranking', 'FaseFinal', '3er', 'Resultados'].includes(name)
  );

  let bracketTemplate = [];
  try { bracketTemplate = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'bracket_template_2026.json'), 'utf8')); } catch (e) {}

  let thirdPlaceMatrix = {};
  try { thirdPlaceMatrix = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'third_place_matrix_2026.json'), 'utf8')); } catch (e) {}

  const participants = [];
  const matchesMap = new Map();
  const predictions = [];
  const resultsMap = new Map();
  const excelPointsSnapshot = [];
  
  const knockoutMatchesMap = new Map();
  const knockoutPredictions = [];
  
  const allGroupStandingsPredictions = [];
  const privacyIssues = { critical: [], review: [] };
  const extractionWarnings = [];

  const piiRegexes = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\\+?[\\d\\s-]{9,20}$/,
    url: /https?:\/\/[^\s]+/,
    longId: /^[a-zA-Z0-9_-]{20,}$/
  };

  function checkPrivacy(text, location) {
    const str = cellText(text);
    if (str.length === 0) return;
    for (const [type, regex] of Object.entries(piiRegexes)) {
      if (regex.test(str)) {
        if (['email', 'phone', 'url'].includes(type)) {
          privacyIssues.critical.push(`[${type.toUpperCase()}] at ${location}: <redacted-${type}>`);
        } else {
          privacyIssues.review.push(`[${type.toUpperCase()}] at ${location}: ${str}`);
        }
      }
    }
  }

  if (workbook.Sheets['Resumen']) {
    const resData = xlsx.utils.sheet_to_json(workbook.Sheets['Resumen'], { header: 1 });
    resData.flat().forEach(cell => checkPrivacy(cell, 'Hoja Resumen'));
  }

  for (const sheetName of participantSheets) {
    checkPrivacy(sheetName, `Sheet Name (${sheetName})`);
    
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
    
    let displayName = sheetName;
    let totalPoints = null;
    
    if (data[2]) {
      const nameCell = cellText(data[2][2]);
      if (nameCell) displayName = nameCell;
      if (data[2][9] !== null) totalPoints = Number(data[2][9]);
    }
    
    checkPrivacy(displayName, `Display Name in sheet ${sheetName}`);
    participants.push({ participantId: sheetName, sheetName, displayName, source: "excel" });

    // --- PHASE 1: GROUP STAGE ---
    let matchCounter = 0;
    let lastGroupRowIndex = 3;
    const pGroupPreds = [];
    
    for (let i = 4; i < data.length; i++) {
      if (matchCounter >= 72) break;
      const row = data[i];
      if (!row) continue;
      
      const homeTeam = cellText(row[2]);
      const awayTeam = cellText(row[6]);
      if (!homeTeam || !awayTeam || homeTeam === "Home" || homeTeam === "Visitante" || homeTeam.includes("Fase de Grupos")) continue;
      
      const matchNum = matchCounter + 1;
      const matchId = `GROUP-${String(matchNum).padStart(3, '0')}`;
      const excelDate = row[1];
      const parsedDates = typeof excelDate === 'number' ? parseExcelDate(excelDate) : { date: cellText(excelDate), time: null, dateTime: null };
      const realHomeGoals = row[7];
      const realAwayGoals = row[8];
      
      if (!matchesMap.has(matchId)) {
        let status = "PENDING";
        if (realHomeGoals !== null && realAwayGoals !== null && cellText(realHomeGoals) !== '' && cellText(realAwayGoals) !== '') {
            status = "FINISHED";
            if (!resultsMap.has(matchId)) {
                resultsMap.set(matchId, { matchId, homeGoals: Number(realHomeGoals), awayGoals: Number(realAwayGoals) });
            }
        }
        matchesMap.set(matchId, {
          matchId, round: "GROUP", group: null, date: parsedDates.date, kickoffTime: parsedDates.time,
          kickoffDateTime: parsedDates.dateTime, timezone: null, excelRawDate: excelDate, homeTeam, awayTeam, status
        });
      }
      
      const predHome = cellText(row[3]);
      const predAway = cellText(row[5]);
      if (predHome !== '' && predAway !== '') {
          const p = { participantId: sheetName, matchId, round: "GROUP", homeTeam, awayTeam, predictedHomeGoals: Number(predHome), predictedAwayGoals: Number(predAway) };
          predictions.push(p);
          pGroupPreds.push(p);
      }
      
      const matchPoints = cellText(row[9]);
      if (matchPoints !== '') {
          excelPointsSnapshot.push({ participantId: sheetName, matchId, points: Number(matchPoints) });
      }
      matchCounter++;
      lastGroupRowIndex = i;
    }
    excelPointsSnapshot.push({ participantId: sheetName, matchId: 'TOTAL_GROUP', points: totalPoints });

    // --- PHASE 2: KNOCKOUT STAGE ---
    let currentSection = null;
    let sectionIndex = 0;
    const participantKnockoutPreds = [];

    function findTeamCellInRow(row) {
      for (let c = 1; c < Math.min(row.length, 10); c++) {
        const val = row[c];
        if (val === undefined || val === null || val === '') continue;
        if (typeof val === 'number') continue;
        if (!isNaN(Number(val))) continue;
        
        const text = String(val).trim();
        if (text.length > 2 && text !== 'CAMPEÓN' && text !== 'Podium') {
          return text;
        }
      }
      return null;
    }

    const sectionMarkers = {
      'Dieciseisavos de final': 'R32',
      'Octavos de final': 'R16',
      'Cuartos de final': 'QF',
      'Semifinales': 'SF',
      '3er Puesto': 'THIRD_PLACE',
      'Final': 'FINAL',
      'CAMPEÓN': 'CHAMPION',
      'Podium': 'PODIUM'
    };

    for (let i = lastGroupRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (!row) continue;
      
      const colB = cellText(row[1]);
      const colC = cellText(row[2]);
      
      const marker = sectionMarkers[colB] || sectionMarkers[colC];
      if (marker) {
        currentSection = marker;
        sectionIndex = 0;
        continue;
      }
      
      if (!currentSection) continue;
      
      if (['R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL'].includes(currentSection)) {
        const homeTeam = cellText(row[2]); // Col C
        const awayTeam = cellText(row[6]); // Col G
        if (!homeTeam && !awayTeam) continue; 
        
        sectionIndex++;
        let slotId = currentSection;
        if (currentSection !== 'THIRD_PLACE' && currentSection !== 'FINAL') {
          slotId = `${currentSection}-${String(sectionIndex).padStart(2, '0')}`;
        }
        
        const excelDate = row[1];
        const parsedDates = typeof excelDate === 'number' ? parseExcelDate(excelDate) : { date: cellText(excelDate), time: null, dateTime: null };
        const predHome = cellText(row[3]);
        const predAway = cellText(row[5]);
        const points = cellText(row[9]);
        
        let predictedHomeGoals = predHome !== '' ? Number(predHome) : null;
        let predictedAwayGoals = predAway !== '' ? Number(predAway) : null;
        
        const predObj = {
          participantId: sheetName,
          slotId,
          round: currentSection,
          date: parsedDates.date,
          kickoffTime: parsedDates.time,
          kickoffDateTime: parsedDates.dateTime,
          predictedHomeTeam: homeTeam,
          predictedAwayTeam: awayTeam,
          predictedHomeGoals,
          predictedAwayGoals,
          predictedWinner: null,
          sourceRow: i
        };

        const templateSlot = bracketTemplate.find(s => s.slotId === slotId);
        if (templateSlot) {
            predObj.homeSource = templateSlot.homeSource;
            predObj.awaySource = templateSlot.awaySource;
            
            // Reconstruct "fromWinnerOf" for later rounds
            if (currentSection !== 'R32') {
                const prevRoundSlots = bracketTemplate.filter(s => s.nextWinnerSlotId === slotId).map(s => s.slotId);
                if (prevRoundSlots.length > 0) predObj.fromWinnerOf = prevRoundSlots;
            }
        }

        participantKnockoutPreds.push(predObj);

        if (points !== '') {
          excelPointsSnapshot.push({ participantId: sheetName, matchId: slotId, points: Number(points) });
        }
        
        if (sheetName === participantSheets[0]) {
            knockoutMatchesMap.set(slotId, {
                slotId, round: currentSection,
                date: parsedDates.date, kickoffTime: parsedDates.time, kickoffDateTime: parsedDates.dateTime
            });
        }
      } 
      else if (currentSection === 'CHAMPION') {
        const champTeam = findTeamCellInRow(row);
        participantKnockoutPreds.push({
          participantId: sheetName, slotId: 'CHAMPION', round: 'CHAMPION', team: champTeam || null, sourceRow: i
        });
        if (!champTeam) extractionWarnings.push(`CHAMPION_NOT_FOUND for ${sheetName} at row ${i}`);
        
        const points = cellText(row[9]);
        if (points !== '') excelPointsSnapshot.push({ participantId: sheetName, matchId: 'CHAMPION', points: Number(points) });
      }
      else if (currentSection === 'PODIUM') {
        const colA = cellText(row[0]);
        const podiumTeam = cellText(row[1]);
        if (colA === 'Primero' || colA === 'Segundo' || colA === 'Tercero') {
            sectionIndex++;
            participantKnockoutPreds.push({
              participantId: sheetName, slotId: `PODIUM-${sectionIndex}`, round: 'PODIUM', position: colA, team: podiumTeam, sourceRow: i
            });
        }
      }
    }

    const pStandings = computeGroupStandings(pGroupPreds, Array.from(matchesMap.values()), participantKnockoutPreds, bracketTemplate);
    const pStandingsObj = { participantId: sheetName, standings: pStandings };
    
    // Resolve Best Thirds
    const bestThirdsInfo = computeBestThirds(pStandings, thirdPlaceMatrix);
    pStandingsObj.bestThirdsCombination = bestThirdsInfo.combinationString;
    pStandingsObj.bestThirdsMapping = bestThirdsInfo.matrixMapping;
    
    allGroupStandingsPredictions.push(pStandingsObj);

    const getTeamsInRound = (roundPrefix) => {
       const teams = new Set();
       participantKnockoutPreds.filter(p => p.slotId.startsWith(roundPrefix)).forEach(p => {
           if (p.predictedHomeTeam) teams.add(p.predictedHomeTeam);
           if (p.predictedAwayTeam) teams.add(p.predictedAwayTeam);
       });
       if (roundPrefix === 'FINAL') {
           participantKnockoutPreds.filter(p => p.slotId === 'THIRD_PLACE').forEach(p => {
               if (p.predictedHomeTeam) teams.add(p.predictedHomeTeam);
               if (p.predictedAwayTeam) teams.add(p.predictedAwayTeam);
           });
       }
       return teams;
    };

    const nextRoundMap = {
        'R32': getTeamsInRound('R16'),
        'R16': getTeamsInRound('QF'),
        'QF': getTeamsInRound('SF'),
        'SF': getTeamsInRound('FINAL'), 
    };

    participantKnockoutPreds.forEach(p => {
      if (['R32', 'R16', 'QF', 'SF'].includes(p.round)) {
          const nextTeams = nextRoundMap[p.round];
          let winner = null;
          
          if (p.predictedHomeGoals !== null && p.predictedAwayGoals !== null) {
              if (p.predictedHomeGoals > p.predictedAwayGoals) winner = p.predictedHomeTeam;
              else if (p.predictedAwayGoals > p.predictedHomeGoals) winner = p.predictedAwayTeam;
          }

          if (!winner) {
              const homeAdvances = nextTeams.has(p.predictedHomeTeam);
              const awayAdvances = nextTeams.has(p.predictedAwayTeam);
              if (homeAdvances && !awayAdvances) winner = p.predictedHomeTeam;
              else if (awayAdvances && !homeAdvances) winner = p.predictedAwayTeam;
          }
          p.predictedWinner = winner;
      } else if (p.round === 'FINAL' || p.round === 'THIRD_PLACE') {
          if (p.predictedHomeGoals !== null && p.predictedAwayGoals !== null) {
              if (p.predictedHomeGoals > p.predictedAwayGoals) p.predictedWinner = p.predictedHomeTeam;
              else if (p.predictedAwayGoals > p.predictedHomeGoals) p.predictedWinner = p.predictedAwayTeam;
          }
          if (!p.predictedWinner && p.round === 'FINAL') {
             const champ = participantKnockoutPreds.find(x => x.slotId === 'CHAMPION');
             if (champ && champ.team) {
                 if (champ.team === p.predictedHomeTeam) p.predictedWinner = p.predictedHomeTeam;
                 if (champ.team === p.predictedAwayTeam) p.predictedWinner = p.predictedAwayTeam;
             }
          }
      }
    });

    knockoutPredictions.push(...participantKnockoutPreds);
  }

  // Create actual knockout bracket as PENDING
  const actualKnockoutBracket = {
      status: "PENDING",
      usesRealKnockoutData: false,
      usesParticipantAsProxy: false,
      matches: []
  };

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  
  fs.writeFileSync(path.join(DATA_DIR, 'participants.json'), JSON.stringify(participants, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'matches.json'), JSON.stringify(Array.from(matchesMap.values()), null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'predictions.json'), JSON.stringify(predictions, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'results.json'), JSON.stringify(Array.from(resultsMap.values()), null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'excel_points_snapshot.json'), JSON.stringify(excelPointsSnapshot, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'extraction_warnings.json'), JSON.stringify(extractionWarnings, null, 2));
  
  fs.writeFileSync(path.join(DATA_DIR, 'knockout_matches.json'), JSON.stringify(Array.from(knockoutMatchesMap.values()), null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'knockout_predictions.json'), JSON.stringify(knockoutPredictions, null, 2));
  
  // Save new files
  fs.writeFileSync(path.join(DATA_DIR, 'group_standings_predictions.json'), JSON.stringify(allGroupStandingsPredictions, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'actual_knockout_bracket.json'), JSON.stringify(actualKnockoutBracket, null, 2));

  // Compute actual group standings
  const actualResultsAsPreds = Array.from(resultsMap.values()).map(r => ({
      matchId: r.matchId,
      predictedHomeGoals: r.homeGoals,
      predictedAwayGoals: r.awayGoals
  }));
  const actualGroupStandings = computeGroupStandings(actualResultsAsPreds, Array.from(matchesMap.values()), null, null);
  fs.writeFileSync(path.join(DATA_DIR, 'group_standings_actual.json'), JSON.stringify(actualGroupStandings, null, 2));

  let pubStatus = 'OK';
  if (privacyIssues.critical.length > 0) pubStatus = 'BLOCKED';
  else if (privacyIssues.review.length > 0) pubStatus = 'OK_WITH_REVIEW';

  const privacyReport = `# Privacy Report\n\n## Resumen\n- Critical PII findings: ${privacyIssues.critical.length}\n- Review findings: ${privacyIssues.review.length}\n- Publication status: **${pubStatus}**\n`;
  fs.writeFileSync(path.join(DOCS_DIR, 'privacy_report.md'), privacyReport);

  console.log(`Extraction Phase 2B complete. Warnings: ${extractionWarnings.length}`);
}

extract().catch(console.error);
