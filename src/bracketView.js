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

    const roundsOrder = ['R32', 'R16', 'QF', 'SF', 'THIRD_PLACE', 'FINAL', 'CHAMPION'];
    
    // Agrupar predicciones por ronda
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
        
        let html = `<h3 style="margin-bottom: 1rem; color: var(--accent);">${round}</h3>`;
        
        if (round === 'CHAMPION') {
            const champTeam = roundPreds[0].team;
            if (champTeam && champTeam.trim() !== '') {
                html += `<p style="font-size: 1.2rem;"><strong>Campeón Apostado:</strong> ${escapeHTML(champTeam)}</p>`;
            } else {
                html += `<p style="font-size: 1.2rem;" class="status-warning"><strong>Campeón Apostado:</strong> No detectado</p>`;
            }
        } else {
            html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">`;
            
            // Sort by slotId
            roundPreds.sort((a,b) => (a.slotId || '').localeCompare(b.slotId || ''));

            roundPreds.forEach(p => {
                const templateSlot = appData.bracket_template_2026.find(s => s.slotId === p.slotId) || {};
                const actualSlot = appData.actual_knockout_bracket.matches.find(m => m.slotId === p.slotId) || {};
                
                let sourceInfo = templateSlot.homeSource ? `${templateSlot.homeSource} vs ${templateSlot.awaySource}` : '';
                let matchNo = templateSlot.matchNo ? `M${templateSlot.matchNo}` : '';
                
                let hTeam = escapeHTML(p.predictedHomeTeam || 'N/A');
                let aTeam = escapeHTML(p.predictedAwayTeam || 'N/A');
                let score = p.predictedHomeGoals !== null ? `${p.predictedHomeGoals} - ${p.predictedAwayGoals}` : 'Pasa: ' + (p.predictedWinner || '?');

                html += `<div class="bracket-slot">
                            <div class="bracket-slot-header">
                                ${matchNo} · ${p.slotId} ${sourceInfo ? ' · ' + sourceInfo : ''}
                            </div>
                            <div class="bracket-slot-teams">
                                <span>${hTeam}</span>
                                <span>${score}</span>
                                <span>${aTeam}</span>
                            </div>
                         </div>`;
            });
            html += `</div>`;
        }
        
        roundDiv.innerHTML = html;
        container.appendChild(roundDiv);
    });
}
