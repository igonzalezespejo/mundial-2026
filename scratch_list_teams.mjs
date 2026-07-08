import fs from 'fs';
const matches = JSON.parse(fs.readFileSync('data/matches.json', 'utf8'));
const teams = new Set();
matches.forEach(m => {
    teams.add(m.homeTeam);
    teams.add(m.awayTeam);
});
console.log(Array.from(teams).sort());
