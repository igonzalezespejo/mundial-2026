import { appData } from './dataLoader.js';
import { escapeHTML } from './utils.js';

export function renderBracketStage(participantId) {
    const container = document.getElementById('knockout-bracket-container');
    container.innerHTML = '';

    const preds = appData.knockout_predictions.filter(p => p.participantId === participantId);
    if (!preds.length) {
        container.innerHTML = '<p>No hay predicciones de eliminatorias.</p>';
        return;
    }

    const rankingEntry = appData.ranking.find(r => r.participantId === participantId);
    const knockoutMatchPoints = rankingEntry ? rankingEntry.knockoutMatchPoints : {};

    const roundsOrder = ['R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL', 'CHAMPION'];
    
    const grouped = {};
    roundsOrder.forEach(r => grouped[r] = []);
    
    preds.forEach(p => {
        if (grouped[p.round]) {
            grouped[p.round].push(p);
        }
    });

    roundsOrder.forEach(round => {
        const roundPreds = grouped[round];
        if (!roundPreds || roundPreds.length === 0) return;

        const roundDiv = document.createElement('div');
        roundDiv.className = 'card';
        
        let title = round;
        if (round === 'R32') title = '16avos / R32';
        else if (round === 'R16') title = '8os / R16';
        else if (round === 'QF') title = '4os / QF';
        else if (round === 'SF') title = 'Semis / SF';
        else if (round === 'THIRD_PLACE') title = '3er / THIRD_PLACE';
        else if (round === 'FINAL') title = 'Final / FINAL';
        else if (round === 'CHAMPION') title = 'Campeón / CHAMPION';

        let html = `<h3 style="margin-bottom: 1rem; color: var(--accent);">${title}</h3>`;
        
        if (round === 'CHAMPION') {
            const champTeam = roundPreds[0].team;
            const pts = knockoutMatchPoints['CHAMPION'] !== undefined ? knockoutMatchPoints['CHAMPION'] : '-';
            const actualChamp = appData.actual_knockout_bracket.champion || 'Pendiente';
            
            html += `<div class="table-container">
                        <table class="matches-table">
                            <thead>
                                <tr>
                                    <th>PARTIDO</th>
                                    <th>APUESTA</th>
                                    <th>RESULTADO REAL</th>
                                    <th>PUNTOS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Campeón Mundial 2026</td>
                                    <td>${escapeHTML(champTeam || 'No detectado')}</td>
                                    <td>${escapeHTML(actualChamp)}</td>
                                    <td>${pts}</td>
                                </tr>
                            </tbody>
                        </table>
                     </div>`;
        } else {
            html += `<div class="table-container">
                        <table class="matches-table">
                            <thead>
                                <tr>
                                    <th>PARTIDO</th>
                                    <th>APUESTA</th>
                                    <th>RESULTADO REAL</th>
                                    <th>PUNTOS</th>
                                </tr>
                            </thead>
                            <tbody>`;
            
            roundPreds.sort((a,b) => (a.slotId || '').localeCompare(b.slotId || ''));

            roundPreds.forEach(p => {
                const templateSlot = appData.bracket_template_2026.find(s => s.slotId === p.slotId) || {};
                const actualSlot = appData.actual_knockout_bracket.matches.find(m => m.slotId === p.slotId) || {};
                
                let matchNo = templateSlot.matchNo ? `M${templateSlot.matchNo}` : '';
                
                let partidoText = matchNo ? `${matchNo} · ${p.slotId}` : p.slotId;

                let apuHome = escapeHTML(p.predictedHomeTeam || '?');
                let apuAway = escapeHTML(p.predictedAwayTeam || '?');
                let apuesta = `${apuHome} ${p.predictedHomeGoals !== null ? p.predictedHomeGoals : '?'} - ${p.predictedAwayGoals !== null ? p.predictedAwayGoals : '?'} ${apuAway}`;
                
                if (p.predictedHomeGoals !== null && p.predictedHomeGoals === p.predictedAwayGoals && p.predictedWinner) {
                    apuesta += ` · pasa ${escapeHTML(p.predictedWinner)}`;
                }

                let resultadoReal = 'Pendiente';
                if (actualSlot && actualSlot.status === 'FINISHED') {
                    let actHome = escapeHTML(actualSlot.homeTeam || '?');
                    let actAway = escapeHTML(actualSlot.awayTeam || '?');
                    resultadoReal = `${actHome} ${actualSlot.homeGoals} - ${actualSlot.awayGoals} ${actAway}`;
                    if (actualSlot.decidedByPenalties && actualSlot.winner) {
                        resultadoReal += ` · pasa ${escapeHTML(actualSlot.winner)} pen.`;
                    }
                }

                const pts = knockoutMatchPoints[p.slotId] !== undefined ? knockoutMatchPoints[p.slotId] : (actualSlot.status === 'FINISHED' ? 0 : '-');

                html += `<tr>
                            <td>${partidoText}</td>
                            <td>${apuesta}</td>
                            <td>${resultadoReal}</td>
                            <td>${pts}</td>
                         </tr>`;
            });
            html += `</tbody></table></div>`;
        }
        
        roundDiv.innerHTML = html;
        container.appendChild(roundDiv);
    });
}
