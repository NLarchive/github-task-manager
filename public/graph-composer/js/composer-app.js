import { GRAPH_UI_CONFIG_SCHEMA } from '../../graph-display/js/shared/graph-design-contract.js';
import { deleteStoredGraphTemplate, listStoredGraphTemplates, saveStoredGraphTemplate } from '../../graph-display/js/shared/graph-template-storage.js';
import { GRAPH_LINK_TYPE_OPTIONS, GRAPH_MEASUREMENT_PRESETS, createBlankTemplate, createTemplateFromExample } from './composer-defaults.js';
import { applyMeasurementPreset, buildExportJson, createNewLinkTemplate, createNewNodeTemplate, duplicateNode, getAdditionalFields, normalizeTemplate, parseJsonText, removeLink, removeNode, updateNodeDetails, updateTemplateField, upsertLink, upsertNode, validateTemplate } from './composer-state.js';
import { renderConfigEditor, renderJsonPreview, renderLinkList, renderMeasurementPresets, renderNodeList, renderSavedTemplateList, renderSelectOptions, renderValidationSummary } from './composer-render.js';

const KNOWN_META_KEYS = ['profileNodeId', 'coreNodeId', 'legendMode', 'showProfileButton', 'showCoreButton', 'showCvButton', 'walkthroughEnabled'];
const KNOWN_NODE_KEYS = ['id', 'label', 'type', 'layer', 'parentId', 'templateType', 'priority', 'status', 'estimatedHours', 'metrics'];
const KNOWN_LINK_KEYS = ['source', 'target', 'type', 'weight'];

const state = {
  templates: [],
  activeStorageTemplateId: null,
  template: normalizeTemplate(createBlankTemplate()),
  selectedNodeId: null,
  selectedLinkIndex: -1,
  statusText: 'Ready.',
  statusTone: 'info'
};

const refs = {};

function setStatus(message, tone = 'info') {
  state.statusText = message;
  state.statusTone = tone;
  if (refs.statusMessage) {
    refs.statusMessage.textContent = message;
    refs.statusMessage.dataset.tone = tone;
  }
}

function refreshStoredTemplates() {
  state.templates = listStoredGraphTemplates();
}

function ensureSelections() {
  const nodeIds = new Set(state.template.nodes.map((node) => node.id));
  if (!state.selectedNodeId || !nodeIds.has(state.selectedNodeId)) {
    state.selectedNodeId = state.template.nodes[0]?.id || null;
  }

  if (!state.template.links.length) {
    state.selectedLinkIndex = -1;
  } else if (state.selectedLinkIndex < 0 || state.selectedLinkIndex >= state.template.links.length) {
    state.selectedLinkIndex = 0;
  }
}

function loadTemplate(template, activeStorageTemplateId = null) {
  state.template = normalizeTemplate(template);
  state.activeStorageTemplateId = activeStorageTemplateId;
  state.selectedNodeId = state.template.nodes[0]?.id || null;
  state.selectedLinkIndex = state.template.links.length ? 0 : -1;
  renderAll();
}

function getSelectedNode() {
  return state.template.nodes.find((node) => node.id === state.selectedNodeId) || null;
}

function getSelectedLink() {
  return state.selectedLinkIndex >= 0 ? state.template.links[state.selectedLinkIndex] || null : null;
}

function populateTemplateForm() {
  refs.templateId.value = state.template.id || '';
  refs.templateName.value = state.template.name || '';
  refs.templateDescription.value = state.template.description || '';
  refs.metaProfileNode.innerHTML = renderSelectOptions(state.template.nodes.map((node) => ({ value: node.id, label: `${node.label} (${node.id})` })), state.template.meta.profileNodeId, true);
  refs.metaCoreNode.innerHTML = renderSelectOptions(state.template.nodes.map((node) => ({ value: node.id, label: `${node.label} (${node.id})` })), state.template.meta.coreNodeId, true);
  refs.metaLegendMode.value = String(state.template.meta.legendMode || 'custom');
  refs.metaShowProfile.checked = Boolean(state.template.meta.showProfileButton);
  refs.metaShowCore.checked = Boolean(state.template.meta.showCoreButton);
  refs.metaShowCv.checked = Boolean(state.template.meta.showCvButton);
  refs.metaWalkthrough.checked = Boolean(state.template.meta.walkthroughEnabled);
  refs.metaExtraJson.value = JSON.stringify(getAdditionalFields(state.template.meta, KNOWN_META_KEYS), null, 2);
}

function populateNodeEditor() {
  const selectedNode = getSelectedNode();
  refs.nodeEditor.dataset.nodeId = selectedNode?.id || '';
  refs.nodeId.value = selectedNode?.id || '';
  refs.nodeLabel.value = selectedNode?.label || '';
  refs.nodeType.value = selectedNode?.type || 'parent';
  refs.nodeLayer.value = Number.isFinite(Number(selectedNode?.layer)) ? Number(selectedNode.layer) : 0;
  const parentOptions = state.template.nodes
    .filter((node) => node.id !== selectedNode?.id)
    .map((node) => ({ value: node.id, label: `${node.label} (${node.id})` }));
  refs.nodeParentId.innerHTML = renderSelectOptions(parentOptions, selectedNode?.parentId || '', true);
  refs.nodeTemplateType.value = selectedNode?.templateType || '';
  refs.nodePriority.value = selectedNode?.priority || 'Medium';
  refs.nodeStatus.value = selectedNode?.status || 'Not Started';
  refs.nodeEstimatedHours.value = Number.isFinite(Number(selectedNode?.estimatedHours)) ? Number(selectedNode.estimatedHours) : 0;
  refs.nodeMetricsJson.value = JSON.stringify(selectedNode?.metrics || {}, null, 2);
  refs.nodeExtraJson.value = JSON.stringify(getAdditionalFields(selectedNode || {}, KNOWN_NODE_KEYS), null, 2);
}

function populateDetailEditor() {
  const selectedNode = getSelectedNode();
  const details = selectedNode ? (state.template.details[selectedNode.id] || { title: selectedNode.label, items: [] }) : { title: '', items: [] };
  refs.detailTitle.value = details.title || '';
  refs.detailPhotoUrl.value = details.photoUrl || '';
  refs.detailItems.value = Array.isArray(details.items) ? details.items.join('\n') : '';
}

function populateLinkEditor() {
  const selectedLink = getSelectedLink();
  refs.linkEditor.dataset.linkIndex = state.selectedLinkIndex;
  const nodeOptions = state.template.nodes.map((node) => ({ value: node.id, label: `${node.label} (${node.id})` }));
  refs.linkSource.innerHTML = renderSelectOptions(nodeOptions, selectedLink?.source || '', true);
  refs.linkTarget.innerHTML = renderSelectOptions(nodeOptions, selectedLink?.target || '', true);
  refs.linkType.innerHTML = renderSelectOptions(GRAPH_LINK_TYPE_OPTIONS, selectedLink?.type || 'DEPENDS_FS', true);
  refs.linkWeight.value = typeof selectedLink?.weight === 'number' ? selectedLink.weight : selectedLink?.weight || '';
  refs.linkExtraJson.value = JSON.stringify(getAdditionalFields(selectedLink || {}, KNOWN_LINK_KEYS), null, 2);
}

function renderPanels() {
  refs.savedTemplates.innerHTML = renderSavedTemplateList(state.templates, state.activeStorageTemplateId);
  refs.measurementPresets.innerHTML = renderMeasurementPresets(GRAPH_MEASUREMENT_PRESETS);
  refs.configEditor.innerHTML = renderConfigEditor(GRAPH_UI_CONFIG_SCHEMA, state.template.configOverrides);
  refs.nodeList.innerHTML = renderNodeList(state.template.nodes, state.selectedNodeId);
  refs.linkList.innerHTML = renderLinkList(state.template.links, state.selectedLinkIndex);
  const validation = validateTemplate(state.template);
  refs.validationPanel.innerHTML = renderValidationSummary(validation);
  refs.jsonPreview.innerHTML = renderJsonPreview(buildExportJson(state.template));
  refs.templateStats.textContent = `${state.template.nodes.length} nodes · ${state.template.links.length} links · ${state.templates.length} saved templates`;
  refs.previewLink.href = `../graph-display/index.html?template=${encodeURIComponent(state.template.id)}`;
}

function renderAll() {
  ensureSelections();
  populateTemplateForm();
  populateNodeEditor();
  populateDetailEditor();
  populateLinkEditor();
  renderPanels();
  setStatus(state.statusText, state.statusTone);
}

function applyMetaExtras(rawJson) {
  const metaExtras = parseJsonText(rawJson, {});
  const nextMeta = { ...getAdditionalFields(state.template.meta, []), ...metaExtras };
  KNOWN_META_KEYS.forEach((key) => {
    if (typeof state.template.meta[key] !== 'undefined') nextMeta[key] = state.template.meta[key];
  });
  state.template = normalizeTemplate({ ...state.template, meta: nextMeta });
}

function readNodeDraft() {
  const currentNodeId = refs.nodeEditor.dataset.nodeId || null;
  const currentNode = state.template.nodes.find((node) => node.id === currentNodeId) || {};
  const metrics = parseJsonText(refs.nodeMetricsJson.value, currentNode.metrics || {});
  const extras = parseJsonText(refs.nodeExtraJson.value, getAdditionalFields(currentNode, KNOWN_NODE_KEYS));
  return {
    previousId: currentNodeId,
    draft: {
      ...extras,
      id: refs.nodeId.value,
      label: refs.nodeLabel.value,
      type: refs.nodeType.value,
      layer: Number(refs.nodeLayer.value),
      parentId: refs.nodeParentId.value,
      templateType: refs.nodeTemplateType.value,
      priority: refs.nodePriority.value,
      status: refs.nodeStatus.value,
      estimatedHours: Number(refs.nodeEstimatedHours.value || 0),
      metrics
    }
  };
}

function readLinkDraft() {
  const linkIndex = Number(refs.linkEditor.dataset.linkIndex);
  const currentLink = Number.isInteger(linkIndex) && linkIndex >= 0 ? state.template.links[linkIndex] || {} : {};
  const extras = parseJsonText(refs.linkExtraJson.value, getAdditionalFields(currentLink, KNOWN_LINK_KEYS));
  return {
    linkIndex,
    draft: {
      ...extras,
      source: refs.linkSource.value,
      target: refs.linkTarget.value,
      type: refs.linkType.value,
      weight: refs.linkWeight.value === '' ? '' : Number(refs.linkWeight.value)
    }
  };
}

function persistCurrentTemplate(openPreview = false) {
  const validation = validateTemplate(state.template);
  if (state.activeStorageTemplateId && state.activeStorageTemplateId !== state.template.id) {
    deleteStoredGraphTemplate(state.activeStorageTemplateId);
  }
  const savedTemplate = saveStoredGraphTemplate(state.template);
  refreshStoredTemplates();
  state.activeStorageTemplateId = savedTemplate.id;
  state.template = normalizeTemplate(savedTemplate);
  ensureSelections();
  renderAll();
  setStatus(
    validation.valid
      ? `Saved ${savedTemplate.name}.`
      : `Saved ${savedTemplate.name} with ${validation.errors.length} error(s) still visible in validation.`,
    validation.valid ? 'success' : 'warning'
  );

  if (openPreview) {
    window.open(`../graph-display/index.html?template=${encodeURIComponent(savedTemplate.id)}`, '_blank', 'noopener');
  }
}

function exportCurrentTemplate() {
  const payload = buildExportJson(state.template);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${state.template.id || 'graph-template'}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus(`Exported ${state.template.id || 'graph-template'}.json.`, 'success');
}

function bindEvents() {
  refs.newTemplateBtn.addEventListener('click', () => {
    state.activeStorageTemplateId = null;
    state.template = normalizeTemplate(createBlankTemplate());
    state.selectedNodeId = state.template.nodes[0]?.id || null;
    state.selectedLinkIndex = state.template.links.length ? 0 : -1;
    renderAll();
    setStatus('Started a new graph template.', 'info');
  });

  refs.loadExampleBtn.addEventListener('click', () => {
    state.activeStorageTemplateId = null;
    state.template = normalizeTemplate(createTemplateFromExample());
    state.selectedNodeId = state.template.nodes[0]?.id || null;
    state.selectedLinkIndex = state.template.links.length ? 0 : -1;
    renderAll();
    setStatus('Loaded the example template into the composer.', 'info');
  });

  refs.saveTemplateBtn.addEventListener('click', () => persistCurrentTemplate(false));
  refs.previewTemplateBtn.addEventListener('click', () => persistCurrentTemplate(true));
  refs.exportTemplateBtn.addEventListener('click', exportCurrentTemplate);

  refs.deleteTemplateBtn.addEventListener('click', () => {
    if (!state.activeStorageTemplateId) {
      setStatus('The current template is not saved yet.', 'warning');
      return;
    }

    const removed = deleteStoredGraphTemplate(state.activeStorageTemplateId);
    if (!removed) {
      setStatus('Could not delete the selected saved template.', 'warning');
      return;
    }

    refreshStoredTemplates();
    if (state.templates.length > 0) {
      loadTemplate(state.templates[0], state.templates[0].id);
    } else {
      state.activeStorageTemplateId = null;
      state.template = normalizeTemplate(createBlankTemplate());
      renderAll();
    }
    setStatus('Deleted saved template.', 'success');
  });

  refs.savedTemplates.addEventListener('click', (event) => {
    const button = event.target.closest('[data-load-template]');
    if (!button) return;
    const templateId = button.dataset.loadTemplate;
    const template = state.templates.find((entry) => entry.id === templateId);
    if (!template) return;
    loadTemplate(template, template.id);
    setStatus(`Loaded ${template.name}.`, 'info');
  });

  refs.measurementPresets.addEventListener('click', (event) => {
    const button = event.target.closest('[data-apply-preset]');
    if (!button) return;
    state.template = applyMeasurementPreset(state.template, button.dataset.applyPreset);
    renderAll();
    setStatus('Applied measurement preset.', 'success');
  });

  refs.templateForm.addEventListener('change', (event) => {
    const target = event.target;
    if (target.matches('[data-template-path]')) {
      const value = target.type === 'checkbox' ? target.checked : target.value;
      state.template = updateTemplateField(state.template, target.dataset.templatePath, value);
      renderAll();
      return;
    }

    if (target === refs.metaExtraJson) {
      try {
        applyMetaExtras(refs.metaExtraJson.value);
        renderAll();
      } catch (error) {
        setStatus(`Meta JSON error: ${error.message}`, 'warning');
      }
    }
  });

  refs.configEditor.addEventListener('change', (event) => {
    const target = event.target;
    if (!target.dataset.configInput || !target.dataset.path) return;

    try {
      let nextValue;
      switch (target.dataset.configInput) {
        case 'boolean':
          nextValue = target.checked;
          break;
        case 'number':
          nextValue = target.value === '' ? 0 : Number(target.value);
          break;
        case 'json':
          nextValue = parseJsonText(target.value, {});
          break;
        default:
          nextValue = target.value;
          break;
      }
      state.template = updateTemplateField(state.template, target.dataset.path, nextValue);
      renderAll();
    } catch (error) {
      setStatus(`Config error: ${error.message}`, 'warning');
    }
  });

  refs.nodeList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-select-node]');
    if (!button) return;
    state.selectedNodeId = button.dataset.selectNode;
    renderAll();
  });

  refs.addNodeBtn.addEventListener('click', () => {
    const result = createNewNodeTemplate(state.template);
    state.template = result.template;
    state.selectedNodeId = result.newNodeId;
    renderAll();
    setStatus('Added a new node.', 'success');
  });

  refs.duplicateNodeBtn.addEventListener('click', () => {
    if (!state.selectedNodeId) return;
    const result = duplicateNode(state.template, state.selectedNodeId);
    state.template = result.template;
    state.selectedNodeId = result.newNodeId;
    renderAll();
    setStatus('Duplicated node.', 'success');
  });

  refs.removeNodeBtn.addEventListener('click', () => {
    if (!state.selectedNodeId) return;
    state.template = removeNode(state.template, state.selectedNodeId);
    state.selectedNodeId = state.template.nodes[0]?.id || null;
    renderAll();
    setStatus('Removed node and its attached links.', 'success');
  });

  refs.nodeEditor.addEventListener('change', () => {
    try {
      const { previousId, draft } = readNodeDraft();
      state.template = upsertNode(state.template, draft, previousId);
      state.selectedNodeId = draft.id;
      renderAll();
    } catch (error) {
      setStatus(`Node error: ${error.message}`, 'warning');
    }
  });

  refs.detailEditor.addEventListener('change', () => {
    const selectedNode = getSelectedNode();
    if (!selectedNode) return;
    state.template = updateNodeDetails(state.template, selectedNode.id, {
      title: refs.detailTitle.value,
      photoUrl: refs.detailPhotoUrl.value,
      items: refs.detailItems.value.split('\n').map((item) => item.trim()).filter(Boolean)
    });
    renderAll();
  });

  refs.linkList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-select-link]');
    if (!button) return;
    state.selectedLinkIndex = Number(button.dataset.selectLink);
    renderAll();
  });

  refs.addLinkBtn.addEventListener('click', () => {
    const result = createNewLinkTemplate(state.template);
    state.template = result.template;
    state.selectedLinkIndex = result.newLinkIndex;
    renderAll();
    setStatus('Added a new link.', 'success');
  });

  refs.removeLinkBtn.addEventListener('click', () => {
    if (state.selectedLinkIndex < 0) return;
    state.template = removeLink(state.template, state.selectedLinkIndex);
    state.selectedLinkIndex = state.template.links.length ? Math.min(state.selectedLinkIndex, state.template.links.length - 1) : -1;
    renderAll();
    setStatus('Removed link.', 'success');
  });

  refs.linkEditor.addEventListener('change', () => {
    try {
      const { linkIndex, draft } = readLinkDraft();
      state.template = upsertLink(state.template, draft, Number.isInteger(linkIndex) ? linkIndex : -1);
      renderAll();
    } catch (error) {
      setStatus(`Link error: ${error.message}`, 'warning');
    }
  });
}

function cacheDom() {
  refs.savedTemplates = document.getElementById('saved-templates');
  refs.measurementPresets = document.getElementById('measurement-presets');
  refs.statusMessage = document.getElementById('status-message');
  refs.templateStats = document.getElementById('template-stats');
  refs.previewLink = document.getElementById('preview-link');

  refs.newTemplateBtn = document.getElementById('new-template-btn');
  refs.loadExampleBtn = document.getElementById('load-example-btn');
  refs.saveTemplateBtn = document.getElementById('save-template-btn');
  refs.previewTemplateBtn = document.getElementById('preview-template-btn');
  refs.exportTemplateBtn = document.getElementById('export-template-btn');
  refs.deleteTemplateBtn = document.getElementById('delete-template-btn');

  refs.templateForm = document.getElementById('template-form');
  refs.templateId = document.getElementById('template-id');
  refs.templateName = document.getElementById('template-name');
  refs.templateDescription = document.getElementById('template-description');
  refs.metaProfileNode = document.getElementById('meta-profile-node');
  refs.metaCoreNode = document.getElementById('meta-core-node');
  refs.metaLegendMode = document.getElementById('meta-legend-mode');
  refs.metaShowProfile = document.getElementById('meta-show-profile');
  refs.metaShowCore = document.getElementById('meta-show-core');
  refs.metaShowCv = document.getElementById('meta-show-cv');
  refs.metaWalkthrough = document.getElementById('meta-walkthrough');
  refs.metaExtraJson = document.getElementById('meta-extra-json');

  refs.configEditor = document.getElementById('config-editor');
  refs.nodeList = document.getElementById('node-list');
  refs.addNodeBtn = document.getElementById('add-node-btn');
  refs.duplicateNodeBtn = document.getElementById('duplicate-node-btn');
  refs.removeNodeBtn = document.getElementById('remove-node-btn');
  refs.nodeEditor = document.getElementById('node-editor');
  refs.nodeId = document.getElementById('node-id');
  refs.nodeLabel = document.getElementById('node-label');
  refs.nodeType = document.getElementById('node-type');
  refs.nodeLayer = document.getElementById('node-layer');
  refs.nodeParentId = document.getElementById('node-parent-id');
  refs.nodeTemplateType = document.getElementById('node-template-type');
  refs.nodePriority = document.getElementById('node-priority');
  refs.nodeStatus = document.getElementById('node-status');
  refs.nodeEstimatedHours = document.getElementById('node-estimated-hours');
  refs.nodeMetricsJson = document.getElementById('node-metrics-json');
  refs.nodeExtraJson = document.getElementById('node-extra-json');

  refs.detailEditor = document.getElementById('detail-editor');
  refs.detailTitle = document.getElementById('detail-title');
  refs.detailPhotoUrl = document.getElementById('detail-photo-url');
  refs.detailItems = document.getElementById('detail-items');

  refs.linkList = document.getElementById('link-list');
  refs.addLinkBtn = document.getElementById('add-link-btn');
  refs.removeLinkBtn = document.getElementById('remove-link-btn');
  refs.linkEditor = document.getElementById('link-editor');
  refs.linkSource = document.getElementById('link-source');
  refs.linkTarget = document.getElementById('link-target');
  refs.linkType = document.getElementById('link-type');
  refs.linkWeight = document.getElementById('link-weight');
  refs.linkExtraJson = document.getElementById('link-extra-json');

  refs.validationPanel = document.getElementById('validation-panel');
  refs.jsonPreview = document.getElementById('json-preview');
}

function init() {
  cacheDom();
  bindEvents();
  refreshStoredTemplates();
  if (state.templates.length > 0) {
    loadTemplate(state.templates[0], state.templates[0].id);
  } else {
    renderAll();
  }
}

document.addEventListener('DOMContentLoaded', init);
