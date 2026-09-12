// firebase-config.js — Biblioteca de ADE (UNGS)
(function() {
    const defaultFirebaseConfig = {
        apiKey: "AIzaSyDoFacVfYeZpNVIvbBqlcXtlZkbeg_UeVg",
        authDomain: "knowy-13079.firebaseapp.com",
        projectId: "knowy-13079",
        storageBucket: "knowy-13079.firebasestorage.app",
        messagingSenderId: "645341817520",
        appId: "1:645341817520:web:799733f87a0ad1a0382975",
        measurementId: "G-PQGH6R9SZC"
    };

    const config = window.FIREBASE_CONFIG || defaultFirebaseConfig;
    window.FIREBASE_CONFIG = config;

    if (typeof firebase !== 'undefined') {
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(config);
        }
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        if (window.auth && firebase.auth && firebase.auth.Auth && firebase.auth.Auth.Persistence) {
            window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(err) {
                console.warn('[Firebase Auth] Persistence error:', err);
            });
        }
    }
})();
