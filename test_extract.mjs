import xlsx from 'xlsx';

const cellText = (c) => c !== undefined && c !== null ? String(c).trim() : '';

const workbook = xlsx.readFile('data_raw/PORRAS_Combinadas - copia.xlsx');
const participantSheets = workbook.SheetNames.filter(name => 
    !['Resumen', 'Evolucion_Puntos', 'Evolucion_Ranking', 'FaseFinal', '3er', 'Resultados'].includes(name)
);
const sheetName = participantSheets[0];
console.log('Testing sheet:', sheetName);
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });

for (let i = 75; i < 85; i++) {
    if (data[i]) {
        console.log(`Row ${i} Col B:`, cellText(data[i][1]), `Col C:`, cellText(data[i][2]));
    }
}
