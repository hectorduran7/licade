// firebase-config.js
// Centralized configuration for Firebase and App Check (Biblioteca-ADE)

// Declarar variables globales con 'var' para compatibilidad total y evitar ReferenceError
var auth;
var db;
var googleProvider;

(function() {
    // Si la configuración no es válida o tiene placeholders, intentamos cargarla del archivo .env local (para desarrollo en local)
    if (!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey || window.FIREBASE_CONFIG.apiKey.startsWith('{{')) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '.env', false); // Petición síncrona
            xhr.send(null);
            if (xhr.status === 200) {
                var envText = xhr.responseText;
                var env = {};
                envText.split('\n').forEach(function(line) {
                    var trimmedLine = line.trim();
                    if (trimmedLine && !trimmedLine.startsWith('#')) {
                        var parts = trimmedLine.split('=');
                        if (parts.length >= 2) {
                            var key = parts[0].trim();
                            var value = parts.slice(1).join('=').trim();
                            env[key] = value;
                        }
                    }
                });
                
                if (env.FIREBASE_API_KEY) {
                    window.FIREBASE_CONFIG = {
                        apiKey: env.FIREBASE_API_KEY,
                        authDomain: env.FIREBASE_AUTH_DOMAIN,
                        projectId: env.FIREBASE_PROJECT_ID,
                        storageBucket: env.FIREBASE_STORAGE_BUCKET,
                        messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
                        appId: env.FIREBASE_APP_ID
                    };
                    window.APP_CHECK_SITE_KEY = env.APP_CHECK_SITE_KEY || "";
                    console.log("🔥 Firebase: Configuración cargada localmente desde el archivo .env");
                }
            }
        } catch (e) {
            console.warn("⚠️ No se pudo cargar el archivo .env de forma local:", e);
        }
    }

    // Comprobar si existe la configuración global
    if (!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey || window.FIREBASE_CONFIG.apiKey.startsWith('{{')) {
        console.error("❌ Firebase: No se detectó configuración válida en window.FIREBASE_CONFIG. Revisa la carga de config.js y tus variables de entorno.");
        return;
    }

    const firebaseConfig = window.FIREBASE_CONFIG;
    const siteKey = window.APP_CHECK_SITE_KEY && !window.APP_CHECK_SITE_KEY.startsWith('{{') ? window.APP_CHECK_SITE_KEY : null;

    // Inicializar Firebase si no ha sido inicializado antes
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("🔥 Firebase inicializado con éxito");
    }

    window.auth = firebase.auth();
    window.db = firebase.firestore();
    auth = window.auth;
    db = window.db;

    // Activar App Check si la clave está disponible
    if (siteKey) {
        try {
            const appCheck = firebase.appCheck();
            appCheck.activate(siteKey, true);
            console.log("✅ App Check activado correctamente");
        } catch (error) {
            console.error("❌ Error activando App Check:", error);
        }
    } else {
        console.warn("⚠️ App Check: Site Key no disponible. Omitiendo activación.");
    }

    // Configurar persistencia local para la sesión del usuario
    window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(function() { 
            console.log("🔑 Persistencia LOCAL de Autenticación configurada"); 
        })
        .catch(function(error) { 
            console.error("❌ Error configurando persistencia de autenticación:", error); 
        });

    // Configurar el proveedor de Google Auth
    window.googleProvider = new firebase.auth.GoogleAuthProvider();
    window.googleProvider.setCustomParameters({ prompt: 'select_account' });
    googleProvider = window.googleProvider;
})();
