'use strict';

function createWebLlmEngine() {
  return {
    getDescriptor() {
      return {
        id: 'webllm',
        label: 'WebLLM',
        environment: 'browser',
        canInfer: true,
        supportsGguf: false,
      };
    },

    async probe(context) {
      return {
        available: false,
        canInfer: true,
        reason: context.runtime === 'browser'
          ? 'WebGPU browser runtime not wired in this repository harness.'
          : 'WebLLM is browser-focused and not selected for Node runtime.',
        details: null,
      };
    },

    async complete() {
      throw new Error('WebLLM adapter is not active in this runtime.');
    },
  };
}

module.exports = {
  createWebLlmEngine,
};
