(function (globalScope) {
    const STATUS_VALUES = Object.freeze(['Not Started', 'In Progress', 'On Hold', 'Blocked', 'Done', 'Cancelled', 'Pending Review']);
    const PRIORITY_VALUES = Object.freeze(['Critical', 'High', 'Medium', 'Low']);
    const COMPLEXITY_VALUES = Object.freeze(['Very Low', 'Low', 'Medium', 'High', 'Very High']);
    const DEPENDENCY_TYPES = Object.freeze(['FS', 'SS', 'FF', 'SF']);

    const ROOT_KEY_ORDER = Object.freeze(['$schema', 'template_type', 'version', 'project', 'categories', 'workers', 'tasks']);
    const PROJECT_KEY_ORDER = Object.freeze([
        'name', 'description', 'start_date', 'end_date', 'status', 'timezone', 'currency', 'budget', 'budget_spent',
        'project_manager', 'stakeholders', 'tags', 'milestones', 'sprints', 'risks', 'change_log', 'closure'
    ]);
    const TASK_KEY_ORDER = Object.freeze([
        'task_id', 'task_name', 'description', 'start_date', 'end_date', 'due_date', 'priority', 'status',
        'progress_percentage', 'estimated_hours', 'actual_hours', 'complexity', 'blocker_reason', 'sprint_name',
        'reviewer', 'is_critical_path', 'category_name', 'tags', 'assigned_workers', 'acceptance_criteria',
        'dependencies', 'parent_task_id', 'subtasks', 'attachments', 'links', 'comments'
    ]);
    const SUBTASK_KEY_ORDER = Object.freeze([
        'task_name', 'description', 'status', 'priority', 'estimated_hours', 'actual_hours', 'progress_percentage',
        'complexity', 'start_date', 'end_date', 'due_date', 'category_name', 'tags', 'assigned_workers',
        'acceptance_criteria', 'dependencies', 'subtasks', 'attachments', 'links', 'comments'
    ]);

    const TASK_FIELD_REFERENCE = Object.freeze({
        task_id: 'Required integer. Keep unique and stable across the file. Sort tasks by task_id ascending.',
        task_name: 'Required string. Use a delivery-oriented label, ideally with a task code prefix like BUILD-001: Auth + DB + base UI.',
        description: 'Required for useful graph popups and LLM planning. Describe the deliverable, boundary, and intent.',
        start_date: 'Optional ISO date string. Helps timeline and calendar exports.',
        end_date: 'Optional ISO date string. Used by graph popups and calendar exports.',
        due_date: 'Optional ISO date string. Use when there is a deadline distinct from end_date.',
        priority: `Enum: ${PRIORITY_VALUES.join(', ')}. Drives node color and urgency sorting.`,
        status: `Enum: ${STATUS_VALUES.join(', ')}. Drives graph styling, list filters, and pending-task exports.`,
        progress_percentage: 'Optional number 0-100. Good for in-progress execution tracking.',
        estimated_hours: 'Recommended number. Drives node sizing and planning summaries.',
        actual_hours: 'Optional number. Use once execution starts.',
        complexity: `Optional enum: ${COMPLEXITY_VALUES.join(', ')}. Useful for prioritization and planning.`,
        blocker_reason: 'Optional string. Use when status is Blocked or On Hold.',
        sprint_name: 'Optional string. Groups work by sprint or phase.',
        reviewer: 'Optional string or object. Name the approving reviewer or owner of acceptance.',
        is_critical_path: 'Optional boolean. Marks critical-path tasks for filters and exports.',
        category_name: 'Optional string. Use a consistent category taxonomy across the project.',
        tags: 'Optional string array. Keep tags short and reusable.',
        assigned_workers: 'Optional worker array. Helps worker calendars and ownership views.',
        acceptance_criteria: 'Optional string array. Rendered directly in popup dropdowns.',
        dependencies: 'Optional dependency array. Declare upstream tasks here; the graph derives "Leads to" automatically from reverse dependencies.',
        parent_task_id: 'Optional integer. Use for child tasks that should remain full graph nodes with their own lifecycle, dependencies, and relations.',
        subtasks: 'Optional inline subtask array. Use for nested work that should open as an inline subgraph from the parent task popup.',
        attachments: 'Optional array of artifacts or files related to the task.',
        links: 'Optional array of URLs or link objects.',
        comments: 'Optional array of comments or decision notes.'
    });

    const SUBTASK_FIELD_REFERENCE = Object.freeze({
        task_name: 'Required. Inline subtasks should still be delivery-oriented and specific.',
        description: 'Optional but recommended for non-trivial subtasks.',
        status: `Recommended enum: ${STATUS_VALUES.join(', ')}.`,
        priority: `Recommended enum: ${PRIORITY_VALUES.join(', ')}.`,
        estimated_hours: 'Recommended number for sizing inline subgraphs.',
        dependencies: 'Optional. Use when subtasks depend on each other within the inline subgraph.',
        subtasks: 'Optional nested inline subtasks. Supports recursive subgraphs in the graph UI.'
    });

    const AUTHORING_RULES = Object.freeze([
        'Author node.tasks.json as a delivery graph, not as a flat checklist. Every task should have a clear deliverable and an explicit position in the dependency flow.',
        'Use dependencies to describe execution order. "Depends on" is authored directly; "Leads to" is derived automatically from downstream dependencies.',
        'Use parent_task_id for child tasks that should exist as full graph nodes with their own lifecycle, dependencies, and relations.',
        'Use subtasks[] for inline nested work that belongs inside a parent task popup and should open as an inline subgraph from the popup.',
        'Keep task_id values stable, unique, and ascending. Sort the tasks array by task_id ascending before saving.',
        'Do not author runtime-only fields such as subtasksPath, subtasksTargets, synthetic start/end nodes, or derived leads_to arrays.',
        'Prefer one task per real deliverable. If a task is too broad to estimate or validate, split it into child tasks or inline subtasks.',
        'Write acceptance criteria so the task can be validated without extra context. Good acceptance criteria make popup context and LLM planning materially better.'
    ]);

    const RELATION_RULES = Object.freeze({
        depends_on: 'Author this relation through dependencies[]. Each dependency points to an upstream predecessor that must already exist in the same file or module context.',
        leads_to: 'Do not author directly. This is derived by the graph from reverse dependency lookup over all tasks.',
        parent_child: 'Use parent_task_id when a child should remain a full graph node with its own relationships, dates, assignees, and lifecycle.',
        inline_subgraph: 'Use subtasks[] when the work belongs inside a parent task popup and should drill down into a nested inline subgraph.',
        start_end_nodes: 'Project start/end nodes are generated by the graph engine. They should never be stored in node.tasks.json.'
    });

    function safeClone(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return value;
        }
    }

    function normalizeFocusTask(value) {
        if (!value || typeof value !== 'object') return null;
        const focusTask = {};
        if (value.node_id) focusTask.node_id = String(value.node_id);
        if (value.node_label) focusTask.node_label = String(value.node_label);
        if (value.node_type) focusTask.node_type = String(value.node_type);
        if (value.module_path) focusTask.module_path = String(value.module_path);
        return Object.keys(focusTask).length > 0 ? focusTask : null;
    }

    function buildStarterTemplate() {
        return {
            $schema: './tasksDB/_schema/graph-template.schema.json',
            template_type: 'project_task_template',
            version: '3.0',
            project: {
                name: 'Project Name',
                description: 'Describe the project goal, delivery scope, and how the graph should represent the execution plan.',
                start_date: '2026-04-23',
                end_date: '2026-05-23',
                status: 'Planning',
                timezone: 'UTC',
                currency: 'USD',
                budget: 0,
                budget_spent: 0,
                project_manager: {
                    name: 'Owner Name',
                    email: 'owner@example.com'
                },
                stakeholders: [],
                tags: ['graph-project', 'taskdb'],
                milestones: [],
                sprints: [],
                risks: [],
                change_log: [],
                closure: {
                    actual_end_date: null,
                    delivered_on_time: null,
                    delivered_on_budget: null,
                    lessons_learned: [],
                    sign_off_by: null,
                    sign_off_date: null
                }
            },
            categories: [
                {
                    name: 'Planning',
                    description: 'Top-level category or workstream for grouped tasks.',
                    parent_category_name: null
                }
            ],
            workers: [
                {
                    name: 'Owner Name',
                    email: 'owner@example.com',
                    role: 'Project Manager',
                    skills: ['Planning', 'Execution'],
                    hourly_rate: 0,
                    weekly_capacity_hours: 40,
                    timezone: 'UTC'
                }
            ],
            tasks: [
                {
                    task_id: 1,
                    task_name: 'TASK-001: Deliver the first visible milestone',
                    description: 'Define the primary deliverable, its boundary, and how it contributes to the graph execution flow.',
                    start_date: '2026-04-23',
                    end_date: '2026-04-25',
                    due_date: '2026-04-25',
                    priority: 'High',
                    status: 'Not Started',
                    progress_percentage: 0,
                    estimated_hours: 8,
                    actual_hours: 0,
                    complexity: 'Medium',
                    blocker_reason: '',
                    sprint_name: 'Sprint 1',
                    reviewer: 'Owner Name',
                    is_critical_path: true,
                    category_name: 'Planning',
                    tags: ['milestone'],
                    assigned_workers: [
                        {
                            name: 'Owner Name',
                            email: 'owner@example.com',
                            role: 'Project Manager'
                        }
                    ],
                    acceptance_criteria: [
                        'The deliverable is usable and testable.',
                        'The downstream task can start without guessing missing context.'
                    ],
                    dependencies: [],
                    parent_task_id: null,
                    subtasks: [
                        {
                            task_name: 'Break the deliverable into an inline subtask with a clear outcome',
                            description: 'Use inline subtasks for nested work that belongs inside the parent node popup.',
                            status: 'Not Started',
                            priority: 'Medium',
                            estimated_hours: 2,
                            actual_hours: 0,
                            progress_percentage: 0,
                            complexity: 'Low',
                            start_date: '2026-04-23',
                            end_date: '2026-04-24',
                            due_date: '2026-04-24',
                            category_name: 'Planning',
                            tags: ['inline-subtask'],
                            assigned_workers: [],
                            acceptance_criteria: [
                                'The parent popup can drill into this subgraph.',
                                'The subtask is narrow enough to execute independently.'
                            ],
                            dependencies: [],
                            subtasks: [],
                            attachments: [],
                            links: [],
                            comments: []
                        }
                    ],
                    attachments: [],
                    links: [],
                    comments: []
                },
                {
                    task_id: 2,
                    task_name: 'TASK-002: Downstream task that depends on TASK-001',
                    description: 'This task exists to demonstrate how reverse dependencies create the graph\'s derived leads-to relation.',
                    start_date: '2026-04-26',
                    end_date: '2026-04-29',
                    due_date: '2026-04-29',
                    priority: 'Medium',
                    status: 'Not Started',
                    progress_percentage: 0,
                    estimated_hours: 6,
                    actual_hours: 0,
                    complexity: 'Medium',
                    blocker_reason: '',
                    sprint_name: 'Sprint 1',
                    reviewer: 'Owner Name',
                    is_critical_path: false,
                    category_name: 'Planning',
                    tags: ['dependency-demo'],
                    assigned_workers: [],
                    acceptance_criteria: [
                        'The dependency chain is explicit and valid.',
                        'The graph can derive the upstream task\'s leads-to relation from this dependency.'
                    ],
                    dependencies: [
                        {
                            predecessor_task_id: 1,
                            type: 'FS',
                            lag_days: 0
                        }
                    ],
                    parent_task_id: null,
                    subtasks: [],
                    attachments: [],
                    links: [],
                    comments: []
                }
            ]
        };
    }

    const DEFAULT_TEMPLATE_URL = (function () {
        if (typeof globalScope.location === 'object' && globalScope.location.href) {
            try {
                return new URL('../tasksDB/_templates/starter_project_template.json', globalScope.location.href).href;
            } catch {
                return '../tasksDB/_templates/starter_project_template.json';
            }
        }
        return '../tasksDB/_templates/starter_project_template.json';
    })();

    async function loadStarterTemplate() {
        if (typeof globalScope.fetch !== 'function') {
            return buildStarterTemplate();
        }

        try {
            const response = await globalScope.fetch(DEFAULT_TEMPLATE_URL, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`Failed to load starter template: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.warn('Could not load starter_project_template.json, using fallback starter template:', error.message);
            return buildStarterTemplate();
        }
    }

    function buildClipboardPayload(options = {}) {
        const focusTask = normalizeFocusTask(options.focusTask);

        return {
            artifact: 'node.tasks.json authoring template',
            version: '1.0',
            copied_at: new Date().toISOString(),
            scope: String(options.scope || 'task-manager'),
            template_id_hint: options.templateId ? String(options.templateId) : null,
            active_project_id_hint: options.activeProjectId ? String(options.activeProjectId) : null,
            requested_focus: focusTask,
            purpose: 'Use this payload to author a sorted node.tasks.json file that fully represents tasks, dependencies, child tasks, inline subgraphs, and graph navigation context for this system.',
            authoring_rules: safeClone(AUTHORING_RULES),
            relation_rules: safeClone(RELATION_RULES),
            supported_enums: {
                status: safeClone(STATUS_VALUES),
                priority: safeClone(PRIORITY_VALUES),
                complexity: safeClone(COMPLEXITY_VALUES),
                dependency_type: safeClone(DEPENDENCY_TYPES)
            },
            canonical_key_order: {
                root: safeClone(ROOT_KEY_ORDER),
                project: safeClone(PROJECT_KEY_ORDER),
                task: safeClone(TASK_KEY_ORDER),
                subtask: safeClone(SUBTASK_KEY_ORDER)
            },
            task_field_reference: safeClone(TASK_FIELD_REFERENCE),
            subtask_field_reference: safeClone(SUBTASK_FIELD_REFERENCE),
            llm_output_contract: [
                'Produce a single valid JSON object that can be saved as node.tasks.json.',
                'Keep keys in the canonical order when possible and keep the tasks array sorted by task_id ascending.',
                'Use dependencies to model execution order, parent_task_id for full child task nodes, and subtasks[] for inline popup subgraphs.',
                'Do not emit runtime-only fields such as subtasksPath, subtasksTargets, derived leads_to arrays, or synthetic start/end nodes.'
            ],
            template: buildStarterTemplate()
        };
    }

    async function copyToClipboard(options = {}) {
        const payload = buildClipboardPayload(options);
        payload.template = await loadStarterTemplate();
        const nodeTasksJsonPayload = payload.template || payload;
        if (!globalScope.navigator || !globalScope.navigator.clipboard || typeof globalScope.navigator.clipboard.writeText !== 'function') {
            throw new Error('Clipboard API is not available in this browser.');
        }
        await globalScope.navigator.clipboard.writeText(JSON.stringify(nodeTasksJsonPayload, null, 2));
        return payload;
    }

    globalScope.TaskSchemaClipboard = {
        buildClipboardPayload,
        copyToClipboard
    };
})(typeof window !== 'undefined' ? window : globalThis);