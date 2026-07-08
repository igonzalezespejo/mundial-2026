import { appData } from './dataLoader.js';
import { escapeHTML } from './utils.js';
import { renderGroupStage } from './groupView.js';
import { renderBracketStage } from './bracketView.js';

export function initParticipantView(participantId) {
    const participant = appData.participants.find(p => p.participantId === participantId);
    const rankingEntry = appData.ranking.find(r => r.participantId === participantId);

    if (!participant || !rankingEntry) return;

    const rPts = rankingEntry.roundPoints || {};
    const kbStatus = appData.actual_knockout_bracket.status || 'PENDING';
    let statusMsg = '';
    if (kbStatus === 'PENDING') statusMsg = 'Eliminatorias pendientes de resultados reales.';
    else if (kbStatus === 'PARTIAL') statusMsg = 'Eliminatorias parcialmente actualizadas.';
    else if (kbStatus === 'COMPLETE') statusMsg = 'Eliminatorias completas.';

    const header = document.getElementById('header-participant-info');
    if (header) {
        header.innerHTML = `
            <h2>${escapeHTML(participant.displayName || participantId)}</h2>
            <div class="header-participant-stats">
                <div><strong>Total:</strong> <span style="color:var(--accent)">${rankingEntry.totalPoints}</span></div>
                <div><strong>Grupos:</strong> ${rankingEntry.groupPoints}</div>
                <div><strong>16avos:</strong> ${rPts.R32 || 0}</div>
                <div><strong>8os:</strong> ${rPts.R16 || 0}</div>
                <div><strong>4os:</strong> ${rPts.QF || 0}</div>
                <div><strong>Semis:</strong> ${rPts.SF || 0}</div>
                <div><strong>3er:</strong> ${rPts.THIRD_PLACE || 0}</div>
                <div><strong>Final:</strong> ${rPts.FINAL || 0}</div>
                <div><strong>Campeón:</strong> ${rPts.CHAMPION || 0}</div>
            </div>
            ${statusMsg ? `<div style="color:var(--warning); font-size:0.75rem; margin-top:0.25rem;">${statusMsg}</div>` : ''}
        `;
    }

    // Tabs logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        // remove old listeners by cloning
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            newBtn.classList.add('active');
            const targetId = newBtn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Render contents
    renderGroupStage(participantId);
    renderBracketStage(participantId);
}
