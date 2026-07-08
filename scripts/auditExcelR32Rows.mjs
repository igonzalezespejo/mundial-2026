import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RAW_DATA_PATH = path.join(__dirname, '..', 'data_raw', 'PORRAS_Combinadas - copia.xlsx');
const BRACKET_TEMPLATE = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'bracket_template_2026.json'), 'utf8'));

function cellText(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
}

async function run() {
    const workbook = xlsx.readFile(RAW_DATA_PATH);
    const targetSheets = ["Juan Ruiz Torres", "La_Gran_Porra_De_Isra", "Antequera"];
    
    for (const sheetName of targetSheets) {
        console.log(`\nParticipante: ${sheetName}`);
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) continue;

        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });
        
        let inR32 = false;
        let r32Count = 0;
        
        console.log("order | sourceRow | extracted slotId | matchNo | homeTeam | awayTeam | predScore | excelPointsCell | formula si existe");
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row) continue;
            
            const colB = cellText(row[1]);
            const colC = cellText(row[2]);
            
            if (colB === 'Dieciseisavos de final' || colC === 'Dieciseisavos de final') {
                inR32 = true;
                continue;
            }
            if (colB === 'Octavos de final' || colC === 'Octavos de final') {
                inR32 = false;
                break;
            }
            
            if (inR32) {
                const homeTeam = cellText(row[2]);
                const awayTeam = cellText(row[6]);
                if (!homeTeam && !awayTeam) continue;
                
                r32Count++;
                const slotId = `R32-${String(r32Count).padStart(2, '0')}`;
                
                const predHome = cellText(row[3]);
                const predAway = cellText(row[5]);
                const predScore = `${predHome}-${predAway}`;
                
                const excelPointsCell = worksheet[xlsx.utils.encode_cell({ r: i, c: 9 })];
                const excelPoints = excelPointsCell ? cellText(excelPointsCell.v) : '';
                const formula = excelPointsCell && excelPointsCell.f ? `=${excelPointsCell.f}` : '';
                
                const bracketMatch = BRACKET_TEMPLATE.find(m => m.slotId === slotId);
                const matchNo = bracketMatch ? `M${bracketMatch.matchNo}` : 'N/A';
                
                console.log(`${r32Count.toString().padEnd(5)} | ${(i + 1).toString().padEnd(9)} | ${slotId.padEnd(16)} | ${matchNo.padEnd(7)} | ${homeTeam.padEnd(20)} | ${awayTeam.padEnd(20)} | ${predScore.padEnd(9)} | ${excelPoints.padEnd(15)} | ${formula}`);
            }
        }
    }
}

run().catch(console.error);
