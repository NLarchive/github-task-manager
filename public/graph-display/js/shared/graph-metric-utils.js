/**
 * Shared helpers for resolving custom metric-based node sizing and coloring.
 */

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toPathSegments(path) {
  return String(path || '')
    .split('.')
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function getValueAtPath(source, path) {
  const segments = toPathSegments(path);
  if (!segments.length) return undefined;

  let cursor = source;
  for (const segment of segments) {
    if (!cursor || (typeof cursor !== 'object' && typeof cursor !== 'function')) {
      return undefined;
    }
    cursor = cursor[segment];
  }
  return cursor;
}

export function resolveMetricRadius(node, metricSizing = {}) {
  const rawValue = getValueAtPath(node, metricSizing.field);
  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue)) return null;

  const minValue = Number(metricSizing.minValue ?? 0);
  const maxValue = Number(metricSizing.maxValue ?? minValue + 1);
  const minRadius = Number(metricSizing.minRadius ?? 16);
  const maxRadius = Number(metricSizing.maxRadius ?? 44);
  const scale = String(metricSizing.scale || 'sqrt').trim().toLowerCase();

  const boundedValue = Math.max(minValue, Math.min(maxValue, numericValue));
  const span = Math.max(1e-6, maxValue - minValue);
  const normalized = (boundedValue - minValue) / span;
  const eased = scale === 'linear' ? normalized : Math.sqrt(normalized);

  return minRadius + (maxRadius - minRadius) * eased;
}

export function resolveMetricColor(node, metricColoring = {}, fallbackHex = '#aabbc8') {
  const palette = isPlainObject(metricColoring.palette) ? metricColoring.palette : {};
  const fallbackKey = String(metricColoring.fallbackKey || 'default').trim() || 'default';
  const rawValue = getValueAtPath(node, metricColoring.field);
  const normalizedKey = String(rawValue ?? '').trim();

  if (normalizedKey && palette[normalizedKey]) {
    return palette[normalizedKey];
  }

  if (palette[fallbackKey]) {
    return palette[fallbackKey];
  }

  return fallbackHex;
}

export function getMetricLegendItems(metricColoring = {}, fallbackHex = '#aabbc8') {
  const palette = isPlainObject(metricColoring.palette) ? metricColoring.palette : {};
  const fallbackKey = String(metricColoring.fallbackKey || 'default').trim() || 'default';
  const entries = Object.entries(palette).map(([key, hex]) => ({
    key,
    label: key,
    hex,
    isFallback: key === fallbackKey
  }));

  if (entries.length > 0) {
    return entries;
  }

  return [
    {
      key: fallbackKey,
      label: fallbackKey,
      hex: fallbackHex,
      isFallback: true
    }
  ];
}
