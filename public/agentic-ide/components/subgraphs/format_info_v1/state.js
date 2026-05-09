/**
 * state.js — State schema for the format_info subgraph.
 */

/** @returns {FormatState} */
export function createState(initial = {}) {
  return {
    raw:       null,
    doc:       null,
    formatted: null,
    error:     null,
    ...initial,
  };
}
