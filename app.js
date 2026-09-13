// js/app.js
window.openSubjectViewer = function(name, driveLink) {
    window.location.href = 'visor.html?name=' + encodeURIComponent(name) + '&link=' + encodeURIComponent(driveLink);
};

let activeTab = 'TODAS';
const TABS = [
    { id: 'TODAS', label: 'Todas' },
    { id: 'PRIMER AÑO', label: '1º Año' },
    { id: 'SEGUNDO AÑO', label: '2º Año' },
    { id: 'TERCER AÑO', label: '3º Año' },
    { id: 'CUARTO AÑO', label: '4º Año' },
    { id: 'QUINTO AÑO', label: '5º Año' },
    { id: 'SEXTO AÑO', label: '6º Año' },
    { id: 'EXTRACURRICULARES', label: 'Extras' }
];

window.resetAppTabs = function() {
    activeTab = 'TODAS';
};

window.renderApp = function() {
    const query = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const container = document.getElementById('subjectsContainer');
    const tabsContainer = document.getElementById('tabsContainer');
    if (!container || !tabsContainer || !window.MATERIAS_ADE) return;

    // TODAS las materias siempre como base — "Mis materias" es solo un badge visual
    const baseSubset = window.MATERIAS_ADE;

    tabsContainer.innerHTML = '';
    TABS.forEach(tab => {
        const count = tab.id === 'TODAS' ? baseSubset.length : baseSubset.filter(s => s.year === tab.id).length;
        if (count > 0 || tab.id === 'TODAS') {
            const btn = document.createElement('button');
            btn.className = 'tab-btn' + (activeTab === tab.id ? ' active' : '');
            btn.onclick = () => { activeTab = tab.id; window.renderApp(); };
            btn.innerHTML = tab.label + ' <span class="tab-badge">' + count + '</span>';
            tabsContainer.appendChild(btn);
        }
    });

    let filtered = baseSubset;
    if (activeTab !== 'TODAS') {
        filtered = filtered.filter(s => s.year === activeTab);
    }
    if (query) {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(query) || s.req.toLowerCase().includes(query));
    }

    container.innerHTML = '';
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No se encontraron resultados.</p></div>';
        return;
    }

    const grouped = filtered.reduce((acc, curr) => {
        if (!acc[curr.year]) acc[curr.year] = [];
        acc[curr.year].push(curr);
        return acc;
    }, {});

    const yearLabels = {
        'PRIMER AÑO': '1º Año',
        'SEGUNDO AÑO': '2º Año',
        'TERCER AÑO': '3º Año',
        'CUARTO AÑO': '4º Año',
        'QUINTO AÑO': '5º Año',
        'SEXTO AÑO': '6º Año',
        'EXTRACURRICULARES': 'Extracurriculares'
    };

    const order = Object.keys(yearLabels);
    order.forEach(year => {
        if (!grouped[year]) return;
        const section = document.createElement('div');
        section.className = 'year-section';

        const header = document.createElement('div');
        header.className = 'year-header';
        header.textContent = yearLabels[year] || year;
        section.appendChild(header);

        const list = document.createElement('div');
        list.className = 'inset-list';

        grouped[year].forEach(m => {
            const isCursando = window.userMySubjects && window.userMySubjects.includes(m.name);
            const row = document.createElement('a');
            row.className = 'list-row';
            row.href = 'javascript:void(0)';
            row.onclick = () => window.openSubjectViewer(m.name, m.link || '');
            row.innerHTML =
                '<div class="row-main">' +
                    '<div class="row-title-line">' +
                        '<span class="row-title">' + m.name + '</span>' +
                        (isCursando && window.currentUser ? '<span class="badge-status badge-cursando">Cursando</span>' : '') +
                    '</div>' +
                    '<div class="row-subtitle">' +
                        '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' +
                        'Req: ' + m.req +
                    '</div>' +
                '</div>' +
                '<div class="row-end">' +
                    '<span class="diff-chip" id="diff-chip-' + m.id + '" onclick="event.stopPropagation(); window.openDiffModal(\'' + m.id + '\', \'' + m.name.replace(/'/g, "\\'") + '\', \'' + m.diff + '\')">' + m.diff + '</span>' +
                    '<span class="row-chevron">\u203a</span>' +
                '</div>';
            list.appendChild(row);
        });

        section.appendChild(list);
        container.appendChild(section);
    });
};

window.openMySubjectsModal = function() {
    window.openModal('mySubjectsModal');
    const list = document.getElementById('mySubjectsList');
    if (!list) return;

    if (!window.MATERIAS_ADE || !Array.isArray(window.MATERIAS_ADE) || window.MATERIAS_ADE.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 32px 16px; color: var(--text-muted);">
                <div class="spinner" style="margin: 0 auto 12px auto;"></div>
                <p style="font-size: 13px; margin: 0;">Cargando catálogo oficial de materias...</p>
            </div>
        `;
        return;
    }

    list.innerHTML = '';

    const grouped = window.MATERIAS_ADE.reduce((acc, curr) => {
        const y = curr.year || 'OTROS';
        if (!acc[y]) acc[y] = [];
        acc[y].push(curr);
        return acc;
    }, {});

    const yearDisplayLabels = {
        'PRIMER AÑO': '1º Año',
        'SEGUNDO AÑO': '2º Año',
        'TERCER AÑO': '3º Año',
        'CUARTO AÑO': '4º Año',
        'QUINTO AÑO': '5º Año',
        'SEXTO AÑO': '6º Año',
        'EXTRACURRICULARES': 'Extracurriculares'
    };

    const orderedYears = ['PRIMER AÑO', 'SEGUNDO AÑO', 'TERCER AÑO', 'CUARTO AÑO', 'QUINTO AÑO', 'SEXTO AÑO', 'EXTRACURRICULARES'];
    const allYears = Array.from(new Set([...orderedYears, ...Object.keys(grouped)]));

    let renderedCount = 0;

    allYears.forEach(year => {
        if (grouped[year] && grouped[year].length > 0) {
            const title = document.createElement('div');
            title.style.cssText = "font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin: 16px 0 8px 4px;";
            title.textContent = yearDisplayLabels[year] || year;
            list.appendChild(title);

            grouped[year].forEach(m => {
                renderedCount++;
                const isSelected = Array.isArray(window.userMySubjects) && window.userMySubjects.includes(m.name);
                const item = document.createElement('div');
                item.className = `check-item ${isSelected ? 'selected' : ''}`;
                item.innerHTML = `
                    <div class="check-box"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
                    <span class="check-label">${m.name}</span>
                `;
                item.onclick = () => {
                    item.classList.toggle('selected');
                    if (!Array.isArray(window.userMySubjects)) window.userMySubjects = [];
                    if (item.classList.contains('selected')) {
                        if (!window.userMySubjects.includes(m.name)) window.userMySubjects.push(m.name);
                    } else {
                        window.userMySubjects = window.userMySubjects.filter(name => name !== m.name);
                    }
                };
                list.appendChild(item);
            });
        }
    });

    if (renderedCount === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 24px 16px; color: var(--text-muted); font-size: 13px;">
                No se encontraron materias registradas en el sistema.
            </div>
        `;
    }
};

window.saveMySubjects = function() {
    try {
        localStorage.setItem('ungs_my_subjects', JSON.stringify(window.userMySubjects || []));
    } catch(e) { console.warn(e); }

    const modal = document.getElementById('mySubjectsModal');
    const btn = modal ? modal.querySelector('.btn-submit-full') : null;
    const origHtml = btn ? btn.innerHTML : '';

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span style="display:inline-flex; align-items:center; gap:8px;">Guardando materias...</span>';
    }

    function finalize() {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = origHtml || 'Guardar Cambios';
        }
        if (window.closeModal) window.closeModal('mySubjectsModal');
        if (typeof window.renderApp === 'function') window.renderApp();
    }

    if (!window.currentUser || !window.currentUser.uid || !window.db) {
        finalize();
        return;
    }

    window.db.collection('usuarios_materias').doc(window.currentUser.uid)
        .set({ 
            cursando: window.userMySubjects || [],
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })
        .then(() => {
            finalize();
        })
        .catch(e => {
            console.error('[saveMySubjects] Error al guardar en Firestore:', e);
            finalize();
        });
};

document.addEventListener('keydown', (e) => {
        e.preventDefault();
        const inp = document.getElementById('searchInput');
        if (inp) { inp.focus(); window.scrollTo({top: 0, behavior: 'smooth'}); }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    try {
        const savedMySubjs = localStorage.getItem('ungs_my_subjects');
        if (savedMySubjs) {
            const parsed = JSON.parse(savedMySubjs);
            if (Array.isArray(parsed)) window.userMySubjects = parsed;
        }
    } catch(e) {}

    if (typeof window.renderApp === 'function') window.renderApp();
    if (window.auth && typeof firebase !== 'undefined' && firebase.auth) {
        window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(){});
    }
});

window.sanitizeHTML = function(str) { var t = document.createElement('div'); t.textContent = str; return t.innerHTML; };
window.sanitizeText = function(str) { var t = document.createElement('div'); t.textContent = str; return t.innerHTML; };



window.openDiffModal = async function(id, name, defaultDiff) {
    if (!document.getElementById('diffModal')) {
        const modalHtml = `
<div class="modal-overlay" id="diffModal" onclick="window.closeOnOutsideClick && closeOnOutsideClick(event,'diffModal')">
    <div class="modal-content" style="max-width:340px;">
        <div class="apple-modal-header" style="margin-bottom: 18px;">
            <div class="apple-modal-icon-badge" style="width: 42px; height: 42px; border-radius: 14px; margin-bottom: 8px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3 class="apple-modal-title" style="font-size: 18px; margin: 0 0 4px 0;">Votar Dificultad</h3>
            <p class="apple-modal-subtitle" id="diffModalTitle" style="font-size: 12px; margin: 0; line-height: 1.3;">Materia</p>
            <button class="modal-close" style="position: absolute; top: 0; right: 0;" onclick="window.closeModal && closeModal('diffModal')" aria-label="Cerrar"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>

        <div style="text-align:center; margin:32px 0;">
            <div id="diffScore" style="font-size:56px; font-weight:800; letter-spacing:-0.04em; color:var(--text-main); line-height:1;">-.-</div>
            <div id="diffVotesCount" style="font-size:13px; color:var(--text-muted); margin-top:12px;">Cargando votos comunitarios...</div>
        </div>

        <div id="diffVotingArea" style="margin-top:24px;">
            <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;">TU CALIFICACIÓN (1 AL 5)</div>
            <div style="display:flex; gap:6px;">
                <button class="diff-vote-card diff-vote-btn" data-val="1" style="flex:1;">1</button>
                <button class="diff-vote-card diff-vote-btn" data-val="2" style="flex:1;">2</button>
                <button class="diff-vote-card diff-vote-btn" data-val="3" style="flex:1;">3</button>
                <button class="diff-vote-card diff-vote-btn" data-val="4" style="flex:1;">4</button>
                <button class="diff-vote-card diff-vote-btn" data-val="5" style="flex:1;">5</button>
            </div>
            <div id="diffVoteError" class="form-error" style="margin-top:16px; text-align:center; display:none;"></div>
        </div>
    </div>
</div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.querySelectorAll('.diff-vote-btn').forEach(btn => {
            btn.onclick = () => window.submitDiffVote(btn.getAttribute('data-val'));
        });
    }

    document.getElementById('diffModalTitle').textContent = name;
    document.getElementById('diffScore').textContent = defaultDiff;
    document.getElementById('diffVotesCount').textContent = "Cargando votos...";
    document.getElementById('diffVoteError').style.display = 'none';
    window._currentDiffMateriaId = id;
    
    document.querySelectorAll('.diff-vote-btn').forEach(b => b.classList.remove('active'));

    window.openModal('diffModal');

    if (window.db) {
        window.db.collection('materias_dificultad').doc(id.toString()).collection('votos').get()
        .then(snap => {
            let total = 0;
            let count = snap.size;
            let userVote = null;
            
            snap.forEach(doc => {
                let v = parseFloat(doc.data().value);
                total += v;
                if (window.currentUser && doc.id === window.currentUser.uid) {
                    userVote = v;
                }
            });

            if (count > 0) {
                let avg = (total / count).toFixed(1);
                document.getElementById('diffScore').textContent = avg;
                document.getElementById('diffVotesCount').textContent = count + (count === 1 ? ' voto registrado' : ' votos registrados');
                
                let chip = document.getElementById('diff-chip-' + id);
                if(chip) chip.textContent = avg;
            } else {
                document.getElementById('diffScore').textContent = defaultDiff;
                document.getElementById('diffVotesCount').textContent = 'Sé el primero en calificar esta materia';
            }

            if (userVote) {
                let btn = document.querySelector(`.diff-vote-btn[data-val="${userVote}"]`);
                if(btn) btn.classList.add('active');
            }
        })
        .catch(e => {
            console.log("Error loading votes:", e);
            document.getElementById('diffVotesCount').textContent = 'No se pudieron cargar los votos';
        });
    }
};

window.submitDiffVote = function(val) {
    if (!window.currentUser) {
        document.getElementById('diffVoteError').textContent = 'IniciÃ¡ sesiÃ³n para poder votar.';
        document.getElementById('diffVoteError').style.display = 'block';
        return;
    }
    
    let numVal = parseFloat(val);
    let id = window._currentDiffMateriaId;
    
    document.querySelectorAll('.diff-vote-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.diff-vote-btn[data-val="${val}"]`).classList.add('active');
    document.getElementById('diffVoteError').style.display = 'none';
    document.getElementById('diffVotesCount').textContent = 'Guardando voto...';

    window.db.collection('materias_dificultad').doc(id.toString()).collection('votos').doc(window.currentUser.uid)
    .set({
        value: numVal,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        let name = document.getElementById('diffModalTitle').textContent;
        let defaultDiff = document.getElementById('diffScore').textContent;
        window.openDiffModal(id, name, defaultDiff); 
    })
    .catch(e => {
        document.getElementById('diffVoteError').textContent = 'Error al guardar el voto.';
        document.getElementById('diffVoteError').style.display = 'block';
    });
};

