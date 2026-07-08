import fs from 'fs';

const ranking = JSON.parse(fs.readFileSync('C:\\Users\\israelg\\OneDrive - abunayyangroup.com\\98. Personal\\37. Porra mundial web\\data\\ranking.json', 'utf8'));
const entry = ranking.find(r => r.participantId === "Jose Maria Diaz Antunez");
if (entry) {
    console.log("Points for R32-08:", entry.knockoutMatchPoints['R32-08']);
} else {
    console.log("Participant not found");
}
