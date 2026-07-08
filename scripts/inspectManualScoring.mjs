import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

function main() {
    const ranking = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ranking.json'), 'utf8'));
    const arg = process.argv[2];

    if (arg) {
        // Individual participant
        const participant = ranking.find(p => p.participantId === arg || p.displayName === arg);
        if (!participant) {
            console.log(`Participante "${arg}" no encontrado.`);
            return;
        }
        console.log(`\n=== Desglose para ${participant.displayName} ===`);
        console.log(`Total: ${participant.totalPoints} | Grupos: ${participant.groupPoints} | Eliminatorias: ${participant.knockoutPoints}`);
        console.log(`Desglose por rondas:`, participant.roundPoints);
    } else {
        // General stats
        console.log(`\n=== Top 10 Ranking ===`);
        ranking.slice(0, 10).forEach((p, i) => {
            console.log(`${i+1}. ${p.displayName}: ${p.totalPoints} pts (Grupos: ${p.groupPoints}, Eliminatorias: ${p.knockoutPoints})`);
        });

        const roundSums = { R32: 0, R16: 0, QF: 0, SF: 0, FINAL: 0, CHAMPION: 0, THIRD_PLACE: 0 };
        const participantsWithPoints = { R32: 0, R16: 0, QF: 0, SF: 0, FINAL: 0, CHAMPION: 0, THIRD_PLACE: 0 };

        ranking.forEach(p => {
            const rPts = p.roundPoints || {};
            for (const round of Object.keys(roundSums)) {
                if (rPts[round] > 0) {
                    roundSums[round] += rPts[round];
                    participantsWithPoints[round]++;
                }
            }
        });

        console.log(`\n=== Resumen de puntos sumados en eliminatorias ===`);
        for (const round of Object.keys(roundSums)) {
            console.log(`- ${round}: ${participantsWithPoints[round]} participantes sumaron puntos (Total: ${roundSums[round]} pts)`);
        }

        const topKnockout = [...ranking].sort((a, b) => b.knockoutPoints - a.knockoutPoints).slice(0, 5);
        console.log(`\n=== Top 5 Participantes en Eliminatorias ===`);
        topKnockout.forEach((p, i) => {
            console.log(`${i+1}. ${p.displayName}: ${p.knockoutPoints} pts`);
        });
    }
}

main();
