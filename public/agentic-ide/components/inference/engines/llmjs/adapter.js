'use strict';

function createLlmJsEngine() {
  return {
    getDescriptor() {
      return {
        id: 'llmjs',
        label: 'LLM.js',
        environment: 'browser',
        canInfer: true,
        supportsGguf: true,
      };
    },

    async probe(context) {
      const isBrowser = context.runtime === 'browser';
      return {
        available: false,
        canInfer: true,
        reason: isBrowser
          ? 'Browser runtime not wired in this Node benchmark harness.'
          : 'LLM.js is browser-first and not selected for Node runtime.',
        details: null,
      };
    },

    async complete() {
      throw new Error('LLM.js adapter is not active in this Node runtime.');
    },
  };
}

module.exports = {
  createLlmJsEngine,
};
