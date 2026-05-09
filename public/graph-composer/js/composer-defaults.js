import { COMMON_LINK_TYPES, TASK_LINK_TYPES } from '../../graph-display/js/shared/link-types.js';
import { GRAPH_COMPONENT_EXAMPLES, createGraphUiConfig } from '../../graph-display/js/shared/graph-design-contract.js';

export function deepClone(value) {
  if (Array.isArray(value)) return value.map(deepClone);
  if (!value || typeof value !== 'object') return value;

  const copy = {};
  Object.keys(value).forEach((key) => {
    copy[key] = deepClone(value[key]);
  });
  return copy;
}

export const GRAPH_LINK_TYPE_OPTIONS = Object.freeze([
  COMMON_LINK_TYPES.HAS_FOUNDATION,
  COMMON_LINK_TYPES.HAS_SUBCATEGORY,
  COMMON_LINK_TYPES.DEVELOPS,
  COMMON_LINK_TYPES.CREATES,
  COMMON_LINK_TYPES.LEADS_TO,
  TASK_LINK_TYPES.HAS_TASK,
  'DEPENDS_FS',
  'DEPENDS_SS',
  'DEPENDS_FF',
  'DEPENDS_SF',
  'DEPENDS_ON'
]);

export const GRAPH_MEASUREMENT_PRESETS = Object.freeze([
  {
    id: 'hours-priority',
    label: 'Hours / Priority',
    description: 'Use estimated hours for size and task priority for color.',
    configOverrides: {
      colorMode: 'priority',
      sizeMode: 'hours'
    }
  },
  {
    id: 'content-category',
    label: 'Content / Category',
    description: 'Measure nodes by content size and color them by authored category.',
    configOverrides: {
      colorMode: 'metric',
      sizeMode: 'metric',
      metricSizing: {
        field: 'metrics.contentSize',
        label: 'Content size',
        minValue: 0,
        maxValue: 500,
        minRadius: 16,
        maxRadius: 56,
        scale: 'sqrt'
      },
      metricColoring: {
        field: 'metrics.category',
        label: 'Category',
        fallbackKey: 'default',
        palette: {
          default: '#94a3b8',
          research: '#0f766e',
          design: '#ea580c',
          engineering: '#2563eb',
          delivery: '#dc2626'
        }
      }
    }
  },
  {
    id: 'substructure-type',
    label: 'Substructure / Type',
    description: 'Measure nodes by substructure count and color them by node type.',
    configOverrides: {
      colorMode: 'metric',
      sizeMode: 'metric',
      metricSizing: {
        field: 'metrics.substructureSize',
        label: 'Substructure size',
        minValue: 0,
        maxValue: 24,
        minRadius: 14,
        maxRadius: 60,
        scale: 'linear'
      },
      metricColoring: {
        field: 'metrics.nodeType',
        label: 'Node type',
        fallbackKey: 'default',
        palette: {
          default: '#94a3b8',
          folder: '#1d4ed8',
          file: '#c2410c',
          note: '#15803d',
          system: '#7c3aed'
        }
      }
    }
  }
]);

export function getMeasurementPresetById(presetId) {
  return GRAPH_MEASUREMENT_PRESETS.find((preset) => preset.id === presetId) || GRAPH_MEASUREMENT_PRESETS[0];
}

export function createBlankNode(index = 1) {
  return {
    id: `node-${index}`,
    label: `Node ${index}`,
    type: 'parent',
    layer: 0,
    parentId: '',
    templateType: 'custom-node',
    priority: 'Medium',
    status: 'Not Started',
    estimatedHours: 0,
    metrics: {
      contentSize: 0,
      substructureSize: 0,
      category: 'default',
      nodeType: 'folder'
    }
  };
}

export function createBlankNodeDetails(label = 'Node') {
  return {
    title: label,
    items: ['Describe what this node represents.']
  };
}

export function createBlankLink(nodes = []) {
  const sourceId = nodes[0]?.id || 'node-1';
  const targetId = nodes[1]?.id || nodes[0]?.id || 'node-1';
  return {
    source: sourceId,
    target: targetId,
    type: 'DEPENDS_FS',
    weight: 1
  };
}

export function createBlankTemplate() {
  const preset = getMeasurementPresetById('content-category');
  const root = {
    id: 'graph-root',
    label: 'Graph Root',
    type: 'parent',
    layer: 0,
    templateType: 'root',
    priority: 'High',
    status: 'In Progress',
    estimatedHours: 4,
    metrics: {
      contentSize: 120,
      substructureSize: 3,
      category: 'research',
      nodeType: 'folder'
    }
  };
  const branch = {
    id: 'graph-branch',
    label: 'Compose Signals',
    type: 'parent',
    layer: 1,
    templateType: 'phase',
    priority: 'Medium',
    status: 'Not Started',
    estimatedHours: 8,
    metrics: {
      contentSize: 280,
      substructureSize: 7,
      category: 'engineering',
      nodeType: 'file'
    }
  };
  const finish = {
    id: 'graph-finish',
    label: 'Publish Graph',
    type: 'parent',
    layer: 2,
    templateType: 'phase',
    priority: 'Critical',
    status: 'Not Started',
    estimatedHours: 12,
    metrics: {
      contentSize: 420,
      substructureSize: 11,
      category: 'delivery',
      nodeType: 'system'
    }
  };

  return {
    id: 'custom-graph',
    name: 'Custom Graph',
    description: 'Metric-driven graph template created in Graph Composer.',
    nodes: [root, branch, finish],
    links: [
      { source: root.id, target: branch.id, type: TASK_LINK_TYPES.HAS_TASK },
      { source: branch.id, target: finish.id, type: 'DEPENDS_FS' }
    ],
    details: {
      [root.id]: createBlankNodeDetails(root.label),
      [branch.id]: createBlankNodeDetails(branch.label),
      [finish.id]: createBlankNodeDetails(finish.label)
    },
    meta: {
      profileNodeId: root.id,
      coreNodeId: finish.id,
      legendMode: 'custom'
    },
    configOverrides: createGraphUiConfig(preset.configOverrides)
  };
}

export function createTemplateFromExample() {
  const template = deepClone(GRAPH_COMPONENT_EXAMPLES.directTemplate);
  template.id = 'example-graph';
  template.name = 'Example Graph';
  template.description = 'Example payload loaded into Graph Composer.';
  template.configOverrides = createGraphUiConfig(template.configOverrides || {});
  return template;
}
