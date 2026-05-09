import { createGraphUiConfig, validateGraphComponentInputs } from '../../graph-display/js/shared/graph-design-contract.js';
import { createBlankLink, createBlankNode, createBlankNodeDetails, createBlankTemplate, deepClone, getMeasurementPresetById } from './composer-defaults.js';

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function setValueAtPath(target, path, value) {
  const segments = String(path || '').split('.').map((segment) => segment.trim()).filter(Boolean);
  if (!segments.length) return target;

  let cursor = target;
  while (segments.length > 1) {
    const segment = segments.shift();
    if (!isPlainObject(cursor[segment])) cursor[segment] = {};
    cursor = cursor[segment];
  }
  cursor[segments[0]] = value;
  return target;
}

function normalizeNode(node, index = 0) {
  const baseNode = deepClone(node || createBlankNode(index + 1));
  baseNode.id = String(baseNode.id || `node-${index + 1}`).trim() || `node-${index + 1}`;
  baseNode.label = String(baseNode.label || baseNode.id).trim() || baseNode.id;
  baseNode.type = String(baseNode.type || 'parent').trim() || 'parent';
  baseNode.layer = Number.isFinite(Number(baseNode.layer)) ? Number(baseNode.layer) : 0;
  baseNode.parentId = String(baseNode.parentId || '').trim();
  baseNode.templateType = String(baseNode.templateType || 'custom-node').trim() || 'custom-node';
  baseNode.priority = String(baseNode.priority || 'Medium').trim() || 'Medium';
  baseNode.status = String(baseNode.status || 'Not Started').trim() || 'Not Started';
  baseNode.estimatedHours = Number.isFinite(Number(baseNode.estimatedHours)) ? Number(baseNode.estimatedHours) : 0;
  baseNode.metrics = isPlainObject(baseNode.metrics) ? deepClone(baseNode.metrics) : {};
  return baseNode;
}

function normalizeLink(link, index = 0) {
  const baseLink = deepClone(link || {});
  baseLink.source = String(baseLink.source || `node-${index + 1}`).trim();
  baseLink.target = String(baseLink.target || baseLink.source).trim();
  baseLink.type = String(baseLink.type || 'DEPENDS_FS').trim() || 'DEPENDS_FS';
  if (baseLink.weight !== '' && typeof baseLink.weight !== 'undefined') {
    const numericWeight = Number(baseLink.weight);
    baseLink.weight = Number.isFinite(numericWeight) ? numericWeight : baseLink.weight;
  }
  return baseLink;
}

function normalizeDetails(template) {
  const nextDetails = isPlainObject(template.details) ? deepClone(template.details) : {};
  template.nodes.forEach((node) => {
    if (!isPlainObject(nextDetails[node.id])) {
      nextDetails[node.id] = createBlankNodeDetails(node.label);
    }
    nextDetails[node.id].title = String(nextDetails[node.id].title || node.label || node.id).trim() || node.id;
    nextDetails[node.id].items = Array.isArray(nextDetails[node.id].items)
      ? nextDetails[node.id].items.map((item) => String(item))
      : [];
    if (typeof nextDetails[node.id].photoUrl !== 'undefined') {
      nextDetails[node.id].photoUrl = String(nextDetails[node.id].photoUrl || '').trim();
    }
  });

  Object.keys(nextDetails).forEach((nodeId) => {
    if (!template.nodes.some((node) => node.id === nodeId)) {
      delete nextDetails[nodeId];
    }
  });

  return nextDetails;
}

export function getAdditionalFields(source, knownKeys) {
  const extras = {};
  if (!isPlainObject(source)) return extras;
  Object.keys(source).forEach((key) => {
    if (!knownKeys.includes(key)) {
      extras[key] = deepClone(source[key]);
    }
  });
  return extras;
}

export function parseJsonText(text, fallback = {}) {
  const raw = String(text || '').trim();
  if (!raw) return deepClone(fallback);
  return JSON.parse(raw);
}

export function suggestUniqueNodeId(template, baseId = 'node') {
  const normalizedBase = String(baseId || 'node').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'node';
  const usedIds = new Set((template?.nodes || []).map((node) => node.id));
  let candidate = normalizedBase;
  let counter = 2;
  while (usedIds.has(candidate)) {
    candidate = `${normalizedBase}-${counter}`;
    counter += 1;
  }
  return candidate;
}

export function normalizeTemplate(template) {
  const nextTemplate = deepClone(template || createBlankTemplate());
  nextTemplate.id = String(nextTemplate.id || 'custom-graph').trim() || 'custom-graph';
  nextTemplate.name = String(nextTemplate.name || nextTemplate.id).trim() || nextTemplate.id;
  nextTemplate.description = String(nextTemplate.description || '').trim();
  nextTemplate.nodes = Array.isArray(nextTemplate.nodes) ? nextTemplate.nodes.map((node, index) => normalizeNode(node, index)) : [];
  nextTemplate.links = Array.isArray(nextTemplate.links) ? nextTemplate.links.map((link, index) => normalizeLink(link, index)) : [];
  nextTemplate.meta = isPlainObject(nextTemplate.meta) ? deepClone(nextTemplate.meta) : {};
  nextTemplate.configOverrides = createGraphUiConfig(isPlainObject(nextTemplate.configOverrides) ? nextTemplate.configOverrides : {});
  nextTemplate.details = normalizeDetails(nextTemplate);

  if (!nextTemplate.meta.profileNodeId && nextTemplate.nodes[0]) {
    nextTemplate.meta.profileNodeId = nextTemplate.nodes[0].id;
  }
  if (!nextTemplate.meta.coreNodeId && nextTemplate.nodes[nextTemplate.nodes.length - 1]) {
    nextTemplate.meta.coreNodeId = nextTemplate.nodes[nextTemplate.nodes.length - 1].id;
  }

  return nextTemplate;
}

export function updateTemplateField(template, path, value) {
  const nextTemplate = deepClone(normalizeTemplate(template));
  setValueAtPath(nextTemplate, path, value);
  return normalizeTemplate(nextTemplate);
}

export function applyMeasurementPreset(template, presetId) {
  const nextTemplate = deepClone(normalizeTemplate(template));
  const preset = getMeasurementPresetById(presetId);
  nextTemplate.configOverrides = createGraphUiConfig(preset.configOverrides);
  return normalizeTemplate(nextTemplate);
}

export function upsertNode(template, nodeDraft, previousId = null) {
  const nextTemplate = normalizeTemplate(template);
  const normalizedNode = normalizeNode(nodeDraft, nextTemplate.nodes.length);
  const otherNodes = nextTemplate.nodes.filter((node) => node.id !== previousId);
  if (otherNodes.some((node) => node.id === normalizedNode.id)) {
    throw new Error(`Node id already exists: ${normalizedNode.id}`);
  }

  const nodeIndex = nextTemplate.nodes.findIndex((node) => node.id === previousId);
  if (nodeIndex >= 0) {
    nextTemplate.nodes[nodeIndex] = normalizedNode;
  } else {
    nextTemplate.nodes.push(normalizedNode);
  }

  if (previousId && previousId !== normalizedNode.id) {
    nextTemplate.links = nextTemplate.links.map((link) => ({
      ...link,
      source: link.source === previousId ? normalizedNode.id : link.source,
      target: link.target === previousId ? normalizedNode.id : link.target
    }));
    if (nextTemplate.details[previousId]) {
      nextTemplate.details[normalizedNode.id] = nextTemplate.details[previousId];
      delete nextTemplate.details[previousId];
    }
    if (nextTemplate.meta.profileNodeId === previousId) nextTemplate.meta.profileNodeId = normalizedNode.id;
    if (nextTemplate.meta.coreNodeId === previousId) nextTemplate.meta.coreNodeId = normalizedNode.id;
  }

  nextTemplate.details[normalizedNode.id] = nextTemplate.details[normalizedNode.id] || createBlankNodeDetails(normalizedNode.label);
  return normalizeTemplate(nextTemplate);
}

export function duplicateNode(template, nodeId) {
  const nextTemplate = normalizeTemplate(template);
  const sourceNode = nextTemplate.nodes.find((node) => node.id === nodeId);
  if (!sourceNode) return { template: nextTemplate, newNodeId: null };

  const copiedNode = deepClone(sourceNode);
  copiedNode.id = suggestUniqueNodeId(nextTemplate, `${sourceNode.id}-copy`);
  copiedNode.label = `${sourceNode.label} Copy`;
  nextTemplate.nodes.push(copiedNode);
  nextTemplate.details[copiedNode.id] = deepClone(nextTemplate.details[sourceNode.id] || createBlankNodeDetails(copiedNode.label));
  nextTemplate.details[copiedNode.id].title = copiedNode.label;

  return { template: normalizeTemplate(nextTemplate), newNodeId: copiedNode.id };
}

export function removeNode(template, nodeId) {
  const nextTemplate = normalizeTemplate(template);
  nextTemplate.nodes = nextTemplate.nodes.filter((node) => node.id !== nodeId);
  nextTemplate.links = nextTemplate.links.filter((link) => link.source !== nodeId && link.target !== nodeId);
  delete nextTemplate.details[nodeId];
  if (nextTemplate.meta.profileNodeId === nodeId) delete nextTemplate.meta.profileNodeId;
  if (nextTemplate.meta.coreNodeId === nodeId) delete nextTemplate.meta.coreNodeId;
  return normalizeTemplate(nextTemplate);
}

export function upsertLink(template, linkDraft, linkIndex = -1) {
  const nextTemplate = normalizeTemplate(template);
  const normalizedLink = normalizeLink(linkDraft, linkIndex >= 0 ? linkIndex : nextTemplate.links.length);
  if (linkIndex >= 0 && linkIndex < nextTemplate.links.length) {
    nextTemplate.links[linkIndex] = normalizedLink;
  } else {
    nextTemplate.links.push(normalizedLink);
  }
  return normalizeTemplate(nextTemplate);
}

export function removeLink(template, linkIndex) {
  const nextTemplate = normalizeTemplate(template);
  nextTemplate.links = nextTemplate.links.filter((_, index) => index !== linkIndex);
  return normalizeTemplate(nextTemplate);
}

export function updateNodeDetails(template, nodeId, detailDraft) {
  const nextTemplate = normalizeTemplate(template);
  nextTemplate.details[nodeId] = {
    ...(nextTemplate.details[nodeId] || createBlankNodeDetails(nodeId)),
    ...deepClone(detailDraft)
  };
  return normalizeTemplate(nextTemplate);
}

export function createNewNodeTemplate(template) {
  const nextTemplate = normalizeTemplate(template);
  const nodeId = suggestUniqueNodeId(nextTemplate, `node-${nextTemplate.nodes.length + 1}`);
  const node = createBlankNode(nextTemplate.nodes.length + 1);
  node.id = nodeId;
  node.label = `Node ${nextTemplate.nodes.length + 1}`;
  nextTemplate.nodes.push(node);
  nextTemplate.details[nodeId] = createBlankNodeDetails(node.label);
  return { template: normalizeTemplate(nextTemplate), newNodeId: nodeId };
}

export function createNewLinkTemplate(template) {
  const nextTemplate = normalizeTemplate(template);
  const link = createBlankLink(nextTemplate.nodes);
  nextTemplate.links.push(link);
  return { template: normalizeTemplate(nextTemplate), newLinkIndex: nextTemplate.links.length - 1 };
}

export function validateTemplate(template) {
  const normalizedTemplate = normalizeTemplate(template);
  return validateGraphComponentInputs({
    template: normalizedTemplate,
    configOverrides: normalizedTemplate.configOverrides
  });
}

export function buildExportJson(template) {
  return JSON.stringify(normalizeTemplate(template), null, 2);
}
