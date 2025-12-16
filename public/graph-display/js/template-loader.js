// Template Loader - isolates synchronous/optional template builders
// This file lets developers re-introduce built-in templates when needed
// without keeping template data inline in `graph-data.js`.

export const CAREER_TEMPLATE_ID = 'career';
export const TASK_MGMT_TEMPLATE_ID = 'task-management';

// Try to synchronously require a local JSON template (useful in Node/test env)
export function tryRequireLocalTemplate(path) {
    try {
        if (typeof module !== 'undefined' && module.exports) {
            // eslint-disable-next-line global-require, import/no-dynamic-require
            return require(path);
        }
    } catch (e) {
        // Not available or not found in this environment
    }
    return null;
}

// Lightweight builders that convert JSON payloads to the template objects
// These are the same shapes the app expects when templates are loaded.
export function buildCareerTemplateFromData(id, name, data, convertFn) {
    const { nodes, links } = (typeof convertFn === 'function') ? convertFn({ rawNodes: data.rawNodes || [], rawRelationships: data.rawRelationships || [] }) : { nodes: [], links: [] };
    return {
        id: id || CAREER_TEMPLATE_ID,
        name: name || 'Career (Template)',
        description: data.description || 'Interactive CV/portfolio graph template loaded from JSON.',
        nodes,
        links,
        details: data.details || {},
        meta: data.meta || {},
        configOverrides: data.configOverrides || {}
    };
}

export function buildTaskMgmtFromData(id, name, data, helpers) {
    // helpers: { buildDependencyLayering, normalizePriority, getTaskPredecessorIds }
    const project = data.project || { name: name || 'Project', description: '' };
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const { buildDependencyLayering, normalizePriority, getTaskPredecessorIds, getDependencyLinkType } = (helpers || {});

    const { layerById = new Map(), cycleNodes = new Set() } = (typeof buildDependencyLayering === 'function') ? buildDependencyLayering(tasks) : { layerById: new Map(), cycleNodes: new Set() };

    const projectStartNodeId = 'project-start';
    const projectEndNodeId = 'project-end';
    const idToNodeId = (tId) => `task-${tId}`;
    const taskById = new Map(tasks.filter(t => typeof t?.task_id === 'number').map(t => [t.task_id, t]));
    const validTaskIds = new Set(taskById.keys());

    const hours = tasks.map(t => Number(t.estimated_hours)).filter(h => Number.isFinite(h) && h > 0);
    const minHours = Math.min(...hours, 2);
    const maxHours = Math.max(...hours, 40);

    const taskLayers = Array.from(layerById.values());
    const maxTaskLayer = taskLayers.length ? Math.max(...taskLayers) : 1;
    const endLayer = maxTaskLayer + 1;

    const nodes = [
        { id: projectStartNodeId, label: `Start: ${project.name}`, type: 'parent', layer: 0, parentId: null, templateType: 'project-start' },
        { id: projectEndNodeId, label: `End: ${project.name}`, type: 'parent', layer: endLayer, parentId: null, templateType: 'project-end' }
    ];

    const links = [];
    const details = {};

    const successorsByTaskId = new Map();
    for (const task of tasks) {
        const predIds = (typeof getTaskPredecessorIds === 'function') ? getTaskPredecessorIds(task, validTaskIds) : [];
        for (const predId of predIds) {
            if (!successorsByTaskId.has(predId)) successorsByTaskId.set(predId, new Set());
            successorsByTaskId.get(predId).add(task.task_id);
        }
    }

    for (const task of tasks) {
        const taskId = task.task_id;
        if (typeof taskId !== 'number') continue;
        const taskNodeId = idToNodeId(taskId);
        const layer = layerById.get(taskId) ?? 1;
        const normalizedPriority = (typeof normalizePriority === 'function') ? normalizePriority(task.priority) : (task.priority || 'Medium');
        const predIds = (typeof getTaskPredecessorIds === 'function') ? getTaskPredecessorIds(task, validTaskIds) : [];

        nodes.push({
            id: taskNodeId,
            label: task.task_name || `Task ${taskId}`,
            type: 'parent',
            layer,
            parentId: projectStartNodeId,
            templateType: 'task',
            priority: normalizedPriority,
            estimatedHours: Number(task.estimated_hours) || 0,
            status: task.status || 'Not Started'
        });

        if (!predIds.length) links.push({ source: projectStartNodeId, target: taskNodeId, type: 'HAS_TASK' });

        const predecessorNames = predIds.map(id => taskById.get(id)?.task_name).filter(Boolean);
        const cycleNote = cycleNodes.has(taskId) ? '<strong>Warning:</strong> dependency cycle detected.' : null;

        details[taskNodeId] = {
            title: task.task_name || `Task ${taskId}`,
            items: [
                `<strong>Priority:</strong> ${normalizedPriority} | <strong>Status:</strong> ${task.status || 'Not Started'}`,
                `<strong>Estimated hours:</strong> ${Number(task.estimated_hours) || 0}`,
                `<strong>Dependency layer:</strong> ${layer}`,
                task.category_name ? `<strong>Category:</strong> ${task.category_name}` : null,
                task.description ? `<strong>Description:</strong> ${task.description}` : null,
                predecessorNames.length ? `<strong>Depends on:</strong> ${predecessorNames.join(' · ')}` : '<strong>Depends on:</strong> none',
                cycleNote
            ].filter(Boolean)
        };

        const structuredDeps = Array.isArray(task?.dependencies) ? task.dependencies.filter(d => d && typeof d === 'object') : [];
        const structuredByPred = new Map(structuredDeps.map(d => [d.predecessor_task_id, d]));
        for (const predId of predIds) {
            const depType = (typeof getDependencyLinkType === 'function') ? getDependencyLinkType(structuredByPred.get(predId)) : 'DEPENDS_ON';
            links.push({ source: idToNodeId(predId), target: taskNodeId, type: depType });
        }

        const successors = successorsByTaskId.get(taskId);
        if (!successors || successors.size === 0) {
            links.push({ source: taskNodeId, target: projectEndNodeId, type: 'DEPENDS_FS' });
        }
    }

    const meta = (typeof data.meta === 'object' && data.meta) ? { ...data.meta } : {};
    meta.profileNodeId = meta.profileNodeId || projectStartNodeId;
    meta.legendMode = meta.legendMode || 'task-management';

    return {
        id: id || TASK_MGMT_TEMPLATE_ID,
        name: name || 'Task Management (Project)',
        description: data.description || project.description || '',
        nodes,
        links,
        details,
        meta,
        configOverrides: data.configOverrides || { colorMode: 'priority', sizeMode: 'hours', taskSizing: { minHours, maxHours, minRadius: 16, maxRadius: 44 } }
    };
}

// Register built-in templates into an existing registry Map if local files are present.
export function syncBuiltInTemplates(registry, convertFn, helpers = {}) {
    if (!registry || typeof registry.set !== 'function') return;

    try {
        const careerLocal = tryRequireLocalTemplate('../templates/career-lite/data.json') || tryRequireLocalTemplate('../templates/career/data.json') || tryRequireLocalTemplate('templates/career-lite/data.json');
        if (careerLocal) {
            registry.set('career-lite', buildCareerTemplateFromData('career-lite', careerLocal.name || 'Career (Lite Template)', careerLocal, convertFn));
        }
    } catch (e) {
        // ignore
    }

    try {
        const taskLocal = tryRequireLocalTemplate('../templates/task-management/data.json') || tryRequireLocalTemplate('templates/task-management/data.json');
        if (taskLocal) {
            registry.set('task-management', buildTaskMgmtFromData('task-management', taskLocal.name || 'Task Management (Project)', taskLocal, helpers));
        }
    } catch (e) {
        // ignore
    }
}

// Export default for convenience
export default { CAREER_TEMPLATE_ID, TASK_MGMT_TEMPLATE_ID, tryRequireLocalTemplate, buildCareerTemplateFromData, buildTaskMgmtFromData, syncBuiltInTemplates };
