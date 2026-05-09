'use strict';

function createLlama3PureEngine() {
  return {
    getDescriptor() {
      return {
        id: 'llama3pure',
        label: 'llama3pure',
        environment: 'node',
        canInfer: true,
        supportsGguf: 'partial',
      };
    },

    async probe() {
      return {
        available: false,
        canInfer: true,
        reason: 'Educational parser/generator path not wired as production runtime.',
        details: null,
      };
    },

    async complete() {
      throw new Error('llama3pure adapter is not active in this runtime.');
    },
  };
}

module.exports = {
  createLlama3PureEngine,
};
