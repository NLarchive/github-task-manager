'use strict';

const fs = require('fs');

function resolvePrompt(payload) {
  if (Array.isArray(payload.messages) && payload.messages.length) {
    const last = payload.messages[payload.messages.length - 1];
    return String((last && last.content) || '');
  }
  return String(payload.prompt || '');
}

function createDuck4iLlamaEngine() {
  return {
    getDescriptor() {
      return {
        id: 'duck4i-llama',
        label: '@duck4i/llama',
        environment: 'node',
        canInfer: true,
        supportsGguf: true,
      };
    },

    async probe(context) {
      const modelExists = Boolean(context.modelPath) && fs.existsSync(context.modelPath);
      let installed = false;
      let loadError = null;
      try {
        require.resolve('@duck4i/llama');
        installed = true;
      } catch {
        installed = false;
      }

      if (installed) {
        try {
          await import('@duck4i/llama');
        } catch (error) {
          loadError = error && error.message ? error.message : String(error);
        }
      }

      return {
        available: installed && modelExists && !loadError,
        canInfer: true,
        reason: loadError
          ? `@duck4i/llama failed to load: ${loadError}`
          : installed
          ? (modelExists ? null : 'Model file not found for @duck4i/llama execution.')
          : '@duck4i/llama is not installed. Run: npm install @duck4i/llama',
        details: {
          installed,
          loadError,
          modelPath: context.modelPath || null,
          modelExists,
        },
      };
    },

    async complete(payload, context) {
      const modelPath = context.modelPath;
      if (!modelPath || !fs.existsSync(modelPath)) {
        throw new Error('Model path not found for @duck4i/llama inference.');
      }

      let mod;
      try {
        mod = await import('@duck4i/llama');
      } catch (error) {
        throw new Error(`Failed to load @duck4i/llama: ${error && error.message ? error.message : String(error)}`);
      }

      const runInference = mod && (mod.RunInference || (mod.default && mod.default.RunInference));
      if (typeof runInference !== 'function') {
        throw new Error('@duck4i/llama RunInference export was not found.');
      }

      const prompt = resolvePrompt(payload);
      const answer = await runInference({
        modelPath,
        prompt,
        systemPrompt: payload.systemPrompt || 'You are a helpful assistant.',
        flashAttention: true,
        maxTokens: payload.max_tokens || 1024,
      });

      const text = String(answer || '').trim();
      return {
        text,
        content: text,
        finish_reason: 'stop',
      };
    },
  };
}

module.exports = {
  createDuck4iLlamaEngine,
};
