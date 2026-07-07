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

    // Sort by matchId
    preds.sort((a,b) => a.matchId.localeCompare(b.matchId));

    const table = document.createElement('div');
    table.className = 'table-container';
    
    let html = `<table>
                    <thead>
                        <tr>
                            <th>Partido</th>
                            <th>Apuesta</th>
                            <th>Resultado Real</th>
                            <th>Puntos</th>
                        </tr>
                    </thead>
                    <tbody>`;
                    
    preds.forEach(p => {
        // Need to find real match to show team names if possible, but matchId contains teams in group
        // Real result
        const rMatch = appData.results.find(r => r.matchId === p.matchId);
        
        // Let's use match.json to get proper teams
        const matchInfo = appData.matches.find(m => m.matchId === p.matchId) || { homeTeam: p.matchId.split('-')[1], awayTeam: p.matchId.split('-')[2] };

        let realScore = rMatch && rMatch.status === 'FINISHED' ? `${rMatch.homeGoals} - ${rMatch.awayGoals}` : '-';
        
        // Scoring status (approximate based on points)
        // This participant might have points calculated in ranking.json? Actually we don't have individual match points in ranking.json.
        // For visual, we can just guess or show if it matches.
        // We will just show the scores.
        
        html += `<tr>
                    <td>${matchInfo.matchId} <br> <small>${escapeHTML(matchInfo.homeTeam)} vs ${escapeHTML(matchInfo.awayTeam)}</small></td>
                    <td><strong>${p.predictedHomeGoals} - ${p.predictedAwayGoals}</strong></td>
                    <td>${realScore}</td>
                    <td>-</td>
                 </tr>`;
    });
    
    html += `</tbody></table>`;
    table.innerHTML = html;
    container.appendChild(table);
}
