import { loadAllData } from './dataLoader.js';
import { initRankingView } from './rankingView.js';
import { initParticipantView } from './participantView.js';

const appContainer = document.getElementById('app-container');

function mountView(templateId) {
    const template = document.getElementById(templateId);
    if (!template) return null;
    
    appContainer.innerHTML = '';
    const content = template.content.cloneNode(true);
    appContainer.appendChild(content);
    return appContainer;
}

export function showRankingView() {
    mountView('ranking-template');
    initRankingView();
}

export function showParticipantView(participantId) {
    mountView('participant-template');
    initParticipantView(participantId);
    
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', showRankingView);
    }
}

async function init() {
    const statusBox = document.getElementById('status-bar');
    statusBox.innerHTML = 'Cargando datos... 0%';

    const success = await loadAllData((file) => {
        statusBox.innerHTML = `Cargando ${file}...`;
    });

    if (success) {
        statusBox.innerHTML = `Última actualización local: ${new Date().toLocaleString('es-ES')}`;
        showRankingView();
    } else {
        statusBox.innerHTML = '<span style="color: var(--danger);">Error cargando datos. Revisa la consola.</span>';
        appContainer.innerHTML = '<div class="card"><p>No se pudo inicializar la aplicación porque faltan datos.</p></div>';
    }
}

init();
