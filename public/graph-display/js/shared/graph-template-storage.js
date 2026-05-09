/**
 * Browser-local storage for Graph Composer templates.
 */

export const STORED_GRAPH_TEMPLATES_KEY = 'graphComposerTemplatesV1';

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (!isPlainObject(value)) return value;

  const copy = {};
  Object.keys(value).forEach((key) => {
    copy[key] = cloneValue(value[key]);
  });
  return copy;
}

function getStorage(storageOverride) {
  if (storageOverride && typeof storageOverride.getItem === 'function' && typeof storageOverride.setItem === 'function') {
    return storageOverride;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

function normalizeTemplateId(value) {
  const cleaned = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'custom-graph';
}

function normalizeStoredTemplate(template, index = 0) {
  const id = normalizeTemplateId(template?.id || template?.name || `custom-graph-${index + 1}`);
  const name = String(template?.name || id).trim() || id;
  const savedAt = String(template?.savedAt || new Date().toISOString());

  return {
    id,
    name,
    description: String(template?.description || '').trim(),
    nodes: Array.isArray(template?.nodes) ? cloneValue(template.nodes) : [],
    links: Array.isArray(template?.links) ? cloneValue(template.links) : [],
    details: isPlainObject(template?.details) ? cloneValue(template.details) : {},
    meta: isPlainObject(template?.meta) ? cloneValue(template.meta) : {},
    configOverrides: isPlainObject(template?.configOverrides) ? cloneValue(template.configOverrides) : {},
    savedAt,
    source: String(template?.source || 'graph-composer')
  };
}

function readStoredTemplates(storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) return [];

  try {
    const raw = storage.getItem(STORED_GRAPH_TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => isPlainObject(entry))
      .map((entry, index) => normalizeStoredTemplate(entry, index));
  } catch {
    return [];
  }
}

function writeStoredTemplates(templates, storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) return false;
  storage.setItem(STORED_GRAPH_TEMPLATES_KEY, JSON.stringify(templates));
  return true;
}

export function buildStoredGraphTemplateId(name, existingIds = []) {
  const usedIds = new Set(existingIds.map((value) => normalizeTemplateId(value)));
  const baseId = normalizeTemplateId(name);
  let candidate = baseId;
  let counter = 2;

  while (usedIds.has(candidate)) {
    candidate = `${baseId}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export function listStoredGraphTemplates(storageOverride) {
  return readStoredTemplates(storageOverride)
    .sort((left, right) => String(left.name || '').localeCompare(String(right.name || '')));
}

export function getStoredGraphTemplate(templateId, storageOverride) {
  const normalizedId = normalizeTemplateId(templateId);
  return listStoredGraphTemplates(storageOverride)
    .find((template) => template.id === normalizedId) || null;
}

export function saveStoredGraphTemplate(template, storageOverride) {
  const existing = listStoredGraphTemplates(storageOverride);
  const resolvedId = template?.id
    ? normalizeTemplateId(template.id)
    : buildStoredGraphTemplateId(template?.name || 'custom-graph', existing.map((entry) => entry.id));
  const normalized = normalizeStoredTemplate({ ...template, id: resolvedId });
  const nextTemplates = existing.filter((entry) => entry.id !== normalized.id);
  nextTemplates.push(normalized);
  writeStoredTemplates(nextTemplates, storageOverride);
  return normalized;
}

export function deleteStoredGraphTemplate(templateId, storageOverride) {
  const normalizedId = normalizeTemplateId(templateId);
  const existing = listStoredGraphTemplates(storageOverride);
  const nextTemplates = existing.filter((entry) => entry.id !== normalizedId);
  if (nextTemplates.length === existing.length) return false;
  return writeStoredTemplates(nextTemplates, storageOverride);
}
