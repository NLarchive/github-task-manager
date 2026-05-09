/**
 * state.js — State schema for research_workflow_v1.
 *
 * Defines the shared state object passed between nodes in the workflow.
 */

/** @returns {WorkflowState} */
export function createState(initial = {}) {
  return {
    // Input
    topic: '',
    // Intermediate
    searchResults: [],
    rawData:       null,
    // Output
    report:        null,
    // Metadata
    error:         null,
    step:          'init',
    ...initial,
  };
}

export const STEP_ORDER = ['init', 'search', 'process', 'format', 'done', 'error'];
