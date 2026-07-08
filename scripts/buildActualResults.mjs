import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

function main() {
    console.log('Building actual results from manual input...');
    
    const manualResultsPath = path.join(DATA_DIR, 'manual_results.json');
    if (!fs.existsSync(manualResultsPath)) {
        console.warn('manual_results.json not found. Skipping buildActualResults.');
        return;
    }
    
    const manualResults = JSON.parse(fs.readFileSync(manualResultsPath, 'utf8'));
    const template = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'bracket_template_2026.json'), 'utf8'));
    const allMatches = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'matches.json'), 'utf8'));
    
    const validation = {
        status: "OK",
        errors: [],
        warnings: []
    };
    
    const validGroupMatchIds = new Set(allMatches.map(m => m.matchId));
    
    const validSlotIds = new Set([
        ...Array.from({length: 16}, (_, i) => `R32-${String(i+1).padStart(2, '0')}`),
        ...Array.from({length: 8}, (_, i) => `R16-${String(i+1).padStart(2, '0')}`),
        ...Array.from({length: 4}, (_, i) => `QF-${String(i+1).padStart(2, '0')}`),
        ...Array.from({length: 2}, (_, i) => `SF-${String(i+1).padStart(2, '0')}`),
        'THIRD_PLACE',
        'FINAL'
    ]);
    const isValidSlot = (id) => validSlotIds.has(id);
    
    // Validate group results
    if (manualResults.groupResults) {
        for (const gr of manualResults.groupResults) {
            if (!validGroupMatchIds.has(gr.matchId)) {
                validation.errors.push(`Invalid matchId in groupResults: ${gr.matchId}`);
            }
            if (gr.homeGoals < 0 || gr.awayGoals < 0) {
                validation.errors.push(`Negative goals in matchId ${gr.matchId}`);
            }
            if (gr.status === 'FINISHED' && (gr.homeGoals == null || gr.awayGoals == null)) {
                validation.errors.push(`FINISHED match ${gr.matchId} must have goals`);
            }
        }
    }
    
    // Validate knockout results
    if (manualResults.knockoutResults) {
        for (const kr of manualResults.knockoutResults) {
            if (!isValidSlot(kr.slotId)) {
                validation.errors.push(`Invalid slotId in knockoutResults: ${kr.slotId}`);
            } else {
                const templateSlot = template.find(t => t.slotId === kr.slotId);
                if (templateSlot && kr.matchNo && templateSlot.matchNo !== kr.matchNo) {
                    validation.errors.push(`ERROR: ${kr.slotId} apunta a matchNo ${kr.matchNo} pero plantilla/AHR dice matchNo ${templateSlot.matchNo}`);
                }
            }
            if (kr.homeGoals < 0 || kr.awayGoals < 0) {
                validation.errors.push(`Negative goals in slotId ${kr.slotId}`);
            }
            if (kr.status === 'FINISHED') {
                if (kr.homeGoals == null || kr.awayGoals == null) {
                    validation.errors.push(`FINISHED match ${kr.slotId} must have goals`);
                } else if (kr.homeGoals === kr.awayGoals) {
                    if (!kr.winner) {
                        validation.errors.push(`Tied FINISHED match ${kr.slotId} must have a winner`);
                    }
                }
                if (kr.winner && kr.winner !== kr.homeTeam && kr.winner !== kr.awayTeam) {
                    validation.errors.push(`Winner ${kr.winner} in ${kr.slotId} is not homeTeam or awayTeam`);
                }
            }
        }
    }
    
    fs.writeFileSync(path.join(DATA_DIR, 'manual_results_validation.json'), JSON.stringify(validation, null, 2));
    
    if (validation.errors.length > 0) {
        console.error('Validation errors found in manual_results.json:');
        validation.errors.forEach(e => console.error(`- ${e}`));
        process.exit(1);
    }
    
    // 1. Update Group Results (results.json)
    if (manualResults.groupResults && manualResults.groupResults.length > 0) {
        const resultsPath = path.join(DATA_DIR, 'results.json');
        let currentResults = [];
        if (fs.existsSync(resultsPath)) {
            currentResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        }
        
        const resultsMap = new Map(currentResults.map(r => [r.matchId, r]));
        for (const gr of manualResults.groupResults) {
            if (resultsMap.has(gr.matchId)) {
                Object.assign(resultsMap.get(gr.matchId), gr);
            } else {
                resultsMap.set(gr.matchId, gr);
            }
        }
        
        fs.writeFileSync(resultsPath, JSON.stringify(Array.from(resultsMap.values()), null, 2));
        console.log(`Updated results.json with ${manualResults.groupResults.length} manual group results.`);
    }
    
    // 2. Generate actual_knockout_bracket.json
    const knockoutMatches = manualResults.knockoutResults || [];
    
    let status = 'PENDING';
    const totalSlots = 32; // R32 (16) + R16 (8) + QF (4) + SF (2) + 3RD (1) + FIN (1) = 32
    const finishedMatches = knockoutMatches.filter(m => m.status === 'FINISHED').length;
    
    if (knockoutMatches.length > 0) {
        if (finishedMatches === totalSlots) {
            status = 'COMPLETE';
        } else {
            status = 'PARTIAL';
        }
    }
    
    const actualKnockoutBracket = {
        status: status,
        usesRealKnockoutData: knockoutMatches.length > 0,
        usesParticipantAsProxy: false,
        updatedAt: manualResults.metadata?.updatedAt || null,
        matches: knockoutMatches,
        champion: manualResults.champion || null
    };
    
    fs.writeFileSync(path.join(DATA_DIR, 'actual_knockout_bracket.json'), JSON.stringify(actualKnockoutBracket, null, 2));
    console.log(`Generated actual_knockout_bracket.json with status ${status}`);
}

main();
