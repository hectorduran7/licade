// firebase-config.js — Biblioteca-ADE
// Inicialización centralizada y garantizada de Firebase.
// Este archivo DEBE cargarse en el <head> ANTES que cualquier script de página.

// 1. Inicializar window.auth, window.db y window.googleProvider a null como señal segura.
//    Esto evita ReferenceError en cualquier script que los verifique antes de tiempo.
window.auth = null;
window.db = null;
window.googleProvider = null;

(function () {
    'use strict';

    // ── PASO 1: Cargar configuración desde .env si los placeholders no fueron reemplazados ──
    if (
        !window.FIREBASE_CONFIG ||
        !window.FIREBASE_CONFIG.apiKey ||
        window.FIREBASE_CONFIG.apiKey.startsWith('{{')
    ) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '.env', false); // Síncrono: bloquea hasta recibir la respuesta
            xhr.send(null);
            if (xhr.status === 200) {
                var env = {};
                xhr.responseText.split('\n').forEach(function (line) {
                    var t = line.trim();
                    if (t && !t.startsWith('#')) {
                        var idx = t.indexOf('=');
                        if (idx > 0) {
                            env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
                        }
                    }
                });
                if (env.FIREBASE_API_KEY) {
                    window.FIREBASE_CONFIG = {
                        apiKey:            env.FIREBASE_API_KEY,
                        authDomain:        env.FIREBASE_AUTH_DOMAIN,
                        projectId:         env.FIREBASE_PROJECT_ID,
                        storageBucket:     env.FIREBASE_STORAGE_BUCKET,
                        messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
                        appId:             env.FIREBASE_APP_ID
                    };
                    window.APP_CHECK_SITE_KEY = env.APP_CHECK_SITE_KEY || '';
                    console.log('🔥 Firebase: configuración cargada desde .env local');
                }
            }
        } catch (e) {
            console.warn('⚠️ No se pudo leer .env:', e);
        }
    }

    // ── PASO 2: Validar que la configuración existe ──
    if (
        !window.FIREBASE_CONFIG ||
        !window.FIREBASE_CONFIG.apiKey ||
        window.FIREBASE_CONFIG.apiKey.startsWith('{{')
    ) {
        console.error(
            '❌ Firebase: configuración inválida. ' +
            'Verifica config.js y las variables de entorno de Vercel.'
        );
        return; // Salimos; window.auth sigue en null — los scripts de página deben comprobarlo
    }

    // ── PASO 3 + 4: Inicializar y exponer instancias de forma segura ──
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(window.FIREBASE_CONFIG);
        }
        var app = firebase.app();
        window.auth           = firebase.auth(app);
        window.db             = firebase.firestore(app);
        window.googleProvider = new firebase.auth.GoogleAuthProvider();
        window.googleProvider.setCustomParameters({ prompt: 'select_account' });
        console.log('✅ Firebase inicializado correctamente con:', app.name);

        // ── PASO 5: Persistencia LOCAL (mantiene sesión entre páginas) ──
        window.auth
            .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(function () {
                console.log('🔑 Persistencia LOCAL activada');
            })
            .catch(function (e) {
                console.error('❌ Error al configurar persistencia:', e);
            });

        // ── PASO 6: App Check (ejecución directa — el DOM ya está listo al final del body) ──
        try {
            const appCheck = firebase.appCheck();
            appCheck.activate(
                new firebase.appCheck.ReCaptchaV3Provider(window.APP_CHECK_SITE_KEY || firebaseConfig.apiKey),
                true
            );
            console.log('✅ App Check activado en la raíz del body');
        } catch (error) {
            console.error('❌ Error activando App Check:', error);
        }
    } else {
        console.error('❌ Firebase SDK no cargado. Verifica los scripts del <head>.');
    }
})();
