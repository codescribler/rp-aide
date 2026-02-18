// ==================== ADMIN: TEMPLATE MANAGER ====================

let adminCurrentType = null;   // template type key being edited
let adminEditItemIdx = null;   // index for edit-mode in the item modal
let adminEditSection = null;   // section letter for edit-mode
let adminEditSubsection = null; // subsection for edit-mode
let adminDeleteCallback = null; // callback for confirm-delete modal

// Icons for template cards (reuse from dashboard)
const ADMIN_ICONS = {
  'new-build': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  'extension': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="10" height="14" rx="1"/><rect x="12" y="11" width="10" height="10" rx="1"/></svg>',
  'loft-conversion': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 8.5 22 22 2 22 2 8.5"/></svg>',
  'garage-conversion': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="14" rx="1"/><path d="M3 8l9-6 9 6"/></svg>',
  'kitchen-refit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
  'bathroom-refit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/></svg>'
};


// ==================== TEMPLATE LIST PAGE ====================

function renderAdminTemplates() {
  const templates = getTemplates();
  if (!templates) { initTemplates(); }
  const data = getTemplates();
  const container = document.getElementById('admin-templates-grid');
  if (!container) return;

  const colors = ['blue', 'orange', 'green', 'blue', 'orange', 'green'];
  const keys = Object.keys(data);

  container.innerHTML = keys.map((key, i) => {
    const t = data[key];
    const counts = countTemplateItems(t);
    return `<div class="admin-template-card type-card ${colors[i % 3]}" onclick="openAdminEditor('${key}')">
      <div class="type-card-icon">
        ${ADMIN_ICONS[key] || ADMIN_ICONS['new-build']}
      </div>
      <div class="type-card-name">${esc(t.name)}</div>
      <div class="type-card-desc">${counts.enabled} / ${counts.total} items</div>
    </div>`;
  }).join('');
}

function countTemplateItems(template) {
  let total = 0, enabled = 0;
  for (const secKey of Object.keys(template.sections)) {
    const secData = template.sections[secKey];
    if (Array.isArray(secData)) {
      total += secData.length;
      enabled += secData.filter(i => i.enabled !== false).length;
    } else if (secData && typeof secData === 'object') {
      for (const subItems of Object.values(secData)) {
        total += subItems.length;
        enabled += subItems.filter(i => i.enabled !== false).length;
      }
    }
  }
  return { total, enabled };
}


// ==================== EXPORT & RESET ====================

function exportTemplatesJson() {
  const data = getTemplates();
  if (!data) { showToast('No template data to export'); return; }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'renovation-planner-templates.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Templates exported');
}

function resetTemplatesToDefaults() {
  openAdminConfirmDelete('Reset all templates to defaults? Any customisations will be lost.', () => {
    localStorage.removeItem('rp_templates');
    initTemplates();
    adminCurrentType = null;
    navigateTo('admin-templates');
    showToast('Templates reset to defaults');
  });
}


// ==================== TEMPLATE EDITOR PAGE ====================

function openAdminEditor(typeKey) {
  adminCurrentType = typeKey;
  navigateTo('admin-editor');
}

function renderAdminEditor() {
  const templates = getTemplates();
  if (!templates || !adminCurrentType || !templates[adminCurrentType]) {
    document.getElementById('admin-editor-sections').innerHTML = '<div class="empty-state"><h3>No template selected</h3><p>Go back and select a template.</p></div>';
    return;
  }

  const template = templates[adminCurrentType];
  document.getElementById('admin-editor-title').textContent = template.name + ' Template';
  document.getElementById('admin-editor-subtitle').textContent = 'Edit items, costs, and related costs';

  const container = document.getElementById('admin-editor-sections');
  let html = '';

  SECTIONS.forEach(sec => {
    const secData = template.sections[sec.letter];
    if (secData === undefined) return;

    // Collect all items in this section
    const allItems = [];
    if (Array.isArray(secData)) {
      secData.forEach((item, idx) => {
        allItems.push({ ...item, subsection: '', idx, source: 'root' });
      });
    } else if (secData && typeof secData === 'object') {
      for (const [sub, subItems] of Object.entries(secData)) {
        subItems.forEach((item, idx) => {
          allItems.push({ ...item, subsection: sub, idx, source: sub });
        });
      }
    }

    const enabledCount = allItems.filter(i => i.enabled !== false).length;

    html += `<div class="section-block animate-in">`;
    html += `<div class="section-header" onclick="toggleSection(this)">
      <div class="section-title">
        <span class="section-letter">${sec.letter}</span>
        ${sec.name}
        <span style="font-weight:400; font-size:0.75rem; opacity:0.7">(${enabledCount}/${allItems.length} items)</span>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); removeAdminSection('${sec.letter}')" title="Remove section" style="color:rgba(255,255,255,0.6); padding:4px 8px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`;
    html += `<div class="section-body">`;

    if (Array.isArray(secData)) {
      // Flat items
      secData.forEach((item, idx) => {
        html += renderAdminItemRow(item, sec.letter, '', idx);
      });
    } else if (secData && typeof secData === 'object') {
      for (const [sub, subItems] of Object.entries(secData)) {
        html += `<div class="subsection-header">
          <span>${esc(sub)}</span>
          <button class="subsection-remove-btn" onclick="event.stopPropagation(); removeAdminSubsection('${sec.letter}', '${escAttr(sub)}')" title="Remove subsection">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>`;
        subItems.forEach((item, idx) => {
          html += renderAdminItemRow(item, sec.letter, sub, idx);
        });
      }
    }

    // Add item + Add subsection buttons
    html += `<div class="add-item-row">
      <button class="add-item-btn" onclick="openAdminItemModal('${sec.letter}', '${escAttr(sec.name)}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add item
      </button>
      <button class="add-item-btn" onclick="openAdminSubsectionModal('${sec.letter}', '${escAttr(sec.name)}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Add subsection
      </button>
    </div>`;

    html += '</div></div>';
  });

  // Add section button
  html += `<button class="add-section-btn" onclick="openAdminSectionModal()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    Add Section
  </button>`;

  container.innerHTML = html;
}

function renderAdminItemRow(item, sectionLetter, subsection, idx) {
  const isEnabled = item.enabled !== false;
  const sub = subsection || '';
  return `<div class="admin-item-row ${isEnabled ? '' : 'inactive'}">
    <button class="item-toggle ${isEnabled ? 'on' : ''}" onclick="toggleAdminItem('${sectionLetter}', '${escAttr(sub)}', ${idx})" title="${isEnabled ? 'Enabled' : 'Disabled'}"></button>
    <div class="item-desc" title="${esc(item.desc)}">${esc(item.desc)}</div>
    <div class="admin-item-cost">\u00A3${item.cost.toFixed(2)}</div>
    <div class="item-unit">${esc(item.unit)}</div>
    <div class="admin-related-costs" title="${esc(item.relatedCosts || '')}">${esc(item.relatedCosts || '-')}</div>
    <button class="admin-item-action-btn" onclick="openAdminEditItem('${sectionLetter}', '${escAttr(sub)}', ${idx})" title="Edit">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    </button>
    <button class="admin-item-action-btn danger" onclick="deleteAdminItem('${sectionLetter}', '${escAttr(sub)}', ${idx})" title="Delete">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
    </button>
  </div>`;
}


// ==================== TOGGLE / DELETE ITEMS ====================

function getAdminItemRef(sectionLetter, subsection) {
  const templates = getTemplates();
  const secData = templates[adminCurrentType].sections[sectionLetter];
  if (!subsection && Array.isArray(secData)) return { arr: secData, templates };
  if (subsection && secData && typeof secData === 'object' && secData[subsection]) return { arr: secData[subsection], templates };
  return null;
}

function toggleAdminItem(sectionLetter, subsection, idx) {
  const ref = getAdminItemRef(sectionLetter, subsection);
  if (!ref || !ref.arr[idx]) return;
  ref.arr[idx].enabled = !ref.arr[idx].enabled;
  saveTemplates(ref.templates);
  renderAdminEditor();
}

function deleteAdminItem(sectionLetter, subsection, idx) {
  openAdminConfirmDelete('Delete this item from the template?', () => {
    const ref = getAdminItemRef(sectionLetter, subsection);
    if (!ref) return;
    ref.arr.splice(idx, 1);
    saveTemplates(ref.templates);
    renderAdminEditor();
    showToast('Item deleted');
  });
}

function removeAdminSubsection(sectionLetter, subsection) {
  openAdminConfirmDelete('Remove subsection "' + subsection + '" and all its items?', () => {
    const templates = getTemplates();
    const secData = templates[adminCurrentType].sections[sectionLetter];
    if (secData && typeof secData === 'object' && !Array.isArray(secData)) {
      delete secData[subsection];
    }
    saveTemplates(templates);
    renderAdminEditor();
    showToast('Subsection removed');
  });
}

function removeAdminSection(sectionLetter) {
  openAdminConfirmDelete('Remove section ' + sectionLetter + ' from this template?', () => {
    const templates = getTemplates();
    delete templates[adminCurrentType].sections[sectionLetter];
    saveTemplates(templates);
    renderAdminEditor();
    showToast('Section removed');
  });
}


// ==================== ADD/EDIT ITEM MODAL ====================

let adminItemTargetSection = '';
let adminItemTargetSectionName = '';

function openAdminItemModal(sectionLetter, sectionName) {
  adminItemTargetSection = sectionLetter;
  adminItemTargetSectionName = sectionName;
  adminEditItemIdx = null;
  adminEditSection = null;
  adminEditSubsection = null;

  document.getElementById('admin-item-modal-title').textContent = 'Add Template Item';
  document.getElementById('admin-item-section-label').textContent = sectionLetter + ' \u2014 ' + sectionName;
  document.getElementById('ati-desc').value = '';
  document.getElementById('ati-unit').value = 'nr';
  document.getElementById('ati-cost').value = '';
  document.getElementById('ati-related').value = '';
  document.getElementById('admin-item-save-btn').textContent = 'Add Item';

  // Build subsection dropdown
  buildAdminSubsectionDropdown(sectionLetter);

  document.getElementById('admin-item-modal').classList.add('active');
  setTimeout(() => document.getElementById('ati-desc').focus(), 100);
}

function openAdminEditItem(sectionLetter, subsection, idx) {
  const ref = getAdminItemRef(sectionLetter, subsection);
  if (!ref || !ref.arr[idx]) return;
  const item = ref.arr[idx];

  // Find the section name
  const sec = SECTIONS.find(s => s.letter === sectionLetter);
  const sectionName = sec ? sec.name : sectionLetter;

  adminItemTargetSection = sectionLetter;
  adminItemTargetSectionName = sectionName;
  adminEditItemIdx = idx;
  adminEditSection = sectionLetter;
  adminEditSubsection = subsection;

  document.getElementById('admin-item-modal-title').textContent = 'Edit Template Item';
  document.getElementById('admin-item-section-label').textContent = sectionLetter + ' \u2014 ' + sectionName;
  document.getElementById('ati-desc').value = item.desc;
  document.getElementById('ati-unit').value = item.unit;
  document.getElementById('ati-cost').value = item.cost;
  document.getElementById('ati-related').value = item.relatedCosts || '';
  document.getElementById('admin-item-save-btn').textContent = 'Save Changes';

  buildAdminSubsectionDropdown(sectionLetter);
  document.getElementById('ati-subsection').value = subsection || '';

  document.getElementById('admin-item-modal').classList.add('active');
  setTimeout(() => document.getElementById('ati-desc').focus(), 100);
}

function buildAdminSubsectionDropdown(sectionLetter) {
  const templates = getTemplates();
  const secData = templates[adminCurrentType].sections[sectionLetter];
  const select = document.getElementById('ati-subsection');
  select.innerHTML = '<option value="">(No subsection / flat list)</option>';

  if (secData && typeof secData === 'object' && !Array.isArray(secData)) {
    Object.keys(secData).forEach(sub => {
      select.innerHTML += '<option value="' + esc(sub) + '">' + esc(sub) + '</option>';
    });
  }
  select.innerHTML += '<option value="__new__">+ New subsection...</option>';

  document.getElementById('ati-new-subsection-row').style.display = 'none';
  document.getElementById('ati-new-subsection').value = '';
}

function onAdminSubsectionSelectChange() {
  const val = document.getElementById('ati-subsection').value;
  document.getElementById('ati-new-subsection-row').style.display = val === '__new__' ? 'block' : 'none';
  if (val === '__new__') setTimeout(() => document.getElementById('ati-new-subsection').focus(), 50);
}

function closeAdminItemModal() {
  document.getElementById('admin-item-modal').classList.remove('active');
}

function confirmAdminItem() {
  const desc = document.getElementById('ati-desc').value.trim();
  if (!desc) { showToast('Please enter a description'); return; }

  const unit = document.getElementById('ati-unit').value;
  const cost = parseFloat(document.getElementById('ati-cost').value) || 0;
  const relatedCosts = document.getElementById('ati-related').value.trim();
  const selectVal = document.getElementById('ati-subsection').value;
  const subsection = selectVal === '__new__'
    ? document.getElementById('ati-new-subsection').value.trim()
    : (selectVal || '');

  const templates = getTemplates();
  const secData = templates[adminCurrentType].sections[adminItemTargetSection];

  if (adminEditItemIdx !== null) {
    // Edit mode — update existing item
    const oldSub = adminEditSubsection;
    let oldArr;
    if (!oldSub && Array.isArray(secData)) {
      oldArr = secData;
    } else if (oldSub && secData[oldSub]) {
      oldArr = secData[oldSub];
    }

    if (oldArr && oldArr[adminEditItemIdx] !== undefined) {
      if (oldSub === subsection || (!oldSub && !subsection)) {
        // Same subsection — update in place
        oldArr[adminEditItemIdx] = { desc, unit, cost, enabled: oldArr[adminEditItemIdx].enabled, relatedCosts };
      } else {
        // Moved to different subsection — remove from old, add to new
        const wasEnabled = oldArr[adminEditItemIdx].enabled;
        oldArr.splice(adminEditItemIdx, 1);
        addItemToSection(templates, adminItemTargetSection, subsection, { desc, unit, cost, enabled: wasEnabled, relatedCosts });
      }
    }
  } else {
    // Add mode
    addItemToSection(templates, adminItemTargetSection, subsection, { desc, unit, cost, enabled: true, relatedCosts });
  }

  saveTemplates(templates);
  closeAdminItemModal();
  showToast(adminEditItemIdx !== null ? 'Item updated' : 'Item added');
  renderAdminEditor();
}

function addItemToSection(templates, sectionLetter, subsection, item) {
  const secData = templates[adminCurrentType].sections[sectionLetter];

  if (!subsection) {
    // Add to flat array
    if (Array.isArray(secData)) {
      secData.push(item);
    } else {
      // Section is an object (has subsections) — can't add flat; put into a '' key isn't ideal
      // Convert to subsection-based: put into the first subsection or create one
      showToast('This section uses subsections. Please select one.');
    }
  } else {
    // Add to subsection
    if (Array.isArray(secData)) {
      // Convert from flat array to object with subsections
      const existing = [...secData];
      templates[adminCurrentType].sections[sectionLetter] = {};
      if (existing.length > 0) {
        templates[adminCurrentType].sections[sectionLetter]['General'] = existing;
      }
      templates[adminCurrentType].sections[sectionLetter][subsection] = templates[adminCurrentType].sections[sectionLetter][subsection] || [];
      templates[adminCurrentType].sections[sectionLetter][subsection].push(item);
    } else {
      if (!secData[subsection]) secData[subsection] = [];
      secData[subsection].push(item);
    }
  }
}


// ==================== ADD SECTION MODAL ====================

function openAdminSectionModal() {
  const templates = getTemplates();
  const usedLetters = Object.keys(templates[adminCurrentType].sections);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const nextLetter = alphabet.find(l => !usedLetters.includes(l)) || '';

  document.getElementById('ats-letter').value = nextLetter;
  document.getElementById('ats-name').value = '';
  document.getElementById('admin-section-modal').classList.add('active');
  setTimeout(() => document.getElementById('ats-name').focus(), 100);
}

function closeAdminSectionModal() {
  document.getElementById('admin-section-modal').classList.remove('active');
}

function confirmAdminSection() {
  const letter = document.getElementById('ats-letter').value.trim().toUpperCase();
  const name = document.getElementById('ats-name').value.trim().toUpperCase();
  if (!letter) { showToast('Please enter a section letter'); return; }
  if (!name) { showToast('Please enter a section name'); return; }

  const templates = getTemplates();
  if (templates[adminCurrentType].sections[letter] !== undefined) {
    showToast('Section "' + letter + '" already exists');
    return;
  }

  templates[adminCurrentType].sections[letter] = [];

  // Also add to SECTIONS if not already there (so the editor can render it)
  if (!SECTIONS.find(s => s.letter === letter)) {
    SECTIONS.push({ letter, name, subsections: [] });
  }

  saveTemplates(templates);
  closeAdminSectionModal();
  showToast('Section ' + letter + ' added');
  renderAdminEditor();
}


// ==================== ADD SUBSECTION MODAL ====================

let adminSubTargetSection = '';

function openAdminSubsectionModal(sectionLetter, sectionName) {
  adminSubTargetSection = sectionLetter;
  document.getElementById('admin-sub-section-label').textContent = sectionLetter + ' \u2014 ' + sectionName;
  document.getElementById('atsub-name').value = '';
  document.getElementById('admin-subsection-modal').classList.add('active');
  setTimeout(() => document.getElementById('atsub-name').focus(), 100);
}

function closeAdminSubsectionModal() {
  document.getElementById('admin-subsection-modal').classList.remove('active');
}

function confirmAdminSubsection() {
  const name = document.getElementById('atsub-name').value.trim();
  if (!name) { showToast('Please enter a subsection name'); return; }

  const templates = getTemplates();
  let secData = templates[adminCurrentType].sections[adminSubTargetSection];

  if (Array.isArray(secData)) {
    // Convert flat array to object
    const existing = [...secData];
    secData = {};
    if (existing.length > 0) secData['General'] = existing;
    templates[adminCurrentType].sections[adminSubTargetSection] = secData;
  }

  if (secData[name]) {
    showToast('Subsection "' + name + '" already exists');
    return;
  }

  secData[name] = [];
  saveTemplates(templates);
  closeAdminSubsectionModal();
  showToast('Subsection "' + name + '" added');
  renderAdminEditor();
}


// ==================== CONFIRM DELETE MODAL ====================

function openAdminConfirmDelete(message, callback) {
  document.getElementById('admin-confirm-delete-text').textContent = message;
  adminDeleteCallback = callback;
  document.getElementById('admin-confirm-delete-modal').classList.add('active');
}

function closeAdminConfirmDelete() {
  document.getElementById('admin-confirm-delete-modal').classList.remove('active');
  adminDeleteCallback = null;
}

function confirmAdminDelete() {
  if (adminDeleteCallback) adminDeleteCallback();
  closeAdminConfirmDelete();
}
