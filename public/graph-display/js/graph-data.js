/*
 * IMPORTANT: Graph definitions (nodes, relationships, details) must come from
 * external JSON templates following the schemas in `templates/schema/`.
 *
 * Template helpers (synchronous require and built-in template builders) were
 * moved to `template-loader.js` to keep this file focused on processing.
 */

import { CAREER_TEMPLATE_ID, TASK_MGMT_TEMPLATE_ID } from './template-loader.js';

// NOTE: For optional synchronous template registration, use `template-loader.js`'s
// `syncBuiltInTemplates(registry, convertFn, helpers)` when running in test/Node environments.

// Built-in template builders were removed from this file to keep it processing-only.
// Use `initTemplates()` at runtime and `template-loader.js` (sync helper) in Node/tests when needed.



/**
* Converts raw Cypher-like export data into D3 compatible nodes and links.
* @param {object} cypherData - Object with rawNodes and rawRelationships arrays.
* @returns {{nodes: Array<object>, links: Array<object>}} D3 graph data.
*/
function convertCypherToGraph(cypherData) {
   const nodes = [];
   const links = [];
   const nodeIds = new Set(); // Keep track of valid node IDs

   if (!cypherData || !cypherData.rawNodes || !cypherData.rawRelationships) {
       console.error("Invalid Cypher data structure provided to adapter.");
       return { nodes: [], links: [] };
   }

   // Process nodes first
   cypherData.rawNodes.forEach(rn => {
       if (!rn || !rn.id || typeof rn.id !== 'string') {
           console.warn("Skipping invalid raw node (missing or invalid ID):", rn);
           return;
       }
       if (nodeIds.has(rn.id)) {
           console.warn(`Skipping duplicate node ID: ${rn.id}`);
           return;
       }

       let type = (rn.labels && rn.labels.includes('Domain')) ? 'parent' : 'child';
       let layer = parseInt(rn.properties?.layer, 10);
       if (isNaN(layer)) {
           console.warn(`Node ${rn.id} has invalid or missing layer. Defaulting to 0.`);
           layer = 0; // Default layer if missing or invalid
       }

       nodes.push({
           id: rn.id,
           label: rn.properties?.name || `Node ${rn.id}`, // Use name, fallback to ID
           type: type,
           layer: layer,
           // Store parent ID for easier lookup later, default to null
           parentId: rn.properties?.parent || null
           // Properties like assignedColor, colorVariantIndex, textColorClass will be added during preprocessData
       });
       nodeIds.add(rn.id);
   });

   // Process relationships
   cypherData.rawRelationships.forEach((rel, index) => {
       if (!rel || typeof rel !== 'object') {
           console.warn(`Skipping invalid raw relationship at index ${index}:`, rel);
           return;
       }

       // Handle cases where source/target might be objects with an 'id' property or just the ID string/number
       const sourceId = typeof rel.source === 'object' ? rel.source?.id : rel.source;
       const targetId = typeof rel.target === 'object' ? rel.target?.id : rel.target;

       // Ensure IDs are valid strings and exist in our processed nodes
       if (sourceId && targetId && typeof sourceId === 'string' && typeof targetId === 'string') {
           if (!nodeIds.has(sourceId)) {
               console.warn(`Skipping relationship: Source node ID '${sourceId}' not found in node list.`);
               return;
           }
           if (!nodeIds.has(targetId)) {
               console.warn(`Skipping relationship: Target node ID '${targetId}' not found in node list.`);
               return;
           }
           links.push({
               source: sourceId, // D3 forceLink needs the ID string
               target: targetId, // D3 forceLink needs the ID string
               type: rel.type || 'RELATES_TO' // Default relationship type
           });
       } else {
           console.warn(`Skipping relationship with missing/invalid source/target ID at index ${index}:`, rel);
       }
   });

   console.log(`Data Conversion: Processed ${nodes.length} nodes and ${links.length} links.`);
   return { nodes, links };
}

// Template registration is intentionally empty here; templates are loaded at runtime by `initTemplates()`
// or can be registered synchronously from `template-loader.js` (use `syncBuiltInTemplates`).


// --- Task Management Template Builder --------------------------------------

function normalizePriority(priority) {
    const p = String(priority || '').trim();
    if (!p) return 'Medium';
    const normalized = p.toLowerCase();
    if (normalized === 'critical') return 'Critical';
    if (normalized === 'high') return 'High';
    if (normalized === 'medium') return 'Medium';
    if (normalized === 'low') return 'Low';
    return 'Medium';
}

function getTaskPredecessorIds(task, validTaskIds) {
    const predecessorIds = new Set();

    const addId = (id) => {
        if (typeof id !== 'number' || !Number.isFinite(id)) return;
        if (validTaskIds && !validTaskIds.has(id)) return;
        predecessorIds.add(id);
    };

    // TaskDB v1.x often uses `requisites: number[]`
    if (Array.isArray(task?.requisites)) {
        for (const id of task.requisites) addId(id);
    }

    // Some datasets use `dependencies` as:
    // - number[]
    // - { predecessor_task_id, type, lag_days }[]
    // - other object forms
    if (Array.isArray(task?.dependencies)) {
        for (const dep of task.dependencies) {
            if (typeof dep === 'number') {
                addId(dep);
                continue;
            }
            if (dep && typeof dep === 'object') {
                addId(dep.predecessor_task_id);
                addId(dep.task_id);
                addId(dep.id);
            }
        }
    }

    return Array.from(predecessorIds);
}

function getDependencyLinkType(dep) {
    if (!dep || typeof dep !== 'object') return 'DEPENDS_ON';
    if (dep.type) return `DEPENDS_${String(dep.type).toUpperCase()}`;
    return 'DEPENDS_ON';
}

function buildDependencyLayering(tasks) {
    const byId = new Map(
        tasks
            .filter(t => t && typeof t.task_id === 'number' && Number.isFinite(t.task_id))
            .map(t => [t.task_id, t])
    );
    const visiting = new Set();
    const visited = new Set();
    const layerById = new Map();
    const cycleNodes = new Set();

    const validTaskIds = new Set(byId.keys());

    const getPredecessors = (task) => getTaskPredecessorIds(task, validTaskIds);

    const dfs = (taskId) => {
        if (layerById.has(taskId)) return layerById.get(taskId);
        if (visiting.has(taskId)) {
            cycleNodes.add(taskId);
            return 1;
        }
        if (visited.has(taskId)) return layerById.get(taskId) ?? 1;

        visiting.add(taskId);
        const task = byId.get(taskId);
        const preds = task ? getPredecessors(task) : [];
        let maxPredLayer = 0;
        for (const predId of preds) {
            const predLayer = dfs(predId);
            maxPredLayer = Math.max(maxPredLayer, predLayer);
        }
        const layer = Math.max(1, maxPredLayer + 1);
        layerById.set(taskId, layer);
        visiting.delete(taskId);
        visited.add(taskId);
        return layer;
    };

    for (const t of tasks) {
        if (typeof t.task_id === 'number') dfs(t.task_id);
    }
    return { layerById, cycleNodes };
}

function scaleHoursToRadius(hours, minHours, maxHours, minRadius, maxRadius) {
    const h = Number(hours);
    if (!Number.isFinite(h) || h <= 0) return minRadius;
    const clamped = Math.max(minHours, Math.min(maxHours, h));
    const t = (clamped - minHours) / Math.max(1e-6, (maxHours - minHours));
    const eased = Math.sqrt(t);
    return minRadius + (maxRadius - minRadius) * eased;
}

// NOTE: Templates are registered at runtime by `initTemplates()` (fetching `templates/registry.json`)
// or can be populated synchronously using `template-loader.js` helpers (e.g., `syncBuiltInTemplates`).
const TEMPLATE_REGISTRY = new Map();

// Lightweight schema validation (no external dependency)
function validateAgainstSchema(obj, schema) {
    // Basic checks based on schema structure provided in templates/schema/graph-template.schema.json
    if (!obj || typeof obj !== 'object') return { valid: false, errors: ['Not an object'] };
    // Career-like: rawNodes + rawRelationships + details
    if (Array.isArray(obj.rawNodes) && Array.isArray(obj.rawRelationships) && obj.details) return { valid: true };
    // Task-management-like: project + tasks
    if (obj.project && Array.isArray(obj.tasks)) return { valid: true };
    return { valid: false, errors: ['Does not match expected career or task-management schema'] };
}

// Detect if running in development mode (localhost)
function isDevMode() {
    if (typeof window === 'undefined' || !window.location) return false;
    const host = String(window.location.hostname || '');
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

// Async template loader: fetch registry.json then fetch templates; used by main-graph.js
export async function initTemplates() {
    const maybeLoadDynamicTaskDbTemplate = async (basePath) => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const requested = urlParams.get('template');
            if (!requested) return;
            if (TEMPLATE_REGISTRY.has(requested)) return;
            if (!requested.endsWith('-tasks')) return;

            const projectId = requested.slice(0, -'-tasks'.length);
            if (!projectId) return;

            const dataUrl = `${basePath}../tasksDB/${projectId}/tasks.json`;
            const res = await fetch(dataUrl, { cache: 'no-store' });
            if (!res.ok) return;

            const data = await res.json();
            const v = validateAgainstSchema(data, null);
            if (!v.valid) return;

            const entry = { id: requested, name: `${projectId} (TaskDB)`, type: 'task-management', path: dataUrl };

            // If TaskDB has an embedded career-style graph (graphTemplate), use that instead of task-dependency flow
            if (data && data.graphTemplate && Array.isArray(data.graphTemplate.rawNodes) && Array.isArray(data.graphTemplate.rawRelationships)) {
                const { nodes, links } = convertCypherToGraph({ rawNodes: data.graphTemplate.rawNodes, rawRelationships: data.graphTemplate.rawRelationships });
                const tpl = {
                    id: entry.id,
                    name: `${projectId} (Learning Graph)`,
                    description: data.graphTemplate.description || data.description || entry.name,
                    nodes,
                    links,
                    details: data.graphTemplate.details || {},
                    meta: { ...(data.graphTemplate.meta || {}) },
                    configOverrides: data.graphTemplate.configOverrides || {}
                };
                TEMPLATE_REGISTRY.set(entry.id, tpl);
                return;
            }

            // Reuse the same builder logic as registry-loaded task-management entries.
            const built = (function buildFromData() {
                const resolveProjectIdFromPath = (p) => {
                    const s = String(p || '').replace(/\\/g, '/');
                    const m = s.match(/tasksDB\/([^\/]+)\/tasks\.json$/);
                    return m ? m[1] : null;
                };

                const inferredProjectId = resolveProjectIdFromPath(entry.path);
                const project = data.project || { name: entry.name, description: '' };
                const tasks = Array.isArray(data.tasks) ? data.tasks : [];
                const { layerById, cycleNodes } = buildDependencyLayering(tasks);

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
                const details = {
                    [projectStartNodeId]: {
                        title: `Start: ${project.name}`,
                        items: [
                            project.description || '',
                            '<strong>How layers work:</strong> Layer 1 = tasks with no prerequisites. Layer N depends on earlier layers.',
                            '<strong>Visual encoding:</strong> color = priority, size = estimated hours.'
                        ].filter(Boolean)
                    },
                    [projectEndNodeId]: {
                        title: `End: ${project.name}`,
                        items: ['All terminal tasks flow into this final milestone.']
                    }
                };

                const successorsByTaskId = new Map();
                for (const task of tasks) {
                    const taskId = task?.task_id;
                    if (typeof taskId !== 'number') continue;
                    const predIds = getTaskPredecessorIds(task, validTaskIds);
                    for (const predId of predIds) {
                        if (!successorsByTaskId.has(predId)) successorsByTaskId.set(predId, new Set());
                        successorsByTaskId.get(predId).add(taskId);
                    }
                }

                for (const task of tasks) {
                    const taskId = task?.task_id;
                    if (typeof taskId !== 'number') continue;

                    const taskNodeId = idToNodeId(taskId);
                    const layer = layerById.get(taskId) ?? 1;
                    const normalizedPriority = normalizePriority(task.priority);
                    const predIds = getTaskPredecessorIds(task, validTaskIds);

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
                        links.push({
                            source: idToNodeId(predId),
                            target: taskNodeId,
                            type: getDependencyLinkType(structuredByPred.get(predId))
                        });
                    }

                    const successors = successorsByTaskId.get(taskId);
                    if (!successors || successors.size === 0) {
                        links.push({ source: taskNodeId, target: projectEndNodeId, type: 'DEPENDS_FS' });
                    }
                }

                const raw = (data && typeof data.meta === 'object' && data.meta) ? data.meta : {};
                const meta = { ...raw };
                if (typeof meta.walkthroughEnabled !== 'boolean') meta.walkthroughEnabled = true;
                if (!meta.walkthroughStepsPath && inferredProjectId) meta.walkthroughStepsPath = `../tasksDB/${inferredProjectId}/tour/graph-tour.json`;
                if (typeof meta.showProfileButton !== 'boolean') meta.showProfileButton = true;
                if (typeof meta.showCoreButton !== 'boolean') meta.showCoreButton = false;
                if (typeof meta.showCvButton !== 'boolean') meta.showCvButton = false;
                if (!meta.menuLabels || typeof meta.menuLabels !== 'object') {
                    meta.menuLabels = { profile: '🧩 Focus Project', core: '⭐', cv: '📄', tour: '👋 Start Project Tour' };
                }
                if (!meta.legendMode) meta.legendMode = 'task-management';
                if (!meta.profileNodeId) meta.profileNodeId = 'project-start';

                return {
                    nodes,
                    links,
                    details,
                    meta,
                    configOverrides: data.configOverrides || {
                        colorMode: 'priority',
                        sizeMode: 'hours',
                        taskSizing: { minHours, maxHours, minRadius: 16, maxRadius: 44 }
                    }
                };
            })();

            TEMPLATE_REGISTRY.set(entry.id, {
                id: entry.id,
                name: entry.name,
                description: data.description || entry.name,
                nodes: built.nodes,
                links: built.links,
                details: built.details,
                meta: built.meta,
                configOverrides: built.configOverrides
            });
        } catch (e) {
            // Best-effort only.
        }
    };

    try {
        // Determine base path of the current document (e.g., '/graph-display/') so relative template files resolve correctly
        const basePath = (window.location && window.location.pathname) ? window.location.pathname.replace(/\/[^\/]*$/, '/') : './';
        // Site root for templates that use absolute-like paths (e.g. '/tasksDB/...').
        // This keeps things working on GitHub Pages subpaths (e.g. '/<repo>/graph-display/')
        // and when serving the repo root via Live Server (pages under '/public/...').
        const siteRootRaw = basePath.endsWith('/graph-display/')
            ? (basePath.slice(0, -'/graph-display/'.length) || '/')
            : basePath;
        const siteRoot = siteRootRaw.endsWith('/') ? siteRootRaw : `${siteRootRaw}/`;
        const registryUrl = `${basePath}templates/registry.json`;
        const r = await fetch(registryUrl, { cache: 'no-store' });
        if (!r.ok) throw new Error(`Failed to load registry: ${r.status}`);
        const registry = await r.json();
        const devMode = isDevMode();

        for (const entry of registry || []) {
            try {
                // In production (non-dev), skip local template files (career-lite, task-management).
                // Only load templates from remote URLs (/tasksDB/...).
                if (!devMode && entry.path && !entry.path.startsWith('/') && !entry.path.startsWith('http')) {
                    console.log(`Production mode: skipping local template "${entry.id}" (path: ${entry.path})`);
                    continue;
                }

                const dataUrl = (typeof entry.path === 'string' && (entry.path.startsWith('http://') || entry.path.startsWith('https://')))
                    ? entry.path
                    : (typeof entry.path === 'string' && entry.path.startsWith('/'))
                        ? `${siteRoot}${entry.path.replace(/^\//, '')}`
                        : `${basePath}templates/${entry.path}`;
                const res = await fetch(dataUrl, { cache: 'no-store' });
                if (!res.ok) {
                    console.warn('Skipping template (fetch failed):', entry.id, res.status);
                    continue;
                }
                const data = await res.json();
                const v = validateAgainstSchema(data, null);
                if (!v.valid) {
                    console.warn('Template failed basic validation:', entry.id, v.errors);
                    continue;
                }
                // Construct template object depending on type
                if (entry.type === 'career') {
                    const { nodes, links } = convertCypherToGraph({ rawNodes: data.rawNodes, rawRelationships: data.rawRelationships });
                    const tpl = {
                        id: entry.id,
                        name: entry.name,
                        description: data.description || entry.name,
                        nodes,
                        links,
                        details: data.details || {},
                        meta: data.meta || {},
                        configOverrides: data.configOverrides || {}
                    };
                    TEMPLATE_REGISTRY.set(entry.id, tpl);
                } else if (entry.type === 'task-management') {
                    // Build from any TaskDB-like payload: { project, tasks }.
                    const built = (function buildFromData() {
                        const resolveProjectIdFromPath = (p) => {
                            const s = String(p || '').replace(/\\/g, '/');
                            const m = s.match(/tasksDB\/([^\/]+)\/tasks\.json$/);
                            return m ? m[1] : null;
                        };

                        const inferredProjectId = resolveProjectIdFromPath(entry.path);

                        const project = data.project || { name: entry.name, description: '' };
                        const tasks = Array.isArray(data.tasks) ? data.tasks : [];
                        const { layerById, cycleNodes } = buildDependencyLayering(tasks);

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
                        const details = {
                            [projectStartNodeId]: {
                                title: `Start: ${project.name}`,
                                items: [
                                    project.description || '',
                                    '<strong>How layers work:</strong> Layer 1 = tasks with no prerequisites. Layer N depends on earlier layers.',
                                    '<strong>Visual encoding:</strong> color = priority, size = estimated hours.'
                                ].filter(Boolean)
                            },
                            [projectEndNodeId]: {
                                title: `End: ${project.name}`,
                                items: ['All terminal tasks flow into this final milestone.']
                            }
                        };

                        // Successor index: identify terminal tasks (no dependents)
                        const successorsByTaskId = new Map();
                        for (const task of tasks) {
                            const taskId = task?.task_id;
                            if (typeof taskId !== 'number') continue;
                            const predIds = getTaskPredecessorIds(task, validTaskIds);
                            for (const predId of predIds) {
                                if (!successorsByTaskId.has(predId)) successorsByTaskId.set(predId, new Set());
                                successorsByTaskId.get(predId).add(taskId);
                            }
                        }

                        for (const task of tasks) {
                            const taskId = task?.task_id;
                            if (typeof taskId !== 'number') continue;

                            const taskNodeId = idToNodeId(taskId);
                            const layer = layerById.get(taskId) ?? 1;
                            const normalizedPriority = normalizePriority(task.priority);
                            const predIds = getTaskPredecessorIds(task, validTaskIds);

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

                            // Dependency edges (pred -> task)
                            const structuredDeps = Array.isArray(task?.dependencies) ? task.dependencies.filter(d => d && typeof d === 'object') : [];
                            const structuredByPred = new Map(structuredDeps.map(d => [d.predecessor_task_id, d]));
                            for (const predId of predIds) {
                                links.push({
                                    source: idToNodeId(predId),
                                    target: taskNodeId,
                                    type: getDependencyLinkType(structuredByPred.get(predId))
                                });
                            }

                            // Terminal tasks -> End milestone
                            const successors = successorsByTaskId.get(taskId);
                            if (!successors || successors.size === 0) {
                                links.push({ source: taskNodeId, target: projectEndNodeId, type: 'DEPENDS_FS' });
                            }
                        }

                        return {
                            nodes,
                            links,
                            details,
                            meta: (() => {
                                const raw = (data && typeof data.meta === 'object' && data.meta) ? data.meta : {};
                                const meta = { ...raw };

                                if (typeof meta.walkthroughEnabled !== 'boolean') meta.walkthroughEnabled = true;

                                // Convention: per-project tour file lives alongside tasks.json
                                // at /tasksDB/<projectId>/tour/graph-tour.json.
                                if (!meta.walkthroughStepsPath && inferredProjectId) {
                                    // Relative to /graph-display/ so it works on GitHub Pages subpaths.
                                    meta.walkthroughStepsPath = `../tasksDB/${inferredProjectId}/tour/graph-tour.json`;
                                }

                                if (typeof meta.showProfileButton !== 'boolean') meta.showProfileButton = true;
                                if (typeof meta.showCoreButton !== 'boolean') meta.showCoreButton = false;
                                if (typeof meta.showCvButton !== 'boolean') meta.showCvButton = false;
                                if (!meta.menuLabels || typeof meta.menuLabels !== 'object') {
                                    meta.menuLabels = {
                                        profile: '🧩 Focus Project',
                                        core: '⭐',
                                        cv: '📄',
                                        tour: '👋 Start Project Tour'
                                    };
                                } else {
                                    meta.menuLabels = {
                                        profile: meta.menuLabels.profile || '🧩 Focus Project',
                                        core: meta.menuLabels.core || '⭐',
                                        cv: meta.menuLabels.cv || '📄',
                                        tour: meta.menuLabels.tour || '👋 Start Project Tour'
                                    };
                                }

                                if (!meta.legendMode) meta.legendMode = 'task-management';
                                if (!meta.profileNodeId) meta.profileNodeId = 'project-start';

                                return meta;
                            })(),
                            configOverrides: data.configOverrides || {
                                colorMode: 'priority',
                                sizeMode: 'hours',
                                taskSizing: { minHours, maxHours, minRadius: 16, maxRadius: 44 }
                            }
                        };
                    })();

                    const tpl = {
                        id: entry.id,
                        name: entry.name,
                        description: data.description || entry.name,
                        nodes: built.nodes,
                        links: built.links,
                        details: built.details,
                        meta: built.meta,
                        configOverrides: built.configOverrides
                    };
                    TEMPLATE_REGISTRY.set(entry.id, tpl);
                }
            } catch (e) {
                console.warn('Error loading template entry', entry && entry.id, e && e.message);
            }
        }

        // If the app is asked for a <projectId>-tasks template that isn't in registry.json,
        // try to fetch it directly from /tasksDB/<projectId>/tasks.json.
        await maybeLoadDynamicTaskDbTemplate(basePath);
    } catch (e) {
        console.warn('initTemplates failed (fallback to built-in):', e && e.message);

        // Still try dynamic TaskDB loading in case registry.json is missing.
        try {
            const basePath = (window.location && window.location.pathname) ? window.location.pathname.replace(/\/[^\/]*$/, '/') : './';
            await maybeLoadDynamicTaskDbTemplate(basePath);
        } catch {
            // ignore
        }
    }
}

export function getAvailableTemplates() {
    return Array.from(TEMPLATE_REGISTRY.values()).map(t => ({ id: t.id, name: t.name, description: t.description }));
}

export function loadTemplate(templateId) {
    let tpl = null;

    if (templateId && TEMPLATE_REGISTRY.has(templateId)) {
        tpl = TEMPLATE_REGISTRY.get(templateId);
    } else if (TEMPLATE_REGISTRY.has(CAREER_TEMPLATE_ID)) {
        tpl = TEMPLATE_REGISTRY.get(CAREER_TEMPLATE_ID);
    } else if (TEMPLATE_REGISTRY.size > 0) {
        tpl = TEMPLATE_REGISTRY.values().next().value;
    }

    if (!tpl) {
        // Return a safe empty template when none are available synchronously.
        return {
            template: { id: 'none', name: 'Empty Template', description: 'No template loaded', meta: {} },
            nodes: [],
            links: [],
            details: {},
            configOverrides: {}
        };
    }

    return { template: { id: tpl.id, name: tpl.name, description: tpl.description, meta: tpl.meta }, nodes: tpl.nodes || [], links: tpl.links || [], details: tpl.details || {}, configOverrides: tpl.configOverrides || {} };
}

export function getDefaultTemplateId() {
    if (TEMPLATE_REGISTRY.has(CAREER_TEMPLATE_ID)) return CAREER_TEMPLATE_ID;
    if (TEMPLATE_REGISTRY.size > 0) return TEMPLATE_REGISTRY.keys().next().value;
    return CAREER_TEMPLATE_ID;
}

// Backwards-compatible exports (default to the Career template when available in the runtime registry)
export const GRAPH_NODES = (TEMPLATE_REGISTRY.has(CAREER_TEMPLATE_ID) ? (TEMPLATE_REGISTRY.get(CAREER_TEMPLATE_ID).nodes || []) : []);
export const GRAPH_LINKS = (TEMPLATE_REGISTRY.has(CAREER_TEMPLATE_ID) ? (TEMPLATE_REGISTRY.get(CAREER_TEMPLATE_ID).links || []) : []);
export const GRAPH_DETAILS = (TEMPLATE_REGISTRY.has(CAREER_TEMPLATE_ID) ? (TEMPLATE_REGISTRY.get(CAREER_TEMPLATE_ID).details || {}) : {});