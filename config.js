// ==================== CONFIGURACIÓN FIREBASE — Biblioteca-ADE ====================
// Estrategia de carga en dos capas:
//
//   CAPA 1 (Producción): Vercel puede inyectar variables como propiedades de `window`
//                        mediante un endpoint serverless o un script de entorno.
//                        Si window.FIREBASE_API_KEY ya existe, se usa directamente.
//
//   CAPA 2 (Fallback):   Si la capa 1 no está disponible, se usan los marcadores
//                        %VARIABLE% que algunos pipelines de build (Vercel Static,
//                        Netlify, etc.) reemplazan en tiempo de despliegue.
//                        En desarrollo local, firebase-config.js leerá el .env.
// ================================================================================

var firebaseConfig = {
    apiKey:            window.FIREBASE_API_KEY            || "",
    authDomain:        window.FIREBASE_AUTH_DOMAIN        || "",
    projectId:         window.FIREBASE_PROJECT_ID         || "",
    storageBucket:     window.FIREBASE_STORAGE_BUCKET     || "",
    messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID || "",
    appId:             window.FIREBASE_APP_ID             || "",
    measurementId:     window.FIREBASE_MEASUREMENT_ID     || "G-PQGH6R9SZC"
};

// Si la capa 1 no inyectó valores, intentar con marcadores de build (%VAR%)
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "") {
    firebaseConfig.apiKey            = "%FIREBASE_API_KEY%";
    firebaseConfig.authDomain        = "%FIREBASE_AUTH_DOMAIN%";
    firebaseConfig.projectId         = "%FIREBASE_PROJECT_ID%";
    firebaseConfig.storageBucket     = "%FIREBASE_STORAGE_BUCKET%";
    firebaseConfig.messagingSenderId = "%FIREBASE_MESSAGING_SENDER_ID%";
    firebaseConfig.appId             = "%FIREBASE_APP_ID%";
}

// Exponer como window.FIREBASE_CONFIG para que firebase-config.js lo consuma
window.FIREBASE_CONFIG = firebaseConfig;

// App Check (mismo patrón: window primero, luego marcador de build)
window.APP_CHECK_SITE_KEY = window.APP_CHECK_SITE_KEY_VALUE || "%APP_CHECK_SITE_KEY%";

console.log("\u2705 config.js cargado — projectId:", window.FIREBASE_CONFIG.projectId || "(pendiente de inyección)");