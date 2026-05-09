/**
 * Unit tests for the reusable graph-display contract surface.
 */

const fs = require('fs');
const path = require('path');

function loadGraphDesignContractModule() {
  const filePath = path.join(__dirname, '../../public/graph-display/js/shared/graph-design-contract.js');
  let src = fs.readFileSync(filePath, 'utf8');
  src = src.replace(/^export\s+/mg, '');

  const fn = new Function(
    'globalThis',
    'console',
    src + '\nreturn { GRAPH_UI_DEFAULTS, GRAPH_UI_CONFIG_SCHEMA, GRAPH_COMPONENT_INPUT_SCHEMA, GRAPH_COMPONENT_CONTRACT, createGraphUiConfig, validateGraphUiConfig, validateGraphComponentInputs, getGraphComponentContract };'
  );

  return fn({}, console);
}

describe('Graph Design Contract', () => {
  it('exposes defaults, schema, and contract helpers', () => {
    const mod = loadGraphDesignContractModule();

    expect(mod.GRAPH_UI_DEFAULTS.colorMode).toBe('layer');
    expect(mod.GRAPH_UI_DEFAULTS.metricSizing.scale).toBe('sqrt');
    expect(mod.GRAPH_UI_CONFIG_SCHEMA.colorMode.allowedValues).toContain('priority');
    expect(mod.GRAPH_UI_CONFIG_SCHEMA.colorMode.allowedValues).toContain('metric');
    expect(mod.GRAPH_COMPONENT_INPUT_SCHEMA.directTemplate.fields.nodes.type).toBe('GraphNode[]');
    expect(mod.GRAPH_COMPONENT_INPUT_SCHEMA.graphNode.optionalFields.metrics.type).toBe('object');
    expect(typeof mod.getGraphComponentContract).toBe('function');
    expect(mod.getGraphComponentContract()).toBe(mod.GRAPH_COMPONENT_CONTRACT);
  });

  it('creates a sanitized config while preserving valid nested overrides', () => {
    const mod = loadGraphDesignContractModule();
    const config = mod.createGraphUiConfig({
      colorMode: 'priority',
      nodeSizes: { main: 42, sub: 'too-big' },
      forces: { charge: -900 },
      projectName: 'External Host Project'
    });

    expect(config.colorMode).toBe('priority');
    expect(config.nodeSizes.main).toBe(42);
    expect(config.nodeSizes.sub).toBe(mod.GRAPH_UI_DEFAULTS.nodeSizes.sub);
    expect(config.forces.charge).toBe(-900);
    expect(config.projectName).toBe('External Host Project');
  });

  it('reports invalid config values and unknown contract keys', () => {
    const mod = loadGraphDesignContractModule();
    const validation = mod.validateGraphUiConfig({
      colorMode: 'heatmap',
      fallbackColorHex: 'orange',
      madeUpSection: { enabled: true }
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors.some((msg) => msg.includes('colorMode'))).toBeTruthy();
    expect(validation.errors.some((msg) => msg.includes('fallbackColorHex'))).toBeTruthy();
    expect(validation.warnings.some((msg) => msg.includes('madeUpSection'))).toBeTruthy();
  });

  it('validates direct template inputs for host integration', () => {
    const mod = loadGraphDesignContractModule();
    const validation = mod.validateGraphComponentInputs({
      template: {
        id: 'demo',
        name: 'Demo Graph',
        nodes: [{ id: 'task-1', label: 'First Task' }],
        links: [{ source: 'task-1', target: 'task-2', type: 'DEPENDS_FS' }],
        details: { 'task-1': { title: 'First Task' } }
      },
      configOverrides: {
        colorMode: 'priority'
      }
    });

    expect(validation.valid).toBe(true);
  });
});