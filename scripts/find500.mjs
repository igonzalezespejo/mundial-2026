import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RAW_DATA_PATH = path.join(__dirname, '..', 'data_raw', 'PORRAS_Combinadas - copia.xlsx');

async function run() {
    const workbook = xlsx.readFile(RAW_DATA_PATH);
    const sheet = workbook.Sheets['Juan Ruiz Torres'];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
    
    for (let r = 0; r < data.length; r++) {
        const row = data[r];
        if (!row) continue;
        for (let c = 0; c < row.length; c++) {
            if (row[c] == 500 || String(row[c]).includes('500')) {
                console.log(`Found 500 at R${r+1}C${c+1}: ${row[c]}`);
            }
        }
    }
}
run().catch(console.error);
