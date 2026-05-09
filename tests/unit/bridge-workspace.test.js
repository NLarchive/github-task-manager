const path = require('path');
const { discoverWorkspace, runComponent, runComponentTests } = require('../../public/agentic-ide/js/bridge-workspace');

const ROOT = path.resolve(__dirname, '../../public/agentic-ide');

describe('agentic bridge workspace', () => {
  it('discovers JSON components, models, and file nodes', async () => {
    const graph = await discoverWorkspace(ROOT);

    expect(graph.rootId).toBe('root');
    expect(Object.keys(graph.nodes).length).toBeGreaterThan(10);

    const searchAgent = graph.nodes.search_agent;
    expect(searchAgent).toBeTruthy();
    expect(searchAgent.type).toBe('agent');

    const componentFileNode = Object.values(graph.nodes).find((node) =>
      node.parent === 'search_agent' && node.meta && node.meta.relative_file === 'component.json'
    );
    expect(componentFileNode).toBeTruthy();
    expect(componentFileNode.type).toBe('file');

    const runtimeFileNode = Object.values(graph.nodes).find((node) =>
      node.parent === 'web_search_tool' && node.meta && node.meta.relative_file === 'main.js'
    );
    expect(runtimeFileNode).toBeTruthy();
    expect(Array.isArray(runtimeFileNode.meta.symbols)).toBeTruthy();
    expect(runtimeFileNode.meta.symbols.length).toBeGreaterThan(0);

    const modelNode = graph.models.find((model) => model.id === 'gemma_model');
    expect(modelNode).toBeTruthy();
  });

  it('nests benchmark workflow children during discovery', async () => {
    const graph = await discoverWorkspace(ROOT);

    const benchmarkNode = graph.nodes.research_benchmark;
    expect(benchmarkNode).toBeTruthy();
    expect(benchmarkNode.type).toBe('benchmark');
    expect(benchmarkNode.children).toContain('research_benchmark_runner');
    expect(benchmarkNode.children).toContain('benchmark_result_writer');
  });

  it('runs declared workflow tests with mocked fetch and llm responses', async () => {
    const result = await runComponentTests(ROOT, 'research_workflow');

    expect(result.ok).toBeTruthy();
    expect(result.total).toBeGreaterThan(0);
    expect(result.passed).toBe(result.total);
  });

  it('returns executed node fingerprints for runtime runs', async () => {
    const result = await runComponent(ROOT, 'format_tool', {
      html: '<article><h1>Hello</h1><p>World</p></article>'
    });

    expect(result.ok).toBeTruthy();
    expect(Array.isArray(result.steps)).toBeTruthy();
    expect(result.steps.length).toBeGreaterThan(0);
    expect(Array.isArray(result.executedNodes)).toBeTruthy();
    expect(result.executedNodes.length).toBeGreaterThan(0);
    expect(result.runFingerprint).toMatch(/^[a-f0-9]{40}$/);

    const htmlParser = result.executedNodes.find((node) => node.nodeId === 'html_parser');
    expect(htmlParser).toBeTruthy();
    expect(htmlParser.runtime_signature).toMatch(/^[a-f0-9]{40}$/);
    expect(htmlParser.component_signature).toMatch(/^[a-f0-9]{40}$/);
    expect(Array.isArray(htmlParser.file_hashes)).toBeTruthy();
  });

  it('runs benchmark result writer component tests', async () => {
    const result = await runComponentTests(ROOT, 'benchmark_result_writer');

    expect(result.ok).toBeTruthy();
    expect(result.total).toBeGreaterThan(0);
    expect(result.passed).toBe(result.total);
  });
});