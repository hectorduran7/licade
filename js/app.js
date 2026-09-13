// js/app.js
window.openSubjectViewer = function(name, driveLink) {
    try {
        window.location.href = 'visor.html?name=' + encodeURIComponent(name || '') + '&link=' + encodeURIComponent(driveLink || '');
    } catch(e) {
        console.error('[openSubjectViewer error]', e);
    }
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
    try {
        const queryInput = document.getElementById('searchInput');
        const query = (queryInput && queryInput.value ? queryInput.value : '').toLowerCase().trim();
        const container = document.getElementById('subjectsContainer');
        const tabsContainer = document.getElementById('tabsContainer');

        if (!container) return;

        if (!window.MATERIAS_ADE || !Array.isArray(window.MATERIAS_ADE) || window.MATERIAS_ADE.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 40px 20px; text-align: center;">
                    <div class="spinner" style="margin: 0 auto 12px auto;"></div>
                    <p style="color: var(--text-muted); font-size: 14px;">Cargando materias de la carrera...</p>
                </div>
            `;
            return;
        }

        const baseSubset = window.MATERIAS_ADE;

        if (tabsContainer) {
            tabsContainer.innerHTML = '';
            TABS.forEach(tab => {
                const count = tab.id === 'TODAS' 
                    ? baseSubset.length 
                    : baseSubset.filter(s => s.year === tab.id).length;

                if (count > 0 || tab.id === 'TODAS') {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'tab-btn' + (activeTab === tab.id ? ' active' : '');
                    btn.onclick = () => { activeTab = tab.id; window.renderApp(); };
                    btn.innerHTML = tab.label + ' <span class="tab-badge">' + count + '</span>';
                    tabsContainer.appendChild(btn);
                }
            });
        }

        let filtered = baseSubset;
        if (activeTab !== 'TODAS') {
            filtered = filtered.filter(s => s.year === activeTab);
        }
        if (query) {
            filtered = filtered.filter(s => 
                (s.name && s.name.toLowerCase().includes(query)) || 
                (s.req && s.req.toLowerCase().includes(query))
            );
        }

        container.innerHTML = '';
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No se encontraron resultados para la búsqueda.</p></div>';
            return;
        }

        const grouped = filtered.reduce((acc, curr) => {
            const y = curr.year || 'OTROS';
            if (!acc[y]) acc[y] = [];
            acc[y].push(curr);
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

        const orderedYears = ['PRIMER AÑO', 'SEGUNDO AÑO', 'TERCER AÑO', 'CUARTO AÑO', 'QUINTO AÑO', 'SEXTO AÑO', 'EXTRACURRICULARES'];
        const allYears = Array.from(new Set([...orderedYears, ...Object.keys(grouped)]));

        allYears.forEach(year => {
            if (!grouped[year] || grouped[year].length === 0) return;

            const section = document.createElement('div');
            section.className = 'year-section';

            const header = document.createElement('div');
            header.className = 'year-header';
            header.textContent = yearLabels[year] || year;
            section.appendChild(header);

            const list = document.createElement('div');
            list.className = 'inset-list';

            grouped[year].forEach(m => {
                const isCursando = Array.isArray(window.userMySubjects) && window.userMySubjects.includes(m.name);
                const row = document.createElement('a');
                row.className = 'list-row';
                row.href = 'javascript:void(0)';
                row.onclick = () => window.openSubjectViewer(m.name, m.link || '');
                
                const safeName = window.sanitizeHTML ? window.sanitizeHTML(m.name) : m.name;
                const safeReq = window.sanitizeHTML ? window.sanitizeHTML(m.req || 'Ninguna') : (m.req || 'Ninguna');
                const safeDiff = m.diff || '3.0';

                row.innerHTML =
                    '<div class="row-main">' +
                        '<div class="row-title-line">' +
                            '<span class="row-title">' + safeName + '</span>' +
                            (isCursando && window.currentUser ? '<span class="badge-status badge-cursando">Cursando</span>' : '') +
                        '</div>' +
                        '<div class="row-subtitle">' +
                            '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' +
                            'Req: ' + safeReq +
                        '</div>' +
                    '</div>' +
                    '<div class="row-end">' +
                        '<span class="diff-chip" id="diff-chip-' + m.id + '" onclick="event.stopPropagation(); window.openDiffModal(\'' + m.id + '\', \'' + (m.name || '').replace(/'/g, "\\'") + '\', \'' + safeDiff + '\')">' + safeDiff + '</span>' +
                        '<span class="row-chevron">\u203a</span>' +
                    '</div>';
                list.appendChild(row);
            });

            section.appendChild(list);
            container.appendChild(section);
        });
    } catch(err) {
        console.error('[renderApp crash prevented]', err);
        const container = document.getElementById('subjectsContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 30px; text-align: center;">
                    <p style="color: var(--text-muted); margin-bottom: 12px;">Hubo un problema al cargar la vista.</p>
                    <button type="button" class="btn-primary-solid" style="margin: 0 auto; display: inline-flex;" onclick="window.renderApp()">Reintentar</button>
                </div>
            `;
        }
    }
};

window.openMySubjectsModal = function() {
    try {
        if (window.openModal) window.openModal('mySubjectsModal');
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
                    
                    const safeName = window.sanitizeHTML ? window.sanitizeHTML(m.name) : m.name;
                    item.innerHTML = `
                        <div class="check-box">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                        <span class="check-label">${safeName}</span>
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
    } catch(e) {
        console.error('[openMySubjectsModal error]', e);
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

    Promise.all([
        window.db.collection('usuarios_materias').doc(window.currentUser.uid)
            .set({ 
                cursando: window.userMySubjects || [],
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }),
        window.db.collection('usuarios_cursada').doc(window.currentUser.uid)
            .set({
                enrolled: window.userMySubjects || [],
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true })
    ])
    .then(() => {
        finalize();
    })
    .catch(e => {
        console.error('[saveMySubjects] Error al guardar en Firestore:', e);
        finalize();
    });
};

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    try {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            const inp = document.getElementById('searchInput');
            if (inp) { inp.focus(); window.scrollTo({top: 0, behavior: 'smooth'}); }
        }
    } catch(err) {
        console.warn(err);
    }
});

// DOMContentLoaded Safe Init
document.addEventListener('DOMContentLoaded', function() {
    try {
        const savedMySubjs = localStorage.getItem('ungs_my_subjects');
        if (savedMySubjs) {
            const parsed = JSON.parse(savedMySubjs);
            if (Array.isArray(parsed)) window.userMySubjects = parsed;
        }
    } catch(e) {}

    if (typeof window.renderApp === 'function') {
        window.renderApp();
    }

    if (window.auth && typeof firebase !== 'undefined' && firebase.auth && firebase.auth.Auth && firebase.auth.Auth.Persistence) {
        window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(){});
    }
});

// Sanitizers
window.sanitizeHTML = function(str) { 
    if (!str && str !== 0) return '';
    var t = document.createElement('div'); 
    t.textContent = String(str); 
    return t.innerHTML; 
};

window.sanitizeText = function(str) { 
    if (!str && str !== 0) return '';
    var t = document.createElement('div'); 
    t.textContent = String(str); 
    return t.innerHTML; 
};

// Difficulty Voting Modal Logic
window.openDiffModal = async function(id, name, defaultDiff) {
    try {
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
            <button type="button" class="modal-close" style="position: absolute; top: 0; right: 0;" onclick="window.closeModal && closeModal('diffModal')" aria-label="Cerrar"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>

        <div style="text-align:center; margin:32px 0;">
            <div id="diffScore" style="font-size:56px; font-weight:800; letter-spacing:-0.04em; color:var(--text-main); line-height:1;">-.-</div>
            <div id="diffVotesCount" style="font-size:13px; color:var(--text-muted); margin-top:12px;">Cargando votos comunitarios...</div>
        </div>

        <div id="diffVotingArea" style="margin-top:24px;">
            <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;">TU CALIFICACIÓN (1 AL 5)</div>
            <div style="display:flex; gap:6px;">
                <button type="button" class="diff-vote-card diff-vote-btn" data-val="1" style="flex:1;">1</button>
                <button type="button" class="diff-vote-card diff-vote-btn" data-val="2" style="flex:1;">2</button>
                <button type="button" class="diff-vote-card diff-vote-btn" data-val="3" style="flex:1;">3</button>
                <button type="button" class="diff-vote-card diff-vote-btn" data-val="4" style="flex:1;">4</button>
                <button type="button" class="diff-vote-card diff-vote-btn" data-val="5" style="flex:1;">5</button>
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

        const titleEl = document.getElementById('diffModalTitle');
        const scoreEl = document.getElementById('diffScore');
        const votesEl = document.getElementById('diffVotesCount');
        const errEl = document.getElementById('diffVoteError');

        if (titleEl) titleEl.textContent = name || 'Materia';
        if (scoreEl) scoreEl.textContent = defaultDiff || '3.0';
        if (votesEl) votesEl.textContent = "Cargando votos...";
        if (errEl) errEl.style.display = 'none';

        window._currentDiffMateriaId = id;
        document.querySelectorAll('.diff-vote-btn').forEach(b => b.classList.remove('active'));

        if (window.openModal) window.openModal('diffModal');

        if (window.db && id) {
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
                    if (scoreEl) scoreEl.textContent = avg;
                    if (votesEl) votesEl.textContent = count + (count === 1 ? ' voto registrado' : ' votos registrados');
                    
                    let chip = document.getElementById('diff-chip-' + id);
                    if(chip) chip.textContent = avg;
                } else {
                    if (scoreEl) scoreEl.textContent = defaultDiff || '3.0';
                    if (votesEl) votesEl.textContent = 'Sé el primero en calificar esta materia';
                }

                if (userVote) {
                    let btn = document.querySelector(`.diff-vote-btn[data-val="${userVote}"]`);
                    if(btn) btn.classList.add('active');
                }
            })
            .catch(e => {
                console.warn("Error loading votes:", e);
                if (votesEl) votesEl.textContent = 'No se pudieron cargar los votos';
            });
        }
    } catch(e) {
        console.error('[openDiffModal error]', e);
    }
};

window.submitDiffVote = function(val) {
    try {
        const errEl = document.getElementById('diffVoteError');
        const votesEl = document.getElementById('diffVotesCount');

        if (!window.currentUser) {
            if (errEl) {
                errEl.textContent = 'Iniciá sesión para poder votar.';
                errEl.style.display = 'block';
            }
            return;
        }
        
        let numVal = parseFloat(val);
        let id = window._currentDiffMateriaId;
        
        document.querySelectorAll('.diff-vote-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.diff-vote-btn[data-val="${val}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        if (errEl) errEl.style.display = 'none';
        if (votesEl) votesEl.textContent = 'Guardando voto...';

        if (!window.db || !id) return;

        window.db.collection('materias_dificultad').doc(id.toString()).collection('votos').doc(window.currentUser.uid)
        .set({
            value: numVal,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            let name = document.getElementById('diffModalTitle')?.textContent;
            let defaultDiff = document.getElementById('diffScore')?.textContent;
            window.openDiffModal(id, name, defaultDiff); 
        })
        .catch(e => {
            console.error('[submitDiffVote error]', e);
            if (errEl) {
                errEl.textContent = 'Error al guardar el voto.';
                errEl.style.display = 'block';
            }
        });
    } catch(e) {
        console.error('[submitDiffVote crash prevented]', e);
    }
};
