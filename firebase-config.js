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

    // ── PASO 3: Inicializar Firebase (solo una vez) ──
    if (!firebase.apps.length) {
        firebase.initializeApp(window.FIREBASE_CONFIG);
        console.log('🔥 Firebase inicializado con éxito');
    }

    // ── PASO 4: Exponer instancias como propiedades de window ──
    // Se asignan directamente a window para que estén accesibles desde CUALQUIER script,
    // independientemente del orden de carga o del scope donde se llamen.
    window.auth           = firebase.auth();
    window.db             = firebase.firestore();
    window.googleProvider = new firebase.auth.GoogleAuthProvider();
    window.googleProvider.setCustomParameters({ prompt: 'select_account' });

    console.log('✅ window.auth, window.db y window.googleProvider listos');

    // ── PASO 5: Forzar persistencia LOCAL (mantiene sesión entre páginas y recargas) ──
    window.auth
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(function () {
            console.log('🔑 Persistencia LOCAL activada — el usuario permanece logueado entre páginas');
        })
        .catch(function (e) {
            console.error('❌ Error al configurar persistencia:', e);
        });

    // ── PASO 6: App Check (opcional, si la clave está disponible) ──
    var siteKey = window.APP_CHECK_SITE_KEY;
    if (siteKey && !siteKey.startsWith('{{')) {
        try {
            var appCheck = firebase.appCheck();
            appCheck.activate(siteKey, true);
            console.log('✅ App Check activado');
        } catch (e) {
            console.error('❌ Error activando App Check:', e);
        }
    }
})();
