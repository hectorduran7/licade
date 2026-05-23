// ==================== CONFIGURACIÓN INYECTADA POR VERCEL ====================
// Este archivo es procesado automáticamente por Vercel
// Las variables {{ ... }} serán reemplazadas en tiempo de build

window.FIREBASE_CONFIG = {
    apiKey: "{{ FIREBASE_API_KEY }}",
    authDomain: "{{ FIREBASE_AUTH_DOMAIN }}",
    projectId: "{{ FIREBASE_PROJECT_ID }}",
    storageBucket: "{{ FIREBASE_STORAGE_BUCKET }}",
    messagingSenderId: "{{ FIREBASE_MESSAGING_SENDER_ID }}",
    appId: "{{ FIREBASE_APP_ID }}",
    measurementId: "G-PQGH6R9SZC"
};

window.APP_CHECK_SITE_KEY = "{{ APP_CHECK_SITE_KEY }}";

console.log("✅ Configuración cargada desde variables de entorno");