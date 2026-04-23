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

/** Task-management specific link types layered on top of the shared graph set. */
export const TASK_LINK_TYPES = Object.freeze({
  HAS_TASK: 'HAS_TASK',
  DEPENDS_PREFIX: 'DEPENDS_'
});

/**
 * Check whether a link type encodes a dependency edge in the task template.
 *
 * @param {string} type
 * @returns {boolean}
 */
export function isDependsLinkType(type) {
  return String(type || '').startsWith(TASK_LINK_TYPES.DEPENDS_PREFIX);
}

/**
 * Check whether a link type represents an in-layer subcategory relationship.
 *
 * @param {string} type
 * @returns {boolean}
 */
export function isSubcategoryLinkType(type) {
  return String(type || '') === COMMON_LINK_TYPES.HAS_SUBCATEGORY;
}

/**
 * Identify link types that should render with the stronger cohesion force.
 *
 * @param {string} type
 * @returns {boolean}
 */
export function isStrongCohesionLinkType(type) {
  const t = String(type || '');
  return (
    t === COMMON_LINK_TYPES.HAS_FOUNDATION ||
    t === COMMON_LINK_TYPES.HAS_SUBCATEGORY ||
    t === TASK_LINK_TYPES.HAS_TASK ||
    isDependsLinkType(t)
  );
}

/**
 * Identify link types that should use the wider layer-spacing distance.
 *
 * @param {string} type
 * @returns {boolean}
 */
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
