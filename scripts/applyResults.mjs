import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

const userInputText = `
South Africa 0 - 1 Canada. Pasa Canada.
Brazil 2 - 1 Japan. Pasa Brazil.
Germany 1 - 1 Paraguay. Pasa Germany por penaltis 4-3.
Netherlands 1 - 1 Morocco. Pasa Netherlands por penaltis 3-2.
Ivory Coast 1 - 2 Norway. Pasa Norway.
France 3 - 0 Sweden. Pasa France.
Mexico 2 - 0 Ecuador. Pasa Mexico.
England 2 - 1 DR Congo. Pasa England.
Belgium 3 - 2 Senegal. Pasa Belgium tras prórroga.
United States 2 - 0 Bosnia and Herzegovina. Pasa United States.
Spain 3 - 0 Austria. Pasa Spain.
Portugal 2 - 1 Croatia. Pasa Portugal.
Switzerland 2 - 0 Algeria. Pasa Switzerland.
Australia 1 - 1 Egypt. Pasa Egypt por penaltis 4-2.
Argentina 3 - 2 Cape Verde. Pasa Argentina tras prórroga.
Colombia 1 - 0 Ghana. Pasa Colombia.
Morocco 3 - 0 Canada. Pasa Morocco.
France 1 - 0 Paraguay. Pasa France.
Brazil 0 - 2 Norway. Pasa Norway.
Mexico 2 - 3 England. Pasa England.
Spain 1 - 0 Portugal. Pasa Spain.
United States 1 - 4 Belgium. Pasa Belgium.
`;

const teamTranslations = {
    "South Africa": "Sudáfrica",
    "Canada": "Canadá",
    "Brazil": "Brasil",
    "Japan": "Japón",
    "Germany": "Alemania",
    "Paraguay": "Paraguay",
    "Netherlands": "Países Bajos",
    "Morocco": "Marruecos",
    "Ivory Coast": "Costa de Marfil",
    "Norway": "Noruega",
    "France": "Francia",
    "Sweden": "Suecia",
    "Mexico": "México",
    "Ecuador": "Ecuador",
    "England": "Inglaterra",
    "DR Congo": "RD Congo", // Need to verify RD Congo or República Democrática del Congo
    "Belgium": "Bélgica",
    "Senegal": "Senegal",
    "United States": "Estados Unidos",
    "Bosnia and Herzegovina": "Bosnia y Herzegovina",
    "Spain": "España",
    "Austria": "Austria",
    "Portugal": "Portugal",
    "Croatia": "Croacia",
    "Switzerland": "Suiza",
    "Algeria": "Argelia",
    "Australia": "Australia",
    "Egypt": "Egipto",
    "Argentina": "Argentina",
    "Cape Verde": "Cabo Verde",
    "Colombia": "Colombia",
    "Ghana": "Ghana"
};

function main() {
    let manualResults = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'manual_results.json'), 'utf8'));
    
    const lines = userInputText.trim().split('\n');
    let loadedR32 = 0;
    let loadedR16 = 0;
    let unmapped = [];
    
    // We need a list of all existing predictions/matches to find the correct slotIds for R16
    const knockoutPreds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'knockout_predictions.json'), 'utf8'));
    const allSlotIds = [...new Set(knockoutPreds.map(p => p.slotId))].filter(s => s);
    
    for (const line of lines) {
        if (!line.trim()) continue;
        
        // e.g. "South Africa 0 - 1 Canada. Pasa Canada."
        // e.g. "Germany 1 - 1 Paraguay. Pasa Germany por penaltis 4-3."
        const match = line.match(/^(.*?)\s+(\d+)\s*-\s*(\d+)\s+(.*?)\.\s*Pasa\s+(.*?)(?:\s*por penaltis.*| tras prórroga.*)?\.$/);
        
        if (match) {
            let [_, homeEng, homeGoalsStr, awayGoalsStr, awayEng, winnerEng] = match;
            
            const homeTeam = teamTranslations[homeEng] || homeEng;
            const awayTeam = teamTranslations[awayEng] || awayEng;
            const winner = teamTranslations[winnerEng.split(' por ')[0].split(' tras ')[0]] || winnerEng.split(' por ')[0].split(' tras ')[0];
            
            const homeGoals = parseInt(homeGoalsStr, 10);
            const awayGoals = parseInt(awayGoalsStr, 10);
            
            const isPenalties = line.includes('por penaltis');
            const notes = line.split('. ')[1];
            
            // Try to find in R32 existing structure first
            let foundSlot = manualResults.knockoutResults.find(k => 
                (k.homeTeam === homeTeam && (k.awayTeam === awayTeam || k.awayTeam === 'TBD')) ||
                (k.awayTeam === awayTeam && (k.homeTeam === homeTeam || k.homeTeam === 'TBD')) ||
                (k.homeTeam === 'TBD' && k.awayTeam === 'TBD') // fallback, but we should map correctly
            );
            
            // Actually, we should map R32 directly if they match
            foundSlot = manualResults.knockoutResults.find(k => 
                (k.homeTeam === homeTeam || k.homeTeam === 'TBD') && 
                (k.awayTeam === awayTeam || k.awayTeam === 'TBD') &&
                k.round === 'R32'
            );
            
            // If not found, maybe it's R16. Since R16 slots aren't even created yet, we just create them.
            // But we need to assign a valid R16 slotId. 
            // We can just iterate R16-01 to R16-08 to find an empty one, or create one if it doesn't exist.
            if (!foundSlot) {
                // Determine if it's R32 or R16 based on our parsed lines
                // R32 has 16 matches, R16 has 8 matches.
                const round = line.includes('Morocco 3 - 0') || line.includes('France 1 - 0') || 
                              line.includes('Brazil 0 - 2') || line.includes('Mexico 2 - 3') || 
                              line.includes('Spain 1 - 0') || line.includes('United States 1 - 4') ? 'R16' : 'R32';
                              
                if (round === 'R16') {
                    // Find next R16 slotId
                    let r16Slots = manualResults.knockoutResults.filter(k => k.round === 'R16');
                    const nextId = `R16-${String(r16Slots.length + 1).padStart(2, '0')}`;
                    foundSlot = {
                        slotId: nextId,
                        matchNo: 88 + r16Slots.length + 1,
                        round: "R16",
                        homeTeam: homeTeam,
                        awayTeam: awayTeam,
                        status: "PENDING"
                    };
                    manualResults.knockoutResults.push(foundSlot);
                } else {
                    // It's R32 but we couldn't match the teams exactly (maybe "RD Congo" vs "TBD")
                    // Let's try to find a R32 slot where one team matches, or just find the first TBD vs TBD
                    foundSlot = manualResults.knockoutResults.find(k => 
                        (k.homeTeam === homeTeam && k.awayTeam === 'TBD') || 
                        (k.awayTeam === awayTeam && k.homeTeam === 'TBD')
                    );
                    
                    if (!foundSlot) {
                        unmapped.push(line);
                        continue;
                    }
                }
            }
            
            foundSlot.homeTeam = homeTeam;
            foundSlot.awayTeam = awayTeam;
            foundSlot.homeGoals = homeGoals;
            foundSlot.awayGoals = awayGoals;
            foundSlot.winner = winner;
            foundSlot.status = "FINISHED";
            foundSlot.decidedByPenalties = isPenalties;
            foundSlot.notes = notes;
            
            if (foundSlot.round === 'R32') loadedR32++;
            if (foundSlot.round === 'R16') loadedR16++;
            
        } else {
            unmapped.push(line);
        }
    }
    
    // Hardcode pending matches to ensure they are there
    manualResults.knockoutResults.push({
        slotId: "R16-07",
        matchNo: 95,
        round: "R16",
        homeTeam: "Argentina",
        awayTeam: "Egipto",
        homeGoals: null,
        awayGoals: null,
        winner: null,
        status: "PENDING"
    });
    
    manualResults.knockoutResults.push({
        slotId: "R16-08",
        matchNo: 96,
        round: "R16",
        homeTeam: "Suiza",
        awayTeam: "Colombia",
        homeGoals: null,
        awayGoals: null,
        winner: null,
        status: "PENDING"
    });

    manualResults.metadata.updatedAt = new Date().toISOString();
    fs.writeFileSync(path.join(DATA_DIR, 'manual_results.json'), JSON.stringify(manualResults, null, 2));
    
    console.log(`Loaded R32: ${loadedR32}`);
    console.log(`Loaded R16: ${loadedR16}`);
    console.log(`Unmapped:`, unmapped);
}

main();
