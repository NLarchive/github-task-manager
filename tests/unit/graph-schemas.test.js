/**
 * Unit tests for the machine-readable graph schema snapshots.
 */

const fs = require('fs');
const path = require('path');

describe('Graph JSON Schemas', () => {
  it('publishes metric-capable UI config schema', () => {
    const schemaPath = path.join(__dirname, '../../public/graph-display/schema/graph-ui-config.schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

    expect(schema.properties.colorMode.enum).toContain('metric');
    expect(schema.properties.sizeMode.enum).toContain('metric');
    expect(schema.properties.metricSizing.properties.scale.enum).toContain('sqrt');
  });

  it('publishes a direct template schema with metrics and config refs', () => {
    const schemaPath = path.join(__dirname, '../../public/graph-display/schema/graph-template.schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

    expect(schema.required).toContain('nodes');
    expect(schema.$defs.graphNode.properties.metrics.type).toBe('object');
    expect(schema.properties.configOverrides.$ref).toBe('./graph-ui-config.schema.json');
  });
});
