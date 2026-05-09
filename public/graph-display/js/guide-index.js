import {
    GRAPH_COMPONENT_INPUT_SCHEMA,
    GRAPH_HOST_FEATURES,
    GRAPH_RELATION_GUIDE,
    GRAPH_SEMANTICS_GUIDE,
    GRAPH_UI_CONFIG_SCHEMA
} from './shared/graph-design-contract.js';
import { escapeHtml } from './shared/project-graph-utils.js';

const LAYER_COLORS = Object.freeze({
    0: '#183a60',
    1: '#1d5fa7',
    2: '#d17f1f',
    3: '#4d8f4b',
    4: '#8d6b3f'
});

const PRIORITY_COLORS = Object.freeze({
    Critical: '#b42318',
    High: '#c86b1f',
    Medium: '#1d5fa7',
    Low: '#4d8f4b'
});

const RELATION_COLORS = Object.freeze({
    HAS_TASK: '#183a60',
    DEPENDS_FS: '#b42318',
    HAS_SUBCATEGORY: '#8d6b3f',
    DEVELOPS: '#1d5fa7',
    LEADS_TO: '#4d8f4b'
});

const GUIDE_NODES = [
    { id: 'project-start', label: 'Project Start', layer: 0, priority: 'Low', estimatedHours: 1, nodeType: 'project-start' },
    { id: 'discover', label: 'Discover', layer: 1, priority: 'Medium', estimatedHours: 4, nodeType: 'task' },
    { id: 'build-core', label: 'Build Core', layer: 2, priority: 'High', estimatedHours: 10, nodeType: 'task' },
    { id: 'qa-inline', label: 'Inline QA', layer: 2, priority: 'Medium', estimatedHours: 2, nodeType: 'inline-subgraph', subgraphType: 'inline' },
    { id: 'billing-module', label: 'Billing Module', layer: 3, priority: 'Critical', estimatedHours: 8, nodeType: 'module', subgraphType: 'module', isCriticalPath: true },
    { id: 'launch', label: 'Launch', layer: 4, priority: 'Critical', estimatedHours: 6, nodeType: 'task', isCriticalPath: true }
];

const GUIDE_LINKS = [
    { source: 'project-start', target: 'discover', type: 'HAS_TASK' },
    { source: 'discover', target: 'build-core', type: 'DEPENDS_FS' },
    { source: 'build-core', target: 'qa-inline', type: 'HAS_SUBCATEGORY' },
    { source: 'build-core', target: 'billing-module', type: 'DEVELOPS' },
    { source: 'billing-module', target: 'launch', type: 'LEADS_TO' }
];

const GUIDE_POSITIONS = Object.freeze({
    'project-start': { x: 90, y: 220 },
    discover: { x: 245, y: 140 },
    'build-core': { x: 420, y: 220 },
    'qa-inline': { x: 420, y: 340 },
    'billing-module': { x: 640, y: 140 },
    launch: { x: 820, y: 220 }
});

const FEATURE_DEFINITIONS = {
    nodes: {
        title: 'Nodes',
        description: 'Every renderable graph starts with nodes. The contract expects each node to provide a stable id, a visible label, and then optional fields such as layer, priority, estimated hours, or templateType depending on the graph style.',
        cards: [
            { title: 'Required core', body: 'At minimum, author id and label so the graph can position, connect, and describe the node.' },
            { title: 'Useful authoring fields', body: 'layer, type, templateType, priority, estimatedHours, status, and task_id shape layout, coloring, sizing, and popup context.' },
            { title: 'Detail records', body: 'Pair nodes with details keyed by node id so clicks can open a richer popup or inspector view.' }
        ],
        preview: () => ({
            graphNode: GRAPH_COMPONENT_INPUT_SCHEMA.graphNode,
            nodeDetails: GRAPH_COMPONENT_INPUT_SCHEMA.nodeDetails || GRAPH_COMPONENT_INPUT_SCHEMA.graphNodeDetails
        })
    },
    sizes: {
        title: 'Node Sizes',
        description: 'Node radius can stay fixed for a clean conceptual map, or scale by estimated hours or another metric. The guide graph switches to a size-by-effort view here so the difference is visible immediately.',
        cards: [
            { title: 'Fixed mode', body: 'Use nodeSizes.main and nodeSizes.sub for stable radii across the graph.' },
            { title: 'Hours mode', body: 'Use taskSizing when task effort should be legible on the graph itself.' },
            { title: 'Metric mode', body: 'The contract also supports metricSizing for arbitrary numeric fields such as content volume or structural complexity.' }
        ],
        preview: () => ({
            sizeMode: GRAPH_UI_CONFIG_SCHEMA.sizeMode,
            nodeSizes: GRAPH_UI_CONFIG_SCHEMA.nodeSizes,
            taskSizing: GRAPH_UI_CONFIG_SCHEMA.taskSizing,
            metricSizing: GRAPH_UI_CONFIG_SCHEMA.metricSizing
        })
    },
    colors: {
        title: 'Node Colors',
        description: 'Color can tell the story of graph layers, task priority, or category metrics. This demo switches to priority colors so you can see the same nodes gain meaning without changing the graph structure.',
        cards: [
            { title: 'Layer colors', body: GRAPH_SEMANTICS_GUIDE.nodeColoring.layer },
            { title: 'Priority colors', body: GRAPH_SEMANTICS_GUIDE.nodeColoring.priority },
            { title: 'Metric colors', body: 'Use metricColoring when color should mean categories such as content type, team, or custom semantic buckets.' }
        ],
        preview: () => ({
            colorMode: GRAPH_UI_CONFIG_SCHEMA.colorMode,
            baseLayerColorsHex: GRAPH_UI_CONFIG_SCHEMA.baseLayerColorsHex,
            priorityColorsHex: GRAPH_UI_CONFIG_SCHEMA.priorityColorsHex,
            metricColoring: GRAPH_UI_CONFIG_SCHEMA.metricColoring
        })
    },
    relations: {
        title: 'Edges and Relations',
        description: 'Edges are more than lines. Relation types encode how nodes depend on, create, or group into each other. The runtime uses these labels for force tuning, legend copy, and downstream explanation.',
        cards: [
            { title: 'Structural edges', body: 'HAS_TASK and HAS_SUBCATEGORY hold a project or category structure together.' },
            { title: 'Flow edges', body: 'Dependency and progression links tell the graph what must happen before, after, or alongside another node.' },
            { title: 'Relation guide', body: 'The shared relation guide is the stable place to explain edge meaning for another host application.' }
        ],
        preview: () => GRAPH_RELATION_GUIDE
    },
    subgraphs: {
        title: 'Subgraphs and Subcomponents',
        description: 'Subgraphs are modeled intentionally instead of inferred from layout alone. Inline subtasks, full child tasks, and module navigation solve different problems and should be authored differently.',
        cards: [
            { title: 'Inline subtasks', body: GRAPH_SEMANTICS_GUIDE.subgraphs.inline },
            { title: 'Child tasks', body: GRAPH_SEMANTICS_GUIDE.subgraphs.parentChild },
            { title: 'Modules', body: GRAPH_SEMANTICS_GUIDE.subgraphs.modules }
        ],
        preview: () => ({
            subgraphs: GRAPH_SEMANTICS_GUIDE.subgraphs,
            taskDbTask: GRAPH_COMPONENT_INPUT_SCHEMA.taskDbTask,
            templateMeta: GRAPH_COMPONENT_INPUT_SCHEMA.templateMeta || GRAPH_COMPONENT_INPUT_SCHEMA.graphTemplateMeta
        })
    },
    critical: {
        title: 'Critical Path',
        description: 'Critical path is node metadata rather than a special edge. That keeps the underlying dependency graph stable while still letting the UI, exports, or host app draw attention to deadline-critical work.',
        cards: [
            { title: 'Source field', body: `${GRAPH_SEMANTICS_GUIDE.criticalPath.field} is the canonical task flag.` },
            { title: 'What it drives', body: 'Hosts can use the preserved flag for filtering, special legends, calendar exports, or urgency styling.' },
            { title: 'Why nodes, not edges', body: 'A critical path can be explained without inventing a separate edge system that fragments the dependency model.' }
        ],
        preview: () => ({
            criticalPath: GRAPH_SEMANTICS_GUIDE.criticalPath,
            taskDbTask: GRAPH_COMPONENT_INPUT_SCHEMA.taskDbTask?.optionalFields?.is_critical_path || GRAPH_COMPONENT_INPUT_SCHEMA.taskDbTask
        })
    },
    schemas: {
        title: 'Schemas and Host Features',
        description: 'The machine-readable schema files validate payload shape, while the contract file explains how the runtime consumes those payloads and which browser features are optional when the folder is copied elsewhere.',
        cards: [
            { title: 'Schema files', body: 'graph-ui-config.schema.json validates config overrides, while graph-template.schema.json validates direct template payloads.' },
            { title: 'Runtime contract', body: 'graph-design-contract.js stays human-readable and host-friendly, exporting the same defaults and guides the UI uses.' },
            { title: 'Optional host integrations', body: 'Folder picker, calendar export, and clipboard helpers are listed explicitly so another host can remove or replace them cleanly.' }
        ],
        preview: () => ({
            hostFeatures: GRAPH_HOST_FEATURES,
            uiConfigKeys: Object.keys(GRAPH_UI_CONFIG_SCHEMA),
            inputSchemaKeys: Object.keys(GRAPH_COMPONENT_INPUT_SCHEMA)
        })
    }
};

const dom = {};
let activeFeatureId = 'nodes';

document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    renderFeatureButtons();
    renderContractSummary();
    activateFeature('nodes');
});

function cacheDom() {
    dom.featureSelector = document.getElementById('feature-selector');
    dom.featureCopy = document.getElementById('feature-copy');
    dom.featureTitle = document.getElementById('feature-title');
    dom.featureDescription = document.getElementById('feature-description');
    dom.guideGraph = document.getElementById('guide-graph');
    dom.guideLegend = document.getElementById('guide-legend');
    dom.contractSummary = document.getElementById('contract-summary');
    dom.jsonPreview = document.getElementById('guide-json-preview');
}

function activateFeature(featureId) {
    activeFeatureId = featureId;
    renderFeatureButtons();
    renderFeatureCopy();
    renderGuideGraph();
    renderPreview();
}

function renderFeatureButtons() {
    dom.featureSelector.innerHTML = Object.entries(FEATURE_DEFINITIONS).map(([featureId, feature]) => `
        <button type="button" class="feature-button ${featureId === activeFeatureId ? 'active' : ''}" data-feature="${featureId}">
            ${escapeHtml(feature.title)}
        </button>
    `).join('');

    dom.featureSelector.querySelectorAll('[data-feature]').forEach((button) => {
        button.addEventListener('click', () => activateFeature(button.dataset.feature));
    });
}

function renderFeatureCopy() {
    const feature = FEATURE_DEFINITIONS[activeFeatureId];
    dom.featureTitle.textContent = feature.title;
    dom.featureDescription.textContent = feature.description;
    dom.featureCopy.innerHTML = feature.cards.map((card) => `
        <article class="feature-card">
            <strong>${escapeHtml(card.title)}</strong>
            <span>${escapeHtml(card.body)}</span>
        </article>
    `).join('');
}

function renderContractSummary() {
    const summaryCards = [
        { value: Object.keys(GRAPH_UI_CONFIG_SCHEMA).length, label: 'config keys documented' },
        { value: Object.keys(GRAPH_COMPONENT_INPUT_SCHEMA).length, label: 'input shapes explained' },
        { value: Object.keys(GRAPH_RELATION_GUIDE).length, label: 'relation semantics exported' },
        { value: Object.keys(GRAPH_HOST_FEATURES.optionalGlobals || {}).length, label: 'optional host integrations' }
    ];

    dom.contractSummary.innerHTML = summaryCards.map((card) => `
        <div class="summary-card">
            <strong>${card.value}</strong>
            <span>${escapeHtml(card.label)}</span>
        </div>
    `).join('');
}

function renderPreview() {
    const feature = FEATURE_DEFINITIONS[activeFeatureId];
    dom.jsonPreview.textContent = JSON.stringify(feature.preview(), null, 2);
}

function getFeatureNodeRadius(node) {
    if (activeFeatureId === 'sizes') {
        const minHours = 1;
        const maxHours = 10;
        const normalized = (Math.max(node.estimatedHours, minHours) - minHours) / (maxHours - minHours || 1);
        return 18 + normalized * 20;
    }
    return node.id === 'project-start' ? 32 : 24;
}

function getFeatureNodeFill(node) {
    if (activeFeatureId === 'colors' || activeFeatureId === 'critical') {
        return PRIORITY_COLORS[node.priority] || '#64748b';
    }
    return LAYER_COLORS[node.layer] || '#64748b';
}

function getFeatureLinkStroke(link) {
    if (activeFeatureId === 'relations') {
        return RELATION_COLORS[link.type] || '#64748b';
    }
    return 'rgba(24, 58, 96, 0.32)';
}

function renderGuideLegend() {
    let legendItems;
    if (activeFeatureId === 'colors' || activeFeatureId === 'critical') {
        legendItems = Object.entries(PRIORITY_COLORS).map(([label, color]) => ({ label, color }));
    } else if (activeFeatureId === 'relations') {
        legendItems = GUIDE_LINKS.map((link) => ({ label: link.type, color: RELATION_COLORS[link.type] || '#64748b' }));
    } else {
        legendItems = Object.entries(LAYER_COLORS).map(([layer, color]) => ({ label: `Layer ${layer}`, color }));
    }

    const deduped = [];
    const seen = new Set();
    legendItems.forEach((item) => {
        if (seen.has(item.label)) return;
        seen.add(item.label);
        deduped.push(item);
    });

    dom.guideLegend.innerHTML = deduped.map((item) => `
        <span class="guide-legend-chip">
            <span class="guide-legend-swatch" style="background:${item.color}"></span>
            <span>${escapeHtml(item.label)}</span>
        </span>
    `).join('');
}

function renderGuideGraph() {
    const d3Api = window.d3;
    if (!d3Api) return;

    dom.guideGraph.innerHTML = '';
    const svg = d3Api.select(dom.guideGraph)
        .append('svg')
        .attr('viewBox', '0 0 920 440')
        .attr('role', 'img')
        .attr('aria-label', `Guide graph demo for ${FEATURE_DEFINITIONS[activeFeatureId].title}`);

    const defs = svg.append('defs');
    defs.append('marker')
        .attr('id', 'guide-arrow')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 9)
        .attr('refY', 5)
        .attr('markerWidth', 7)
        .attr('markerHeight', 7)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', '#64748b');

    const nodes = GUIDE_NODES.map((node) => ({
        ...node,
        ...GUIDE_POSITIONS[node.id],
        radius: getFeatureNodeRadius(node)
    }));

    const byId = new Map(nodes.map((node) => [node.id, node]));
    const links = GUIDE_LINKS.map((link) => ({
        ...link,
        sourceNode: byId.get(link.source),
        targetNode: byId.get(link.target)
    }));

    svg.append('g')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('class', 'guide-link')
        .attr('x1', (link) => link.sourceNode.x)
        .attr('y1', (link) => link.sourceNode.y)
        .attr('x2', (link) => link.targetNode.x)
        .attr('y2', (link) => link.targetNode.y)
        .attr('stroke', (link) => getFeatureLinkStroke(link))
        .attr('marker-end', 'url(#guide-arrow)')
        .attr('stroke-dasharray', (link) => activeFeatureId === 'relations' && link.type === 'HAS_SUBCATEGORY' ? '8 7' : null);

    if (activeFeatureId === 'relations') {
        svg.append('g')
            .selectAll('text')
            .data(links)
            .join('text')
            .attr('class', 'guide-link-label')
            .attr('x', (link) => (link.sourceNode.x + link.targetNode.x) / 2)
            .attr('y', (link) => (link.sourceNode.y + link.targetNode.y) / 2 - 10)
            .text((link) => link.type);
    }

    const nodeGroups = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('transform', (node) => `translate(${node.x}, ${node.y})`);

    nodeGroups.append('circle')
        .attr('r', (node) => node.radius)
        .attr('fill', (node) => getFeatureNodeFill(node))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 3);

    if (activeFeatureId === 'subgraphs') {
        nodeGroups.filter((node) => node.subgraphType)
            .append('circle')
            .attr('r', (node) => node.radius + 8)
            .attr('fill', 'none')
            .attr('stroke', '#102033')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '7 6');
    }

    if (activeFeatureId === 'critical') {
        nodeGroups.filter((node) => node.isCriticalPath)
            .append('circle')
            .attr('r', (node) => node.radius + 10)
            .attr('fill', 'none')
            .attr('stroke', '#b42318')
            .attr('stroke-width', 3);
    }

    nodeGroups.append('text')
        .attr('class', 'guide-node-label')
        .attr('y', 4)
        .text((node) => node.label);

    nodeGroups.append('text')
        .attr('class', 'guide-node-meta')
        .attr('y', (node) => node.radius + 20)
        .text((node) => {
            if (activeFeatureId === 'sizes') return `${node.estimatedHours}h`;
            if (activeFeatureId === 'subgraphs' && node.subgraphType) return node.subgraphType;
            if (activeFeatureId === 'critical' && node.isCriticalPath) return 'critical';
            if (activeFeatureId === 'colors' || activeFeatureId === 'critical') return node.priority;
            return `layer ${node.layer}`;
        });

    nodeGroups.append('title').text((node) => `${node.label}\npriority: ${node.priority}\nestimatedHours: ${node.estimatedHours}`);

    renderGuideLegend();
}