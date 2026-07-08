import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const RAW_DATA_PATH = path.join(process.cwd(), 'data_raw', 'PORRAS_Combinadas - copia.xlsx');
const DATA_DIR = path.join(process.cwd(), 'data');

function cellText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function run() {
  const workbook = xlsx.readFile(RAW_DATA_PATH, { cellDates: false });
  const sheet = workbook.Sheets['Menuda_Porra_la_de_AHR'];
  if (!sheet) {
    console.error("Sheet Menuda_Porra_la_de_AHR not found!");
    process.exit(1);
  }

  const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const map = [];
  
  let matchCounter = 0;
  let inGroupStage = true;
  let visualOrder = 0;

  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;

    const colA = cellText(row[0]);
    const homeTeam = cellText(row[2]);
    const awayTeam = cellText(row[6]);

    // Handle group stage end
    if (inGroupStage && matchCounter >= 72) {
      inGroupStage = false;
      visualOrder = 0;
    }

    if (inGroupStage) {
      if (!homeTeam || !awayTeam || homeTeam === "Home" || homeTeam === "Visitante" || homeTeam.includes("Fase de Grupos")) continue;
      
      const matchNo = parseInt(colA, 10);
      if (isNaN(matchNo)) {
        console.error(`Missing matchNo at row ${i} (Group stage)`);
        process.exit(1);
      }
      
      visualOrder++;
      map.push({
        sourceRow: i,
        matchNo: matchNo,
        round: 'GROUP',
        visualOrder: visualOrder
      });
      matchCounter++;
    } else {
      // Knockout
      const colB = cellText(row[1]);
      const colC = cellText(row[2]);
      
      const marker = ['Dieciseisavos de final', 'Octavos de final', 'Cuartos de final', 'Semifinales', '3er Puesto', 'Final'].find(m => m === colB || m === colC);
      
      if (marker) continue;
      
      if (!homeTeam && !awayTeam) continue;

      if (['CAMPEÓN', 'Podium'].includes(colB) || ['CAMPEÓN', 'Podium'].includes(colC)) break;
      
      // Found a knockout match row
      const matchNo = parseInt(colA, 10);
      if (!isNaN(matchNo)) {
        visualOrder++;
        
        let round = 'UNKNOWN';
        if (matchNo >= 73 && matchNo <= 88) round = 'R32';
        else if (matchNo >= 89 && matchNo <= 96) round = 'R16';
        else if (matchNo >= 97 && matchNo <= 100) round = 'QF';
        else if (matchNo >= 101 && matchNo <= 102) round = 'SF';
        else if (matchNo === 103) round = 'THIRD_PLACE';
        else if (matchNo === 104) round = 'FINAL';

        map.push({
          sourceRow: i,
          matchNo: matchNo,
          round: round,
          visualOrder: visualOrder
        });
      }
    }
  }

  // Validations
  const matchNos = map.map(x => x.matchNo);
  const duplicates = matchNos.filter((item, index) => matchNos.indexOf(item) !== index);
  if (duplicates.length > 0) {
    console.error(`Duplicate matchNos found: ${[...new Set(duplicates)].join(', ')}`);
    process.exit(1);
  }

  const missing = [];
  for (let i = 1; i <= 104; i++) {
    if (!matchNos.includes(i)) missing.push(i);
  }

  if (missing.length > 0) {
    console.error(`Missing matchNos 1-104: ${missing.join(', ')}`);
  } else {
    console.log("All 1-104 matchNos found!");
  }

  console.log(`Total matches mapped: ${map.length}`);
  
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, 'excel_row_match_map.json'), JSON.stringify(map, null, 2));
}

run();
