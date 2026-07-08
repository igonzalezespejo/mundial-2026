import { appData } from './dataLoader.js';
import { escapeHTML } from './utils.js';
import { showParticipantView } from './app.js';

export function initRankingView() {
    const tbody = document.getElementById('ranking-body');
    if (!tbody) return;

    renderRanking(appData.ranking);
    renderTop10List();

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

function renderTop10List() {
    const participants = appData.ranking || [];

    // Top 10 Grupos
    const topGroups = [...participants].sort((a, b) => (b.groupPoints || 0) - (a.groupPoints || 0)).slice(0, 10);
    renderMiniTable('top10-groups', topGroups, p => p.groupPoints || 0);

    // Top 10 8os (R16)
    const topR16 = [...participants].sort((a, b) => ((b.roundPoints && b.roundPoints.R16) || 0) - ((a.roundPoints && a.roundPoints.R16) || 0)).slice(0, 10);
    renderMiniTable('top10-r16', topR16, p => (p.roundPoints && p.roundPoints.R16) || 0);

    // Top 10 4os (QF)
    const topQF = [...participants].sort((a, b) => ((b.roundPoints && b.roundPoints.QF) || 0) - ((a.roundPoints && a.roundPoints.QF) || 0)).slice(0, 10);
    renderMiniTable('top10-qf', topQF, p => (p.roundPoints && p.roundPoints.QF) || 0);
}

function renderMiniTable(containerId, list, pointsFn) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const body = container.querySelector('.top10-body');
    if (!body) return;
    
    body.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'top10-table';
    
    list.forEach((p, index) => {
        const tr = document.createElement('tr');
        tr.className = 'ranking-row';
        tr.onclick = () => showParticipantView(p.participantId);
        tr.innerHTML = `
            <td style="width:24px; color:var(--text-secondary); font-weight:700;">${index + 1}</td>
            <td><strong>${escapeHTML(p.displayName || p.participantId)}</strong></td>
            <td style="text-align:right; font-weight:700; color:var(--accent)">${pointsFn(p)}</td>
        `;
        table.appendChild(tr);
    });
    body.appendChild(table);
}
