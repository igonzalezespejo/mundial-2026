import fs from 'fs';

const data = JSON.parse(fs.readFileSync('C:\\Users\\israelg\\OneDrive - abunayyangroup.com\\98. Personal\\37. Porra mundial web\\data\\knockout_predictions.json', 'utf8'));
const champs = data.filter(d => d.slotId === 'CHAMPION');
console.log("Total champions extracted:", champs.length);
console.log("First 5 champions:", champs.slice(0, 5));
