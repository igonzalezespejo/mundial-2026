import { loadAllData, appData } from './dataLoader.js';
import { initRankingView } from './rankingView.js';
import { initParticipantView } from './participantView.js';
import { initProgressionView } from './progressionView.js';

const appContainer = document.getElementById('app-container');
const navHomeBtn = document.getElementById('nav-home');
const navProgressionBtn = document.getElementById('nav-progression');

function updateNav(activeId) {
    if (navHomeBtn) navHomeBtn.classList.remove('active');
    if (navProgressionBtn) navProgressionBtn.classList.remove('active');
    const activeBtn = document.getElementById(activeId);
    if (activeBtn) activeBtn.classList.add('active');
}

function mountView(templateId) {
    const template = document.getElementById(templateId);
    if (!template) return null;
    
    appContainer.innerHTML = '';
    const content = template.content.cloneNode(true);
    appContainer.appendChild(content);
    return appContainer;
}

export function showRankingView() {
    updateNav('nav-home');
    mountView('ranking-template');
    initRankingView();
    toggleHeaderView('main');
}

export function showProgressionView() {
    updateNav('nav-progression');
    mountView('progression-template');
    // Esperar al siguiente tick para que el contenedor exista en el DOM
    setTimeout(initProgressionView, 0);
    toggleHeaderView('main');
}

export function showParticipantView(participantId) {
    mountView('participant-template');
    initParticipantView(participantId);
    toggleHeaderView('participant');
    
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', showRankingView);
    }
}

function toggleHeaderView(viewType) {
    const mainTitle = document.getElementById('main-title-section');
    const participantInfo = document.getElementById('header-participant-info');
    if (viewType === 'main') {
        if (mainTitle) mainTitle.style.display = 'block';
        if (participantInfo) participantInfo.style.display = 'none';
    } else {
        if (mainTitle) mainTitle.style.display = 'none';
        if (participantInfo) participantInfo.style.display = 'block';
    }
}

async function init() {
    const statusBox = document.getElementById('status-bar');
    statusBox.innerHTML = 'Cargando datos... 0%';

    const success = await loadAllData((file) => {
        statusBox.innerHTML = `Cargando ${file}...`;
    });

    if (success) {
        const kb = appData.actual_knockout_bracket || {};
        const kbStatus = kb.status || 'PENDING';
        let kbUpdate = 'N/A';
        if (kb.updatedAt) {
            const dateObj = new Date(kb.updatedAt);
            const d = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const t = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            kbUpdate = `${d} ${t}`;
        }
        statusBox.innerHTML = `Eliminatorias: ${kbStatus} &middot; actualizado ${kbUpdate}`;
        showRankingView();
        
        // Listeners for top nav buttons
        if (navHomeBtn) {
            navHomeBtn.addEventListener('click', showRankingView);
        }
        if (navProgressionBtn) {
            navProgressionBtn.addEventListener('click', showProgressionView);
        }
    } else {
        statusBox.innerHTML = '<span style="color: var(--danger);">Error cargando datos. Revisa la consola.</span>';
        appContainer.innerHTML = '<div class="card"><p>No se pudo inicializar la aplicación porque faltan datos.</p></div>';
    }
}

init();
