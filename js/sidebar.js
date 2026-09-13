// js/sidebar.js
function toggleSidebarExpansion(forceExpand) {
    const sb = document.getElementById('sidebarRail');
    const bd = document.getElementById('sidebarBackdrop');
    if (!sb) return;
    
    const willExpand = forceExpand !== undefined ? forceExpand : sb.classList.contains('collapsed');
    if (willExpand) {
        sb.classList.remove('collapsed'); sb.classList.add('expanded');
        if (bd) bd.classList.add('active');
    } else {
        sb.classList.add('collapsed'); sb.classList.remove('expanded');
        if (bd) bd.classList.remove('active');
    }
}

function initSidebar() {
    let sidebarHTML = `
        <div id="sidebarBackdrop" class="sidebar-backdrop" onclick="toggleSidebarExpansion(false)"></div>
        <!-- FAB Mobile -->
        <button type="button" class="mobile-fab" onclick="toggleSidebarExpansion(true)">
            <svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>

        <aside id="sidebarRail" class="sidebar-rail collapsed">
            <div class="rail-header">
                <button type="button" data-tooltip="ADE UNGS" class="rail-btn" onclick="toggleSidebarExpansion()">
                    <div class="rail-icon"><svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></div>
                    <span class="rail-label">ADE UNGS</span>
                </button>
            </div>

            <nav class="rail-nav">
                <a href="index.html" data-tooltip="Explorar Materias" class="rail-item active" id="nav-index">
                    <div class="rail-icon"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                    <span class="rail-label">Explorar Materias</span>
                </a>
                <button type="button" id="btnRailMisMaterias" data-tooltip="Editar Cursada" class="rail-item hidden" onclick="window.openMySubjectsModal && window.openMySubjectsModal()">
                    <div class="rail-icon"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>
                    <span class="rail-label">Editar Cursada</span>
                </button>
                <a href="progreso.html" data-tooltip="Mi Progreso" class="rail-item" id="nav-progreso">
                    <div class="rail-icon"><svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
                    <span class="rail-label">Mi Progreso</span>
                </a>
                <a href="estudio.html" data-tooltip="Sesión de Estudio" class="rail-item" id="nav-estudio">
                    <div class="rail-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                    <span class="rail-label">Sesión de Estudio</span>
                </a>
                <a href="cursada.html" data-tooltip="Planificador de Cursada" class="rail-item" id="nav-cursada">
                    <div class="rail-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                    <span class="rail-label">Planificar Cursada</span>
                </a>
                
                <div class="rail-divider"></div>

                <a href="https://www.ungs.edu.ar/category/bienestar/intermediacion-laboral/busquedas-externas" target="_blank" data-tooltip="Bolsa de Trabajo" class="rail-item">
                    <div class="rail-icon"><svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
                    <span class="rail-label">Bolsa de Trabajo</span>
                </a>
                <a href="https://www.ungs.edu.ar/category/estudiar-en-la-ungs/becas-y-pasantias/convocatorias-de-pasantias-vigentes" target="_blank" data-tooltip="Pasantías ADE" class="rail-item">
                    <div class="rail-icon"><svg viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg></div>
                    <span class="rail-label">Pasantías ADE</span>
                </a>
                <div class="rail-divider"></div>
                <a href="Recomendaciones_docentes.pdf" target="_blank" data-tooltip="Recomendaciones Docentes" class="rail-item">
                    <div class="rail-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
                    <span class="rail-label">Recomendaciones Docentes</span>
                </a>
                <a href="https://forms.gle/rjBa6mMxTo9zxcmy7" target="_blank" data-tooltip="Dejar Sugerencia" class="rail-item">
                    <div class="rail-icon"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="7" x2="12" y2="13"/></svg></div>
                    <span class="rail-label">Dejar Sugerencia</span>
                </a>
            </nav>

            <div class="rail-footer">
                <button type="button" data-tooltip="Apariencia" class="rail-item" onclick="window.openModal && openModal('settingsModal')">
                    <div class="rail-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div>
                    <span class="rail-label">Apariencia</span>
                </button>
                <button type="button" id="btnRailAuth" data-tooltip="Iniciar Sesión" class="rail-item rail-btn" onclick="openLoginModal()" title="Cuenta">
                    <div class="rail-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                    <span id="railAuthLabel" class="rail-label">Iniciar Sesión</span>
                </button>
            </div>
        </aside>
    `;
    const container = document.getElementById('sidebar-mount');
    sidebarHTML += `
    <!-- Settings Modal -->
    <div id="settingsModal" class="modal-overlay" onclick="window.closeOnOutsideClick && closeOnOutsideClick(event, 'settingsModal')">
        <div class="modal-content" style="max-width: 400px; padding: 22px 20px 20px 20px; max-height: 92vh;">
            <div class="apple-modal-header" style="margin-bottom: 18px;">
                <div class="apple-modal-icon-badge" style="width: 42px; height: 42px; border-radius: 14px; margin-bottom: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </div>
                <h3 class="apple-modal-title" style="font-size: 18px; margin: 0 0 4px 0;">Apariencia</h3>
                <p class="apple-modal-subtitle" style="font-size: 12px; margin: 0; line-height: 1.3;">Personalizá el modo visual y el color de acento del sistema.</p>
                <button type="button" class="modal-close" style="position: absolute; top: 0; right: 0;" onclick="window.closeModal && closeModal('settingsModal')" aria-label="Cerrar"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            
            <div style="margin-bottom: 18px;">
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 10px; display: block;">Modo de Visualización</label>
                <div class="apple-segmented-control" style="margin-bottom: 0; padding: 2px;">
                    <button type="button" id="btnThemeDark" class="apple-segment-btn active" style="padding: 7px 0; font-size: 13px;" onclick="window.setAppearanceMode && setAppearanceMode('dark')">Oscuro (Pizarra)</button>
                    <button type="button" id="btnThemeLight" class="apple-segment-btn" style="padding: 7px 0; font-size: 13px;" onclick="window.setAppearanceMode && setAppearanceMode('light')">Claro (Papiro)</button>
                </div>
            </div>

            <div>
                <label style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 10px; display: block;">Color de Acento</label>
                <div class="apple-swatches-grid">
                    <button type="button" class="apple-swatch-btn" data-swatch="blue" style="background:#0A84FF; --swatch-color:#0A84FF;" onclick="window.setTheme && setTheme('blue')" title="Azul Apple" aria-label="Azul Apple">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button type="button" class="apple-swatch-btn" data-swatch="orange" style="background:#FF9F0A; --swatch-color:#FF9F0A;" onclick="window.setTheme && setTheme('orange')" title="Naranja Ámbar" aria-label="Naranja Ámbar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button type="button" class="apple-swatch-btn" data-swatch="green" style="background:#32D74B; --swatch-color:#32D74B;" onclick="window.setTheme && setTheme('green')" title="Verde Esmeralda" aria-label="Verde Esmeralda">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button type="button" class="apple-swatch-btn" data-swatch="purple" style="background:#BF5AF2; --swatch-color:#BF5AF2;" onclick="window.setTheme && setTheme('purple')" title="Violeta Neón" aria-label="Violeta Neón">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button type="button" class="apple-swatch-btn" data-swatch="red" style="background:#FF453A; --swatch-color:#FF453A;" onclick="window.setTheme && setTheme('red')" title="Rojo Coral" aria-label="Rojo Coral">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                </div>
            </div>

            <button type="button" class="btn-primary-solid" style="width: 100%; height: 44px; font-size: 14px; border-radius: 12px; margin-top: 20px;" onclick="window.closeModal && closeModal('settingsModal')">Listo</button>
        </div>
    </div>

    <!-- Auth Modal -->
    <div id="authModal" class="modal-overlay" onclick="window.closeOnOutsideClick && closeOnOutsideClick(event, 'authModal')">
        <div class="modal-content" style="max-width: 400px; padding: 20px 20px 18px 20px; max-height: 92vh;">
            <div class="apple-modal-header" style="margin-bottom: 14px;">
                <div class="apple-modal-icon-badge" style="width: 42px; height: 42px; border-radius: 14px; margin-bottom: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <h3 class="apple-modal-title" id="authModalTitle" style="font-size: 18px; margin: 0 0 4px 0;">Iniciar Sesión</h3>
                <p class="apple-modal-subtitle" id="authModalSubtitle" style="font-size: 12px; margin: 0; line-height: 1.3;">Sincronizá tus materias, notas y agenda en la nube de UNGS.</p>
                <button type="button" class="modal-close" style="position: absolute; top: 0; right: 0;" onclick="window.closeModal && closeModal('authModal')" aria-label="Cerrar"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>

            <!-- Apple Segmented Control -->
            <div class="apple-segmented-control" style="margin-bottom: 14px; padding: 2px;">
                <button type="button" id="tabAuthLogin" class="apple-segment-btn active" style="padding: 7px 0; font-size: 13px;" onclick="window.switchAuthTab && switchAuthTab('login')">Ingresar</button>
                <button type="button" id="tabAuthRegister" class="apple-segment-btn" style="padding: 7px 0; font-size: 13px;" onclick="window.switchAuthTab && switchAuthTab('register')">Registrarse</button>
            </div>
            
            <div id="authFormArea">
                <div id="registerExtraFields" class="hidden" style="margin-bottom: 10px;">
                    <input type="text" id="authName" class="form-input" style="height: 44px; font-size: 14px;" placeholder="Nombre completo" autocomplete="name">
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
                    <input type="email" id="authEmail" class="form-input" style="height: 44px; font-size: 14px;" placeholder="Correo electrónico" autocomplete="email">
                    <input type="password" id="authPass" class="form-input" style="height: 44px; font-size: 14px;" placeholder="Contraseña (mín 6 caracteres)" autocomplete="current-password">
                </div>
                
                <button type="button" id="btnAuthSubmit" class="btn-submit-full" style="height: 44px; font-size: 14px; border-radius: 12px;" onclick="window.handleAuthAction && handleAuthAction()">
                    <span id="btnAuthSubmitText">Ingresar</span>
                </button>
                
                <div class="apple-auth-divider" style="margin: 12px 0;">
                    <span>O continuar con</span>
                </div>
                
                <div style="display: flex; gap: 8px; flex-direction: column;">
                    <button type="button" class="apple-social-btn" style="height: 42px; font-size: 13px; border-radius: 12px;" onclick="window.handleGoogleLogin && handleGoogleLogin()">
                        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        <span>Google</span>
                    </button>
                    <button type="button" class="apple-social-btn" style="height: 42px; font-size: 13px; border-radius: 12px;" onclick="window.closeModal && closeModal('authModal')">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span>Entrar como Invitado</span>
                    </button>
                </div>
                
                <div style="display: flex; justify-content: center; margin-top: 10px;">
                    <button type="button" class="apple-link-btn" style="font-size: 12px;" onclick="window.handlePasswordReset && handlePasswordReset()">¿Olvidaste tu contraseña?</button>
                </div>
                <p id="authErrorMsg" class="hidden" style="color: var(--danger); font-size: 12px; margin-top: 10px; text-align: center; font-weight: 600; padding: 6px 10px; background: rgba(255, 69, 58, 0.1); border-radius: 8px; border: 1px solid rgba(255, 69, 58, 0.25);"></p>
            </div>

            <div id="authLoggedInArea" class="hidden" style="text-align: center; padding: 8px 0;">
                <div id="authAvatar" style="width: 64px; height: 64px; border-radius: 32px; background: var(--primary-glow); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; margin: 0 auto 12px auto; box-shadow: 0 0 20px var(--primary-glow);">U</div>
                <div id="loggedUserName" style="font-weight: 700; color: var(--text-main); font-size: 17px;">Estudiante ADE</div>
                <div id="loggedUserEmail" style="font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">usuario@email.com</div>
                
                <button type="button" class="btn-submit-full" style="height: 44px; font-size: 14px; border-radius: 12px; background: rgba(255, 69, 58, 0.15); color: var(--danger); border: 1px solid rgba(255, 69, 58, 0.3); box-shadow: none;" onclick="window.handleAuthLogout && handleAuthLogout()">Cerrar Sesión</button>
            </div>
        </div>
    </div>

    <!-- My Subjects Modal -->
    <div id="mySubjectsModal" class="modal-overlay" onclick="window.closeOnOutsideClick && closeOnOutsideClick(event, 'mySubjectsModal')">
        <div class="modal-content" style="max-width: 500px; padding: 22px 20px 20px 20px; max-height: 92vh; display: flex; flex-direction: column;">
            <div class="apple-modal-header" style="margin-bottom: 14px;">
                <div class="apple-modal-icon-badge" style="width: 42px; height: 42px; border-radius: 14px; margin-bottom: 8px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <h3 class="apple-modal-title" style="font-size: 18px; margin: 0 0 4px 0;">Editar Cursada</h3>
                <p class="apple-modal-subtitle" style="font-size: 12px; margin: 0; line-height: 1.3;">Marcá las materias que estás cursando para tener acceso rápido en la pantalla principal.</p>
                <button type="button" class="modal-close" style="position: absolute; top: 0; right: 0;" onclick="window.closeModal && closeModal('mySubjectsModal')" aria-label="Cerrar"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            
            <div id="mySubjectsList" class="check-list" style="display: flex; flex-direction: column; gap: 6px; max-height: 54vh; min-height: 180px; overflow-y: auto;"></div>
            
            <button type="button" class="btn-submit-full" style="margin-top: 16px;" onclick="window.saveMySubjects && saveMySubjects()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Guardar Cambios
            </button>
        </div>
    </div>
    `;

    if (container) container.innerHTML = sidebarHTML;

    // Set active link based on pathname
    const path = window.location.pathname;
    const pageName = path.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.rail-item').forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href && (href === pageName || (pageName === 'visor.html' && href === 'index.html') || (pageName === 'metricas.html' && href === 'estudio.html'))) {
            item.classList.add('active');
        }
    });

    // Auto-close en rail items que no sean botones modales
    document.querySelectorAll('.rail-item').forEach(item => {
        if (item.tagName === 'A') {
            item.addEventListener('click', () => toggleSidebarExpansion(false));
        }
    });
}
document.addEventListener('DOMContentLoaded', initSidebar);

window.openModal = function(id) {
    if (window.toggleSidebarExpansion) window.toggleSidebarExpansion(false);
    const m = document.getElementById(id);
    if (m) {
        m.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (id === 'settingsModal') {
            const currentTheme = localStorage.getItem('ungs_theme') || 'orange';
            document.querySelectorAll('.apple-swatch-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-swatch') === currentTheme);
            });
            const currentMode = localStorage.getItem('ungs_mode') || 'dark';
            const btnDark = document.getElementById('btnThemeDark');
            const btnLight = document.getElementById('btnThemeLight');
            if (btnDark) btnDark.classList.toggle('active', currentMode === 'dark');
            if (btnLight) btnLight.classList.toggle('active', currentMode === 'light');
        }
    }
};

window.closeModal = function(id) {
    const m = document.getElementById(id);
    if (m) {
        m.classList.remove('active');
        document.body.style.overflow = '';
    }
};
window.closeOnOutsideClick = function(e, id) {
    if(e.target.id === id) window.closeModal(id);
}
window.setTheme = function(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ungs_theme', theme);
    document.querySelectorAll('.apple-swatch-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-swatch') === theme);
    });
}
window.setAppearanceMode = function(mode) {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('ungs_mode', mode);
    const btnDark = document.getElementById('btnThemeDark');
    const btnLight = document.getElementById('btnThemeLight');
    if (btnDark) btnDark.classList.toggle('active', mode === 'dark');
    if (btnLight) btnLight.classList.toggle('active', mode === 'light');
}
