import xlsx from 'xlsx';

const wb = xlsx.readFile('data_raw/PORRAS_Combinadas - copia.xlsx', { cellFormula: true, cellHTML: false });
const sheet = wb.Sheets['La_Gran_Porra_De_Isra'];

// Scan entire sheet for formulas
const range = xlsx.utils.decode_range(sheet['!ref']);
console.log(`Scanning from ${range.s.r} to ${range.e.r}`);

for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = {c:C, r:R};
        const cellRef = xlsx.utils.encode_cell(cellAddress);
        const cell = sheet[cellRef];
        
        if (cell) {
            // Check if formula contains COUNTIF or similar, or gives 10, 20, 30 points
            if (cell.f && (cell.f.includes('COUNTIF') || cell.f.includes('Resultados!') || cell.f.includes('VLOOKUP'))) {
                // Ignore the basic group stage formulas to reduce noise
                if (!cell.f.includes('IF(SIGN(') && !cell.f.includes('IF(AND(') && cell.v > 0) {
                    console.log(`Row ${R+1}, Col ${xlsx.utils.encode_col(C)} (${cellRef}): Formula: ${cell.f} | Value: ${cell.v}`);
                }
            }
        }
    }
}
