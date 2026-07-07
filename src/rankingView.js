import { appData } from './dataLoader.js';
import { escapeHTML } from './utils.js';
import { showParticipantView } from './app.js';

export function initRankingView() {
    const tbody = document.getElementById('ranking-body');
    if (!tbody) return;

    renderRanking(appData.ranking);

    const searchInput = document.getElementById('search-participant');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = appData.ranking.filter(r => 
                (r.displayName || r.participantId).toLowerCase().includes(term)
            );
            renderRanking(filtered);
        });
    }
}

function renderRanking(rankingList) {
    const tbody = document.getElementById('ranking-body');
    tbody.innerHTML = '';

    if (rankingList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No se encontraron participantes.</td></tr>`;
        return;
    }

    rankingList.forEach((r, index) => {
        const tr = document.createElement('tr');
        tr.className = 'ranking-row';
        tr.onclick = () => showParticipantView(r.participantId);
        
        const rPts = r.roundPoints || {};
        tr.innerHTML = `
            <td>${r.rank || index + 1}</td>
            <td><strong>${escapeHTML(r.displayName || r.participantId)}</strong></td>
            <td style="color:var(--accent)"><strong>${r.totalPoints}</strong></td>
            <td>${r.groupPoints}</td>
            <td>${rPts.R32 || 0}</td>
            <td>${rPts.R16 || 0}</td>
            <td>${rPts.QF || 0}</td>
            <td>${rPts.SF || 0}</td>
            <td>${rPts.THIRD_PLACE || 0}</td>
            <td>${rPts.FINAL || 0}</td>
            <td>${rPts.CHAMPION || 0}</td>
        `;
        tbody.appendChild(tr);
    });
}
