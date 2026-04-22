/*
 * IMPORTANT: Graph definitions (nodes, relationships, details) must come from
 * external JSON templates following the schemas in `tasksDB/_schema/`.
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

// NOTE: Templates are registered at runtime by `initTemplates()` (fetching `tasksDB/registry.json`)
// or can be populated synchronously using `template-loader.js` helpers (e.g., `syncBuiltInTemplates`).
const TEMPLATE_REGISTRY = new Map();

// Lightweight schema validation (no external dependency)
function validateAgainstSchema(obj, schema) {
    // Basic checks based on schema structure provided in tasksDB/_schema/graph-template.schema.json
    if (!obj || typeof obj !== 'object') return { valid: false, errors: ['Not an object'] };
    // Career-like: rawNodes + rawRelationships + details
    if (Array.isArray(obj.rawNodes) && Array.isArray(obj.rawRelationships) && obj.details) return { valid: true };
    // Task-management-like: project + tasks
    if (obj.project && Array.isArray(obj.tasks)) return { valid: true };
    return { valid: false, errors: ['Does not match expected career or task-management schema'] };
}

function resolveProjectIdFromTasksPath(path) {
    const s = String(path || '').replace(/\\/g, '/');
    // Handle tasksDB/(external|local/)?projectId/tasks.json
    const m = s.match(/tasksDB\/(?:(?:external|local)\/)?([^\/]+)\/tasks\.json$/i);
    return m ? m[1] : null;
}

/**
 * Return the scoped base path segment for a TaskDB URL.
 * Examples:
 *   '/tasksDB/external/first-graph/tasks.json' → 'external/first-graph'
 *   '/tasksDB/local/test-tasks/tasks.json'     → 'local/test-tasks'
 *   '/tasksDB/first-graph/tasks.json'           → 'first-graph'  (legacy)
 */
function resolveProjectScopedBase(path) {
    const s = String(path || '').replace(/\\/g, '/');
    const m = s.match(/tasksDB\/((?:external\/|local\/)?)([^\/]+)\/(?:tasks\.json|data\.json)?/i);
    if (!m) return null;
    const scope = (m[1] || '').replace(/\/$/, '');
    const projectId = m[2];
    return scope ? `${scope}/${projectId}` : projectId;
}

function normalizeTaskDbWalkthroughPath(pathValue, scopedBase) {
    const raw = String(pathValue || '').trim();
    if (!raw) {
        return scopedBase ? `../tasksDB/${scopedBase}/tour/graph-tour.json` : '';
    }

    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) return raw;
    if (!scopedBase) return raw;

    const normalized = raw.replace(/\\/g, '/').replace(/^\.\//, '');

    if (normalized.startsWith('../tasksDB/')) return normalized;
    if (normalized.startsWith('tasksDB/')) return `../${normalized}`;
    if (normalized.startsWith('../tour/')) return `../tasksDB/${scopedBase}/tour/${normalized.slice('../tour/'.length)}`;
    if (normalized.startsWith('tour/')) return `../tasksDB/${scopedBase}/${normalized}`;

    return `../tasksDB/${scopedBase}/${normalized.replace(/^\.\.\//, '')}`;
}

function buildEmbeddedTaskDbTemplate(entry, data, scopedBase, embeddedGraphName) {
    const graphTemplate = data && data.graphTemplate;
    if (!graphTemplate || !Array.isArray(graphTemplate.rawNodes) || !Array.isArray(graphTemplate.rawRelationships)) {
        return null;
    }

    const { nodes, links } = convertCypherToGraph({
        rawNodes: graphTemplate.rawNodes,
        rawRelationships: graphTemplate.rawRelationships
    });

    const meta = (graphTemplate && typeof graphTemplate.meta === 'object' && graphTemplate.meta)
        ? { ...graphTemplate.meta }
        : {};

    if (typeof meta.walkthroughEnabled !== 'boolean') meta.walkthroughEnabled = true;

    const walkthroughStepsPath = normalizeTaskDbWalkthroughPath(meta.walkthroughStepsPath, scopedBase);
    if (walkthroughStepsPath) meta.walkthroughStepsPath = walkthroughStepsPath;

    return {
        id: entry.id,
        name: graphTemplate.name || embeddedGraphName || entry.name,
        description: graphTemplate.description || data.description || entry.name,
        nodes,
        links,
        details: graphTemplate.details || {},
        meta,
        configOverrides: graphTemplate.configOverrides || {}
    };
}

function normalizeProjectRelativeModulePath(modulePath, entryPath) {
    const raw = String(modulePath || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '');
    if (!raw) return '';
    if (raw.startsWith('src/')) return raw;

    const entryRaw = String(entryPath || '').replace(/\\/g, '/');
    const match = entryRaw.match(/tasksDB\/(?:external|local\/)?[^\/]+\/(.+)$/i);
    const relativeEntryFile = match ? match[1] : '';
    const relativeEntryDir = relativeEntryFile.includes('/') ? relativeEntryFile.slice(0, relativeEntryFile.lastIndexOf('/')) : '';

    if (!relativeEntryDir) return raw;
    if (raw.startsWith(`${relativeEntryDir}/`)) return raw;
    return `${relativeEntryDir}/${raw}`.replace(/^\.\//, '');
}

function normalizeNavigationModules(modules, entryPath) {
    if (!Array.isArray(modules)) return [];
    return modules
        .filter(moduleEntry => moduleEntry && typeof moduleEntry === 'object')
        .map(moduleEntry => ({
            ...moduleEntry,
            path: normalizeProjectRelativeModulePath(moduleEntry.path, entryPath),
            taskIds: Array.isArray(moduleEntry.taskIds)
                ? moduleEntry.taskIds.filter(Boolean)
                : (Array.isArray(moduleEntry.task_ids) ? moduleEntry.task_ids.filter(Boolean) : [])
        }))
        .filter(moduleEntry => moduleEntry.path);
}

const INLINE_TASK_ID_PREFIX = '__inline_task_id__:';

function buildInlineTaskIdPath(taskId) {
    return typeof taskId === 'number' && Number.isFinite(taskId)
        ? `${INLINE_TASK_ID_PREFIX}${taskId}`
        : null;
}

function parseInlineTaskPath(path) {
    const raw = String(path || '').trim();
    if (!raw.startsWith(INLINE_TASK_ID_PREFIX)) return null;
    const taskId = Number.parseInt(raw.slice(INLINE_TASK_ID_PREFIX.length), 10);
    return Number.isFinite(taskId) ? { taskId } : null;
}

function hasOwnInlineSubtasks(task) {
    return Array.isArray(task?.subtasks) && task.subtasks.some(Boolean);
}

function buildChildrenByParentTaskId(tasks) {
    const childrenByParentId = new Map();
    if (!Array.isArray(tasks)) return childrenByParentId;

    tasks.forEach((task) => {
        if (!task || typeof task !== 'object') return;
        const parentTaskId = task.parent_task_id;
        if (typeof parentTaskId !== 'number' || !Number.isFinite(parentTaskId)) return;
        if (!childrenByParentId.has(parentTaskId)) childrenByParentId.set(parentTaskId, []);
        childrenByParentId.get(parentTaskId).push(task);
    });

    return childrenByParentId;
}

function collectDescendantTasks(childrenByParentId, parentTaskId, visited = new Set()) {
    if (!childrenByParentId.has(parentTaskId) || visited.has(parentTaskId)) return [];
    visited.add(parentTaskId);

    const descendants = [];
    for (const childTask of childrenByParentId.get(parentTaskId)) {
        descendants.push(childTask);
        if (typeof childTask?.task_id === 'number' && Number.isFinite(childTask.task_id)) {
            descendants.push(...collectDescendantTasks(childrenByParentId, childTask.task_id, visited));
        }
    }

    visited.delete(parentTaskId);
    return descendants;
}

function toFiniteNumber(...values) {
    for (const value of values) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
}

function normalizeInlineAssignedWorkers(subtask) {
    if (Array.isArray(subtask?.assigned_workers)) return subtask.assigned_workers.filter(Boolean);
    if (subtask?.assigned_to) {
        return [{ name: String(subtask.assigned_to), email: '', role: '' }];
    }
    return [];
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeStringList(value, fallback = []) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (Array.isArray(fallback)) return fallback.filter(Boolean);
    return [];
}

function normalizeAssignedWorkersList(task, fallbackTask = {}) {
    const ownWorkers = normalizeInlineAssignedWorkers(task);
    if (ownWorkers.length > 0) return ownWorkers;
    return Array.isArray(fallbackTask?.assigned_workers) ? fallbackTask.assigned_workers.filter(Boolean) : [];
}

function buildPopupListDropdown(title, items, renderItem) {
    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
    if (safeItems.length === 0) return null;
    return `<details class="popup-dropdown"><summary><strong>${escapeHtml(title)}</strong> <span class="popup-dropdown-count">(${safeItems.length})</span></summary><ul>${safeItems.map(renderItem).join('')}</ul></details>`;
}

function formatWorkerLabel(worker) {
    if (!worker) return '';
    if (typeof worker === 'string') return worker.trim();
    if (typeof worker !== 'object') return '';
    const name = String(worker.name || worker.id || '').trim();
    const role = String(worker.role || '').trim();
    if (name && role) return `${name} (${role})`;
    return name || role;
}

function buildTaskSupplementalDetailItems(task) {
    const detailItems = [];

    const timelineParts = [];
    if (task.start_date) timelineParts.push(`Start: ${escapeHtml(task.start_date)}`);
    if (task.end_date) timelineParts.push(`End: ${escapeHtml(task.end_date)}`);
    if (task.due_date) timelineParts.push(`Due: ${escapeHtml(task.due_date)}`);
    if (timelineParts.length > 0) {
        detailItems.push(`<strong>Timeline:</strong> ${timelineParts.join(' | ')}`);
    }

    const numericProgress = Number(task.progress_percentage);
    if (Number.isFinite(numericProgress)) {
        detailItems.push(`<strong>Progress:</strong> ${numericProgress}%`);
    }

    const actualHours = Number(task.actual_hours);
    if (Number.isFinite(actualHours) && actualHours > 0) {
        detailItems.push(`<strong>Actual hours:</strong> ${actualHours}`);
    }

    const summaryBits = [];
    if (task.sprint_name) summaryBits.push(`Sprint: ${escapeHtml(task.sprint_name)}`);
    if (task.complexity) summaryBits.push(`Complexity: ${escapeHtml(task.complexity)}`);
    if (task.is_critical_path) summaryBits.push('Critical path');
    if (summaryBits.length > 0) {
        detailItems.push(`<strong>Planning:</strong> ${summaryBits.join(' | ')}`);
    }

    const workers = normalizeAssignedWorkersList(task);
    if (workers.length > 0) {
        detailItems.push(`<strong>Assigned:</strong> ${workers.map(formatWorkerLabel).filter(Boolean).map(escapeHtml).join(', ')}`);
    }

    if (task.reviewer) {
        detailItems.push(`<strong>Reviewer:</strong> ${escapeHtml(task.reviewer)}`);
    }

    const tags = normalizeStringList(task.tags);
    if (tags.length > 0) {
        detailItems.push(`<strong>Tags:</strong> ${tags.map(escapeHtml).join(', ')}`);
    }

    if (task.blocker_reason) {
        detailItems.push(`<strong>Blocker:</strong> ${escapeHtml(task.blocker_reason)}`);
    }

    const links = Array.isArray(task.links) ? task.links.filter(Boolean) : [];
    const linksHtml = buildPopupListDropdown('Links', links, (linkItem) => {
        if (typeof linkItem === 'string') {
            const safeUrl = escapeHtml(linkItem);
            return `<li><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a></li>`;
        }

        if (!linkItem || typeof linkItem !== 'object') return '';
        const url = escapeHtml(linkItem.url || linkItem.href || linkItem.path || '');
        const label = escapeHtml(linkItem.label || linkItem.title || linkItem.name || linkItem.url || linkItem.href || 'Link');
        if (!url) return `<li>${label}</li>`;
        return `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></li>`;
    });
    if (linksHtml) detailItems.push(linksHtml);

    const attachments = Array.isArray(task.attachments) ? task.attachments.filter(Boolean) : [];
    const attachmentsHtml = buildPopupListDropdown('Attachments', attachments, (attachment) => {
        if (typeof attachment === 'string') return `<li>${escapeHtml(attachment)}</li>`;
        if (!attachment || typeof attachment !== 'object') return '';
        const label = escapeHtml(attachment.name || attachment.label || attachment.title || attachment.url || attachment.path || 'Attachment');
        const url = escapeHtml(attachment.url || attachment.path || '');
        return url
            ? `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></li>`
            : `<li>${label}</li>`;
    });
    if (attachmentsHtml) detailItems.push(attachmentsHtml);

    const comments = Array.isArray(task.comments) ? task.comments.filter(Boolean) : [];
    const commentsHtml = buildPopupListDropdown('Comments', comments, (comment) => {
        if (typeof comment === 'string') return `<li>${escapeHtml(comment)}</li>`;
        if (!comment || typeof comment !== 'object') return '';
        const author = escapeHtml(comment.author || comment.user || 'Comment');
        const date = escapeHtml(comment.date || comment.created_date || '');
        const text = escapeHtml(comment.text || comment.body || '');
        const prefix = date ? `${author} - ${date}` : author;
        return `<li><strong>${prefix}</strong>${text ? `: ${text}` : ''}</li>`;
    });
    if (commentsHtml) detailItems.push(commentsHtml);

    return detailItems;
}

function normalizeInlineSubtaskTask(subtask, index, parentTask = {}) {
    if (!subtask || typeof subtask !== 'object') return null;

    const taskName = String(subtask.task_name || subtask.name || subtask.title || `Subtask ${index + 1}`).trim();
    if (!taskName) return null;
    const numericTaskId = Number(subtask.task_id);

    const assignedWorkers = normalizeAssignedWorkersList(subtask, parentTask);
    const acceptanceCriteria = normalizeStringList(subtask.acceptance_criteria, parentTask.acceptance_criteria);
    const tags = normalizeStringList(subtask.tags, parentTask.tags);
    const comments = Array.isArray(subtask.comments) ? subtask.comments.filter(Boolean) : [];
    const attachments = Array.isArray(subtask.attachments) ? subtask.attachments.filter(Boolean) : [];
    const links = Array.isArray(subtask.links) ? subtask.links.filter(Boolean) : [];

    return {
        task_id: Number.isInteger(numericTaskId) && numericTaskId > 0 ? numericTaskId : null,
        task_name: taskName,
        description: subtask.description || subtask.text || parentTask.description || '',
        priority: subtask.priority || parentTask.priority || 'Medium',
        status: subtask.status || parentTask.status || 'Not Started',
        estimated_hours: toFiniteNumber(subtask.estimated_hours, subtask.estimatedHours, subtask.hours),
        actual_hours: toFiniteNumber(subtask.actual_hours, subtask.actualHours),
        progress_percentage: toFiniteNumber(subtask.progress_percentage, parentTask.progress_percentage),
        complexity: subtask.complexity || parentTask.complexity || '',
        blocker_reason: subtask.blocker_reason || parentTask.blocker_reason || '',
        reviewer: subtask.reviewer || parentTask.reviewer || '',
        sprint_name: subtask.sprint_name || parentTask.sprint_name || '',
        is_critical_path: Boolean(subtask.is_critical_path || parentTask.is_critical_path),
        category_name: subtask.category_name || parentTask.category_name || parentTask.sprint_name || '',
        start_date: subtask.start_date || parentTask.start_date || parentTask.due_date || parentTask.end_date || '',
        end_date: subtask.end_date || subtask.due_date || parentTask.end_date || parentTask.due_date || '',
        due_date: subtask.due_date || subtask.end_date || parentTask.due_date || parentTask.end_date || '',
        tags,
        acceptance_criteria: acceptanceCriteria,
        dependencies: Array.isArray(subtask.dependencies) ? subtask.dependencies.filter(Boolean) : [],
        assigned_workers: assignedWorkers,
        subtasks: Array.isArray(subtask.subtasks) ? subtask.subtasks.filter(Boolean) : [],
        comments,
        attachments,
        links
    };
}

function buildInlineSubgraphData(sourceData, task) {
    if (!sourceData || !task) return null;

    let inlineTasks = [];

    if (hasOwnInlineSubtasks(task)) {
        inlineTasks = task.subtasks
            .map((subtask, index) => normalizeInlineSubtaskTask(subtask, index, task))
            .filter(Boolean);
    }

    if (!inlineTasks.length && typeof task.task_id === 'number' && Number.isFinite(task.task_id)) {
        const childrenByParentId = buildChildrenByParentTaskId(Array.isArray(sourceData.tasks) ? sourceData.tasks : []);
        inlineTasks = collectDescendantTasks(childrenByParentId, task.task_id).map((childTask) => ({ ...childTask }));
    }

    if (!inlineTasks.length) return null;

    const taskLabel = String(task.task_name || task.name || task.title || 'Subtasks').trim() || 'Subtasks';
    const baseProject = sourceData.project && typeof sourceData.project === 'object' ? sourceData.project : {};

    return {
        ...sourceData,
        project: {
            ...baseProject,
            name: taskLabel,
            description: task.description || baseProject.description || sourceData.description || ''
        },
        description: task.description || sourceData.description || '',
        tasks: inlineTasks
    };
}

function buildInlineSubtaskTargets(task, childrenByParentId) {
    const hasChildSubgraph = hasOwnInlineSubtasks(task)
        || (typeof task?.task_id === 'number' && Number.isFinite(task.task_id) && childrenByParentId.has(task.task_id));

    if (!hasChildSubgraph) return [];

    const inlinePath = buildInlineTaskIdPath(task.task_id);
    return inlinePath ? [{ path: inlinePath, label: 'Subtasks' }] : [];
}

function normalizeExplicitSubtaskTargets(task) {
    const explicitTargets = Array.isArray(task?.subtasksTargets)
        ? task.subtasksTargets
            .filter(target => target && target.path)
            .map((target) => ({
                path: String(target.path || '').trim(),
                label: String(target.label || 'Subtasks').trim() || 'Subtasks'
            }))
            .filter(target => target.path)
        : [];

    if (explicitTargets.length > 0) return explicitTargets;

    const explicitPath = String(task?.subtasksPath || '').trim();
    return explicitPath ? [{ path: explicitPath, label: 'Subtasks' }] : [];
}

function resolveTaskSubtaskTargets(task, childrenByParentId) {
    const inlineTargets = buildInlineSubtaskTargets(task, childrenByParentId);
    if (inlineTargets.length > 0) return inlineTargets;

    const explicitTargets = normalizeExplicitSubtaskTargets(task);
    return explicitTargets.length > 0 ? [explicitTargets[0]] : [];
}

function getTaskNarrativeText(task) {
    const tags = Array.isArray(task?.tags) ? task.tags.join(' ') : '';
    return [task?.task_name, task?.description, task?.category_name, tags]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

function resolveProjectEndConfig(project) {
    if (project && typeof project.graph_end === 'object' && project.graph_end) return project.graph_end;
    if (project && typeof project.end_node === 'object' && project.end_node) return project.end_node;
    return {};
}

function resolveProjectEndMode(project, terminalTasks) {
    const endConfig = resolveProjectEndConfig(project);
    const explicitMode = String(endConfig.mode || '').trim().toLowerCase();
    if (['milestone', 'handoff', 'loop', 'checkpoint'].includes(explicitMode)) return explicitMode;

    const taskNarrative = terminalTasks.map(getTaskNarrativeText).join(' ');
    const configNarrative = [endConfig.summary, endConfig.next_step, endConfig.next_graph, endConfig.maintenance_rhythm]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    const narrative = `${taskNarrative} ${configNarrative}`.trim();

    if (/(monitor|monitoring|maintenance|maintain|support|operations|operate|triage|backlog|incident)/.test(narrative)) {
        return 'loop';
    }
    if (endConfig.next_graph || /(handoff|handover|downstream|publish|deploy|release|sync|export|deliver|integration)/.test(narrative)) {
        return 'handoff';
    }
    return 'milestone';
}

function buildProjectEndDetails(project, terminalTasks, totalProjectHours = 0) {
    const endConfig = resolveProjectEndConfig(project);
    const endMode = resolveProjectEndMode(project, terminalTasks);
    const terminalNames = terminalTasks
        .map(task => String(task?.task_name || '').trim())
        .filter(Boolean);
    const preview = terminalNames.slice(0, 5);
    const remainingCount = Math.max(0, terminalNames.length - preview.length);

    const terminalSummary = preview.length
        ? `<strong>Terminal tasks captured here:</strong> ${preview.join(' · ')}${remainingCount > 0 ? ` · +${remainingCount} more` : ''}.`
        : '<strong>Terminal tasks captured here:</strong> none detected yet. Treat this node as the intended completion anchor for the mapped scope.';

    const endTypeLabel = {
        milestone: 'True finish for this graph scope',
        handoff: 'Handoff into downstream work',
        loop: 'Operational loop / ongoing care',
        checkpoint: 'Review gate before the next graph'
    }[endMode] || 'Project completion milestone';

    const generatedMeaning = {
        milestone: 'This node marks a real completion point for the work described in this graph. New work should begin as a fresh graph or a new planned iteration.',
        handoff: 'This graph finishes its local scope here, but the outcome is meant to continue in another graph, module, delivery stream, or external team workflow.',
        loop: 'This graph closes the current delivery path, then hands the result into recurring monitoring, maintenance, support, or operational stewardship.',
        checkpoint: 'This node marks a decision or approval gate before a follow-on graph continues the broader program.'
    }[endMode];

    const generatedNextStep = {
        milestone: 'Validate the terminal deliverables and archive or explicitly start the next initiative from a new root context.',
        handoff: 'Move the output into the downstream graph, linked module, or external workflow that continues after this milestone.',
        loop: 'Shift from build work into monitoring, maintenance, issue triage, and iteration planning for the live system.',
        checkpoint: 'Review the completed scope, approve the outcome, then launch the follow-on graph or phase.'
    }[endMode];

    const generatedSuccessSignal = terminalNames.length
        ? 'Terminal tasks shown above are complete and no unresolved dependencies remain inside this graph.'
        : null;

    const generatedOngoingRhythm = endMode === 'loop'
        ? 'Keep a recurring cadence for monitoring, maintenance, and backlog intake after this milestone.'
        : null;

    return {
        title: `End: ${project.name}`,
        items: [
            terminalSummary,
            totalProjectHours > 0 ? `<strong>Total estimated hours:</strong> ${totalProjectHours}h` : null,
            `<strong>End node type:</strong> ${endTypeLabel}`,
            `<strong>Delivery meaning:</strong> ${endConfig.summary || generatedMeaning}`,
            `<strong>What happens next:</strong> ${endConfig.next_step || generatedNextStep}`,
            endConfig.next_graph ? `<strong>Downstream graph:</strong> ${endConfig.next_graph}` : null,
            `<strong>Success signal:</strong> ${endConfig.success_signal || generatedSuccessSignal}`,
            endConfig.owner ? `<strong>Owner after this node:</strong> ${endConfig.owner}` : null,
            endConfig.maintenance_rhythm ? `<strong>Ongoing rhythm:</strong> ${endConfig.maintenance_rhythm}` : (generatedOngoingRhythm ? `<strong>Ongoing rhythm:</strong> ${generatedOngoingRhythm}` : null)
        ].filter(Boolean)
    };
}

// Build a template from project_task_template format that uses string task_names and name-based deps.
// Converts to the numeric-ID format that buildTaskManagementTemplate expects.
function buildProjectTaskTemplate(entry, data, options = {}) {
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    if (!tasks.length) return null;

    const normalizedModules = normalizeNavigationModules(
        data && data.navigation && Array.isArray(data.navigation.modules) ? data.navigation.modules : [],
        entry && entry.path
    );

    // Assign sequential numeric IDs and build name→id lookup
    const nameToId = new Map();
    tasks.forEach((t, i) => {
        const key = String(t.task_name || '').trim();
        if (key) nameToId.set(key, i + 1);
    });

    // Convert to numeric-id format
    const normalizedTasks = tasks.map((t, i) => {
        const numericId = i + 1;
        const rawDeps = Array.isArray(t.dependencies) ? t.dependencies : [];
        const convertedDeps = rawDeps.map(d => {
            if (!d) return null;
            const predName = String(d.predecessor_task_name || '').trim();
            const predId = nameToId.get(predName);
            if (!predId) return null;
            return { predecessor_task_id: predId, type: d.type || 'FS', lag_days: d.lag_days || 0 };
        }).filter(Boolean);
        const explicitSubtaskTargets = normalizeExplicitSubtaskTargets(t);

        return {
            task_id: numericId,
            task_name: t.task_name || `Task ${numericId}`,
            description: t.description || '',
            start_date: t.start_date || '',
            end_date: t.end_date || '',
            due_date: t.due_date || '',
            priority: t.priority || 'Medium',
            status: t.status || 'Not Started',
            progress_percentage: t.progress_percentage ?? 0,
            estimated_hours: t.estimated_hours || 0,
            actual_hours: t.actual_hours || 0,
            complexity: t.complexity || '',
            blocker_reason: t.blocker_reason || '',
            sprint_name: t.sprint_name || '',
            reviewer: t.reviewer || '',
            is_critical_path: t.is_critical_path || false,
            category_name: t.category_name || '',
            tags: Array.isArray(t.tags) ? t.tags.filter(Boolean) : [],
            assigned_workers: Array.isArray(t.assigned_workers) ? t.assigned_workers.filter(Boolean) : [],
            acceptance_criteria: Array.isArray(t.acceptance_criteria) ? t.acceptance_criteria.filter(Boolean) : [],
            dependencies: convertedDeps,
            parent_task_id: typeof t.parent_task_id === 'number' ? t.parent_task_id : null,
            subtasks: Array.isArray(t.subtasks) ? t.subtasks.filter(Boolean) : [],
            attachments: Array.isArray(t.attachments) ? t.attachments.filter(Boolean) : [],
            links: Array.isArray(t.links) ? t.links.filter(Boolean) : [],
            comments: Array.isArray(t.comments) ? t.comments.filter(Boolean) : [],
            subtasksPath: explicitSubtaskTargets[0]?.path || null,
            subtasksTargets: explicitSubtaskTargets
        };
    });

    // Attach navigation modules to meta so the sidebar can render them
    const enrichedData = { ...data, tasks: normalizedTasks };
    if (normalizedModules.length && !enrichedData.meta) enrichedData.meta = {};
    if (normalizedModules.length) enrichedData.meta = { ...(enrichedData.meta || {}), modules: normalizedModules };
    if (normalizedModules.length) {
        enrichedData.navigation = {
            ...(enrichedData.navigation || {}),
            modules: normalizedModules
        };
    }

    return buildTaskManagementTemplate(entry, enrichedData, options);
}

function buildTaskManagementTemplate(entry, data, options = {}) {
    const scopedBase = resolveProjectScopedBase(entry.path) || resolveProjectIdFromTasksPath(entry.path);

    const embedded = buildEmbeddedTaskDbTemplate(entry, data, scopedBase, options.embeddedGraphName);
    if (embedded) return embedded;

    const project = data.project || (data.module
        ? { name: data.module.name || entry.name, description: data.description || '' }
        : { name: entry.name, description: '' });
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const navigationModules = normalizeNavigationModules(
        data && data.navigation && Array.isArray(data.navigation.modules) ? data.navigation.modules : [],
        entry && entry.path
    );
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
    // Dynamic total hours: sum task own hours + inline subtask hours across all tasks
    const totalProjectHours = tasks.reduce((sum, t) => {
        const own = Number(t.estimated_hours) || 0;
        const sub = Array.isArray(t.subtasks)
            ? t.subtasks.reduce((s, st) => s + (Number(st?.estimated_hours) || 0), 0)
            : 0;
        return sum + own + sub;
    }, 0);

    const details = {
        [projectStartNodeId]: {
            title: `Start: ${project.name}`,
            items: [
                project.description || '',
                `<strong>Tasks:</strong> ${tasks.length} | <strong>Status:</strong> ${project.status || 'Not Started'}`,
                totalProjectHours > 0 ? `<strong>Total estimated hours:</strong> ${totalProjectHours}h` : null,
                project.start_date ? `<strong>Timeline:</strong> ${project.start_date}${project.end_date ? ' → ' + project.end_date : ''}` : null,
                project.budget ? `<strong>Budget:</strong> ${project.budget}` : null
            ].filter(Boolean)
        }
    };

    const successorsByTaskId = new Map();
    const childrenByParentId = buildChildrenByParentTaskId(tasks);
    for (const task of tasks) {
        const taskId = task?.task_id;
        if (typeof taskId !== 'number') continue;
        const predIds = getTaskPredecessorIds(task, validTaskIds);
        for (const predId of predIds) {
            if (!successorsByTaskId.has(predId)) successorsByTaskId.set(predId, new Set());
            successorsByTaskId.get(predId).add(taskId);
        }
    }

    const terminalTasks = tasks.filter((task) => {
        const taskId = task?.task_id;
        if (typeof taskId !== 'number') return false;
        const successors = successorsByTaskId.get(taskId);
        return !successors || successors.size === 0;
    });
    details[projectEndNodeId] = buildProjectEndDetails(project, terminalTasks, totalProjectHours);

    for (const task of tasks) {
        const taskId = task?.task_id;
        if (typeof taskId !== 'number') continue;

        const taskNodeId = idToNodeId(taskId);
        const layer = layerById.get(taskId) ?? 1;
        const normalizedPriority = normalizePriority(task.priority);
        const predIds = getTaskPredecessorIds(task, validTaskIds);
        const effectiveSubtaskTargets = resolveTaskSubtaskTargets(task, childrenByParentId);
        const primarySubtaskTarget = effectiveSubtaskTargets[0] || null;
        const effectiveSubtasksPath = primarySubtaskTarget?.path || null;

        nodes.push({
            id: taskNodeId,
            label: task.task_name || `Task ${taskId}`,
            type: 'parent',
            layer,
            parentId: projectStartNodeId,
            templateType: 'task',
            priority: normalizedPriority,
            estimatedHours: Number(task.estimated_hours) || 0,
            status: task.status || 'Not Started',
            subtasksPath: effectiveSubtasksPath,
            subtasksTargets: primarySubtaskTarget ? [primarySubtaskTarget] : []
        });

        if (!predIds.length) links.push({ source: projectStartNodeId, target: taskNodeId, type: 'HAS_TASK' });

        // Build predecessor pairs (id + name + nodeId) keeping indices aligned
        const predecessorPairs = predIds
            .map(id => {
                const name = taskById.get(id)?.task_name;
                return name ? { id, name, nodeId: idToNodeId(id) } : null;
            })
            .filter(Boolean);
        const predecessorNames = predecessorPairs.map(p => p.name);
        const cycleNote = cycleNodes.has(taskId) ? '<strong>Warning:</strong> dependency cycle detected.' : null;

        // Render dependency names as clickable task-node-btn buttons
        const depsHtml = predecessorPairs.length
            ? `<strong>Depends on:</strong> ${predecessorPairs.map(p => {
                const depTask = taskById.get(p.id);
                const depPriority = normalizePriority(depTask?.priority);
                const depStatus = (depTask?.status || 'Not Started').toLowerCase().replace(/\s+/g, '-');
                const depHours = Number(depTask?.estimated_hours) || 0;
                const depHoursLabel = depHours ? ` <span class="tn-hours">${depHours}h</span>` : '';
                return `<button class="task-node-btn" data-node-id="${p.nodeId}" data-priority="${depPriority}" data-status="${depStatus}" data-hours="${depHours}" title="Go to: ${p.name} (${depPriority}, ${depHours}h)"><span class="tn-name">${p.name}</span>${depHoursLabel}</button>`;
              }).join(' ')}`
            : '<strong>Depends on:</strong> none';

        // Render successor names as clickable task-node-btn buttons ("Leads to")
        const successorIds = successorsByTaskId.get(taskId);
        const leadsToHtml = successorIds && successorIds.size > 0
            ? `<strong>Leads to:</strong> ${[...successorIds].map(succId => {
                const succTask = taskById.get(succId);
                const succPriority = normalizePriority(succTask?.priority);
                const succStatus = (succTask?.status || 'Not Started').toLowerCase().replace(/\s+/g, '-');
                const succHours = Number(succTask?.estimated_hours) || 0;
                const succHoursLabel = succHours ? ` <span class="tn-hours">${succHours}h</span>` : '';
                const succName = escapeHtml(succTask?.task_name || String(succId));
                return `<button class="task-node-btn" data-node-id="${idToNodeId(succId)}" data-priority="${succPriority}" data-status="${succStatus}" data-hours="${succHours}" title="Go to: ${succTask?.task_name || succId} (${succPriority}, ${succHours}h)"><span class="tn-name">${succName}</span>${succHoursLabel}</button>`;
              }).join(' ')}`
            : null;

        // Build acceptance criteria dropdown
        const ac = Array.isArray(task.acceptance_criteria) ? task.acceptance_criteria.filter(Boolean) : [];
        const acHtml = ac.length > 0
            ? `<details class="popup-dropdown"><summary><strong>Acceptance Criteria</strong> <span class="popup-dropdown-count">(${ac.length})</span></summary><ul>${ac.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul></details>`
            : null;

        // Build subtasks dropdown with node-like buttons
        const rawSubtasks = Array.isArray(task.subtasks) ? task.subtasks.filter(Boolean) : [];
        const enrichedSubtasks = rawSubtasks
            .map((subtask, index) => normalizeInlineSubtaskTask(subtask, index, task))
            .filter(Boolean)
            .map((subtask) => ({
                ...subtask,
                estimated_hours: subtask.estimated_hours || (typeof task.estimated_hours === 'number' ? Math.round(task.estimated_hours / Math.max(rawSubtasks.length, 1)) : 0)
            }));
        const inlineSubgraphUsesExplicitIds = enrichedSubtasks.length > 0
            && enrichedSubtasks.every((subtask) => Number.isInteger(Number(subtask?.task_id)) && Number(subtask.task_id) > 0);
        const subtasksDetailHtml = enrichedSubtasks.length > 0
            ? `<details class="popup-dropdown"><summary><strong>Sub-tasks</strong> <span class="popup-dropdown-count">(${enrichedSubtasks.length})</span></summary><div class="task-node-list">${enrichedSubtasks.map((s, index) => {
                const sLabel = String(s.task_name || `Subtask ${index + 1}`);
                const sName = escapeHtml(sLabel);
                const sPriority = normalizePriority(s.priority);
                const sStatusNorm = (s.status || 'Not Started').toLowerCase().replace(/\s+/g, '-');
                const sHours = s.estimated_hours ? `${s.estimated_hours}h` : '';
                const titleBits = [s.description, s.category_name ? `Category: ${s.category_name}` : '', s.due_date ? `Due: ${s.due_date}` : ''].filter(Boolean);
                const titleAttr = titleBits.length > 0 ? ` title="${escapeHtml(titleBits.join(' | '))}"` : '';
                const targetTaskId = inlineSubgraphUsesExplicitIds ? Number(s.task_id) : index + 1;
                const subtaskPathAttr = effectiveSubtasksPath ? ` data-subtasks-path="${escapeHtml(effectiveSubtasksPath)}"` : '';
                const targetNodeIdAttr = effectiveSubtasksPath && Number.isInteger(targetTaskId) && targetTaskId > 0
                    ? ` data-subgraph-node-id="${idToNodeId(targetTaskId)}"`
                    : '';
                const targetLabelAttr = effectiveSubtasksPath ? ` data-target-node-label="${escapeHtml(sLabel)}"` : '';
                return `<button class="task-node-btn" data-priority="${sPriority}" data-status="${sStatusNorm}"${subtaskPathAttr}${targetNodeIdAttr}${targetLabelAttr}${titleAttr}><span class="tn-name">${sName}</span>${sHours ? `<span class="tn-hours">${sHours}</span>` : ''}</button>`;
            }).join('')}</div></details>`
            : null;

        const supplementalDetailItems = buildTaskSupplementalDetailItems(task);

        // Sum estimated hours across task + inline subtasks for display
        const taskOwnHours = Number(task.estimated_hours) || 0;
        const subtaskHoursSum = enrichedSubtasks.reduce((s, st) => s + (Number(st.estimated_hours) || 0), 0);
        const totalTaskHours = taskOwnHours + subtaskHoursSum;
        const hoursLabel = subtaskHoursSum > 0
            ? `${taskOwnHours} + ${subtaskHoursSum} subtask = ${totalTaskHours}h total`
            : `${taskOwnHours}`;

        details[taskNodeId] = {
            title: task.task_name || `Task ${taskId}`,
            items: [
                `<strong>Priority:</strong> ${normalizedPriority} | <strong>Status:</strong> ${task.status || 'Not Started'}`,
                `<strong>Estimated hours:</strong> ${hoursLabel}`,
                `<strong>Dependency layer:</strong> ${layer}`,
                task.category_name ? `<strong>Category:</strong> ${task.category_name}` : null,
                ...supplementalDetailItems,
                task.description ? `<strong>Description:</strong> ${task.description}` : null,
                depsHtml,
                leadsToHtml,
                cycleNote,
                acHtml,
                subtasksDetailHtml
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

    const walkthroughStepsPath = normalizeTaskDbWalkthroughPath(meta.walkthroughStepsPath, scopedBase);
    if (walkthroughStepsPath) meta.walkthroughStepsPath = walkthroughStepsPath;

    if (typeof meta.showProfileButton !== 'boolean') meta.showProfileButton = true;
    if (typeof meta.showCoreButton !== 'boolean') meta.showCoreButton = false;
    if (typeof meta.showCvButton !== 'boolean') meta.showCvButton = false;
    if (!meta.menuLabels || typeof meta.menuLabels !== 'object') {
        meta.menuLabels = { profile: '🧩 Focus Project', core: '⭐', cv: '📄', tour: '👋 Start Project Tour' };
    }
    if (!meta.legendMode) meta.legendMode = 'task-management';
    if (!meta.profileNodeId) meta.profileNodeId = 'project-start';

    // Propagate navigation modules to meta so the sidebar can render them
    // If no explicit modules exist, generate virtual modules from task hierarchy + categories
    if (navigationModules.length && !meta.modules) {
        meta.modules = navigationModules;
    } else if (!navigationModules.length && !meta.modules && tasks.length > 0) {
        const virtualModules = [];

        // Build parent-task virtual modules for tasks with subtasks (hierarchical view)
        const childIdsByParent = new Map();
        for (const task of tasks) {
            if (typeof task.parent_task_id === 'number' && task.parent_task_id) {
                const arr = childIdsByParent.get(task.parent_task_id) || [];
                arr.push(task.task_id);
                childIdsByParent.set(task.parent_task_id, arr);
            }
        }
        const tasksWithSubtasks = tasks.filter(t => {
            if (Array.isArray(t.subtasks) && t.subtasks.length > 0) return true;
            if (t.subtasksPath) return true;
            if (Array.isArray(t.subtasksTargets) && t.subtasksTargets.length > 0) return true;
            if (childIdsByParent.has(t.task_id)) return true;
            return false;
        });
        if (tasksWithSubtasks.length > 0) {
            for (const task of tasksWithSubtasks) {
                const subtaskCount = (childIdsByParent.get(task.task_id) || []).length
                    || (Array.isArray(task.subtasks) ? task.subtasks.length : 0);
                virtualModules.push({
                    name: task.task_name || `Task ${task.task_id}`,
                    label: task.task_name || `Task ${task.task_id}`,
                    path: `__parent_task__:${task.task_id}`,
                    type: 'parent-task',
                    category: task.category_name || '',
                    subtaskCount,
                    taskIds: [task.task_id]
                });
            }
        }

        // Build category-based virtual entries (filter view)
        const categoryMap = new Map();
        for (const task of tasks) {
            const cat = String(task.category_name || '').trim() || 'Uncategorized';
            if (!categoryMap.has(cat)) categoryMap.set(cat, []);
            categoryMap.get(cat).push(task.task_id);
        }
        if (categoryMap.size > 1) {
            for (const [cat, ids] of categoryMap) {
                virtualModules.push({
                    name: cat,
                    label: cat,
                    path: `__category__:${cat}`,
                    type: 'category',
                    taskIds: ids
                });
            }
        }

        if (virtualModules.length) meta.modules = virtualModules;
        meta._categoryModules = virtualModules.some(m => m.type === 'category');
    }

    return {
        id: entry.id,
        name: entry.name,
        description: data.description || project.description || entry.name,
        nodes,
        links,
        details,
        meta,
        sourceData: data,
        sourceEntry: entry,
        configOverrides: data.configOverrides || {
            colorMode: 'priority',
            sizeMode: 'hours',
            taskSizing: { minHours, maxHours, minRadius: 16, maxRadius: 44 }
        }
    };
}

// Detect if running in development mode (localhost)
function isDevMode() {
    if (typeof window === 'undefined' || !window.location) return false;
    const host = String(window.location.hostname || '');
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

export async function ensureDynamicTaskTemplate(requestedTemplateId, options = {}) {
    try {
        const requested = String(requestedTemplateId || new URLSearchParams(window.location.search).get('template') || '').trim();
        if (!requested || TEMPLATE_REGISTRY.has(requested) || !requested.endsWith('-tasks')) return false;

        const basePath = options.basePath || ((window.location && window.location.pathname)
            ? window.location.pathname.replace(/\/[^\/]*$/, '/')
            : './');
        const siteRootRaw = options.siteRootRaw || (basePath.endsWith('/graph-display/')
            ? (basePath.slice(0, -'/graph-display/'.length) || '/')
            : basePath);
        const siteRoot = options.siteRoot || (siteRootRaw.endsWith('/') ? siteRootRaw : `${siteRootRaw}/`);

        const projectId = requested.slice(0, -'-tasks'.length);
        if (!projectId) return false;

        const folderProjectService = typeof window !== 'undefined' ? window.FolderProjectService : null;
        const localFolderProject = folderProjectService && typeof folderProjectService.getProjectRecord === 'function'
            ? folderProjectService.getProjectRecord(requested)
            : null;
        if (localFolderProject && localFolderProject.payload) {
            const localData = localFolderProject.payload;
            const localEntry = {
                id: requested,
                name: `${localFolderProject.label || projectId} (Local Folder)`,
                type: 'task-management',
                path: `/local-folder/${projectId}/${localFolderProject.rootModuleRelative || 'tasks.json'}`
            };
            const localTasks = Array.isArray(localData.tasks) ? localData.tasks : [];
            const usesStringIds = localTasks.length > 0 && typeof localTasks[0].task_id !== 'number';
            const localTemplate = usesStringIds
                ? buildProjectTaskTemplate(localEntry, localData, { embeddedGraphName: `${projectId} (Local Folder Graph)` })
                : buildTaskManagementTemplate(localEntry, localData, { embeddedGraphName: `${projectId} (Local Folder Graph)` });

            if (!localTemplate) return false;
            TEMPLATE_REGISTRY.set(localEntry.id, localTemplate);
            return true;
        }

        // Support direct URL override (e.g. from folder path scan)
        const customTasksUrl = options.customTasksUrl || null;

        const candidates = customTasksUrl
            ? [customTasksUrl]
            : [
                `${siteRoot}tasksDB/external/${projectId}/tasks.json`,
                `${siteRoot}tasksDB/local/${projectId}/tasks.json`,
                `${basePath}../tasksDB/${projectId}/tasks.json`
            ];

        let data = null;
        let resolvedUrl = null;
        for (const url of candidates) {
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (res.ok) {
                    data = await res.json();
                    resolvedUrl = url;
                    break;
                }
            } catch {
                // Try next candidate.
            }
        }
        if (!data || !resolvedUrl) return false;

        const validation = validateAgainstSchema(data, null);
        if (!validation.valid) return false;

        const entry = { id: requested, name: `${projectId} (TaskDB)`, type: 'task-management', path: resolvedUrl };

        let buildData = data;
        let buildEntry = entry;
        if (data.navigation && data.navigation.rootModule) {
            try {
                const rootModulePath = String(data.navigation.rootModule).replace(/\\/g, '/').replace(/^\/+/, '');
                const base = resolvedUrl.replace(/\/tasks\.json$/, '');
                const rootModuleUrl = `${base}/${rootModulePath}`;
                const rootRes = await fetch(rootModuleUrl, { cache: 'no-store' });
                if (rootRes.ok) {
                    const rootData = await rootRes.json();
                    const navigationModules = Array.isArray(data.navigation.modules) ? data.navigation.modules : [];
                    buildData = { ...rootData };
                    if (navigationModules.length) {
                        if (!buildData.navigation) buildData.navigation = {};
                        buildData.navigation.modules = navigationModules;
                    }
                    buildEntry = { ...entry, path: rootModuleUrl };
                }
            } catch {
                // Fall back to tasks.json payload.
            }
        }

        const tasks = Array.isArray(buildData.tasks) ? buildData.tasks : [];
        const usesStringIds = tasks.length > 0 && typeof tasks[0].task_id !== 'number';
        const template = usesStringIds
            ? buildProjectTaskTemplate(buildEntry, buildData, { embeddedGraphName: `${projectId} (Project Graph)` })
            : buildTaskManagementTemplate(buildEntry, buildData, { embeddedGraphName: `${projectId} (Learning Graph)` });

        if (!template) return false;
        TEMPLATE_REGISTRY.set(entry.id, template);
        return true;
    } catch (error) {
        console.warn('ensureDynamicTaskTemplate failed:', requestedTemplateId, error && error.message);
        return false;
    }
}

// Async template loader: fetch registry.json then fetch templates; used by main-graph.js
export async function initTemplates() {
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
        const registryUrl = `${siteRoot}tasksDB/registry.json`;
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
                    const tpl = buildTaskManagementTemplate(entry, data);
                    TEMPLATE_REGISTRY.set(entry.id, tpl);
                }
            } catch (e) {
                console.warn('Error loading template entry', entry && entry.id, e && e.message);
            }
        }

        // If the app is asked for a <projectId>-tasks template that isn't in registry.json,
        // try to fetch it directly from /tasksDB/<scope>/<projectId>/tasks.json.
        await ensureDynamicTaskTemplate(null, { basePath, siteRoot, siteRootRaw });
    } catch (e) {
        console.warn('initTemplates failed (fallback to built-in):', e && e.message);

        // Still try dynamic TaskDB loading in case registry.json is missing.
        try {
            const basePath = (window.location && window.location.pathname) ? window.location.pathname.replace(/\/[^\/]*$/, '/') : './';
            const siteRootRaw2 = basePath.endsWith('/graph-display/')
                ? (basePath.slice(0, -'/graph-display/'.length) || '/')
                : basePath;
            const siteRoot2 = siteRootRaw2.endsWith('/') ? siteRootRaw2 : `${siteRootRaw2}/`;
            await ensureDynamicTaskTemplate(null, { basePath, siteRoot: siteRoot2, siteRootRaw: siteRootRaw2 });
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

    return {
        template: {
            id: tpl.id,
            name: tpl.name,
            description: tpl.description,
            meta: tpl.meta,
            sourceData: tpl.sourceData,
            sourceEntry: tpl.sourceEntry
        },
        nodes: tpl.nodes || [],
        links: tpl.links || [],
        details: tpl.details || {},
        configOverrides: tpl.configOverrides || {}
    };
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

// Public export so dynamic importers (e.g. main-graph.js module navigation) can build templates on the fly
export function buildProjectTaskTemplatePublic(entry, data, options) {
    return buildProjectTaskTemplate(entry, data, options);
}

export function buildInlineTaskSubgraphTemplatePublic(entry, data, inlinePath, options) {
    const inlineTarget = parseInlineTaskPath(inlinePath);
    if (!inlineTarget || !Array.isArray(data?.tasks)) return null;

    const task = data.tasks.find(candidate => candidate && candidate.task_id === inlineTarget.taskId);
    if (!task) return null;

    const inlineData = buildInlineSubgraphData(data, task);
    if (!inlineData || !Array.isArray(inlineData.tasks) || inlineData.tasks.length === 0) return null;

    const inlineEntry = {
        ...(entry || {}),
        name: String(task.task_name || task.name || task.title || entry?.name || 'Subtasks').trim() || 'Subtasks'
    };

    const usesStringIds = typeof inlineData.tasks[0]?.task_id !== 'number';
    return usesStringIds
        ? buildProjectTaskTemplate(inlineEntry, inlineData, options)
        : buildTaskManagementTemplate(inlineEntry, inlineData, options);
}