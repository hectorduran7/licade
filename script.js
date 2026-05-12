let entries = JSON.parse(localStorage.getItem('ungs_grades')) || [];

async function init() {
    const response = await fetch('materias.json');
    const data = await response.json();
    renderAccordion(data.ADE);
    updateGPAUI();
}

function renderAccordion(ade) {
    const container = document.getElementById('accordionContainer');
    container.innerHTML = "";

    for (const [cuatri, mats] of Object.entries(ade)) {
        const section = document.createElement('div');
        section.className = 'year-section';
        section.innerHTML = `
            <div class="year-header" onclick="toggleYear(this)">${cuatri} <span>+</span></div>
            <div class="materia-container" style="display: none;">
                ${mats.map(m => `
                    <div class="materia-item" onclick="openDoc('${m.n}', '${m.l}')">
                        <span>${m.n}</span>
                        <small>Ver →</small>
                    </div>
                `).join('')}
            </div>`;
        container.appendChild(section);
    }
}

function toggleYear(el) {
    const panel = el.nextElementSibling;
    const icon = el.querySelector('span');
    const isOpen = panel.style.display === "block";
    panel.style.display = isOpen ? "none" : "block";
    icon.innerText = isOpen ? "+" : "-";
}

function openDoc(name, link) {
    document.getElementById('activeTitle').innerText = name;
    const viewer = document.getElementById('viewer-container');
    const iframe = document.getElementById('driveViewer');
    viewer.style.display = "block";
    iframe.src = link.replace('/view', '/preview').replace('?usp=drive_link', '');
    window.scrollTo({ top: viewer.offsetTop - 50, behavior: 'smooth' });
}

// Lógica de Calculadora (addEntry, removeEntry, updateGPAUI) igual a la anterior...
// Lógica de Toggles de Sidebar y Theme igual a la anterior...

init();
