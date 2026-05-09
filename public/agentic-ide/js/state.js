import { structuredCloneSafe } from './utils.js';

function createRootNode() {
  return {
    id: 'root',
    type: 'workflow',
    label: 'agentic_ide_workspace',
    path: '',
    desc: 'Workspace root for discovered agentic components',
    version: 1,
    inputs: [],
    outputs: [],
    files: [],
    tests: [],
    children: [],
    edgeIds: [],
    meta: { lifecycle: 'draft', success_threshold: '1.00' },
    parent: null,
    x: 0,
    y: 0,
    w: 180,
    h: 44
  };
}

function createEmptyGraph() {
  return {
    rootId: 'root',
    nodes: { root: createRootNode() },
    edges: {},
    models: [],
    warnings: []
  };
}

function createDefaultChatState() {
  return {
    preset: 'clean',
    systemPrompt: '',
    includeHistory: false,
    includeRuntime: true,
    selectedNodeIds: [],
    targetNodeId: null,
    saveFilename: 'chat-output.md'
  };
}

function cloneGraph(graph) {
  return structuredCloneSafe(graph || createEmptyGraph());
}

function readPersistedState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildCrumbs(scopeId, nodes) {
  const chain = [];
  let current = nodes[scopeId];
  while (current) {
    chain.push(current.id);
    current = current.parent ? nodes[current.parent] : null;
  }
  return chain.reverse();
}

export const STORE_KEY = 'agentic-graph-v2';

const emptyGraph = createEmptyGraph();

export const S = {
  nodes: cloneGraph(emptyGraph).nodes,
  edges: cloneGraph(emptyGraph).edges,
  scope: 'root',
  crumbs: ['root'],
  sel: null,
  selType: null,
  selFile: null,
  btab: 'json',
  editNodeId: null,
  fileContents: {},
  persistedState: null,
  graphSnapshot: cloneGraph(emptyGraph),
  availableModels: [],
  selectedModelId: null,
  registryWarnings: [],
  runtimeReports: [],
  bridgeStatus: { bridge: false, llm: false, ggufExists: false },
  issueCache: [],
  layout: {
    sidebarWidth: 200,
    inspectorWidth: 260,
    bottomHeight: 190
  },
  chat: createDefaultChatState(),
  chatHistory: []
};

export function loadState() {
  const saved = readPersistedState();
  S.persistedState = saved;
  if (saved?.ui?.btab) S.btab = saved.ui.btab;
  if (saved?.ui?.selectedModelId) S.selectedModelId = saved.ui.selectedModelId;
  if (saved?.ui?.chat) {
    S.chat = {
      ...createDefaultChatState(),
      ...saved.ui.chat,
      selectedNodeIds: Array.isArray(saved.ui.chat.selectedNodeIds) ? [...saved.ui.chat.selectedNodeIds] : [],
    };
  }
  if (saved?.ui?.layout) {
    S.layout = {
      ...S.layout,
      ...saved.ui.layout
    };
  }
}

export function saveState() {
  try {
    const nodes = {};
    Object.values(S.nodes).forEach((node) => {
      nodes[node.id] = {
        x: node.x,
        y: node.y,
        w: node.w,
        h: node.h
      };
    });
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        nodes,
        ui: {
          btab: S.btab,
          selectedModelId: S.selectedModelId,
          chat: {
            ...S.chat,
            selectedNodeIds: [...(S.chat.selectedNodeIds || [])]
          },
          layout: { ...S.layout }
        }
      })
    );
    S.persistedState = readPersistedState();
  } catch {}
}

export function applyRegistryGraph(graph) {
  const incoming = cloneGraph(graph);
  const savedNodes = S.persistedState?.nodes || {};
  const mergedNodes = {};

  Object.values(incoming.nodes || {}).forEach((node) => {
    const savedNode = savedNodes[node.id] || {};
    mergedNodes[node.id] = {
      ...node,
      x: savedNode.x ?? node.x,
      y: savedNode.y ?? node.y,
      w: savedNode.w ?? node.w,
      h: savedNode.h ?? node.h
    };
  });

  const rootId = incoming.rootId || 'root';
  const nextScope = mergedNodes[S.scope] ? S.scope : rootId;

  S.nodes = mergedNodes;
  S.edges = structuredCloneSafe(incoming.edges || {});
  S.graphSnapshot = incoming;
  S.availableModels = structuredCloneSafe(incoming.models || []);
  S.registryWarnings = [...(incoming.warnings || [])];
  if (!S.selectedModelId || !S.availableModels.some((model) => model.id === S.selectedModelId)) {
    S.selectedModelId = S.availableModels[0]?.id || null;
  }
  S.scope = nextScope;
  S.crumbs = buildCrumbs(nextScope, S.nodes);
  if (S.sel && !S.nodes[S.sel] && !S.edges[S.sel]) {
    S.sel = null;
    S.selType = null;
    S.selFile = null;
  }
}

export function setBridgeStatus(status) {
  S.bridgeStatus = {
    bridge: !!status?.bridge,
    llm: !!status?.llm,
    ggufExists: !!status?.ggufExists,
    models: Array.isArray(status?.models) ? structuredCloneSafe(status.models) : []
  };
}

export function addRuntimeReport(report) {
  S.runtimeReports.unshift({
    id: `report_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    ...structuredCloneSafe(report)
  });
  S.runtimeReports = S.runtimeReports.slice(0, 20);
}

export function clearRuntimeReports() {
  S.runtimeReports = [];
}

export function addChatMessage(message) {
  S.chatHistory.push({
    id: `chat_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    ...structuredCloneSafe(message)
  });
  S.chatHistory = S.chatHistory.slice(-40);
}

export function clearChatHistory() {
  S.chatHistory = [];
}

export function clearState(renderAll, forceBlank = false) {
  localStorage.removeItem(STORE_KEY);
  S.persistedState = null;
  S.fileContents = {};
  S.runtimeReports = [];
  S.chat = createDefaultChatState();
  S.chatHistory = [];
  if (S.graphSnapshot && !forceBlank) {
    applyRegistryGraph(S.graphSnapshot);
  } else {
    const empty = createEmptyGraph();
    S.nodes = empty.nodes;
    S.edges = empty.edges;
    S.scope = empty.rootId;
    S.crumbs = [empty.rootId];
    S.graphSnapshot = empty;
  }
  if (typeof renderAll === 'function') renderAll();
}
