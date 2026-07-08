import fs from 'fs';
const matches = JSON.parse(fs.readFileSync('data/matches.json', 'utf8'));
for(let i=0; i<72; i+=6) {
   const teams = new Set();
   for(let j=0; j<6; j++) {
       teams.add(matches[i+j].homeTeam);
       teams.add(matches[i+j].awayTeam);
   }
   console.log(`Group ${String.fromCharCode(65 + i/6)}:`, Array.from(teams));
}
