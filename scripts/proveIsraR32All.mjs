import xlsx from 'xlsx';

const wb = xlsx.readFile('data_raw/PORRAS_Combinadas - copia.xlsx', { cellFormula: true, cellHTML: false });
const sheet = wb.Sheets['La_Gran_Porra_De_Isra'];

const targetRows = Array.from({length: 16}, (_, i) => i + 81);

console.log('Row | Col | Formula | Value');
for (const row of targetRows) {
    for (const col of ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']) {
        const cell = sheet[col + row];
        if (cell && (cell.f || (typeof cell.v === 'number' && cell.v !== 0))) {
            console.log(`${row} | ${col} | ${cell.f || 'NO FORMULA'} | ${cell.v}`);
        }
    }
}
