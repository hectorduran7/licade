// firebase-config.js
// Centralized configuration for Firebase and App Check (Biblioteca-ADE)

(function() {
    // Comprobar si existe la configuración global segura (inyectada por config.js desde variables de entorno)
    if (!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey || window.FIREBASE_CONFIG.apiKey.startsWith('{{')) {
        console.error("❌ Firebase: No se detectó configuración válida en window.FIREBASE_CONFIG. Revisa la carga de config.js y tus variables de entorno.");
        return;
    }

    const config = window.FIREBASE_CONFIG;
    const siteKey = window.APP_CHECK_SITE_KEY && !window.APP_CHECK_SITE_KEY.startsWith('{{') ? window.APP_CHECK_SITE_KEY : null;

    // Inicializar Firebase si no ha sido inicializado antes
    if (!firebase.apps.length) {
        firebase.initializeApp(config);
        console.log("🔥 Firebase inicializado con éxito");
    }

    // Inicializar y exportar instancias globalmente para todos los HTML
    window.auth = firebase.auth();
    
    // Verificación defensiva para páginas que no importan Firestore
    if (typeof firebase.firestore === 'function') {
        window.db = firebase.firestore();
    } else {
        console.log("ℹ️ Firestore no está cargado en esta página");
    }

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
})();
