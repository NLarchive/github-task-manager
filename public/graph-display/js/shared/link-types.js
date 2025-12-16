/**
 * Shared link-type definitions and helpers.
 *
 * Goal: keep link-type strings and grouping logic in one place so templates
 * (career, task-management, TaskDB-backed) share consistent behavior.
 */

export const COMMON_LINK_TYPES = Object.freeze({
  HAS_FOUNDATION: 'HAS_FOUNDATION',
  HAS_SUBCATEGORY: 'HAS_SUBCATEGORY',
  DEVELOPS: 'DEVELOPS',
  CREATES: 'CREATES',
  LEADS_TO: 'LEADS_TO'
});

export const TASK_LINK_TYPES = Object.freeze({
  HAS_TASK: 'HAS_TASK',
  DEPENDS_PREFIX: 'DEPENDS_'
});

export function isDependsLinkType(type) {
  return String(type || '').startsWith(TASK_LINK_TYPES.DEPENDS_PREFIX);
}

export function isSubcategoryLinkType(type) {
  return String(type || '') === COMMON_LINK_TYPES.HAS_SUBCATEGORY;
}

export function isStrongCohesionLinkType(type) {
  const t = String(type || '');
  return (
    t === COMMON_LINK_TYPES.HAS_FOUNDATION ||
    t === COMMON_LINK_TYPES.HAS_SUBCATEGORY ||
    t === TASK_LINK_TYPES.HAS_TASK ||
    isDependsLinkType(t)
  );
}

export function isLayerSpacingLinkType(type) {
  const t = String(type || '');
  return (
    t === COMMON_LINK_TYPES.DEVELOPS ||
    t === COMMON_LINK_TYPES.CREATES ||
    t === COMMON_LINK_TYPES.LEADS_TO ||
    t === COMMON_LINK_TYPES.HAS_FOUNDATION ||
    t === TASK_LINK_TYPES.HAS_TASK ||
    isDependsLinkType(t)
  );
}

/**
 * Returns the link distance to use for a link type.
 * Mirrors existing behavior in main-graph.js, but centralized.
 */
export function getForceLinkDistance(linkType, forcesCfg) {
  if (isSubcategoryLinkType(linkType)) return forcesCfg.linkDistanceSubcategory;
  if (isLayerSpacingLinkType(linkType)) return forcesCfg.linkDistanceLayer;
  return forcesCfg.linkDistance;
}

/**
 * Returns the link force strength to use for a link type.
 * Mirrors existing behavior in main-graph.js, but centralized.
 */
export function getForceLinkStrength(linkType) {
  return isStrongCohesionLinkType(linkType) ? 0.6 : 0.4;
}

/**
 * Useful for UIs (legend/debug): shared + template-specific types.
 */
export const TEMPLATE_LINK_TYPES = Object.freeze({
  common: Object.freeze(Object.values(COMMON_LINK_TYPES)),
  taskManagement: Object.freeze([TASK_LINK_TYPES.HAS_TASK, `${TASK_LINK_TYPES.DEPENDS_PREFIX}*`])
});
