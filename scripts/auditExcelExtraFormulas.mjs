import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RAW_DATA_PATH = path.join(__dirname, '..', 'data_raw', 'PORRAS_Combinadas - copia.xlsx');

function cellText(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
}

async function run() {
    console.log(`Leyendo: ${RAW_DATA_PATH}`);
    const workbook = xlsx.readFile(RAW_DATA_PATH);
    const resumenSheet = workbook.Sheets['Resumen'];
    
    if (resumenSheet) {
        const data = xlsx.utils.sheet_to_json(resumenSheet, { header: 1, defval: null });
        console.log("Sheet: Resumen");
        // Print the first few rows to see what is there
        for (let i = 0; i < Math.min(20, data.length); i++) {
            console.log(data[i].join(' | '));
        }
        
        // Find Juan Ruiz Torres
        for (let i = 0; i < data.length; i++) {
            if (data[i] && cellText(data[i][0]).includes('Juan')) {
                const formulas = [];
                for (let c = 0; c <= 20; c++) {
                    const cell = resumenSheet[xlsx.utils.encode_cell({ r: i, c: c })];
                    if (cell && cell.f) {
                        formulas.push(`Col${c}: =${cell.f}`);
                    } else if (cell && cell.v !== null && cell.v !== undefined && cell.v !== '') {
                        formulas.push(`Col${c}: ${cell.v}`);
                    }
                }
                console.log(`\nJuan Ruiz Torres en Resumen (Row ${i+1}):`);
                console.log(formulas.join('\n'));
            }
        }
    }
}

run().catch(console.error);
