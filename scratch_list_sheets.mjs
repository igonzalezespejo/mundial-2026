import xlsx from 'xlsx';

const wb = xlsx.readFile('C:\\Users\\israelg\\OneDrive - abunayyangroup.com\\98. Personal\\37. Porra mundial web\\data_raw\\PORRAS_Combinadas - copia.xlsx');
console.log(wb.SheetNames);
