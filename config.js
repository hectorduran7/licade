// ==================== CONFIGURACIÓN FIREBASE — Biblioteca-ADE ====================
// Solución definitiva para sitios estáticos en Vercel.
// Las variables de configuración de Firebase son públicas por diseño para el frontend.
// ================================================================================

window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyDoFacVfYeZpNVIvbBqlcXtlZkbeg_UeVg",
    authDomain: "knowy-13079.firebaseapp.com",
    projectId: "knowy-13079",
    storageBucket: "knowy-13079.firebasestorage.app",
    messagingSenderId: "645341817520",
    appId: "1:645341817520:web:799733f87a0ad1a0382975",
    measurementId: "G-PQGH6R9SZC"
};

console.log("✅ config.js cargado exitosamente — projectId:", window.FIREBASE_CONFIG.projectId);