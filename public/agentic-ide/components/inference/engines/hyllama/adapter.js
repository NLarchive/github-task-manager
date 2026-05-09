'use strict';

const fs = require('fs');

function readGgufHeader(modelPath) {
  const fd = fs.openSync(modelPath, 'r');
  try {
    const header = Buffer.alloc(24);
    fs.readSync(fd, header, 0, header.length, 0);
    const magic = header.toString('utf8', 0, 4);
    if (magic !== 'GGUF') {
      throw new Error('Invalid GGUF magic header.');
    }
    const version = Number(header.readUInt32LE(4));
    const tensorCount = Number(header.readBigUInt64LE(8));
    const metadataKvCount = Number(header.readBigUInt64LE(16));
    return {
      magic,
      version,
      tensorCount,
      metadataKvCount,
    };
  } finally {
    fs.closeSync(fd);
  }
}

function createHyllamaEngine() {
  return {
    getDescriptor() {
      return {
        id: 'hyllama',
        label: 'hyllama',
        environment: 'node-browser',
        canInfer: false,
        supportsGguf: true,
      };
    },

    async probe(context) {
      const modelPath = context.modelPath;
      if (!modelPath || !fs.existsSync(modelPath)) {
        return {
          available: false,
          canInfer: false,
          reason: 'Model file not found for GGUF header probe.',
          details: { modelPath: modelPath || null },
        };
      }

      try {
        const header = readGgufHeader(modelPath);
        return {
          available: true,
          canInfer: false,
          reason: null,
          details: {
            modelPath,
            header,
            fileSizeBytes: fs.statSync(modelPath).size,
          },
        };
      } catch (error) {
        return {
          available: false,
          canInfer: false,
          reason: error && error.message ? error.message : String(error),
          details: { modelPath },
        };
      }
    },

    async complete() {
      throw new Error('hyllama is metadata-only and cannot generate completions.');
    },

    readGgufHeader,
  };
}

module.exports = {
  createHyllamaEngine,
  readGgufHeader,
};
