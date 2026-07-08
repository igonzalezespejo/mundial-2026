import xlsx from 'xlsx';

const wb = xlsx.readFile('data_raw/PORRAS_Combinadas - copia.xlsx', { cellFormula: true, cellHTML: false });
const sheet = wb.Sheets['La_Gran_Porra_De_Isra'];

// The points are usually in Column J (index 9) for knockout rows.
const targetRows = [80, 82, 83, 84, 85, 86, 87, 88, 89, 90, 92, 93];

console.log('Row | Formula in Col J | Value | Extracted Teams');
for (const r of targetRows) {
    const row = r + 1; // 1-based for Excel
    const cellJ = sheet['J' + row];
    const cellD = sheet['D' + row]; // predHome (index 3 is D)
    const cellF = sheet['F' + row]; // predAway (index 5 is F)
    
    let f = cellJ ? cellJ.f : 'No formula';
    let v = cellJ ? cellJ.v : 'No value';
    let h = cellD ? cellD.v : '';
    let a = cellF ? cellF.v : '';
    
    console.log(`${row} | ${f} | ${v} | ${h} vs ${a}`);
}
