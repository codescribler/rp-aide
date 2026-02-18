// ==================== DATA ====================

const SECTIONS = [
  { letter: 'A', name: 'DEMOLITION', subsections: [] },
  { letter: 'B', name: 'STRUCTURE', subsections: ['Concrete', 'Blockwork', 'Timber Framing', 'Metal Framing'] },
  { letter: 'C', name: 'ARCHITECTURE', subsections: ['Roofing', 'Exterior Finish', 'Insulation', 'Waterproofing', 'Doors', 'Windows', 'Rooflights', 'Plaster Linings', 'Floor Finishes', 'Base Finishes', 'Wall Finishes', 'Ceiling Finishes', 'Stairs & Railings', 'Joinery', 'Specialities'] },
  { letter: 'D', name: 'DRAINAGE WORKS', subsections: [] },
  { letter: 'E', name: 'MECHANICAL SERVICES', subsections: [] },
  { letter: 'F', name: 'ELECTRICAL SERVICES', subsections: [] },
  { letter: 'G', name: 'SITE WORK', subsections: [] }
];

// TEMPLATES constant is now in templates-data.js

// Seed projects for the demo
const SEED_PROJECTS = [
  {
    id: 'proj-001',
    name: 'The White Hart, Marden',
    location: '14 High Street, Marden, Kent TN12 9DR',
    clientName: 'Marden Developments Ltd',
    architectName: 'Baca Architects',
    preparedBy: 'Demo User',
    checkedBy: '',
    date: '2026-01-15',
    revision: '02',
    projectType: 'new-build',
    markupPercentage: 125,
    notes: 'All works subject to planning approval.\nExcludes furniture and soft furnishings.\nProvisional sums for M&E subject to specialist quote.',
    lineItems: [],
    totalValue: 1742500
  },
  {
    id: 'proj-002',
    name: '24 David Road Extension',
    location: '24 David Road, Paignton, Devon TQ4 6DB',
    clientName: 'Mr & Mrs Henderson',
    architectName: 'JBR Architecture',
    preparedBy: 'Demo User',
    checkedBy: 'T. Roberts',
    date: '2026-02-03',
    revision: '00',
    projectType: 'extension',
    markupPercentage: 130,
    notes: 'Client to supply kitchen appliances.\nExcludes landscaping and external drainage beyond 1m from building.',
    lineItems: [],
    totalValue: 132000
  },
  {
    id: 'proj-003',
    name: '30 Grayling Rd Loft',
    location: '30 Grayling Road, London N16 0AE',
    clientName: 'Ms S. Patel',
    architectName: 'Studio Bark',
    preparedBy: 'Demo User',
    checkedBy: '',
    date: '2026-02-10',
    revision: '00a',
    projectType: 'loft-conversion',
    markupPercentage: 125,
    notes: 'Subject to structural survey.\nParty wall agreement required.',
    lineItems: [],
    totalValue: 70000
  }
];


// ==================== STATE ====================

let currentProject = null;
let deleteTargetId = null;

function getProjects() {
  const raw = localStorage.getItem('rp_projects');
  return raw ? JSON.parse(raw) : null;
}

function saveProjects(projects) {
  localStorage.setItem('rp_projects', JSON.stringify(projects));
}

function initSeedData() {
  if (!getProjects()) {
    // Build line items for each seed project from templates
    SEED_PROJECTS.forEach(proj => {
      proj.lineItems = buildLineItems(proj.projectType);
      // Add demo quantities to make it look realistic
      addDemoQuantities(proj);
    });
    saveProjects(SEED_PROJECTS);
  }
}

function addDemoQuantities(proj) {
  const markup = (proj.markupPercentage || 125) / 100;
  // Set random plausible quantities on ~60% of items
  proj.lineItems.forEach((li, i) => {
    if (Math.random() < 0.6) {
      const unit = li.unit;
      if (unit === 'm\u00B2') li.quantity = Math.round(Math.random() * 80 + 10);
      else if (unit === 'm\u00B3') li.quantity = Math.round(Math.random() * 15 + 2);
      else if (unit === 'm') li.quantity = Math.round(Math.random() * 30 + 5);
      else if (unit === 'nr') li.quantity = Math.round(Math.random() * 8 + 1);
      else if (unit === 'kg') li.quantity = Math.round(Math.random() * 300 + 50);
      else if (unit === 'riser') li.quantity = Math.round(Math.random() * 12 + 8);
      else if (unit === 'p/s' || unit === 'item' || unit === 'sum') li.quantity = 1;
      else li.quantity = Math.round(Math.random() * 10 + 1);
    }
  });
  // Compute total
  proj.totalValue = proj.lineItems
    .filter(li => li.isActive)
    .reduce((sum, li) => sum + (li.quantity * li.unitCost * markup), 0);
  proj.totalValue = Math.round(proj.totalValue);
}

function buildLineItems(projectType) {
  // Read from localStorage templates (with enabled/relatedCosts), fall back to hardcoded
  const templates = getTemplates() || TEMPLATES;
  const template = templates[projectType];
  if (!template) return [];
  const items = [];
  let sortOrder = 0;

  SECTIONS.forEach(sec => {
    const sectionData = template.sections[sec.letter];
    if (!sectionData) return;

    if (Array.isArray(sectionData)) {
      sectionData.forEach(item => {
        if (item.enabled === false) return; // skip disabled items
        items.push({
          id: 'li-' + Math.random().toString(36).substr(2, 9),
          section: sec.letter,
          subsection: '',
          description: item.desc,
          quantity: 0,
          unit: item.unit,
          unitCost: item.cost,
          isActive: true,
          sortOrder: sortOrder++,
          measurements: []
        });
      });
    } else {
      // Object with subsections
      for (const [sub, subItems] of Object.entries(sectionData)) {
        subItems.forEach(item => {
          if (item.enabled === false) return; // skip disabled items
          items.push({
            id: 'li-' + Math.random().toString(36).substr(2, 9),
            section: sec.letter,
            subsection: sub,
            description: item.desc,
            quantity: 0,
            unit: item.unit,
            unitCost: item.cost,
            isActive: true,
            sortOrder: sortOrder++,
            measurements: []
          });
        });
      }
    }
  });

  return items;
}


// ==================== NAVIGATION ====================

function doLogin() {
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-login').style.display = 'none';
  document.getElementById('app-shell').style.display = 'flex';
  initTemplates();
  initSeedData();
  navigateTo('dashboard');
}

function doLogout() {
  document.getElementById('app-shell').style.display = 'none';
  document.getElementById('screen-login').style.display = 'block';
  setTimeout(() => document.getElementById('screen-login').classList.add('active'), 10);
}

function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });
  // Show target page
  const target = document.getElementById('page-' + page);
  if (target) {
    target.style.display = 'block';
    setTimeout(() => target.classList.add('active'), 10);
  }
  // Update nav — admin sub-pages highlight the 'admin-templates' nav item
  const navKey = page === 'admin-editor' ? 'admin-templates' : page;
  document.querySelectorAll('.nav-item[data-nav]').forEach(n => {
    n.classList.toggle('active', n.dataset.nav === navKey);
  });
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');

  // Render page content
  if (page === 'dashboard') renderDashboard();
  if (page === 'editor') renderEditor();
  if (page === 'pdf-preview') renderPdfPreview();
  if (page === 'admin-templates') renderAdminTemplates();
  if (page === 'admin-editor') renderAdminEditor();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}


// ==================== DASHBOARD ====================

function renderDashboard() {
  const projects = getProjects() || [];
  const list = document.getElementById('projects-list');

  // Stats
  document.getElementById('stat-total').textContent = projects.length;
  const totalVal = projects.reduce((s, p) => s + (p.totalValue || 0), 0);
  document.getElementById('stat-value').textContent = '\u00A3' + formatNum(totalVal);
  document.getElementById('stat-month').textContent = projects.filter(p => p.date && p.date.startsWith('2026-02')).length;
  document.getElementById('stat-avg').textContent = projects.length ? '\u00A3' + formatNum(Math.round(totalVal / projects.length)) : '\u00A30';

  if (projects.length === 0) {
    list.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><h3>No projects yet</h3><p>Create your first renovation estimate to get started.</p><button class="btn btn-primary" onclick="navigateTo(\'new-project\')">New Project</button></div>';
    return;
  }

  const colors = ['blue', 'orange', 'green'];
  const icons = {
    'new-build': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'extension': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="10" height="14" rx="1"/><rect x="12" y="11" width="10" height="10" rx="1"/></svg>',
    'loft-conversion': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 8.5 22 22 2 22 2 8.5"/></svg>',
    'garage-conversion': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="14" rx="1"/><path d="M3 8l9-6 9 6"/></svg>',
    'kitchen-refit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
    'bathroom-refit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/></svg>'
  };

  const typeLabels = {
    'new-build': 'New Build',
    'extension': 'Extension',
    'loft-conversion': 'Loft Conversion',
    'garage-conversion': 'Garage Conversion',
    'kitchen-refit': 'Kitchen Refit',
    'bathroom-refit': 'Bathroom Refit'
  };

  list.innerHTML = projects.map((p, i) => `
    <div class="project-card animate-in" style="animation-delay:${i * 60}ms" onclick="openProject('${p.id}')">
      <div class="project-icon ${colors[i % 3]}">
        ${icons[p.projectType] || icons['new-build']}
      </div>
      <div class="project-info">
        <div class="project-name">${esc(p.name)}</div>
        <div class="project-meta">
          <span class="project-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${esc(p.clientName)}
          </span>
          <span class="project-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${p.date ? formatDate(p.date) : 'No date'}
          </span>
          <span class="badge badge-blue">${typeLabels[p.projectType] || p.projectType}</span>
        </div>
      </div>
      <div class="project-value">
        <div class="project-value-amount">\u00A3${formatNum(p.totalValue || 0)}</div>
        <div class="project-value-label">Est. value</div>
      </div>
      <div class="project-actions" onclick="event.stopPropagation()">
        <button class="btn btn-ghost btn-sm" onclick="cloneProject('${p.id}')" title="Clone">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button class="btn btn-ghost btn-sm" onclick="promptDelete('${p.id}')" title="Delete" style="color:var(--danger)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}


// ==================== NEW PROJECT ====================

let selectedType = null;

function selectType(el) {
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedType = el.dataset.type;
}

function createProject() {
  const name = document.getElementById('np-name').value.trim();
  if (!name) { showToast('Please enter a project name'); return; }
  if (!selectedType) { showToast('Please select a project type'); return; }

  const project = {
    id: 'proj-' + Math.random().toString(36).substr(2, 9),
    name: name,
    location: document.getElementById('np-location').value.trim(),
    clientName: document.getElementById('np-client').value.trim(),
    architectName: document.getElementById('np-architect').value.trim(),
    preparedBy: 'Demo User',
    checkedBy: '',
    date: document.getElementById('np-date').value,
    revision: document.getElementById('np-revision').value || '00',
    projectType: selectedType,
    markupPercentage: 125,
    notes: '',
    lineItems: buildLineItems(selectedType),
    totalValue: 0
  };

  const projects = getProjects() || [];
  projects.unshift(project);
  saveProjects(projects);

  // Reset form
  document.getElementById('np-name').value = '';
  document.getElementById('np-location').value = '';
  document.getElementById('np-client').value = '';
  document.getElementById('np-architect').value = '';
  document.getElementById('np-date').value = '';
  document.getElementById('np-revision').value = '00';
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  selectedType = null;

  showToast('Project created successfully');
  currentProject = project;
  navigateTo('editor');
}


// ==================== EDITOR ====================

function openProject(id) {
  const projects = getProjects() || [];
  currentProject = projects.find(p => p.id === id);
  if (currentProject) navigateTo('editor');
}

function renderEditor() {
  if (!currentProject) {
    document.getElementById('editor-sections').innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><h3>No project selected</h3><p>Open a project from the dashboard or create a new one.</p><button class="btn btn-primary" onclick="navigateTo(\'dashboard\')">Go to Dashboard</button></div>';
    return;
  }

  document.getElementById('editor-title').textContent = currentProject.name;
  document.getElementById('editor-subtitle').textContent = currentProject.location || 'Edit line items and quantities';
  document.getElementById('markup-pct').value = currentProject.markupPercentage || 125;
  document.getElementById('notes-field').value = currentProject.notes || '';

  const container = document.getElementById('editor-sections');
  let html = '';
  const markup = (currentProject.markupPercentage || 125) / 100;

  // Collect all sections: standard SECTIONS + any custom ones in the project
  const projectSections = getProjectSections();

  projectSections.forEach(sec => {
    const sectionItems = (currentProject.lineItems || []).filter(li => li.section === sec.letter);

    const sectionTotal = sectionItems
      .filter(li => li.isActive)
      .reduce((sum, li) => sum + (li.quantity * li.unitCost * markup), 0);

    html += `<div class="section-block animate-in">`;
    html += `<div class="section-header" onclick="toggleSection(this)">
      <div class="section-title">
        <span class="section-letter">${sec.letter}</span>
        ${sec.name}
        <span style="font-weight:400; font-size:0.75rem; opacity:0.7">(${sectionItems.length} items)</span>
      </div>
      <div class="section-subtotal">\u00A3${formatNum(sectionTotal)}</div>
    </div>`;
    html += `<div class="section-body">`;

    // Group by subsection
    const subsections = {};
    sectionItems.forEach(li => {
      const key = li.subsection || '_root';
      if (!subsections[key]) subsections[key] = [];
      subsections[key].push(li);
    });

    // Include empty subsections (added via Add Subsection but no items yet)
    const emptySubsections = (currentProject.emptySubsections || [])
      .filter(s => s.section === sec.letter && !subsections[s.name]);
    emptySubsections.forEach(s => { subsections[s.name] = []; });

    for (const [sub, items] of Object.entries(subsections)) {
      if (sub !== '_root') {
        html += `<div class="subsection-header">
          <span>${esc(sub)}</span>
          <button class="subsection-remove-btn" onclick="event.stopPropagation(); removeSubsection('${sec.letter}', '${escAttr(sub)}')" title="Remove subsection">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>`;
      }
      items.forEach(li => {
        const itemCost = li.isActive ? li.quantity * li.unitCost * markup : 0;
        html += `<div class="line-item ${li.isActive ? '' : 'inactive'}" data-id="${li.id}">
          <button class="item-toggle ${li.isActive ? 'on' : ''}" onclick="toggleItem('${li.id}', this)" title="${li.isActive ? 'Active' : 'Inactive'}"></button>
          <div class="item-desc" title="${esc(li.description)}">${esc(li.description)}</div>
          <input type="number" class="item-input" value="${li.quantity}" min="0" step="1" onchange="updateQty('${li.id}', this.value)" placeholder="0">
          <div class="item-unit">${esc(li.unit)}</div>
          <input type="number" class="item-input" value="${li.unitCost}" min="0" step="0.01" onchange="updateCost('${li.id}', this.value)" placeholder="0.00">
          <div class="item-cost">\u00A3${formatNum(itemCost)}</div>
        </div>`;
      });
    }

    // Add item + Add subsection buttons at the bottom of each section
    html += `<div class="add-item-row">
      <button class="add-item-btn" onclick="openAddItemModal('${sec.letter}', '${escAttr(sec.name)}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add item
      </button>
      <button class="add-item-btn" onclick="openAddSubsectionModal('${sec.letter}', '${escAttr(sec.name)}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Add subsection
      </button>
    </div>`;

    html += '</div></div>';
  });

  // Add section button below all sections
  html += `<button class="add-section-btn" onclick="openAddSectionModal()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    Add Section
  </button>`;

  container.innerHTML = html;
  updateSummary();
}

function toggleSection(header) {
  const body = header.nextElementSibling;
  if (body.style.display === 'none') {
    body.style.display = 'block';
  } else {
    body.style.display = 'none';
  }
}

function toggleItem(id, btn) {
  if (!currentProject) return;
  const li = currentProject.lineItems.find(i => i.id === id);
  if (!li) return;
  li.isActive = !li.isActive;
  btn.classList.toggle('on', li.isActive);
  btn.closest('.line-item').classList.toggle('inactive', !li.isActive);
  saveCurrentProject();
  recalcRow(id);
  updateSummary();
}

function updateQty(id, val) {
  if (!currentProject) return;
  const li = currentProject.lineItems.find(i => i.id === id);
  if (!li) return;
  li.quantity = parseFloat(val) || 0;
  saveCurrentProject();
  recalcRow(id);
  updateSummary();
}

function updateCost(id, val) {
  if (!currentProject) return;
  const li = currentProject.lineItems.find(i => i.id === id);
  if (!li) return;
  li.unitCost = parseFloat(val) || 0;
  saveCurrentProject();
  recalcRow(id);
  updateSummary();
}

function recalcRow(id) {
  const li = currentProject.lineItems.find(i => i.id === id);
  if (!li) return;
  const markup = (currentProject.markupPercentage || 125) / 100;
  const row = document.querySelector(`.line-item[data-id="${id}"]`);
  if (!row) return;
  const costEl = row.querySelector('.item-cost');
  const val = li.isActive ? li.quantity * li.unitCost * markup : 0;
  costEl.textContent = '\u00A3' + formatNum(val);

  // Update section subtotal
  const sectionBlock = row.closest('.section-block');
  if (sectionBlock) {
    const sectionLetter = sectionBlock.querySelector('.section-letter').textContent;
    const sectionTotal = currentProject.lineItems
      .filter(i => i.section === sectionLetter && i.isActive)
      .reduce((sum, i) => sum + (i.quantity * i.unitCost * markup), 0);
    sectionBlock.querySelector('.section-subtotal').textContent = '\u00A3' + formatNum(sectionTotal);
  }
}

function updateMarkup() {
  if (!currentProject) return;
  currentProject.markupPercentage = parseFloat(document.getElementById('markup-pct').value) || 125;
  saveCurrentProject();
  renderEditor();
}

function updateSummary() {
  if (!currentProject) return;
  const markup = (currentProject.markupPercentage || 125) / 100;
  let summaryHtml = '';
  let grandTotal = 0;

  const projectSections = getProjectSections();
  projectSections.forEach(sec => {
    const items = (currentProject.lineItems || []).filter(li => li.section === sec.letter && li.isActive);
    if (items.length === 0) return;
    const total = items.reduce((sum, li) => sum + (li.quantity * li.unitCost * markup), 0);
    grandTotal += total;
    summaryHtml += `<div class="summary-row">
      <span class="summary-row-label">${sec.letter} \u2014 ${sec.name}</span>
      <span class="summary-row-value">\u00A3${formatNum(total)}</span>
    </div>`;
  });

  document.getElementById('summary-sections').innerHTML = summaryHtml;
  document.getElementById('grand-total').textContent = '\u00A3' + formatNum(grandTotal);

  // Update stored total
  currentProject.totalValue = grandTotal;
  saveCurrentProject();
}

function saveCurrentProject() {
  if (!currentProject) return;
  currentProject.notes = document.getElementById('notes-field')?.value || currentProject.notes;
  const projects = getProjects() || [];
  const idx = projects.findIndex(p => p.id === currentProject.id);
  if (idx >= 0) {
    projects[idx] = currentProject;
  }
  saveProjects(projects);
}


// ==================== SECTIONS HELPER ====================

function getProjectSections() {
  if (!currentProject) return [...SECTIONS];
  // Get standard sections + any custom sections from the project's customSections array
  const custom = (currentProject.customSections || []).map(s => ({ ...s, custom: true }));
  return [...SECTIONS, ...custom];
}


// ==================== ADD LINE ITEM ====================

let addItemTargetSection = '';

function openAddItemModal(sectionLetter, sectionName) {
  addItemTargetSection = sectionLetter;
  document.getElementById('add-item-section-label').textContent = sectionLetter + ' \u2014 ' + sectionName;
  document.getElementById('ai-desc').value = '';
  document.getElementById('ai-unit').value = 'nr';
  document.getElementById('ai-cost').value = '';

  // Build subsection dropdown from existing subsections in this section
  const select = document.getElementById('ai-subsection');
  const fromItems = (currentProject?.lineItems || [])
    .filter(li => li.section === sectionLetter && li.subsection)
    .map(li => li.subsection);
  const fromEmpty = (currentProject?.emptySubsections || [])
    .filter(s => s.section === sectionLetter)
    .map(s => s.name);
  const existingSubs = [...new Set([...fromItems, ...fromEmpty])];
  select.innerHTML = '<option value="">(No subsection)</option>';
  existingSubs.forEach(sub => {
    select.innerHTML += '<option value="' + esc(sub) + '">' + esc(sub) + '</option>';
  });
  select.innerHTML += '<option value="__new__">+ New subsection...</option>';
  select.value = existingSubs.length > 0 ? existingSubs[0] : '';

  document.getElementById('ai-new-subsection-row').style.display = 'none';
  document.getElementById('ai-new-subsection').value = '';

  document.getElementById('add-item-modal').classList.add('active');
  setTimeout(() => document.getElementById('ai-desc').focus(), 100);
}

function closeAddItemModal() {
  document.getElementById('add-item-modal').classList.remove('active');
  addItemTargetSection = '';
}

function onSubsectionSelectChange() {
  const val = document.getElementById('ai-subsection').value;
  const newRow = document.getElementById('ai-new-subsection-row');
  if (val === '__new__') {
    newRow.style.display = 'block';
    setTimeout(() => document.getElementById('ai-new-subsection').focus(), 50);
  } else {
    newRow.style.display = 'none';
  }
}

function confirmAddItem() {
  if (!currentProject) return;
  const desc = document.getElementById('ai-desc').value.trim();
  if (!desc) { showToast('Please enter a description'); return; }

  const unit = document.getElementById('ai-unit').value;
  const cost = parseFloat(document.getElementById('ai-cost').value) || 0;
  const selectVal = document.getElementById('ai-subsection').value;
  const subsection = selectVal === '__new__'
    ? document.getElementById('ai-new-subsection').value.trim()
    : (selectVal || '');

  const maxSort = currentProject.lineItems.reduce((m, li) => Math.max(m, li.sortOrder || 0), 0);

  currentProject.lineItems.push({
    id: 'li-' + Math.random().toString(36).substr(2, 9),
    section: addItemTargetSection,
    subsection: subsection,
    description: desc,
    quantity: 0,
    unit: unit,
    unitCost: cost,
    isActive: true,
    sortOrder: maxSort + 1,
    measurements: []
  });

  saveCurrentProject();
  closeAddItemModal();
  showToast('Item added');
  renderEditor();
}


// ==================== ADD / REMOVE SUBSECTION ====================

let addSubTargetSection = '';
let addSubTargetSectionName = '';

function openAddSubsectionModal(sectionLetter, sectionName) {
  addSubTargetSection = sectionLetter;
  addSubTargetSectionName = sectionName;
  document.getElementById('add-sub-section-label').textContent = sectionLetter + ' \u2014 ' + sectionName;
  document.getElementById('asub-name').value = '';
  document.getElementById('add-subsection-modal').classList.add('active');
  setTimeout(() => document.getElementById('asub-name').focus(), 100);
}

function closeAddSubsectionModal() {
  document.getElementById('add-subsection-modal').classList.remove('active');
  addSubTargetSection = '';
}

function confirmAddSubsection() {
  if (!currentProject) return;
  const name = document.getElementById('asub-name').value.trim();
  if (!name) { showToast('Please enter a subsection name'); return; }

  // Check if subsection already exists in this section
  const exists = (currentProject.emptySubsections || []).some(
    s => s.section === addSubTargetSection && s.name.toLowerCase() === name.toLowerCase()
  ) || currentProject.lineItems.some(
    li => li.section === addSubTargetSection && li.subsection && li.subsection.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    showToast('Subsection "' + name + '" already exists in this section');
    return;
  }

  // Track the empty subsection so it renders without needing a placeholder item
  if (!currentProject.emptySubsections) currentProject.emptySubsections = [];
  currentProject.emptySubsections.push({ section: addSubTargetSection, name: name });

  saveCurrentProject();
  closeAddSubsectionModal();
  showToast('Subsection "' + name + '" added');
  renderEditor();
}

let removeSubSection = '';
let removeSubName = '';

function removeSubsection(sectionLetter, subsectionName) {
  removeSubSection = sectionLetter;
  removeSubName = subsectionName;
  document.getElementById('remove-sub-label').textContent = subsectionName;
  document.getElementById('remove-subsection-modal').classList.add('active');
}

function closeRemoveSubsectionModal() {
  document.getElementById('remove-subsection-modal').classList.remove('active');
  removeSubSection = '';
  removeSubName = '';
}

function confirmRemoveSubsection() {
  if (!currentProject) return;
  currentProject.lineItems = currentProject.lineItems.filter(
    li => !(li.section === removeSubSection && li.subsection === removeSubName)
  );
  // Also remove from emptySubsections
  if (currentProject.emptySubsections) {
    currentProject.emptySubsections = currentProject.emptySubsections.filter(
      s => !(s.section === removeSubSection && s.name === removeSubName)
    );
  }
  saveCurrentProject();
  closeRemoveSubsectionModal();
  showToast('Subsection removed');
  renderEditor();
}


// ==================== ADD SECTION ====================

function openAddSectionModal() {
  // Suggest the next letter
  const projectSections = getProjectSections();
  const usedLetters = projectSections.map(s => s.letter);
  const alphabet = 'HIJKLMNOPQRSTUVWXYZ'.split('');
  const nextLetter = alphabet.find(l => !usedLetters.includes(l)) || '';

  document.getElementById('as-letter').value = nextLetter;
  document.getElementById('as-name').value = '';
  document.getElementById('add-section-modal').classList.add('active');
  setTimeout(() => document.getElementById('as-name').focus(), 100);
}

function closeAddSectionModal() {
  document.getElementById('add-section-modal').classList.remove('active');
}

function confirmAddSection() {
  if (!currentProject) return;
  const letter = document.getElementById('as-letter').value.trim().toUpperCase();
  const name = document.getElementById('as-name').value.trim().toUpperCase();

  if (!letter) { showToast('Please enter a section letter'); return; }
  if (!name) { showToast('Please enter a section name'); return; }

  // Check for duplicate letter
  const projectSections = getProjectSections();
  if (projectSections.some(s => s.letter === letter)) {
    showToast('Section letter "' + letter + '" already exists');
    return;
  }

  // Add custom section to project
  if (!currentProject.customSections) currentProject.customSections = [];
  currentProject.customSections.push({ letter, name, subsections: [] });

  saveCurrentProject();
  closeAddSectionModal();
  showToast('Section ' + letter + ' added');
  renderEditor();
}


// ==================== PDF PREVIEW ====================

function renderPdfPreview() {
  if (!currentProject) {
    document.getElementById('pdf-content').innerHTML = '<p style="text-align:center; padding:40px; color:#999">No project selected. Open a project first.</p>';
    return;
  }

  const markup = (currentProject.markupPercentage || 125) / 100;
  let html = '';

  // Header table
  html += `<table class="pdf-header-table">
    <tr><td class="label">PROJECT</td><td colspan="3">${esc(currentProject.name)}</td></tr>
    <tr><td class="label">LOCATION</td><td colspan="3">${esc(currentProject.location)}</td></tr>
    <tr>
      <td class="label">CLIENT</td><td>${esc(currentProject.clientName)}</td>
      <td class="label" style="width:100px">ARCHITECT</td><td>${esc(currentProject.architectName)}</td>
    </tr>
    <tr>
      <td class="label">PREPARED BY</td><td>${esc(currentProject.preparedBy)}</td>
      <td class="label">DATE</td><td>${currentProject.date ? formatDate(currentProject.date) : ''}</td>
    </tr>
    <tr>
      <td class="label">CHECKED BY</td><td>${esc(currentProject.checkedBy)}</td>
      <td class="label">REVISION</td><td>${esc(currentProject.revision)}</td>
    </tr>
  </table>`;

  // Items table
  html += `<table class="pdf-items-table">
    <thead><tr>
      <th style="width:40px">SR NO</th>
      <th>DESCRIPTION</th>
      <th style="width:50px">QTY</th>
      <th style="width:40px">UNIT</th>
      <th style="width:70px">UNIT COST</th>
      <th style="width:70px">ITEM COST</th>
      <th style="width:80px">BILL COST</th>
    </tr></thead><tbody>`;

  let srNo = 1;
  let grandTotal = 0;

  const pdfSections = getProjectSections();
  pdfSections.forEach(sec => {
    const items = (currentProject.lineItems || []).filter(li => li.section === sec.letter && li.isActive);
    if (items.length === 0) return;

    let sectionTotal = 0;

    html += `<tr class="pdf-section-row"><td></td><td colspan="5">${sec.letter} \u2014 ${sec.name}</td><td></td></tr>`;

    // Group by subsection
    const subs = {};
    items.forEach(li => {
      const k = li.subsection || '';
      if (!subs[k]) subs[k] = [];
      subs[k].push(li);
    });

    for (const [sub, subItems] of Object.entries(subs)) {
      if (sub) {
        html += `<tr><td></td><td colspan="5" style="font-weight:600; font-style:italic; padding-left:16px">${esc(sub)}</td><td></td></tr>`;
      }
      subItems.forEach(li => {
        const adjCost = li.unitCost * markup;
        const itemCost = li.quantity * adjCost;
        sectionTotal += itemCost;
        html += `<tr>
          <td>${li.quantity > 0 ? srNo++ : ''}</td>
          <td style="padding-left:${sub ? '20px' : '8px'}">${esc(li.description)}</td>
          <td>${li.quantity > 0 ? li.quantity : '-'}</td>
          <td>${esc(li.unit)}</td>
          <td>\u00A3${li.unitCost.toFixed(2)}</td>
          <td>${li.quantity > 0 ? '\u00A3' + formatNum(itemCost) : '-'}</td>
          <td></td>
        </tr>`;
      });
    }

    grandTotal += sectionTotal;
    html += `<tr class="pdf-subtotal-row">
      <td></td><td colspan="4" style="text-align:right">Section ${sec.letter} Subtotal</td>
      <td></td><td style="text-align:right; font-weight:700">\u00A3${formatNum(sectionTotal)}</td>
    </tr>`;
  });

  html += `<tr class="pdf-grand-total">
    <td></td><td colspan="4" style="text-align:right">GRAND TOTAL</td>
    <td></td><td style="text-align:right">\u00A3${formatNum(grandTotal)}</td>
  </tr>`;

  html += '</tbody></table>';

  // Notes
  if (currentProject.notes) {
    html += '<div class="pdf-footer"><h4>Notes &amp; Exclusions</h4>';
    currentProject.notes.split('\n').forEach((n, i) => {
      if (n.trim()) html += `<p>${i + 1}. ${esc(n.trim())}</p>`;
    });
    html += '</div>';
  }

  // Units legend
  html += `<div class="pdf-footer"><h4>Units Legend</h4>
    <p>nr = number/count &nbsp;&bull;&nbsp; m = linear metres &nbsp;&bull;&nbsp; m\u00B2 = square metres &nbsp;&bull;&nbsp; m\u00B3 = cubic metres &nbsp;&bull;&nbsp; kg = kilograms &nbsp;&bull;&nbsp; riser = one stair step &nbsp;&bull;&nbsp; item = single item &nbsp;&bull;&nbsp; p/s = provisional sum</p>
  </div>`;

  // Page number
  html += '<div class="pdf-page-num">ESTIMATE 1 of 1</div>';

  document.getElementById('pdf-content').innerHTML = html;
}


// ==================== CLONE & DELETE ====================

function cloneProject(id) {
  const projects = getProjects() || [];
  const source = projects.find(p => p.id === id);
  if (!source) return;

  const clone = JSON.parse(JSON.stringify(source));
  clone.id = 'proj-' + Math.random().toString(36).substr(2, 9);
  clone.name = source.name + ' (Copy)';
  clone.revision = '00';
  clone.date = new Date().toISOString().split('T')[0];

  // Generate new IDs for line items
  clone.lineItems.forEach(li => {
    li.id = 'li-' + Math.random().toString(36).substr(2, 9);
  });

  projects.unshift(clone);
  saveProjects(projects);
  showToast('Project cloned');
  renderDashboard();
}

function promptDelete(id) {
  deleteTargetId = id;
  document.getElementById('delete-modal').classList.add('active');
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('delete-modal').classList.remove('active');
}

function confirmDelete() {
  if (!deleteTargetId) return;
  let projects = getProjects() || [];
  projects = projects.filter(p => p.id !== deleteTargetId);
  saveProjects(projects);
  closeDeleteModal();
  showToast('Project deleted');
  renderDashboard();
}


// ==================== UTILITIES ====================

function formatNum(n) {
  if (n === 0) return '0.00';
  return n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Escape a string for safe use inside an onclick="..." HTML attribute
function escAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

// ==================== INIT ====================

// Set today's date on the new project form
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('np-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
});
