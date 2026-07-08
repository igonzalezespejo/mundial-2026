import xlsx from 'xlsx';

const workbook = xlsx.readFile('data_raw/PORRAS_Combinadas - copia.xlsx', { cellDates: false });
const sheets = workbook.SheetNames;
const pSheet = sheets[4]; // 5th sheet is usually a participant
const data = xlsx.utils.sheet_to_json(workbook.Sheets[pSheet], { header: 1, defval: null });

console.log(`Inspecting sheet: ${pSheet}`);
for (let i = 75; i < Math.min(120, data.length); i++) {
  const row = data[i];
  if (!row) continue;
  // Print columns B to J (1 to 9)
  console.log(`Row ${i+1}:`, row.slice(1, 10).map(x => x === null ? '' : x));
}
