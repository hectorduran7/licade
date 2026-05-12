/**
 * script.js - Lógica de "La Biblioteca de ADE"
 * Maneja la carga de materias, calculadora de promedio y Roadmap.
 */

// Estado global de las notas para la calculadora
let entries = JSON.parse(localStorage.getItem('ungs_grades')) || [];

/**
 * Inicialización: Carga los datos del JSON y prepara la interfaz
 */
async function init() {
    try {
        const response = await fetch('materias.json');
        const data = await response.json();
        
        // Usamos la carrera de ADE por defecto
        const adeData = data.ADE;

        renderRoadmap();
        renderAccordion(adeData);
        updateGPAUI();
    } catch (error) {
        console.error("Error al cargar materias.json. Asegurate de que el archivo exista en la misma carpeta.", error);
    }
}

/**
 * Genera los nodos del Roadmap (Niveles 1 al 11)
 */
function renderRoadmap() {
    const container = document.getElementById('roadmap');
    if (!container) return;

    for (let i = 1; i <= 11; i++) {
        const node = document.createElement('div');
        node.className = 'node';
        node.innerText = i;
        node.title = `Ver materias del Nivel ${i}`;
        
        node.onclick = () => {
            // Al tocar un nivel, filtramos automáticamente en el buscador
            document.getElementById('searchInput').value = `Nivel ${i}`;
            filterMaterias();
            
            // Efecto visual de activo
            document.querySelectorAll('.node').forEach(n => n.classList.remove('active'));
            node.classList.add('active');
        };
        container.appendChild(node);
    }
}

/**
 * Construye el acordeón de materias basado en el JSON
 */
function renderAccordion(ade) {
    const container = document.getElementById('accordionContainer');
    if (!container) return;
    container.innerHTML = ""; // Limpiar antes de cargar

    for (const [level, mats] of Object.entries(ade)) {
        const section = document.createElement('div');
        section.className = 'year-section';
        
        section.innerHTML = `
            <div class="year-header" onclick="toggleYear(this)">
                ${level} <span>+</span>
            </div>
            <div class="materia-container">
                ${mats.map(m => `
                    <div class="materia-item" onclick="openDoc('${m.n}', '${m.l}')">
                        <span>${m.n}</span>
                        <small>Ver recursos →</small>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(section);
    }
}

/**
 * Lógica del Buscador: Filtra materias por nombre o nivel
 */
function filterMaterias() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const items = document.getElementsByClassName('materia-item');
    const sections = document.getElementsByClassName('year-section');

    for (let item of items) {
        const title = item.innerText.toLowerCase();
        item.style.display = title.includes(input) ? "" : "none";
    }

    // Si el usuario está buscando, expandimos las secciones para mostrar resultados
    for (let sec of sections) {
        const headerText = sec.querySelector('.year-header').innerText.toLowerCase();
        const panel = sec.querySelector('.materia-container');
        const icon = sec.querySelector('span');

        if (input && (headerText.includes(input) || Array.from(sec.querySelectorAll('.materia-item')).some(i => i.style.display === ""))) {
            panel.style.display = "block";
            icon.innerText = "-";
        } else if (!input) {
            panel.style.display = "none";
            icon.innerText = "+";
        }
    }
}

/**
 * Abre el visor de Drive
 */
function openDoc(name, link) {
    document.getElementById('activeTitle').innerText = name;
    const viewer = document.getElementById('viewer-container');
    const iframe = document.getElementById('driveViewer');
    
    viewer.style.display = "block";
    // Transformamos el link de Drive para que sea integrable en un iframe
    iframe.src = link.replace('/view', '/preview').replace('?usp=drive_link', '');
    
    // Scroll suave hacia el visor
    window.scrollTo({ top: viewer.offsetTop - 20, behavior: 'smooth' });
}

function closeViewer() {
    document.getElementById('viewer-container').style.display = "none";
}

/**
 * Lógica de la Calculadora de Promedio (Con persistencia)
 */
function addEntry() {
    const subjInput = document.getElementById('subjIn');
    const gradeInput = document.getElementById('gradeIn');
    
    const subj = subjInput.value.trim();
    const grade = parseFloat(gradeInput.value);

    if (subj && !isNaN(grade) && grade >= 1 && grade <= 10) {
        entries.push({ subj, grade });
        localStorage.setItem('ungs_grades', JSON.stringify(entries));
        
        updateGPAUI();
        
        subjInput.value = '';
        gradeInput.value = '';
    } else {
        alert("Por favor, ingresá un nombre de materia y una nota válida (1-10).");
    }
}

function removeEntry(index) {
    entries.splice(index, 1);
    localStorage.setItem('ungs_grades', JSON.stringify(entries));
    updateGPAUI();
}

function updateGPAUI() {
    const list = document.getElementById('gradeList');
    if (!list) return;

    list.innerHTML = entries.map((e, i) => `
        <div class="grade-item">
            <span>${e.subj}</span>
            <span><b>${e.grade}</b> <span class="btn-del" onclick="removeEntry(${i})">×</span></span>
        </div>
    `).join('');

    const avg = entries.length ? (entries.reduce((a, b) => a + b.grade, 0) / entries.length).toFixed(2) : "0.00";
    document.getElementById('avgOut').innerText = avg;
}

/**
 * Utilidades de Interfaz (Toggles)
 */
function toggleYear(el) {
    const panel = el.nextElementSibling;
    const icon = el.querySelector('span');
    const isOpen = panel.style.display === "block";
    
    panel.style.display = isOpen ? "none" : "block";
    icon.innerText = isOpen ? "+" : "-";
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('hidden');
    document.getElementById('mainContent').classList.toggle('expanded');
}

function toggleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('ungs_theme', newTheme);
}

// Aplicar tema guardado al cargar
if (localStorage.getItem('ungs_theme') === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
}

// Iniciar aplicación
init();