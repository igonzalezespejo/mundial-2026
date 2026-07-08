import { appData } from './dataLoader.js';
import { escapeHTML, getStatusClass } from './utils.js';

export function renderGroupStage(participantId) {
    renderGroupStandings(participantId);
    renderGroupMatches(participantId);
}

function renderGroupStandings(participantId) {
    const container = document.getElementById('group-standings-container');
    container.innerHTML = '';

    const pStandingsEntry = appData.group_standings_predictions.find(s => s.participantId === participantId);
    if (!pStandingsEntry) return;

    // Group standings by 'group' (A, B, C...)
    const grouped = {};
    pStandingsEntry.standings.forEach(s => {
        if (!grouped[s.group]) grouped[s.group] = [];
        grouped[s.group].push(s);
    });

    const sortedGroups = Object.keys(grouped).sort();

    sortedGroups.forEach(g => {
        const table = document.createElement('div');
        table.className = 'card';
        
        let html = `<h4 style="margin-bottom: 0.5rem;">Grupo ${g}</h4>`;
        html += `<table class="group-table" style="font-size: 0.85rem;">
                    <thead><tr><th>Pos</th><th>Equipo</th><th>Pts</th><th>GF</th><th>GD</th></tr></thead>
                    <tbody>`;
        
        grouped[g].forEach((s, i) => {
            html += `<tr>
                        <td><strong>${i+1}${g}</strong></td>
                        <td>${escapeHTML(s.team)}</td>
                        <td>${s.points}</td>
                        <td>${s.goalsFor}</td>
                        <td>${s.goalDifference}</td>
                     </tr>`;
        });
        
        html += `</tbody></table>`;
        table.innerHTML = html;
        container.appendChild(table);
    });

    if (pStandingsEntry.bestThirdsCombination) {
        const thirdsDiv = document.createElement('div');
        thirdsDiv.className = 'card';
        thirdsDiv.style.gridColumn = '1 / -1';
        thirdsDiv.innerHTML = `<h4>Mejores Terceros</h4><p>Combinación calculada: <strong>${pStandingsEntry.bestThirdsCombination}</strong></p>`;
        container.appendChild(thirdsDiv);
    }
}

function renderGroupMatches(participantId) {
    const container = document.getElementById('group-matches-container');
    container.innerHTML = '';

    const preds = appData.predictions.filter(p => p.participantId === participantId);
    if (!preds.length) return;

    preds.sort((a,b) => a.matchId.localeCompare(b.matchId));

    const rankingEntry = appData.ranking.find(r => r.participantId === participantId);
    const groupMatchPoints = rankingEntry ? rankingEntry.groupMatchPoints : {};

    const table = document.createElement('div');
    table.className = 'table-container';
    
    let html = `<table class="matches-table">
                    <thead>
                        <tr>
                            <th>PARTIDO</th>
                            <th>APUESTA</th>
                            <th>RESULTADO REAL</th>
                            <th>PUNTOS</th>
                        </tr>
                    </thead>
                    <tbody>`;
                    
    preds.forEach(p => {
        const rMatch = appData.results.find(r => r.matchId === p.matchId);
        const matchInfo = appData.matches.find(m => m.matchId === p.matchId) || { homeTeam: p.matchId.split('-')[1], awayTeam: p.matchId.split('-')[2] };

        let matchNumStr = matchInfo.matchNo ? String(matchInfo.matchNo).padStart(2, '0') : p.matchId.replace('MATCH-', '');
        let groupStr = matchInfo.group ? `Grupo ${matchInfo.group}` : '';
        let partidoText = `M${matchNumStr}` + (groupStr ? ` &middot; ${groupStr}` : '');
        
        let homeT = escapeHTML(matchInfo.homeTeam);
        let awayT = escapeHTML(matchInfo.awayTeam);
        
        let apuesta = `${homeT} ${p.predictedHomeGoals} - ${p.predictedAwayGoals} ${awayT}`;
        
        let resultadoReal = 'Pendiente';
        const hasResult = rMatch && typeof rMatch.homeGoals === 'number' && typeof rMatch.awayGoals === 'number';
        if (hasResult) {
            resultadoReal = `${homeT} ${rMatch.homeGoals} - ${rMatch.awayGoals} ${awayT}`;
        }
        
        const pts = groupMatchPoints[p.matchId] !== undefined ? groupMatchPoints[p.matchId] : (hasResult ? 0 : '-');

        html += `<tr>
                    <td>${partidoText}</td>
                    <td>${apuesta}</td>
                    <td>${resultadoReal}</td>
                    <td>${pts}</td>
                 </tr>`;
    });
    
    html += `</tbody></table>`;
    table.innerHTML = html;
    container.appendChild(table);
}
