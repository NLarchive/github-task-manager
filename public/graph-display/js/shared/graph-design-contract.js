/**
 * Reusable design contract for the graph-display component.
 *
 * Keep this file beside the graph UI when copying it into another project.
 * It is the single source of truth for:
 * - runtime graph UI defaults
 * - supported config override keys
 * - direct-template and TaskDB input shapes
 * - graph semantics such as relations, subgraphs, and critical-path metadata
 * - which host integrations are optional instead of core
 */

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cloneValue(value) {
    if (Array.isArray(value)) return value.map(cloneValue);
    if (!isPlainObject(value)) return value;

    const copy = {};
    Object.keys(value).forEach((key) => {
        copy[key] = cloneValue(value[key]);
    });
    return copy;
}

function mergeWithDefaults(defaults, overrides) {
    const merged = cloneValue(defaults);
    if (!isPlainObject(overrides)) return merged;

    Object.keys(overrides).forEach((key) => {
        const overrideValue = overrides[key];

        if (!(key in defaults)) {
            merged[key] = cloneValue(overrideValue);
            return;
        }

        const defaultValue = defaults[key];
        if (isPlainObject(defaultValue) && isPlainObject(overrideValue)) {
            merged[key] = mergeWithDefaults(defaultValue, overrideValue);
            return;
        }

        if (Array.isArray(defaultValue) && Array.isArray(overrideValue)) {
            merged[key] = cloneValue(overrideValue);
            return;
        }

        if (typeof overrideValue === typeof defaultValue) {
            merged[key] = cloneValue(overrideValue);
        }
    });

    return merged;
}

function deepFreeze(value) {
    if (Array.isArray(value)) {
        value.forEach(deepFreeze);
        return Object.freeze(value);
    }

    if (isPlainObject(value)) {
        Object.keys(value).forEach((key) => deepFreeze(value[key]));
        return Object.freeze(value);
    }

    return value;
}

function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

function isHexColor(value) {
    return /^#[0-9a-fA-F]{6}$/.test(String(value || ''));
}

function collectUnknownKeys(defaults, overrides, path, warnings) {
    if (!isPlainObject(defaults) || !isPlainObject(overrides)) return;

    Object.keys(overrides).forEach((key) => {
        const nextPath = path ? `${path}.${key}` : key;
        if (!(key in defaults)) {
            warnings.push(`${nextPath} is not part of the documented graph UI contract.`);
            return;
        }

        if (isPlainObject(defaults[key]) && isPlainObject(overrides[key])) {
            collectUnknownKeys(defaults[key], overrides[key], nextPath, warnings);
        }
    });
}

function validateNumber(value, path, errors, options = {}) {
    if (typeof value === 'undefined') return;
    if (!isFiniteNumber(value)) {
        errors.push(`${path} must be a finite number.`);
        return;
    }

    if (typeof options.min === 'number' && value < options.min) {
        errors.push(`${path} must be >= ${options.min}.`);
    }

    if (typeof options.max === 'number' && value > options.max) {
        errors.push(`${path} must be <= ${options.max}.`);
    }

    if (options.integer && !Number.isInteger(value)) {
        errors.push(`${path} must be an integer.`);
    }
}

const ALLOWED_COLOR_MODES = Object.freeze(['layer', 'priority', 'metric']);
const ALLOWED_SIZE_MODES = Object.freeze(['fixed', 'hours', 'metric']);
const ALLOWED_METRIC_SCALES = Object.freeze(['linear', 'sqrt']);
const ALLOWED_TONE_DIRECTIONS = Object.freeze(['brighter', 'darker']);
const PRIORITY_LEVELS = Object.freeze(['Critical', 'High', 'Medium', 'Low']);
const DEPENDENCY_RELATION_TYPES = Object.freeze(['DEPENDS_FS', 'DEPENDS_SS', 'DEPENDS_FF', 'DEPENDS_SF', 'DEPENDS_ON']);

export const GRAPH_UI_DEFAULTS = deepFreeze({
    nodeSizes: { main: 30, sub: 18 },
    colorMode: 'layer',
    sizeMode: 'fixed',
    priorityColorsHex: {
        Critical: '#d62728',
        High: '#ff7f0e',
        Medium: '#1f77b4',
        Low: '#2ca02c'
    },
    taskSizing: {
        minHours: 2,
        maxHours: 40,
        minRadius: 16,
        maxRadius: 44
    },
    metricSizing: {
        field: 'estimatedHours',
        label: 'Estimated hours',
        minValue: 0,
        maxValue: 40,
        minRadius: 16,
        maxRadius: 44,
        scale: 'sqrt'
    },
    forces: {
        linkDistance: 80,
        linkDistanceSubcategory: 60,
        linkDistanceLayer: 120,
        charge: -700,
        chargeMobileMultiplier: 1.2,
        collidePadding: 12,
        layerStrengthY: 0.95,
        layoutStrengthX: 0.2
    },
    animation: {
        duration: 600,
        focusDelay: 100,
        focusScale: 1.5,
        highlightDuration: 2500
    },
    layout: {
        horizontalPadding: 80,
        verticalPadding: 50,
        boundaryPadding: 10
    },
    tooltip: {
        offsetX: 15,
        offsetY: -20,
        fadeInDuration: 150,
        fadeOutDuration: 100
    },
    popup: {
        closeDelay: 300
    },
    simulation: {
        alphaThreshold: 0.01
    },
    mobileBreakpoint: 768,
    baseLayerColorsHex: {
        0: '#b07aa1',
        1: '#4e79a7',
        2: '#f28e2c',
        3: '#59a14f',
        4: '#9c65ab'
    },
    fallbackColorHex: '#aabbc8',
    metricColoring: {
        field: 'metrics.category',
        label: 'Category',
        fallbackKey: 'default',
        palette: {
            default: '#aabbc8'
        }
    },
    toneGeneration: {
        step: 0.7,
        direction: 'brighter'
    },
    textColorsHex: {
        light: '#f0f0f0',
        dark: '#333333'
    },
    maxColorVariants: 5,
    showStatusVisuals: true
});

export const GRAPH_UI_CONFIG_SCHEMA = deepFreeze({
    colorMode: {
        type: 'string',
        allowedValues: cloneValue(ALLOWED_COLOR_MODES),
        default: GRAPH_UI_DEFAULTS.colorMode,
        description: 'Choose layer coloring, priority coloring, or a custom metric/category palette.'
    },
    sizeMode: {
        type: 'string',
        allowedValues: cloneValue(ALLOWED_SIZE_MODES),
        default: GRAPH_UI_DEFAULTS.sizeMode,
        description: 'Use fixed node sizes, scale task nodes by estimated hours, or scale by any custom numeric metric.'
    },
    nodeSizes: {
        type: 'object',
        description: 'Fallback radii used when sizeMode is fixed.',
        fields: {
            main: { type: 'number', default: GRAPH_UI_DEFAULTS.nodeSizes.main, description: 'Radius for parent or major nodes.' },
            sub: { type: 'number', default: GRAPH_UI_DEFAULTS.nodeSizes.sub, description: 'Radius for child or minor nodes.' }
        }
    },
    priorityColorsHex: {
        type: 'object',
        description: 'Hex colors keyed by task priority.',
        fields: {
            Critical: { type: 'hex-color', default: GRAPH_UI_DEFAULTS.priorityColorsHex.Critical },
            High: { type: 'hex-color', default: GRAPH_UI_DEFAULTS.priorityColorsHex.High },
            Medium: { type: 'hex-color', default: GRAPH_UI_DEFAULTS.priorityColorsHex.Medium },
            Low: { type: 'hex-color', default: GRAPH_UI_DEFAULTS.priorityColorsHex.Low }
        }
    },
    taskSizing: {
        type: 'object',
        description: 'Hours-to-radius mapping used when sizeMode is hours.',
        fields: {
            minHours: { type: 'number', default: GRAPH_UI_DEFAULTS.taskSizing.minHours },
            maxHours: { type: 'number', default: GRAPH_UI_DEFAULTS.taskSizing.maxHours },
            minRadius: { type: 'number', default: GRAPH_UI_DEFAULTS.taskSizing.minRadius },
            maxRadius: { type: 'number', default: GRAPH_UI_DEFAULTS.taskSizing.maxRadius }
        }
    },
    metricSizing: {
        type: 'object',
        description: 'Custom numeric field-to-radius mapping used when sizeMode is metric.',
        fields: {
            field: { type: 'string', default: GRAPH_UI_DEFAULTS.metricSizing.field, description: 'Dot-path to the node field, for example metrics.contentSize.' },
            label: { type: 'string', default: GRAPH_UI_DEFAULTS.metricSizing.label, description: 'Human-readable legend label for the metric.' },
            minValue: { type: 'number', default: GRAPH_UI_DEFAULTS.metricSizing.minValue },
            maxValue: { type: 'number', default: GRAPH_UI_DEFAULTS.metricSizing.maxValue },
            minRadius: { type: 'number', default: GRAPH_UI_DEFAULTS.metricSizing.minRadius },
            maxRadius: { type: 'number', default: GRAPH_UI_DEFAULTS.metricSizing.maxRadius },
            scale: { type: 'string', allowedValues: cloneValue(ALLOWED_METRIC_SCALES), default: GRAPH_UI_DEFAULTS.metricSizing.scale }
        }
    },
    forces: {
        type: 'object',
        description: 'Force-layout tuning knobs for link distance, repulsion, and band cohesion.',
        fields: {
            linkDistance: { type: 'number', default: GRAPH_UI_DEFAULTS.forces.linkDistance },
            linkDistanceSubcategory: { type: 'number', default: GRAPH_UI_DEFAULTS.forces.linkDistanceSubcategory },
            linkDistanceLayer: { type: 'number', default: GRAPH_UI_DEFAULTS.forces.linkDistanceLayer },
            charge: { type: 'number', default: GRAPH_UI_DEFAULTS.forces.charge },
            chargeMobileMultiplier: { type: 'number', default: GRAPH_UI_DEFAULTS.forces.chargeMobileMultiplier },
            collidePadding: { type: 'number', default: GRAPH_UI_DEFAULTS.forces.collidePadding },
            layerStrengthY: { type: 'number', default: GRAPH_UI_DEFAULTS.forces.layerStrengthY },
            layoutStrengthX: { type: 'number', default: GRAPH_UI_DEFAULTS.forces.layoutStrengthX }
        }
    },
    animation: {
        type: 'object',
        description: 'Timing and focus-motion settings.',
        fields: {
            duration: { type: 'number', default: GRAPH_UI_DEFAULTS.animation.duration },
            focusDelay: { type: 'number', default: GRAPH_UI_DEFAULTS.animation.focusDelay },
            focusScale: { type: 'number', default: GRAPH_UI_DEFAULTS.animation.focusScale },
            highlightDuration: { type: 'number', default: GRAPH_UI_DEFAULTS.animation.highlightDuration }
        }
    },
    layout: {
        type: 'object',
        description: 'Outer graph padding and collision boundaries.',
        fields: {
            horizontalPadding: { type: 'number', default: GRAPH_UI_DEFAULTS.layout.horizontalPadding },
            verticalPadding: { type: 'number', default: GRAPH_UI_DEFAULTS.layout.verticalPadding },
            boundaryPadding: { type: 'number', default: GRAPH_UI_DEFAULTS.layout.boundaryPadding }
        }
    },
    tooltip: {
        type: 'object',
        description: 'Tooltip offset and fade timings.',
        fields: {
            offsetX: { type: 'number', default: GRAPH_UI_DEFAULTS.tooltip.offsetX },
            offsetY: { type: 'number', default: GRAPH_UI_DEFAULTS.tooltip.offsetY },
            fadeInDuration: { type: 'number', default: GRAPH_UI_DEFAULTS.tooltip.fadeInDuration },
            fadeOutDuration: { type: 'number', default: GRAPH_UI_DEFAULTS.tooltip.fadeOutDuration }
        }
    },
    popup: {
        type: 'object',
        description: 'Popup timing.',
        fields: {
            closeDelay: { type: 'number', default: GRAPH_UI_DEFAULTS.popup.closeDelay }
        }
    },
    simulation: {
        type: 'object',
        description: 'Stability thresholds for post-layout actions.',
        fields: {
            alphaThreshold: { type: 'number', default: GRAPH_UI_DEFAULTS.simulation.alphaThreshold }
        }
    },
    mobileBreakpoint: {
        type: 'number',
        default: GRAPH_UI_DEFAULTS.mobileBreakpoint,
        description: 'Viewport width below which mobile graph behavior is enabled.'
    },
    baseLayerColorsHex: {
        type: 'object',
        description: 'Hex colors keyed by vertical layer index.',
        fields: {
            0: { type: 'hex-color', default: GRAPH_UI_DEFAULTS.baseLayerColorsHex[0] },
            1: { type: 'hex-color', default: GRAPH_UI_DEFAULTS.baseLayerColorsHex[1] },
            2: { type: 'hex-color', default: GRAPH_UI_DEFAULTS.baseLayerColorsHex[2] },
            3: { type: 'hex-color', default: GRAPH_UI_DEFAULTS.baseLayerColorsHex[3] },
            4: { type: 'hex-color', default: GRAPH_UI_DEFAULTS.baseLayerColorsHex[4] }
        }
    },
    fallbackColorHex: {
        type: 'hex-color',
        default: GRAPH_UI_DEFAULTS.fallbackColorHex,
        description: 'Used when a node color cannot be resolved.'
    },
    metricColoring: {
        type: 'object',
        description: 'Custom category-to-color mapping used when colorMode is metric.',
        fields: {
            field: { type: 'string', default: GRAPH_UI_DEFAULTS.metricColoring.field, description: 'Dot-path to the node field, for example metrics.nodeType.' },
            label: { type: 'string', default: GRAPH_UI_DEFAULTS.metricColoring.label, description: 'Human-readable legend label for the color metric.' },
            fallbackKey: { type: 'string', default: GRAPH_UI_DEFAULTS.metricColoring.fallbackKey, description: 'Palette key used when the metric value has no direct match.' },
            palette: { type: 'object', default: cloneValue(GRAPH_UI_DEFAULTS.metricColoring.palette), description: 'Category/value to hex color map.' }
        }
    },
    toneGeneration: {
        type: 'object',
        description: 'Variant generation for sibling nodes inside the same layer.',
        fields: {
            step: { type: 'number', default: GRAPH_UI_DEFAULTS.toneGeneration.step },
            direction: { type: 'string', allowedValues: cloneValue(ALLOWED_TONE_DIRECTIONS), default: GRAPH_UI_DEFAULTS.toneGeneration.direction }
        }
    },
    textColorsHex: {
        type: 'object',
        description: 'Text colors used when calculating contrast.',
        fields: {
            light: { type: 'hex-color', default: GRAPH_UI_DEFAULTS.textColorsHex.light },
            dark: { type: 'hex-color', default: GRAPH_UI_DEFAULTS.textColorsHex.dark }
        }
    },
    maxColorVariants: {
        type: 'number',
        default: GRAPH_UI_DEFAULTS.maxColorVariants,
        description: 'Maximum number of CSS color-variant classes available per layer.'
    },
    showStatusVisuals: {
        type: 'boolean',
        default: GRAPH_UI_DEFAULTS.showStatusVisuals,
        description: 'Enable status-specific node styling such as done and in-progress states.'
    }
});

export const GRAPH_RELATION_GUIDE = deepFreeze({
    HAS_FOUNDATION: {
        label: 'Foundation link',
        authoredIn: 'rawRelationships',
        description: 'Connects the profile or root node to major foundation nodes in a career-style graph.',
        distanceBucket: 'layer',
        strength: 0.6,
        lineStyle: 'solid'
    },
    HAS_SUBCATEGORY: {
        label: 'Subcategory link',
        authoredIn: 'rawRelationships',
        description: 'Connects a parent domain node to a child capability or item inside the same band.',
        distanceBucket: 'subcategory',
        strength: 0.6,
        lineStyle: 'solid'
    },
    DEVELOPS: {
        label: 'Develops link',
        authoredIn: 'rawRelationships',
        description: 'Represents skill development or upstream growth into the next layer.',
        distanceBucket: 'layer',
        strength: 0.4,
        lineStyle: 'solid'
    },
    CREATES: {
        label: 'Creates link',
        authoredIn: 'rawRelationships',
        description: 'Represents work that creates an impact or output node.',
        distanceBucket: 'layer',
        strength: 0.4,
        lineStyle: 'solid'
    },
    LEADS_TO: {
        label: 'Leads-to link',
        authoredIn: 'rawRelationships',
        description: 'Represents a resulting outcome in a direct graph template.',
        distanceBucket: 'layer',
        strength: 0.4,
        lineStyle: 'solid'
    },
    HAS_TASK: {
        label: 'Project-start link',
        authoredIn: 'derived from TaskDB',
        description: 'Generated from the synthetic project-start node to tasks without predecessors.',
        distanceBucket: 'layer',
        strength: 0.6,
        lineStyle: 'solid'
    },
    DEPENDS_PREFIX: {
        label: 'Dependency link',
        authoredIn: 'tasks[].dependencies[]',
        description: 'Runtime task dependency edge. Supports finish/start and other scheduling relations.',
        acceptedValues: cloneValue(DEPENDENCY_RELATION_TYPES),
        distanceBucket: 'layer',
        strength: 0.6,
        lineStyle: 'solid'
    }
});

export const GRAPH_SEMANTICS_GUIDE = deepFreeze({
    nodeColoring: {
        layer: 'Uses baseLayerColorsHex by vertical layer and generates sibling variants with toneGeneration.',
        priority: 'Uses priorityColorsHex keyed by task priority.',
        metric: 'Uses metricColoring.field and metricColoring.palette so hosts can color nodes by any authored category such as file type, domain, or content class.'
    },
    nodeSizing: {
        fixed: 'Uses nodeSizes.main and nodeSizes.sub.',
        hours: 'Uses taskSizing and a clamped eased mapping of estimated_hours.',
        metric: 'Uses metricSizing.field and metricSizing scale/radius settings so hosts can size nodes by any numeric metric such as content size, complexity, or substructure count.'
    },
    criticalPath: {
        field: 'is_critical_path',
        appliesTo: 'TaskDB task records',
        description: 'Mark critical-path work in the source data. The graph preserves the flag on nodes and related exports even when edge styling stays generic.'
    },
    subgraphs: {
        modules: 'Use navigation.modules[] to expose sibling module graphs in the sidebar.',
        parentChild: 'Use parent_task_id to model child tasks that remain full graph nodes with their own lifecycle.',
        inline: 'Use subtasks[] for nested popup-driven inline subgraphs.',
        syntheticStartEnd: 'The runtime generates project-start and project-end nodes automatically; do not author them in source data.'
    }
});

export const GRAPH_HOST_FEATURES = deepFreeze({
    coreAssets: [
        'css/styles-new.css',
        'js/d3.v7.min.js',
        'js/utils.js',
        'js/main-graph.js',
        'js/graph-data.js',
        'js/walkthrough.js',
        'js/cv-generator.js',
        'js/shared/link-types.js',
        'js/shared/tours.js',
        'js/shared/graph-design-contract.js'
    ],
    optionalGlobals: {
        FolderProjectService: {
            purpose: 'Enable local folder-backed project discovery and creation.',
            uiSurface: '#folder-path-box',
            requiredScripts: [
                '../local-folder/js/folder-cache.js',
                '../local-folder/js/local-folder-scanner.js'
            ]
        },
        FolderProjectUI: {
            purpose: 'Bind the Browse Folder control to the local-folder picker integration.',
            uiSurface: '#folder-path-load',
            requiredScripts: [
                '../local-folder/js/folder-picker-trigger.js'
            ]
        },
        TaskSchemaClipboard: {
            purpose: 'Enable the Copy Schema action for authoring templates.',
            uiSurface: '#copy-schema-button',
            requiredScripts: [
                '../task-engine/js/task-schema-clipboard.js'
            ]
        },
        calendarExport: {
            purpose: 'Enable ICS export controls from graph task data.',
            uiSurface: '#calendarCtrlDetails',
            requiredScripts: [
                '../calendar/js/task-ics-export.js'
            ]
        }
    }
});

export const GRAPH_COMPONENT_INPUT_SCHEMA = deepFreeze({
    directTemplate: {
        description: 'Use this shape when you already have a graph-ready nodes/links payload.',
        fields: {
            id: { type: 'string', required: true, description: 'Stable template id used in URLs and storage.' },
            name: { type: 'string', required: true, description: 'Human-readable graph name.' },
            description: { type: 'string', required: false, description: 'Used in menus and documentation.' },
            nodes: { type: 'GraphNode[]', required: true, description: 'Rendered nodes.' },
            links: { type: 'GraphLink[]', required: true, description: 'Rendered edges.' },
            details: { type: 'Record<string, NodeDetails>', required: true, description: 'Popup and CV content keyed by node id.' },
            meta: { type: 'GraphTemplateMeta', required: false, description: 'Sidebar, walkthrough, and button behavior.' },
            configOverrides: { type: 'GraphUiConfigOverrides', required: false, description: 'Overrides applied on top of GRAPH_UI_DEFAULTS.' }
        }
    },
    graphNode: {
        requiredFields: {
            id: { type: 'string', description: 'Stable node id.' },
            label: { type: 'string', description: 'Primary visible node label.' }
        },
        optionalFields: {
            type: { type: 'string', description: 'Common values: parent, child.' },
            layer: { type: 'number', description: 'Vertical band index.' },
            parentId: { type: 'string|null', description: 'Inherited grouping parent.' },
            templateType: { type: 'string', description: 'Semantic node type such as task, project-start, or project-end.' },
            priority: { type: 'string', allowedValues: cloneValue(PRIORITY_LEVELS), description: 'Used when colorMode is priority.' },
            status: { type: 'string', description: 'Used for status visuals.' },
            estimatedHours: { type: 'number', description: 'Used when sizeMode is hours.' },
            metrics: { type: 'object', description: 'Custom node metrics, dimensions, or categories addressed by metricSizing.field and metricColoring.field.' },
            task_id: { type: 'number', description: 'Preserved TaskDB id for task nodes.' }
        }
    },
    graphLink: {
        requiredFields: {
            source: { type: 'string|GraphNode', description: 'Source node id or bound D3 node object.' },
            target: { type: 'string|GraphNode', description: 'Target node id or bound D3 node object.' },
            type: { type: 'string', description: 'Relation type. See GRAPH_RELATION_GUIDE.' }
        },
        optionalFields: {
            weight: { type: 'number', description: 'Optional host-specific metadata.' }
        }
    },
    nodeDetails: {
        requiredFields: {
            title: { type: 'string', description: 'Popup header.' }
        },
        optionalFields: {
            items: { type: 'string[]', description: 'HTML-capable body rows rendered in the popup and CV.' },
            photoUrl: { type: 'string', description: 'Optional profile image URL.' }
        }
    },
    templateMeta: {
        optionalFields: {
            profileNodeId: { type: 'string', description: 'Default node used by the profile/menu action.' },
            coreNodeId: { type: 'string', description: 'Default node used by the core focus action.' },
            legendMode: { type: 'string', description: 'Common values: career, task-management.' },
            walkthroughSteps: { type: 'object[]', description: 'Inline walkthrough steps.' },
            walkthroughStepsPath: { type: 'string', description: 'JSON path for walkthrough steps.' },
            modules: { type: 'NavigationModule[]', description: 'Sidebar modules for subgraph navigation.' },
            menuLabels: { type: 'object', description: 'Override button labels in the menu panel.' },
            showProfileButton: { type: 'boolean', description: 'Hide or show profile focus button.' },
            showCoreButton: { type: 'boolean', description: 'Hide or show core focus button.' },
            showCvButton: { type: 'boolean', description: 'Hide or show classic CV button.' },
            walkthroughEnabled: { type: 'boolean', description: 'Hide or show the walkthrough button.' }
        }
    },
    taskDbSource: {
        description: 'Use this shape when the graph should be derived from node.tasks.json.',
        fields: {
            project: { type: 'object', required: true, description: 'Project metadata.' },
            categories: { type: 'object[]', required: false, description: 'Optional task categories.' },
            workers: { type: 'object[]', required: false, description: 'Optional worker metadata.' },
            tasks: { type: 'TaskDbTask[]', required: true, description: 'Task records used to compute the graph.' },
            graphTemplate: { type: 'object', required: false, description: 'Optional embedded direct-template graph payload.' },
            navigation: { type: 'object', required: false, description: 'Optional module-navigation payload.' }
        }
    },
    taskDbTask: {
        requiredFields: {
            task_id: { type: 'number', description: 'Stable numeric id.' },
            task_name: { type: 'string', description: 'Primary label.' },
            description: { type: 'string', description: 'Task description used in popups.' }
        },
        optionalFields: {
            status: { type: 'string', description: 'Task lifecycle state.' },
            priority: { type: 'string', allowedValues: cloneValue(PRIORITY_LEVELS), description: 'Task priority.' },
            estimated_hours: { type: 'number', description: 'Node-size input when sizeMode is hours.' },
            category_name: { type: 'string', description: 'Category label for grouping and popup context.' },
            dependencies: { type: 'object[]|number[]', description: 'Authored dependency records; the graph derives upstream and downstream task links from them.' },
            parent_task_id: { type: 'number', description: 'Use for full child-task nodes.' },
            subtasks: { type: 'InlineSubtask[]', description: 'Use for inline popup-driven subgraphs.' },
            is_critical_path: { type: 'boolean', description: 'Marks critical-path work in the source data.' },
            assigned_workers: { type: 'object[]', description: 'Worker ownership metadata.' }
        }
    },
    inlineSubtask: {
        requiredFields: {
            task_name: { type: 'string', description: 'Inline subtask label.' }
        },
        optionalFields: {
            description: { type: 'string', description: 'Inline subtask description.' },
            status: { type: 'string', description: 'Inline subtask status.' },
            priority: { type: 'string', allowedValues: cloneValue(PRIORITY_LEVELS), description: 'Inline subtask priority.' },
            estimated_hours: { type: 'number', description: 'Inline subtask hours.' },
            dependencies: { type: 'object[]|number[]', description: 'Inline dependency records used inside the inline subgraph.' },
            subtasks: { type: 'InlineSubtask[]', description: 'Recursive nested inline subgraphs.' }
        }
    },
    navigationModule: {
        requiredFields: {
            label: { type: 'string', description: 'Sidebar label.' },
            path: { type: 'string', description: 'Relative module path that resolves to a node.tasks.json file.' }
        },
        optionalFields: {
            projectId: { type: 'string', description: 'Optional project id override for cross-project navigation.' },
            taskIds: { type: 'number[]', description: 'Optional list of task ids represented by the module.' }
        }
    }
});

export const GRAPH_COMPONENT_EXAMPLES = deepFreeze({
    configOverrides: {
        colorMode: 'metric',
        sizeMode: 'metric',
        metricSizing: {
            field: 'metrics.contentSize',
            label: 'Content size',
            minValue: 0,
            maxValue: 500,
            minRadius: 16,
            maxRadius: 52,
            scale: 'sqrt'
        },
        metricColoring: {
            field: 'metrics.nodeType',
            label: 'Node type',
            fallbackKey: 'default',
            palette: {
                default: '#94a3b8',
                folder: '#2563eb',
                file: '#f97316',
                note: '#16a34a'
            }
        },
        forces: {
            linkDistanceLayer: 140,
            charge: -820
        }
    },
    directTemplate: {
        id: 'release-roadmap',
        name: 'Release Roadmap',
        description: 'Minimal graph-ready template object.',
        nodes: [
            { id: 'project-start', label: 'Project Start', type: 'parent', layer: 0, templateType: 'project-start' },
            { id: 'task-1', label: 'Define scope', type: 'parent', layer: 1, templateType: 'task', priority: 'High', status: 'In Progress', estimatedHours: 8, metrics: { contentSize: 180, nodeType: 'folder' } },
            { id: 'task-2', label: 'Ship milestone', type: 'parent', layer: 2, templateType: 'task', priority: 'Critical', status: 'Not Started', estimatedHours: 12, metrics: { contentSize: 320, nodeType: 'file' } }
        ],
        links: [
            { source: 'project-start', target: 'task-1', type: 'HAS_TASK' },
            { source: 'task-1', target: 'task-2', type: 'DEPENDS_FS' }
        ],
        details: {
            'project-start': { title: 'Project Start', items: ['Synthetic start node for the graph.'] },
            'task-1': { title: 'Define scope', items: ['Depends on: none'] },
            'task-2': { title: 'Ship milestone', items: ['Depends on: Define scope'] }
        },
        meta: {
            profileNodeId: 'project-start',
            coreNodeId: 'task-2',
            legendMode: 'task-management'
        },
        configOverrides: {
            colorMode: 'metric',
            sizeMode: 'metric',
            metricSizing: {
                field: 'metrics.contentSize',
                label: 'Content size',
                minValue: 0,
                maxValue: 500,
                minRadius: 16,
                maxRadius: 52,
                scale: 'sqrt'
            },
            metricColoring: {
                field: 'metrics.nodeType',
                label: 'Node type',
                fallbackKey: 'default',
                palette: {
                    default: '#94a3b8',
                    folder: '#2563eb',
                    file: '#f97316'
                }
            }
        }
    },
    taskDbSource: {
        project: {
            name: 'Release Roadmap',
            description: 'TaskDB-backed project example.'
        },
        tasks: [
            {
                task_id: 1,
                task_name: 'Define scope',
                description: 'Collect requirements and boundaries.',
                priority: 'High',
                status: 'In Progress',
                estimated_hours: 8,
                dependencies: [],
                subtasks: [
                    {
                        task_name: 'Review acceptance criteria',
                        status: 'Not Started',
                        priority: 'Medium',
                        estimated_hours: 2,
                        dependencies: []
                    }
                ]
            },
            {
                task_id: 2,
                task_name: 'Ship milestone',
                description: 'Deliver the first release.',
                priority: 'Critical',
                status: 'Not Started',
                estimated_hours: 12,
                is_critical_path: true,
                dependencies: [
                    { predecessor_task_id: 1, type: 'FS', lag_days: 0 }
                ]
            }
        ],
        navigation: {
            modules: [
                { label: 'Billing module', path: 'modules/billing/node.tasks.json' }
            ]
        }
    }
});

export const GRAPH_COMPONENT_CONTRACT = deepFreeze({
    defaults: GRAPH_UI_DEFAULTS,
    configSchema: GRAPH_UI_CONFIG_SCHEMA,
    inputSchema: GRAPH_COMPONENT_INPUT_SCHEMA,
    relations: GRAPH_RELATION_GUIDE,
    semantics: GRAPH_SEMANTICS_GUIDE,
    optionalHostFeatures: GRAPH_HOST_FEATURES,
    examples: GRAPH_COMPONENT_EXAMPLES
});

/**
 * Create a runtime config object from the documented defaults plus overrides.
 * Invalid types on known keys are ignored so the graph keeps a safe default.
 * Unknown keys are preserved to keep host-specific extensions available.
 *
 * @param {object} overrides
 * @returns {object}
 */
export function createGraphUiConfig(overrides = {}) {
    return mergeWithDefaults(GRAPH_UI_DEFAULTS, overrides);
}

/**
 * Validate graph UI overrides before passing them to the renderer.
 *
 * @param {object} overrides
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
export function validateGraphUiConfig(overrides = {}) {
    const errors = [];
    const warnings = [];

    if (typeof overrides === 'undefined' || overrides === null) {
        return { valid: true, errors, warnings };
    }

    if (!isPlainObject(overrides)) {
        errors.push('configOverrides must be an object.');
        return { valid: false, errors, warnings };
    }

    collectUnknownKeys(GRAPH_UI_DEFAULTS, overrides, '', warnings);

    if (typeof overrides.colorMode !== 'undefined' && !ALLOWED_COLOR_MODES.includes(overrides.colorMode)) {
        errors.push(`colorMode must be one of: ${ALLOWED_COLOR_MODES.join(', ')}.`);
    }
    if (typeof overrides.sizeMode !== 'undefined' && !ALLOWED_SIZE_MODES.includes(overrides.sizeMode)) {
        errors.push(`sizeMode must be one of: ${ALLOWED_SIZE_MODES.join(', ')}.`);
    }

    if (typeof overrides.nodeSizes !== 'undefined' && !isPlainObject(overrides.nodeSizes)) {
        errors.push('nodeSizes must be an object.');
    } else if (isPlainObject(overrides.nodeSizes)) {
        validateNumber(overrides.nodeSizes.main, 'nodeSizes.main', errors, { min: 1 });
        validateNumber(overrides.nodeSizes.sub, 'nodeSizes.sub', errors, { min: 1 });
    }

    if (typeof overrides.taskSizing !== 'undefined' && !isPlainObject(overrides.taskSizing)) {
        errors.push('taskSizing must be an object.');
    } else if (isPlainObject(overrides.taskSizing)) {
        validateNumber(overrides.taskSizing.minHours, 'taskSizing.minHours', errors, { min: 0 });
        validateNumber(overrides.taskSizing.maxHours, 'taskSizing.maxHours', errors, { min: 0 });
        validateNumber(overrides.taskSizing.minRadius, 'taskSizing.minRadius', errors, { min: 1 });
        validateNumber(overrides.taskSizing.maxRadius, 'taskSizing.maxRadius', errors, { min: 1 });
        if (isFiniteNumber(overrides.taskSizing.minHours) && isFiniteNumber(overrides.taskSizing.maxHours) && overrides.taskSizing.maxHours < overrides.taskSizing.minHours) {
            errors.push('taskSizing.maxHours must be >= taskSizing.minHours.');
        }
        if (isFiniteNumber(overrides.taskSizing.minRadius) && isFiniteNumber(overrides.taskSizing.maxRadius) && overrides.taskSizing.maxRadius < overrides.taskSizing.minRadius) {
            errors.push('taskSizing.maxRadius must be >= taskSizing.minRadius.');
        }
    }

    if (typeof overrides.metricSizing !== 'undefined' && !isPlainObject(overrides.metricSizing)) {
        errors.push('metricSizing must be an object.');
    } else if (isPlainObject(overrides.metricSizing)) {
        if (typeof overrides.metricSizing.field !== 'undefined' && typeof overrides.metricSizing.field !== 'string') {
            errors.push('metricSizing.field must be a string.');
        }
        if (typeof overrides.metricSizing.label !== 'undefined' && typeof overrides.metricSizing.label !== 'string') {
            errors.push('metricSizing.label must be a string.');
        }
        validateNumber(overrides.metricSizing.minValue, 'metricSizing.minValue', errors);
        validateNumber(overrides.metricSizing.maxValue, 'metricSizing.maxValue', errors);
        validateNumber(overrides.metricSizing.minRadius, 'metricSizing.minRadius', errors, { min: 1 });
        validateNumber(overrides.metricSizing.maxRadius, 'metricSizing.maxRadius', errors, { min: 1 });
        if (typeof overrides.metricSizing.scale !== 'undefined' && !ALLOWED_METRIC_SCALES.includes(overrides.metricSizing.scale)) {
            errors.push(`metricSizing.scale must be one of: ${ALLOWED_METRIC_SCALES.join(', ')}.`);
        }
        if (isFiniteNumber(overrides.metricSizing.minValue) && isFiniteNumber(overrides.metricSizing.maxValue) && overrides.metricSizing.maxValue < overrides.metricSizing.minValue) {
            errors.push('metricSizing.maxValue must be >= metricSizing.minValue.');
        }
        if (isFiniteNumber(overrides.metricSizing.minRadius) && isFiniteNumber(overrides.metricSizing.maxRadius) && overrides.metricSizing.maxRadius < overrides.metricSizing.minRadius) {
            errors.push('metricSizing.maxRadius must be >= metricSizing.minRadius.');
        }
    }

    if (typeof overrides.forces !== 'undefined' && !isPlainObject(overrides.forces)) {
        errors.push('forces must be an object.');
    } else if (isPlainObject(overrides.forces)) {
        validateNumber(overrides.forces.linkDistance, 'forces.linkDistance', errors, { min: 1 });
        validateNumber(overrides.forces.linkDistanceSubcategory, 'forces.linkDistanceSubcategory', errors, { min: 1 });
        validateNumber(overrides.forces.linkDistanceLayer, 'forces.linkDistanceLayer', errors, { min: 1 });
        validateNumber(overrides.forces.charge, 'forces.charge', errors);
        validateNumber(overrides.forces.chargeMobileMultiplier, 'forces.chargeMobileMultiplier', errors, { min: 0 });
        validateNumber(overrides.forces.collidePadding, 'forces.collidePadding', errors, { min: 0 });
        validateNumber(overrides.forces.layerStrengthY, 'forces.layerStrengthY', errors, { min: 0 });
        validateNumber(overrides.forces.layoutStrengthX, 'forces.layoutStrengthX', errors, { min: 0 });
    }

    if (typeof overrides.animation !== 'undefined' && !isPlainObject(overrides.animation)) {
        errors.push('animation must be an object.');
    } else if (isPlainObject(overrides.animation)) {
        validateNumber(overrides.animation.duration, 'animation.duration', errors, { min: 0 });
        validateNumber(overrides.animation.focusDelay, 'animation.focusDelay', errors, { min: 0 });
        validateNumber(overrides.animation.focusScale, 'animation.focusScale', errors, { min: 0 });
        validateNumber(overrides.animation.highlightDuration, 'animation.highlightDuration', errors, { min: 0 });
    }

    if (typeof overrides.layout !== 'undefined' && !isPlainObject(overrides.layout)) {
        errors.push('layout must be an object.');
    } else if (isPlainObject(overrides.layout)) {
        validateNumber(overrides.layout.horizontalPadding, 'layout.horizontalPadding', errors, { min: 0 });
        validateNumber(overrides.layout.verticalPadding, 'layout.verticalPadding', errors, { min: 0 });
        validateNumber(overrides.layout.boundaryPadding, 'layout.boundaryPadding', errors, { min: 0 });
    }

    if (typeof overrides.tooltip !== 'undefined' && !isPlainObject(overrides.tooltip)) {
        errors.push('tooltip must be an object.');
    } else if (isPlainObject(overrides.tooltip)) {
        validateNumber(overrides.tooltip.offsetX, 'tooltip.offsetX', errors);
        validateNumber(overrides.tooltip.offsetY, 'tooltip.offsetY', errors);
        validateNumber(overrides.tooltip.fadeInDuration, 'tooltip.fadeInDuration', errors, { min: 0 });
        validateNumber(overrides.tooltip.fadeOutDuration, 'tooltip.fadeOutDuration', errors, { min: 0 });
    }

    if (typeof overrides.popup !== 'undefined' && !isPlainObject(overrides.popup)) {
        errors.push('popup must be an object.');
    } else if (isPlainObject(overrides.popup)) {
        validateNumber(overrides.popup.closeDelay, 'popup.closeDelay', errors, { min: 0 });
    }

    if (typeof overrides.simulation !== 'undefined' && !isPlainObject(overrides.simulation)) {
        errors.push('simulation must be an object.');
    } else if (isPlainObject(overrides.simulation)) {
        validateNumber(overrides.simulation.alphaThreshold, 'simulation.alphaThreshold', errors, { min: 0 });
    }

    validateNumber(overrides.mobileBreakpoint, 'mobileBreakpoint', errors, { min: 1, integer: true });
    validateNumber(overrides.maxColorVariants, 'maxColorVariants', errors, { min: 1, integer: true });

    if (typeof overrides.showStatusVisuals !== 'undefined' && typeof overrides.showStatusVisuals !== 'boolean') {
        errors.push('showStatusVisuals must be a boolean.');
    }

    if (typeof overrides.fallbackColorHex !== 'undefined' && !isHexColor(overrides.fallbackColorHex)) {
        errors.push('fallbackColorHex must be a 6-digit hex color.');
    }

    if (typeof overrides.metricColoring !== 'undefined' && !isPlainObject(overrides.metricColoring)) {
        errors.push('metricColoring must be an object.');
    } else if (isPlainObject(overrides.metricColoring)) {
        if (typeof overrides.metricColoring.field !== 'undefined' && typeof overrides.metricColoring.field !== 'string') {
            errors.push('metricColoring.field must be a string.');
        }
        if (typeof overrides.metricColoring.label !== 'undefined' && typeof overrides.metricColoring.label !== 'string') {
            errors.push('metricColoring.label must be a string.');
        }
        if (typeof overrides.metricColoring.fallbackKey !== 'undefined' && typeof overrides.metricColoring.fallbackKey !== 'string') {
            errors.push('metricColoring.fallbackKey must be a string.');
        }
        if (typeof overrides.metricColoring.palette !== 'undefined') {
            if (!isPlainObject(overrides.metricColoring.palette)) {
                errors.push('metricColoring.palette must be an object.');
            } else {
                Object.keys(overrides.metricColoring.palette).forEach((paletteKey) => {
                    if (!isHexColor(overrides.metricColoring.palette[paletteKey])) {
                        errors.push(`metricColoring.palette.${paletteKey} must be a 6-digit hex color.`);
                    }
                });
            }
        }
    }

    if (typeof overrides.toneGeneration !== 'undefined' && !isPlainObject(overrides.toneGeneration)) {
        errors.push('toneGeneration must be an object.');
    } else if (isPlainObject(overrides.toneGeneration)) {
        validateNumber(overrides.toneGeneration.step, 'toneGeneration.step', errors, { min: 0 });
        if (typeof overrides.toneGeneration.direction !== 'undefined' && !ALLOWED_TONE_DIRECTIONS.includes(overrides.toneGeneration.direction)) {
            errors.push(`toneGeneration.direction must be one of: ${ALLOWED_TONE_DIRECTIONS.join(', ')}.`);
        }
    }

    ['priorityColorsHex', 'baseLayerColorsHex', 'textColorsHex'].forEach((groupKey) => {
        const groupValue = overrides[groupKey];
        if (typeof groupValue === 'undefined') return;
        if (!isPlainObject(groupValue)) {
            errors.push(`${groupKey} must be an object.`);
            return;
        }

        Object.keys(groupValue).forEach((colorKey) => {
            if (!isHexColor(groupValue[colorKey])) {
                errors.push(`${groupKey}.${colorKey} must be a 6-digit hex color.`);
            }
        });
    });

    return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate the top-level inputs that another host project passes into the graph UI.
 *
 * @param {{template?: object, configOverrides?: object}} payload
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
export function validateGraphComponentInputs(payload = {}) {
    const errors = [];
    const warnings = [];

    const configValidation = validateGraphUiConfig(payload.configOverrides);
    errors.push(...configValidation.errors);
    warnings.push(...configValidation.warnings);

    if (typeof payload.template !== 'undefined') {
        const template = payload.template;
        if (!isPlainObject(template)) {
            errors.push('template must be an object.');
        } else {
            if (!Array.isArray(template.nodes)) errors.push('template.nodes must be an array.');
            if (!Array.isArray(template.links)) errors.push('template.links must be an array.');
            if (!isPlainObject(template.details)) errors.push('template.details must be an object keyed by node id.');
            if (typeof template.id !== 'undefined' && typeof template.id !== 'string') errors.push('template.id must be a string.');
            if (typeof template.name !== 'undefined' && typeof template.name !== 'string') errors.push('template.name must be a string.');
            if (typeof template.meta !== 'undefined' && !isPlainObject(template.meta)) errors.push('template.meta must be an object.');

            if (Array.isArray(template.nodes)) {
                template.nodes.forEach((node, index) => {
                    if (!isPlainObject(node)) {
                        errors.push(`template.nodes[${index}] must be an object.`);
                        return;
                    }
                    if (!node.id) errors.push(`template.nodes[${index}] is missing id.`);
                    if (!node.label) warnings.push(`template.nodes[${index}] is missing label.`);
                    if (typeof node.metrics !== 'undefined' && !isPlainObject(node.metrics)) {
                        errors.push(`template.nodes[${index}].metrics must be an object when provided.`);
                    }
                });
            }

            if (Array.isArray(template.links)) {
                template.links.forEach((link, index) => {
                    if (!isPlainObject(link)) {
                        errors.push(`template.links[${index}] must be an object.`);
                        return;
                    }
                    if (typeof link.source === 'undefined') errors.push(`template.links[${index}] is missing source.`);
                    if (typeof link.target === 'undefined') errors.push(`template.links[${index}] is missing target.`);
                    if (!link.type) errors.push(`template.links[${index}] is missing type.`);
                });
            }
        }
    }

    return { valid: errors.length === 0, errors, warnings };
}

export function getGraphComponentContract() {
    return GRAPH_COMPONENT_CONTRACT;
}