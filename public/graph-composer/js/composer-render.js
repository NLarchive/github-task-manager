export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function humanizeKey(key) {
  return String(key || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[._-]+/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());
}

function renderSchemaField(fieldKey, definition, value, path) {
  const label = humanizeKey(fieldKey);
  const help = definition.description ? `<p class="field-help">${escapeHtml(definition.description)}</p>` : '';
  const currentValue = typeof value === 'undefined' ? definition.default : value;

  if (definition.type === 'object' && definition.fields) {
    return `
      <section class="config-group">
        <header class="config-group-header">
          <h4>${escapeHtml(label)}</h4>
          ${definition.description ? `<p>${escapeHtml(definition.description)}</p>` : ''}
        </header>
        <div class="config-grid nested-grid">
          ${Object.entries(definition.fields).map(([nestedKey, nestedDefinition]) => renderSchemaField(nestedKey, nestedDefinition, currentValue?.[nestedKey], `${path}.${nestedKey}`)).join('')}
        </div>
      </section>
    `;
  }

  if (definition.type === 'object') {
    const jsonValue = JSON.stringify(currentValue ?? {}, null, 2);
    return `
      <label class="field field-wide">
        <span>${escapeHtml(label)}</span>
        <textarea data-config-input="json" data-path="${escapeHtml(path)}">${escapeHtml(jsonValue)}</textarea>
        ${help}
      </label>
    `;
  }

  if (definition.type === 'boolean') {
    return `
      <label class="field field-toggle">
        <span>${escapeHtml(label)}</span>
        <input type="checkbox" data-config-input="boolean" data-path="${escapeHtml(path)}" ${currentValue ? 'checked' : ''}>
        ${help}
      </label>
    `;
  }

  if (definition.type === 'hex-color') {
    const hexValue = /^#[0-9a-fA-F]{6}$/.test(String(currentValue || '')) ? String(currentValue) : '#aabbc8';
    return `
      <label class="field field-wide">
        <span>${escapeHtml(label)}</span>
        <div class="color-input-row">
          <input type="color" data-config-input="color" data-path="${escapeHtml(path)}" value="${escapeHtml(hexValue)}">
          <input type="text" data-config-input="text" data-path="${escapeHtml(path)}" value="${escapeHtml(hexValue)}">
        </div>
        ${help}
      </label>
    `;
  }

  if (Array.isArray(definition.allowedValues)) {
    return `
      <label class="field">
        <span>${escapeHtml(label)}</span>
        <select data-config-input="select" data-path="${escapeHtml(path)}">
          ${definition.allowedValues.map((option) => `<option value="${escapeHtml(option)}" ${String(currentValue) === String(option) ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
        </select>
        ${help}
      </label>
    `;
  }

  if (definition.type === 'number') {
    return `
      <label class="field">
        <span>${escapeHtml(label)}</span>
        <input type="number" step="any" data-config-input="number" data-path="${escapeHtml(path)}" value="${escapeHtml(currentValue ?? '')}">
        ${help}
      </label>
    `;
  }

  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <input type="text" data-config-input="text" data-path="${escapeHtml(path)}" value="${escapeHtml(currentValue ?? '')}">
      ${help}
    </label>
  `;
}

export function renderConfigEditor(schema, values) {
  return Object.entries(schema)
    .map(([fieldKey, definition]) => renderSchemaField(fieldKey, definition, values?.[fieldKey], `configOverrides.${fieldKey}`))
    .join('');
}

export function renderSavedTemplateList(templates, activeTemplateId) {
  if (!templates.length) {
    return '<p class="empty-state">No saved templates yet. Save the current composition to build a reusable library.</p>';
  }

  return templates.map((template) => `
    <button class="library-item ${template.id === activeTemplateId ? 'is-active' : ''}" data-load-template="${escapeHtml(template.id)}">
      <strong>${escapeHtml(template.name)}</strong>
      <span>${escapeHtml(template.description || 'Saved Graph Composer template')}</span>
    </button>
  `).join('');
}

export function renderMeasurementPresets(presets) {
  return presets.map((preset) => `
    <button class="preset-chip" data-apply-preset="${escapeHtml(preset.id)}" title="${escapeHtml(preset.description)}">
      <strong>${escapeHtml(preset.label)}</strong>
      <span>${escapeHtml(preset.description)}</span>
    </button>
  `).join('');
}

export function renderNodeList(nodes, selectedNodeId) {
  if (!nodes.length) return '<p class="empty-state">No nodes defined yet.</p>';

  return nodes.map((node) => `
    <button class="list-row ${node.id === selectedNodeId ? 'is-active' : ''}" data-select-node="${escapeHtml(node.id)}">
      <strong>${escapeHtml(node.label || node.id)}</strong>
      <span>id: ${escapeHtml(node.id)} · layer ${escapeHtml(node.layer)} · ${escapeHtml(node.type)}</span>
    </button>
  `).join('');
}

export function renderLinkList(links, selectedLinkIndex) {
  if (!links.length) return '<p class="empty-state">No links defined yet.</p>';

  return links.map((link, index) => `
    <button class="list-row ${index === selectedLinkIndex ? 'is-active' : ''}" data-select-link="${index}">
      <strong>${escapeHtml(link.type)}</strong>
      <span>${escapeHtml(link.source)} -> ${escapeHtml(link.target)}</span>
    </button>
  `).join('');
}

export function renderSelectOptions(options, selectedValue, includeBlank = false) {
  const normalizedOptions = Array.isArray(options) ? options : [];
  const blankOption = includeBlank ? '<option value=""></option>' : '';
  return blankOption + normalizedOptions.map((option) => {
    const value = typeof option === 'string' ? option : option?.value;
    const label = typeof option === 'string' ? option : option?.label || option?.value;
    return `<option value="${escapeHtml(value)}" ${String(selectedValue) === String(value) ? 'selected' : ''}>${escapeHtml(label)}</option>`;
  }).join('');
}

export function renderValidationSummary(validation) {
  const errors = Array.isArray(validation?.errors) ? validation.errors : [];
  const warnings = Array.isArray(validation?.warnings) ? validation.warnings : [];

  return `
    <div class="validation-block ${errors.length ? 'has-errors' : 'is-clean'}">
      <h4>Validation</h4>
      <p>${errors.length ? `${errors.length} error(s)` : 'No blocking errors'} · ${warnings.length} warning(s)</p>
      ${errors.length ? `<ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul>` : ''}
      ${warnings.length ? `<ul class="warning-list">${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul>` : ''}
    </div>
  `;
}

export function renderJsonPreview(jsonText) {
  return escapeHtml(jsonText);
}
