// js/auth.js
// Firebase is initialized in firebase-config.js

window.currentUser = null;
window.userMySubjects = [];
window.currentAuthMode = 'login';

window.openLoginModal = function() {
    if(window.openModal) window.openModal('authModal');
}

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
}

window.handleAuthAction = function() {
    window.handleAuthLogin();
}

// Named exactly as prompt requested
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
            void err.offsetWidth; // trigger reflow
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
                document.getElementById('authEmail').value = '';
                document.getElementById('authPass').value = '';
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
                window.db.collection('usuarios_materias').doc(cred.user.uid).set({ cursando: [] });
                localStorage.setItem('mock_user_email', cred.user.email);
            })
            .catch(function(e) { showError(e.message); });
    }
}

window.handlePasswordReset = function() {
    const email = document.getElementById('authEmail')?.value.trim();
    if (!email) { alert("Ingresá tu correo en el campo superior."); return; }
    window.auth.sendPasswordResetEmail(email).then(function() { alert("Correo enviado."); }).catch(function(e) { alert("Error."); });
}

window.handleAuthLogout = function() { 
    window.auth.signOut().then(() => { 
        if(window.closeModal) window.closeModal('authModal'); 
        localStorage.removeItem('mock_user_email');
    }); 
}

if(window.auth) {
    window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error);

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

            window.db.collection('usuarios_materias').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data() && Array.isArray(doc.data().cursando)) {
                    window.userMySubjects = doc.data().cursando;
                    try { localStorage.setItem('ungs_my_subjects', JSON.stringify(window.userMySubjects)); } catch(e){}
                } else if (!doc.exists) {
                    window.userMySubjects = [];
                    window.db.collection('usuarios_materias').doc(user.uid).set({ 
                        cursando: [], 
                        createdAt: firebase.firestore.FieldValue.serverTimestamp() 
                    }, { merge: true });
                }
                if (typeof window.renderApp === 'function') window.renderApp();
                const mModal = document.getElementById('mySubjectsModal');
                if (mModal && mModal.classList.contains('active') && typeof window.openMySubjectsModal === 'function') {
                    window.openMySubjectsModal();
                }
            }).catch(err => {
                console.warn('[usuarios_materias error]', err);
                if (typeof window.renderApp === 'function') window.renderApp();
            });
        } else {
            // Also check localStorage fallback for seamless sync across pages
            const mock = localStorage.getItem('mock_user_email');
            if(mock && !user) {
                // Not fully auth'd but we have local memory
                if (rLabel) rLabel.textContent = mock.split('@')[0];
            } else {
                if (rLabel) rLabel.textContent = 'Iniciar Sesión';
            }
            if (btnMisMaterias) btnMisMaterias.classList.add('hidden');
            
            const fArea = document.getElementById('authFormArea');
            const lArea = document.getElementById('authLoggedInArea');
            if(fArea) fArea.classList.remove('hidden');
            if(lArea) lArea.classList.add('hidden');
            
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
            // Ensure document exists
            window.db.collection('usuarios_materias').doc(cred.user.uid).get().then(doc => {
                if(!doc.exists) {
                    window.db.collection('usuarios_materias').doc(cred.user.uid).set({ cursando: [] }, {merge: true});
                }
            });
        })
        .catch((error) => {
            const err = document.getElementById('authErrorMsg');
            if(err) {
                err.innerText = error.message;
                err.classList.remove('hidden');
            }
        });
}
