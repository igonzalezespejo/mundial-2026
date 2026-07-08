import xlsx from 'xlsx';
import fs from 'fs';

const files = fs.readdirSync('C:\\Users\\israelg\\OneDrive - abunayyangroup.com\\98. Personal\\37. Porra mundial web\\data_raw').filter(f => f.endsWith('.xlsx') && !f.includes('~'));
const file = 'C:\\Users\\israelg\\OneDrive - abunayyangroup.com\\98. Personal\\37. Porra mundial web\\data_raw\\' + files[0];
console.log("Reading file:", file);
const workbook = xlsx.readFile(file);
const sheetName = 'PORRA';
console.log("Using sheet:", sheetName);
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log("Total rows:", data.length);
for (let i = 113; i < 118; i++) {
    console.log(`Row ${i + 1}:`, data[i]);
}
