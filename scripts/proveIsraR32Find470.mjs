import xlsx from 'xlsx';

const wb = xlsx.readFile('data_raw/PORRAS_Combinadas - copia.xlsx', { cellFormula: true, cellHTML: false });
const sheet = wb.Sheets['La_Gran_Porra_De_Isra'];

const range = xlsx.utils.decode_range(sheet['!ref']);
for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = sheet[xlsx.utils.encode_cell({c:C, r:R})];
        if (cell && (cell.v === 470 || cell.v === 480 || (typeof cell.v === 'number' && cell.v > 400 && cell.v < 550))) {
            console.log(`Found ${cell.v} at ${xlsx.utils.encode_cell({c:C, r:R})} | Formula: ${cell.f}`);
        }
    }
}
