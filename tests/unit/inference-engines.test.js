/**
 * Inference Engine Isolation Tests
 * Validates engine registration, ranking, and GGUF header parsing behavior.
 */

const fs = require('fs');
const path = require('path');

const { createInferenceManager } = require('../../public/agentic-ide/components/inference/main');
const { readGgufHeader } = require('../../public/agentic-ide/components/inference/engines/hyllama/adapter');

describe('Inference Manager', () => {
  it('should register all required engine adapters', () => {
    const manager = createInferenceManager();
    const ids = manager.listEngines().map((e) => e.id).sort();
    expect(ids.length).toBeGreaterThan(0);
    expect(ids).toContain('llama-server-openai');
  });

  it('should recommend one of the available engines for local node gguf runtime', async () => {
    const manager = createInferenceManager();
    const availableIds = manager.listEngines().map((e) => e.id);
    const selection = await manager.chooseBestEngine({
      runtime: 'node',
      modelPath: path.join(
        process.cwd(),
        'public',
        'agentic-ide',
        'components',
        'models',
        'gemma',
        'gemma4-26b-a4b-q4kxl',
        'gemma-4-26B-A4B-it-UD-Q4_K_XL.gguf'
      ),
    });
    expect(availableIds).toContain(selection.best.engineId);
    expect(Array.isArray(selection.checks)).toBeTruthy();
    expect(selection.checks.length).toBeGreaterThan(0);
  });

  it('should parse gguf header using hyllama metadata parser', () => {
    const fixturePath = path.join(process.cwd(), 'test-results', 'unit', 'tmp-minimal.gguf');
    fs.mkdirSync(path.dirname(fixturePath), { recursive: true });

    const buffer = Buffer.alloc(24);
    buffer.write('GGUF', 0, 'utf8');
    buffer.writeUInt32LE(3, 4);
    buffer.writeBigUInt64LE(7n, 8);
    buffer.writeBigUInt64LE(4n, 16);
    fs.writeFileSync(fixturePath, buffer);

    const header = readGgufHeader(fixturePath);
    expect(header.magic).toBe('GGUF');
    expect(header.version).toBe(3);
    expect(header.tensorCount).toBe(7);
    expect(header.metadataKvCount).toBe(4);
  });

  it('should return compatibility ranking even without live endpoint', async () => {
    const manager = createInferenceManager();
    const availableIds = manager.listEngines().map((e) => e.id);
    const result = await manager.chooseBestEngine({
      runtime: 'node',
      modelPath: path.join(process.cwd(), 'missing-model.gguf'),
      llmEndpoint: 'http://127.0.0.1:65535',
    });

    expect(availableIds).toContain(result.best.engineId);
    expect(Array.isArray(result.checks)).toBeTruthy();
    expect(result.checks.length).toBe(availableIds.length);
    expect(result.recommendation.reason).toContain('Best compatibility');
  });
});
