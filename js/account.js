/**
 * Gestión de Cuenta (RGPD / Borrado de Datos)
 * Módulo 4
 */

async function deleteUserAccount() {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Debes iniciár sesión para eliminar tu cuenta.");
        return;
    }

    const confirmacion = confirm("ATENCIÓN: Esta acción es IRREVERSIBLE.\n\nSe eliminará tu cuenta, tu progreso en materias, puntos de XP, rachas y cualquier voto emitido.\n\n¿Estás completamente seguro de que quieres eliminar tu cuenta y todos tus datos?");
    
    if (!confirmacion) return;

    try {
        const uid = user.uid;
        const db = window.db; // Referencia global a Firestore

        // 1. Borrar datos de Firestore
        // Para users_votes necesitamos hacer una query (borrar donde uid = user.uid)
        const votesSnapshot = await db.collection('users_votes').where('uid', '==', uid).get();
        const batch = db.batch();
        votesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Borrar perfiles y colecciones del usuario
        const userMateriasRef = db.collection('usuarios_materias').doc(uid);
        const userProfileRef = db.collection('usuarios').doc(uid);
        const userProgresoRef = db.collection('usuarios_progreso').doc(uid);
        const userEstudioRef = db.collection('usuarios_estudio').doc(uid);
        const userCursadaRef = db.collection('usuarios_cursada').doc(uid);
        const userCalendarRef = db.collection('users_calendar').doc(uid);
        
        batch.delete(userMateriasRef);
        batch.delete(userProfileRef);
        batch.delete(userProgresoRef);
        batch.delete(userEstudioRef);
        batch.delete(userCursadaRef);
        batch.delete(userCalendarRef);

        await batch.commit();

        // 2. Borrar cuenta de Firebase Authentication
        await user.delete();

        // 3. Limpieza local
        localStorage.clear();
        sessionStorage.clear();

        // 4. Notificación y Redirección
        alert("Tu cuenta y datos han sido eliminados correctamente.");
        window.location.reload();

    } catch (error) {
        console.error("Error al eliminar cuenta:", error);
        if (error.code === 'auth/requires-recent-login') {
            alert("Por seguridad, debes haber iniciádo sesión recientemente para eliminar tu cuenta. Por favor, cierra sesión, vuelve a ingresar e inténtalo de nuevo.");
            firebase.auth().signOut().then(() => {
                window.location.reload();
            });
        } else {
            alert("Hubo un error al eliminar tu cuenta: " + error.message);
        }
    }
}

// Inyectar botón en el modal de configuración de apariencia si el usuario está logueado
function checkAndInjectDeleteButton(user) {
    // 1. Mostrar/Ocultar botón en la barra lateral
    const sidebarDeleteBtn = document.getElementById('sidebarDeleteAccountBtn');
    if (sidebarDeleteBtn) {
        sidebarDeleteBtn.style.display = user ? 'flex' : 'none';
    }

    // 2. Inyectar botón en la tuerca
    const modalContent = document.querySelector('#settingsModal .login-modal-content');
    if (!modalContent) return;

    let deleteSection = document.getElementById('deleteAccountSection');
    
    if (user) {
        if (!deleteSection) {
            deleteSection = document.createElement('div');
            deleteSection.id = 'deleteAccountSection';
            deleteSection.innerHTML = `
                <hr style="border: 0; border-top: 1px solid var(--border); margin: 24px 0;">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #ef4444; display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="alert-triangle" style="width: 16px; height: 16px;"></i> Zona de Peligro
                </h3>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">Elimina tu cuenta y todos tus datos (Progreso, XP, Votos) permanentemente de nuestros servidores.</p>
                <button onclick="deleteUserAccount()" class="btn-dark" style="width: 100%; border-color: rgba(239, 68, 68, 0.3); color: #ef4444; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i> Eliminar mi cuenta
                </button>
            `;
            modalContent.appendChild(deleteSection);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        deleteSection.style.display = 'block';
    } else {
        if (deleteSection) deleteSection.style.display = 'none';
    }
}

// Suscribirse a Auth
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(user => {
        checkAndInjectDeleteButton(user);
    });
}
