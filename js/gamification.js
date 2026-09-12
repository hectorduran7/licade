/**
 * Gamificación Base (XP, Rachas y Rangos)
 * Módulo 3
 */

// Rangos según XP
const RANKS = [
    { max: 100, name: "Estudiante Novato" },
    { max: 350, name: "Estudiante Constante" },
    { max: 800, name: "Estudiante Aplicado" },
    { max: 1500, name: "Tutor Académico" },
    { max: Infinity, name: "Licenciado Honorífico" }
];

function getRank(xp) {
    for (let rank of RANKS) {
        if (xp <= rank.max) return rank.name;
    }
    return RANKS[RANKS.length - 1].name;
}

// Inicializa o procesa la racha diaria
async function checkDailyStreak(user) {
    if (!window.db || !user) return;
    
    const userRef = window.db.collection('usuarios').doc(user.uid);
    const doc = await userRef.get();
    
    if (!doc.exists) {
        // Inicializar nuevo perfil (esto normalmente iría en el registro)
        await userRef.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "Estudiante",
            xp: 0,
            rachaActual: 1,
            ultimaFechaConexion: getLocalDateStr(),
            nivel: getRank(0),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        updateGamificationBadge(1, 0, getRank(0));
        return;
    }

    let data = doc.data();
    let rachaActual = data.rachaActual || 0;
    let xp = data.xp || 0;
    let ultimaConexion = data.ultimaFechaConexion;
    let hoy = getLocalDateStr();

    if (ultimaConexion === hoy) {
        // Ya se conectó hoy, no hacer nada especial
    } else if (ultimaConexion === getLocalDateStr(-1)) {
        // Se conectó ayer, incrementar racha
        rachaActual++;
        xp += 15; // +15 XP por racha
        ultimaConexion = hoy;
    } else {
        // Rompió la racha
        rachaActual = 1;
        xp += 5; // +5 XP por volver
        ultimaConexion = hoy;
    }

    let nivel = getRank(xp);

    // Guardar cambios
    await userRef.update({
        rachaActual,
        xp,
        ultimaFechaConexion: ultimaConexion,
        nivel
    });

    updateGamificationBadge(rachaActual, xp, nivel);
}

// Sumar XP genérico (para visor y estudio)
async function addXP(user, amount, reason) {
    if (!window.db || !user) return;
    const userRef = window.db.collection('usuarios').doc(user.uid);
    const doc = await userRef.get();
    if (doc.exists) {
        let xp = (doc.data().xp || 0) + amount;
        let nivel = getRank(xp);
        await userRef.update({ xp, nivel });
        
        console.log(`+${amount} XP por: ${reason}`);
        // Actualizar UI si estamos en index.html
        if (typeof updateGamificationBadge === 'function') {
            updateGamificationBadge(doc.data().rachaActual, xp, nivel);
        }
    }
}

// Helpers de fecha
function getLocalDateStr(offsetDays = 0) {
    let d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
}

// Actualizar el UI del badge
function updateGamificationBadge(racha, xp, nivel) {
    const badge = document.getElementById('gamificationBadge');
    if (!badge) return;
    badge.classList.remove('badge-disabled');
    badge.innerHTML = `
        <span class="badge-fire" title="Racha actual">Racha: ${racha} días</span>
        <span style="color: var(--border);">|</span>
        <span class="badge-xp" title="Nivel actual">${xp} XP (${nivel})</span>
    `;
}

function setGamificationBadgeGuest() {
    const badge = document.getElementById('gamificationBadge');
    if (!badge) return;
    badge.classList.add('badge-disabled');
    badge.innerHTML = `Racha: 0 días | 0 XP (Inicia sesión para guardar tu progreso)`;
    badge.onclick = () => document.getElementById('loginModal').classList.remove('hidden');
}

// Suscribirse a los cambios de auth
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            checkDailyStreak(user);
        } else {
            setGamificationBadgeGuest();
        }
    });
}
