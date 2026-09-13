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
    { id: 'CURSANDO', label: 'Mis Materias' },
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
        const myEnrolledList = Array.isArray(window.userMySubjects) ? window.userMySubjects : [];
        const myCount = myEnrolledList.length;

        if (tabsContainer) {
            tabsContainer.innerHTML = '';
            TABS.forEach(tab => {
                let count = 0;
                if (tab.id === 'CURSANDO') {
                    count = myCount;
                } else if (tab.id === 'TODAS') {
                    count = baseSubset.length;
                } else {
                    count = baseSubset.filter(s => s.year === tab.id).length;
                }

                if (tab.id === 'CURSANDO') {
                    if (count > 0 || (window.currentUser && myCount > 0)) {
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'tab-btn' + (activeTab === 'CURSANDO' ? ' active' : '');
                        btn.style.borderColor = 'rgba(50, 215, 75, 0.35)';
                        btn.onclick = () => { activeTab = 'CURSANDO'; window.renderApp(); };
                        btn.innerHTML = `<span style="display:inline-flex; align-items:center; gap:5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> ${tab.label}</span> <span class="tab-badge" style="background:rgba(50,215,75,0.2); color:#32D74B;">${count}</span>`;
                        tabsContainer.appendChild(btn);
                    }
                } else if (count > 0 || tab.id === 'TODAS') {
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
        if (activeTab === 'CURSANDO') {
            filtered = filtered.filter(s => myEnrolledList.includes(s.name));
            if (filtered.length === 0 && myEnrolledList.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="padding: 48px 20px; text-align: center;">
                        <div style="width: 48px; height: 48px; border-radius: 16px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; color: var(--text-muted);">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                        </div>
                        <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">No tienes materias seleccionadas</h3>
                        <p style="color: var(--text-muted); font-size: 13px; max-width: 380px; margin: 0 auto 18px auto;">Selecciona las materias que estás cursando este cuatrimestre para tener acceso rápido.</p>
                        <button type="button" class="btn-primary-solid" style="margin: 0 auto; display: inline-flex; align-items: center; gap: 8px;" onclick="window.openMySubjectsModal && window.openMySubjectsModal()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            <span>Seleccionar Mis Materias</span>
                        </button>
                    </div>
                `;
                return;
            }
        } else if (activeTab !== 'TODAS') {
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

                                const cleanName = (m.name || '').replace(/'/g, "\'");
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
                        '<span class="diff-chip" id="diff-chip-' + m.id + '" onclick="event.stopPropagation(); window.openDiffModal(\'' + m.id + '\', \'' + cleanName + '\', \'' + safeDiff + '\')">' + safeDiff + '</span>' +
                        '<span class="row-chevron">›</span>' +
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

    const uid = window.currentUser.uid;
    const matPayload = { cursando: window.userMySubjects || [], updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
    const curPayload = { enrolled: window.userMySubjects || [], updatedAt: firebase.firestore.FieldValue.serverTimestamp() };

    Promise.allSettled([
        window.db.collection('usuarios_materias').doc(uid).set(matPayload, { merge: true }),
        window.db.collection('users_materias').doc(uid).set(matPayload, { merge: true }),
        window.db.collection('usuarios_cursada').doc(uid).set(curPayload, { merge: true }),
        window.db.collection('users_cursada').doc(uid).set(curPayload, { merge: true })
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
            <h3 class="apple-modal-title" style="font-size: 16px; margin: 0 0 4px 0;" id="diffModalName">Dificultad</h3>
            <p class="apple-modal-subtitle" style="font-size: 12px; margin: 0;">Votá del 1 al 5 según tu experiencia</p>
        </div>
        <div style="display:flex; justify-content:center; gap:8px; margin-bottom:18px;" id="diffStars">
            <button type="button" class="btn-star" onclick="window.submitDiff(1)">1★</button>
            <button type="button" class="btn-star" onclick="window.submitDiff(2)">2★</button>
            <button type="button" class="btn-star" onclick="window.submitDiff(3)">3★</button>
            <button type="button" class="btn-star" onclick="window.submitDiff(4)">4★</button>
            <button type="button" class="btn-star" onclick="window.submitDiff(5)">5★</button>
        </div>
        <div style="text-align:center; font-size:11px; color:var(--text-muted); margin-bottom: 14px;" id="diffCount">
            Cargando votos de la comunidad...
        </div>
        <button type="button" class="btn-cancel" onclick="window.closeModal && closeModal('diffModal')">Cerrar</button>
    </div>
</div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        window.currentDiffSubjectId = id;
        const nameEl = document.getElementById('diffModalName');
        if (nameEl) nameEl.textContent = name;
        
        const countEl = document.getElementById('diffCount');
        if (countEl) countEl.textContent = 'Calculando votos...';

        if (window.openModal) window.openModal('diffModal');

        if (window.db) {
            window.db.collection('materias_dificultad').doc(id.toString()).collection('votos').get()
                .then(snap => {
                    let total = 0;
                    let count = 0;
                    snap.forEach(doc => {
                        const d = doc.data();
                        if (d && typeof d.valor === 'number') {
                            total += d.valor;
                            count++;
                        }
                    });
                    const avg = count > 0 ? (total / count).toFixed(1) : defaultDiff;
                    if (countEl) {
                        countEl.textContent = count > 0 
                            ? `Promedio de la comunidad: ${avg}★ (${count} voto${count > 1 ? 's' : ''})`
                            : `Promedio base: ${defaultDiff}★ (Sé el primero en votar)`;
                    }
                    const chip = document.getElementById('diff-chip-' + id);
                    if (chip && count > 0) chip.textContent = avg;
                })
                .catch(err => {
                    console.warn('[Votes load error]', err);
                    if (countEl) countEl.textContent = `Promedio base: ${defaultDiff}★`;
                });
        }
    } catch(e) {
        console.error('[openDiffModal error]', e);
    }
};

window.submitDiff = async function(val) {
    if (!window.currentUser) {
        alert("Iniciá sesión para votar la dificultad de la materia.");
        if (window.openModal) window.openModal('authModal');
        return;
    }

    const id = window.currentDiffSubjectId;
    if (!id || !window.db) return;

    try {
        const countEl = document.getElementById('diffCount');
        if (countEl) countEl.textContent = 'Guardando voto...';

        await window.db.collection('materias_dificultad').doc(id.toString()).collection('votos').doc(window.currentUser.uid)
            .set({
                valor: Number(val),
                user: window.currentUser.email,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        const snap = await window.db.collection('materias_dificultad').doc(id.toString()).collection('votos').get();
        let total = 0;
        let count = 0;
        snap.forEach(doc => {
            const d = doc.data();
            if (d && typeof d.valor === 'number') {
                total += d.valor;
                count++;
            }
        });

        const avg = count > 0 ? (total / count).toFixed(1) : val.toFixed(1);
        const chip = document.getElementById('diff-chip-' + id);
        if (chip) chip.textContent = avg;

        if (countEl) {
            countEl.innerHTML = `<span style="color:var(--success); font-weight:600;">¡Voto guardado con éxito!</span> Promedio: ${avg}★ (${count} votos)`;
        }

        setTimeout(() => {
            if (window.closeModal) window.closeModal('diffModal');
        }, 1500);

    } catch(err) {
        console.error('[submitDiff error]', err);
        alert("Hubo un error al registrar tu voto.");
    }
};
