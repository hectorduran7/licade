// js/auth.js
// Firebase is initialized in firebase-config.js

window.currentUser = null;
window.userMySubjects = [];
window.currentAuthMode = 'login';

window.openLoginModal = function() {
    if(window.openModal) window.openModal('authModal');
};

window.switchAuthTab = function(mode) {
    window.currentAuthMode = mode;
    const tabLogin = document.getElementById('tabAuthLogin');
    const tabReg = document.getElementById('tabAuthRegister');
    const extra = document.getElementById('registerExtraFields');
    const btn = document.getElementById('btnAuthSubmit');
    const btnText = document.getElementById('btnAuthSubmitText');
    const err = document.getElementById('authErrorMsg');
    const title = document.getElementById('authModalTitle');
    const subtitle = document.getElementById('authModalSubtitle');
    
    if(tabLogin) tabLogin.classList.toggle('active', mode === 'login');
    if(tabReg) tabReg.classList.toggle('active', mode === 'register');
    if(extra) extra.classList.toggle('hidden', mode === 'login');
    
    const label = mode === 'login' ? 'Ingresar' : 'Crear Cuenta';
    if(btnText) btnText.innerText = label;
    else if(btn) btn.innerText = label;

    if(title) title.innerText = mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta';
    if(subtitle) subtitle.innerText = mode === 'login' 
        ? 'Sincronizá tus materias, notas y agenda en la nube de UNGS.' 
        : 'Registrate gratis para sincronizar tu avance académico.';

    if(err) err.classList.add('hidden');
};

window.handleAuthAction = function() {
    window.handleAuthLogin();
};

window.handleAuthLogin = function() {
    const email = document.getElementById('authEmail')?.value.trim();
    const pass = document.getElementById('authPass')?.value;
    const err = document.getElementById('authErrorMsg');
    const btn = document.getElementById('btnAuthSubmit');
    const btnText = document.getElementById('btnAuthSubmitText');

    function setBtnText(txt) {
        if(btnText) btnText.innerText = txt;
        else if(btn) btn.innerText = txt;
    }

    function showError(msg) {
        if(err) {
            err.innerText = msg;
            err.classList.remove('hidden');
            err.classList.remove('shake');
            void err.offsetWidth;
            err.classList.add('shake');
        }
        if(btn) {
            setBtnText(window.currentAuthMode === 'login' ? 'Ingresar' : 'Crear Cuenta');
            btn.disabled = false;
        }
    }

    if (!email || !pass) { 
        showError("Completá todos los campos");
        return; 
    }

    if(btn) {
        setBtnText('Verificando...');
        btn.disabled = true;
    }

    if (window.currentAuthMode === 'login') {
        window.auth.signInWithEmailAndPassword(email, pass)
            .then(function(cred) { 
                setBtnText('Ingresar');
                if(btn) btn.disabled = false;
                if(window.closeModal) window.closeModal('authModal');
                const inpEmail = document.getElementById('authEmail');
                const inpPass = document.getElementById('authPass');
                if (inpEmail) inpEmail.value = '';
                if (inpPass) inpPass.value = '';
                localStorage.setItem('mock_user_email', cred.user.email);
            })
            .catch(function(e) { showError("Error: Verifica tus credenciales."); });
    } else {
        const name = document.getElementById('authName')?.value.trim();
        window.auth.createUserWithEmailAndPassword(email, pass)
            .then(function(cred) {
                setBtnText('Crear Cuenta');
                if(btn) btn.disabled = false;
                if (name && cred.user) { cred.user.updateProfile({ displayName: name }); }
                if(window.closeModal) window.closeModal('authModal');
                const payload = { cursando: [], createdAt: firebase.firestore.FieldValue.serverTimestamp() };
                window.db.collection('users_pomodoro').doc(cred.user.uid).set({ timerState: {} }, { merge: true }).catch(console.warn);
                window.db.collection('usuarios_materias').doc(cred.user.uid).set(payload, { merge: true }).catch(console.warn);
                window.db.collection('users_materias').doc(cred.user.uid).set(payload, { merge: true }).catch(console.warn);
                localStorage.setItem('mock_user_email', cred.user.email);
            })
            .catch(function(e) { showError(e.message); });
    }
};

window.handlePasswordReset = function() {
    const email = document.getElementById('authEmail')?.value.trim();
    if (!email) { alert("Ingresá tu correo en el campo superior."); return; }
    window.auth.sendPasswordResetEmail(email).then(function() { alert("Correo enviado."); }).catch(function(e) { alert("Error."); });
};

window.handleAuthLogout = function() { 
    window.auth.signOut().then(() => { 
        if(window.closeModal) window.closeModal('authModal'); 
        localStorage.removeItem('mock_user_email');
        window.currentUser = null;
        window.userMySubjects = [];
        if (typeof window.renderApp === 'function') window.renderApp();
    }); 
};

if(window.auth) {
    window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error);

    // Single unified auth listener - NO RELOADS OR REDIRECTS
    window.auth.onAuthStateChanged(user => {
        window.currentUser = user;
        const rLabel = document.getElementById('railAuthLabel');
        const btnMisMaterias = document.getElementById('btnRailMisMaterias');

        if (user) {
            localStorage.setItem('mock_user_email', user.email);
            const name = user.displayName || user.email.split('@')[0];
            if (rLabel) rLabel.textContent = name;
            if (btnMisMaterias) btnMisMaterias.classList.remove('hidden');
            
            const fArea = document.getElementById('authFormArea');
            const lArea = document.getElementById('authLoggedInArea');
            if(fArea) fArea.classList.add('hidden');
            if(lArea) lArea.classList.remove('hidden');
            
            const logName = document.getElementById('loggedUserName');
            const logEmail = document.getElementById('loggedUserEmail');
            const logAvatar = document.getElementById('authAvatar');
            if(logName) logName.textContent = name;
            if(logEmail) logEmail.textContent = user.email;
            if(logAvatar) logAvatar.textContent = name.charAt(0).toUpperCase();

                        // Parallel multi-collection fetch with full schema mapping - STRICT PRIMARY: users_grades & users_pomodoro
            Promise.allSettled([
                window.db.collection('users_pomodoro').doc(user.uid).get(),
                window.db.collection('usuarios_estudio').doc(user.uid).get(),
                window.db.collection('users_grades').doc(user.uid).get(),
                window.db.collection('usuarios_materias').doc(user.uid).get(),
                window.db.collection('users_materias').doc(user.uid).get(),
                window.db.collection('usuarios_cursada').doc(user.uid).get(),
                window.db.collection('users_cursada').doc(user.uid).get(),
                window.db.collection('usuarios_progreso').doc(user.uid).get(),
                window.db.collection('users_progreso').doc(user.uid).get()
            ]).then(results => {
                let subjects = [];
                let entries = [];
                let studyState = null;

                results.forEach(res => {
                    if (res.status === 'fulfilled' && res.value && res.value.exists) {
                        const data = res.value.data();
                        if (!data) return;

                        // 1. Enrolled subjects
                        if (Array.isArray(data.cursando) && data.cursando.length > 0 && subjects.length === 0) {
                            subjects = data.cursando;
                        } else if (Array.isArray(data.enrolled) && data.enrolled.length > 0 && subjects.length === 0) {
                            subjects = data.enrolled;
                        }

                        // 2. Progress / Approved grades
                        const rawGrades = data.entries || data.aprobadas || data.materiasAprobadas || [];
                        if (Array.isArray(rawGrades) && rawGrades.length > 0) {
                            rawGrades.forEach(item => {
                                const subjName = typeof item === 'string' ? item : (item.subj || item.materia || item.name || '');
                                if (subjName && !entries.some(e => e.subj.toLowerCase() === subjName.toLowerCase())) {
                                    entries.push({
                                        subj: subjName,
                                        grade: (item && item.grade !== undefined) ? item.grade : ((item && item.nota !== undefined) ? item.nota : 'Aprobado'),
                                        isNumeric: (item && typeof item.grade === 'number') || (item && typeof item.nota === 'number'),
                                        date: (item && (item.date || item.fecha)) || new Date().toISOString()
                                    });
                                }
                            });
                        }

                        // 3. Study / Pomodoro state from users_pomodoro & usuarios_estudio
                        const rStudy = data.timerState || data;
                        if (rStudy && (rStudy.sessionHistory || rStudy.globalHistory || rStudy.subjectStats || rStudy.globalSessions || rStudy.globalTime || rStudy.globalFocusMinutes)) {
                            if (!studyState) studyState = {};
                            studyState = Object.assign(studyState, rStudy);
                        }
                    }
                });

                window.userMySubjects = subjects;
                try { localStorage.setItem('ungs_my_subjects', JSON.stringify(subjects)); } catch(e){}

                if (entries.length > 0) {
                    try { localStorage.setItem('ungs_grades_backup_guest', JSON.stringify(entries)); } catch(e){}
                }

                if (studyState) {
                    try {
                        const curLocal = localStorage.getItem('ungs_study_stats');
                        let localObj = curLocal ? JSON.parse(curLocal) : {};
                        const merged = Object.assign({}, localObj, studyState);
                        localStorage.setItem('ungs_study_stats', JSON.stringify(merged));
                    } catch(e){}
                }

                if (typeof window.renderApp === 'function') window.renderApp();
                
                const mModal = document.getElementById('mySubjectsModal');
                if (mModal && mModal.classList.contains('active') && typeof window.openMySubjectsModal === 'function') {
                    window.openMySubjectsModal();
                }
            }).catch(err => {
                console.warn('[Cross-page Firebase sync error]', err);
                if (typeof window.renderApp === 'function') window.renderApp();
            });
        } else {
            const mock = localStorage.getItem('mock_user_email');
            if(mock && !user) {
                if (rLabel) rLabel.textContent = mock.split('@')[0];
            } else {
                if (rLabel) rLabel.textContent = 'Iniciar Sesión';
            }
            if (btnMisMaterias) btnMisMaterias.classList.add('hidden');
            
            const fArea = document.getElementById('authFormArea');
            const lArea = document.getElementById('authLoggedInArea');
            if(fArea) fArea.classList.add('hidden');
            if(lArea) lArea.classList.remove('hidden');
            
            window.userMySubjects = [];
            if(window.resetAppTabs) window.resetAppTabs();
            if(window.renderApp) window.renderApp();
        }
    });
}

window.handleGoogleLogin = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    window.auth.signInWithPopup(provider)
        .then((cred) => {
            if(window.closeModal) window.closeModal('authModal');
            const payload = { cursando: [], createdAt: firebase.firestore.FieldValue.serverTimestamp() };
            window.db.collection('usuarios_materias').doc(cred.user.uid).set(payload, {merge: true}).catch(console.warn);
            window.db.collection('users_materias').doc(cred.user.uid).set(payload, {merge: true}).catch(console.warn);
        })
        .catch((error) => {
            const err = document.getElementById('authErrorMsg');
            if(err) {
                err.innerText = error.message;
                err.classList.remove('hidden');
            }
        });
};
