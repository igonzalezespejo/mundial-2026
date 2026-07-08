import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

const participantId = process.argv[2];
const roundFilter = process.argv[3] || 'R32';

if (!participantId) {
    console.error('Usage: node traceParticipantRound.mjs <ParticipantId> [Round]');
    process.exit(1);
}

const knockoutPreds = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'knockout_predictions.json'), 'utf8'));
const actuals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'actual_knockout_bracket.json'), 'utf8'));
const predStandings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'group_standings_predictions.json'), 'utf8'));
const actStandings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'group_standings_actual.json'), 'utf8'));

const pPreds = knockoutPreds.filter(x => x.participantId === participantId && x.round === roundFilter);
const pSt = predStandings.find(x => x.participantId === participantId);

const normalizeTeamName = (name) => name ? name.trim() : name;

const getTeamPos = (team, standings) => {
    if (!standings || !team) return null;
    const st = standings.find(s => normalizeTeamName(s.team) === normalizeTeamName(team));
    return st ? st.position : null;
};

console.log(`\n=== Trazando ${participantId} - ${roundFilter} ===`);

let total = 0;

pPreds.forEach(pred => {
    const act = actuals.matches.find(m => m.slotId === pred.slotId);
    if (!act || act.status === 'PENDING') return;

    const pHome = normalizeTeamName(pred.predictedHomeTeam);
    const pAway = normalizeTeamName(pred.predictedAwayTeam);
    const aHome = normalizeTeamName(act.homeTeam);
    const aAway = normalizeTeamName(act.awayTeam);

    const roundTeams = new Set();
    actuals.matches.filter(m => m.round === roundFilter && m.status !== 'PENDING').forEach(m => {
        if (m.homeTeam) roundTeams.add(normalizeTeamName(m.homeTeam));
        if (m.awayTeam) roundTeams.add(normalizeTeamName(m.awayTeam));
    });

    let homeBase = 0, homeExt = 0;
    let awayBase = 0, awayExt = 0;

    const checkTeam = (team, isHome) => {
        const pTeam = isHome ? pHome : pAway;
        const aTeam = isHome ? aHome : aAway;
        
        if (!pTeam) return { base: 0, ext: 0, reason: 'No prediction' };

        if (aTeam === pTeam) {
            const actPos = getTeamPos(pTeam, actStandings);
            const predPos = getTeamPos(pTeam, pSt ? pSt.standings : null);
            if (actPos === predPos || !actPos || !predPos) {
                return { base: 10, ext: 20, reason: `EXACT POS (${actPos})` };
            } else {
                return { base: 10, ext: 0, reason: `WRONG SOURCE (Pred: ${predPos}, Act: ${actPos})` };
            }
        } else if (roundTeams.has(pTeam)) {
            return { base: 10, ext: 0, reason: 'WRONG SLOT' };
        }
        return { base: 0, ext: 0, reason: 'MISSED' };
    };

    const hResult = checkTeam(pHome, true);
    const aResult = checkTeam(pAway, false);

    console.log(`\nSlot: ${pred.slotId}`);
    if (pHome) console.log(`  HOME: ${pHome.padEnd(15)} | Base: ${hResult.base}, Extra: ${hResult.ext} | ${hResult.reason}`);
    if (pAway) console.log(`  AWAY: ${pAway.padEnd(15)} | Base: ${aResult.base}, Extra: ${aResult.ext} | ${aResult.reason}`);

    total += hResult.base + hResult.ext + aResult.base + aResult.ext;

    // Bonus check
    if (hResult.ext === 20 && aResult.ext === 20) {
        if (pred.predictedHomeGoals === act.homeGoals && pred.predictedAwayGoals === act.awayGoals) {
            if (normalizeTeamName(pred.predictedWinner) === normalizeTeamName(act.winner)) {
                console.log(`  BONUS: +20 (Exact Score & Winner)`);
                total += 20;
            }
        }
    }
});

console.log(`\nTOTAL CALCULADO ${roundFilter}: ${total}`);
