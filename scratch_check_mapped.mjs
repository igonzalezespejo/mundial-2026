import fs from 'fs';
const ranking = JSON.parse(fs.readFileSync('data/ranking.json', 'utf8'));

console.log("Estefania:", ranking.find(r => r.participantId === 'Estefania Becerra Garcia').groupPoints, ranking.find(r => r.participantId === 'Estefania Becerra Garcia').roundPoints['R32']);
console.log("José Manuel:", ranking.find(r => r.participantId === 'José Manuel Álvarez de la Fuent').groupPoints, ranking.find(r => r.participantId === 'José Manuel Álvarez de la Fuent').roundPoints['R32']);
