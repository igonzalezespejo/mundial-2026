import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

function main() {
    const template = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'bracket_template_2026.json'), 'utf8'));
    const standings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'group_standings_actual.json'), 'utf8'));
    
    // Create a map for 1A, 2A, 1B, etc.
    const teamPositions = {};
    for (const st of standings) {
        if (st.position) {
            teamPositions[st.position] = st.team;
        }
    }
    
    // For third place logic, let's just create pending structures for everything in R32
    // actually, best third places require complex logic, so let's just read what the user's validateGroupScoring or extract script did
    // The extract script might have already generated actual_knockout_bracket.json with the teams populated if they useParticipantAsProxy
    const actualBracket = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'actual_knockout_bracket.json'), 'utf8'));
    
    let manualMatches = [];
    
    manualMatches = template.map(t => {
        return {
            slotId: t.slotId,
            matchNo: t.matchNo,
            round: t.round,
            homeTeam: teamPositions[t.homeSource] || "TBD",
            awayTeam: teamPositions[t.awaySource] || "TBD",
            homeGoals: null,
            awayGoals: null,
            winner: null,
            status: "PENDING",
            decidedByPenalties: false,
            penaltiesHome: null,
            penaltiesAway: null,
            notes: ""
        };
    });

    const manualResults = {
        metadata: {
            updatedAt: new Date().toISOString(),
            source: "manual",
            notes: "Resultados introducidos manualmente"
        },
        groupResults: [],
        knockoutResults: manualMatches,
        champion: null
    };

    fs.writeFileSync(path.join(DATA_DIR, 'manual_results_template.json'), JSON.stringify(manualResults, null, 2));
    console.log("Template generated at data/manual_results_template.json");
}

main();
