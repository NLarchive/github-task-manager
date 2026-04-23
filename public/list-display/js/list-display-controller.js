/**
 * List-display runtime controller for the GitHub Task Manager app.
 *
 * This file owns the interactive list UI, project switching, history and issue
 * workflows, task CRUD, timeline rendering, and synchronization with the
 * embedded graph display and task-engine modules.
 */

/**
 * Coordinate the list-display UI, project context, and persistence services.
 */
class TaskManagerApp {
    /** Create the runtime controller state for this component. */
    constructor() {
        // Defer config loading until initialize() to ensure TEMPLATE_CONFIG is available
        this.config = null;

        this.database = null;
        this.validator = null;
        this.automation = null;
        this.githubApi = null;

        this.tasks = [];
        this.filteredTasks = [];
        this.currentUser = null;
        
        // Password protection state
        this.isAuthenticated = false;
        this.authExpiry = null;
        this.pendingAction = null; // Store action to execute after password verification

        // UI state
        this.viewMode = 'list';
        this.timelineScale = 'day'; // 'day' | 'week'

        // Issues sync state
        this.issuesForSync = [];

        // Multi-project state
        this.activeProjectId = null;
        this.projectPayload = null;
        this.rootTasks = [];
        this.currentContextTasks = [];
        this.navigationModules = [];
        this.moduleIndex = new Map();
        this.moduleNameIndex = new Map();
        this.moduleCache = new Map();
        this.activeModuleData = null;
        this.activeModulePath = '';
        this.currentContextFlowSummary = { startTaskKeys: [], endTaskKeys: [], startLabels: [], endLabels: [] };
        this.isModulePanelOpen = false;
    }

    /** Get graph template id for active project. */
    getGraphTemplateIdForActiveProject() {
        const safeProject = String(this.activeProjectId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
        if (!safeProject) return null;
        return `${safeProject}-tasks`;
    }

    /** Get stored folder projects. */
    getStoredFolderProjects() {
        if (typeof window === 'undefined' || !window.FolderProjectService || typeof window.FolderProjectService.listProjects !== 'function') {
            return [];
        }

        return window.FolderProjectService.listProjects().map(projectRecord => ({
            id: projectRecord.id,
            label: projectRecord.label || projectRecord.id,
            scope: 'folder'
        }));
    }

    /** Register folder project option. */
    registerFolderProjectOption(projectRecord) {
        const select = document.getElementById('projectSelect');
        if (!select || !projectRecord || !projectRecord.id) return;

        let optgroup = Array.from(select.querySelectorAll('optgroup')).find(group => group.label === 'Opened Folders');
        if (!optgroup) {
            optgroup = document.createElement('optgroup');
            optgroup.label = 'Opened Folders';
            select.appendChild(optgroup);
        }

        const existing = Array.from(optgroup.querySelectorAll('option')).find(option => option.value === projectRecord.id);
        if (!existing) {
            const option = document.createElement('option');
            option.value = projectRecord.id;
            option.textContent = projectRecord.label || projectRecord.id;
            optgroup.appendChild(option);
        }

        select.value = projectRecord.id;
    }

    /** Initialize folder project picker. */
    initializeFolderProjectPicker() {
        if (typeof window === 'undefined' || !window.FolderProjectUI || typeof window.FolderProjectUI.bindFolderProjectPicker !== 'function') return;

        window.FolderProjectUI.bindFolderProjectPicker({
            trigger: 'folderProjectLoadBtn',
            result: 'folderProjectLoadResult',
            idleLabel: '📂 Open Local Folder',
            loadingLabel: 'Opening...',
            onProjectLoaded: async (projectRecord) => {
                this.registerFolderProjectOption(projectRecord);

                if (projectRecord.id === this.activeProjectId) {
                    await this.loadTasks();
                    this.refreshCategoryOptions();
                    this.ensureGraphIframeLoaded();
                } else {
                    await this.setActiveProject(projectRecord.id);
                }

                this.showToast(`Opened local folder project: ${projectRecord.label || projectRecord.id}`, 'success');
            }
        });
    }

    /** Build graph iframe src. */
    buildGraphIframeSrc() {
        const templateId = this.getGraphTemplateIdForActiveProject();
        const qp = new URLSearchParams();
        if (templateId) qp.set('template', templateId);
        if (this.activeModulePath) {
            qp.set('module', this.activeModulePath);
            if (this.activeProjectId) qp.set('moduleProject', this.activeProjectId);
        }
        qp.set('embed', '1');
        // Build a host-relative path based on the current pathname so it works both
        // locally and on GitHub Pages where the site may be hosted under a subpath.
        let baseDir = (typeof window !== 'undefined' && window.location && window.location.pathname)
            ? window.location.pathname.replace(/\/[^\/]*$/, '/')
            : '/';
        // If loaded from the /list-display/ subfolder, go up one level so the
        // graph-display path resolves to the sibling folder, not a child folder.
        if (baseDir.endsWith('/list-display/')) {
            baseDir = baseDir.slice(0, baseDir.length - 'list-display/'.length);
        }
        // Keep the computed base directory (including '/public/' when present).
        // `ensureGraphIframeLoaded()` already tries multiple candidates for robustness.
        return `${baseDir}graph-display/index.html?${qp.toString()}`;
    }

    /** Ensure graph iframe loaded. */
    async ensureGraphIframeLoaded() {
        const frame = document.getElementById('graphFrame');
        if (!frame) return;
        const qpSrc = this.buildGraphIframeSrc();
        if (!qpSrc) return;

        const candidates = [qpSrc];
        // Also try a variant without '/public/' in the path
        candidates.push(qpSrc.replace('/public/', '/'));
        // Some dev servers (Live Server) serve the repo root and have the app under '/public/',
        // so also try the '/public/graph-display' variant.
        candidates.push(qpSrc.replace('/graph-display/', '/public/graph-display/'));
        // Try host-root absolute paths (both /graph-display and /public/graph-display)
        try {
            const origin = window.location.origin || '';
            const qp = new URLSearchParams(qpSrc.split('?')[1] || '');
            candidates.push(`${origin}/graph-display/index.html?${qp.toString()}`);
            candidates.push(`${origin}/public/graph-display/index.html?${qp.toString()}`);
        } catch (e) {
            // ignore
        }

        const triedCandidates = [];
        for (const c of candidates) {
            try {
                triedCandidates.push(c);
                const res = await fetch(c, { method: 'HEAD', cache: 'no-store' });
                if (res && res.ok) {
                    if (frame.getAttribute('src') !== c) frame.setAttribute('src', c);
                    // Attach load/error handlers to surface friendly message in the parent UI
                    frame.onload = () => {
                        const errEl = document.getElementById('graphFrameError');
                        if (errEl) errEl.style.display = 'none';
                    };
                    frame.onerror = () => {
                        const errEl = document.getElementById('graphFrameError');
                        if (errEl) {
                            const msg = document.getElementById('graphFrameErrorMessage');
                            const link = document.getElementById('graphFrameOpenDirect');
                            if (msg) msg.textContent = `Failed to load graph from ${c}`;
                            if (link) link.setAttribute('href', c);
                            errEl.style.display = 'block';
                        }
                    };
                    return;
                }
            } catch (e) {
                // Try next candidate
            }
        }

        // Last resort: try forcing the common '/public/graph-display' path before falling back
        try {
            const qp = new URLSearchParams(qpSrc.split('?')[1] || '');
            const publicFallback = `/public/graph-display/index.html?${qp.toString()}`;
            triedCandidates.push(publicFallback);
            if (frame.getAttribute('src') !== publicFallback) {
                frame.setAttribute('src', publicFallback);
                // Attach friendly error display handlers
                frame.onload = () => {
                    const errEl = document.getElementById('graphFrameError');
                    if (errEl) errEl.style.display = 'none';
                };
                frame.onerror = () => {
                    const errEl = document.getElementById('graphFrameError');
                    if (errEl) {
                        const msg = document.getElementById('graphFrameErrorMessage');
                        const link = document.getElementById('graphFrameOpenDirect');
                        if (msg) msg.textContent = `Failed to load graph from ${publicFallback}`;
                        if (link) link.setAttribute('href', publicFallback);
                        errEl.style.display = 'block';
                    }
                };
                return;
            }
        } catch (e) {
            // ignore
        }

        // Final fallback: set the original URL so debugging tools show the 404
        triedCandidates.push(qpSrc);
        console.warn('No valid graph iframe URL found. Tried candidates:', triedCandidates);
        // Show friendly message and provide direct link to the final URL
        const errEl = document.getElementById('graphFrameError');
        if (errEl) {
            const msg = document.getElementById('graphFrameErrorMessage');
            const link = document.getElementById('graphFrameOpenDirect');
            if (msg) msg.textContent = `No graph template found at tried locations. Last attempt: ${qpSrc}`;
            if (link) link.setAttribute('href', qpSrc);
            errEl.style.display = 'block';
        }
        if (frame.getAttribute('src') !== qpSrc) frame.setAttribute('src', qpSrc);
    }

    // Initialize the application
    /** Initialize initialize. */
    async initialize() {
        // Load config now that all scripts should be loaded
        this.loadConfig();

        this.setupEventListeners();
        this.setupProjectSelector();
        this.initializeFolderProjectPicker();
        this.setupStatCardFilters();
        this.loadUserName();
        this.updateAccessIndicator(); // Initialize access indicator

        // Listen for postMessage events from the embedded graph iframe
        window.addEventListener('message', (e) => {
            try {
                if (!e || !e.data || !e.source) return;
                // Ensure message is coming from the graph iframe for sensitive actions
                const frame = document.getElementById('graphFrame');
                const isFromGraphFrame = frame && frame.contentWindow && e.source === frame.contentWindow;

                // Exit graph request
                if (e.data.type === 'exitGraphView') {
                    if (this.viewMode === 'graph') this.setViewMode('list');
                    return;
                }

                // Request to change active project (from graph iframe)
                if (e.data.type === 'setActiveProject' && isFromGraphFrame) {
                    const projectId = String(e.data.projectId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
                    if (projectId) {
                        this.setActiveProject(projectId);
                    }
                    return;
                }

                if (e.data.type === 'activeModuleChanged' && isFromGraphFrame) {
                    const projectId = String(e.data.projectId || this.activeProjectId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
                    const modulePath = this.normalizeModulePath(e.data.modulePath || '');

                    Promise.resolve((async () => {
                        if (projectId && projectId !== this.activeProjectId) {
                            await this.setActiveProject(projectId);
                        }
                        await this.setActiveModule(modulePath, { syncGraph: false });
                    })()).catch((messageError) => {
                        console.warn('Error syncing active module from graph iframe', messageError);
                    });
                    return;
                }

            } catch (err) {
                console.warn('Error handling message event', err);
            }
        });

        // Setup GitHub API with pre-configured settings
        if (this.isConfigured()) {
            this.githubApi = new GitHubAPI(this.config);
            this.database = new TaskDatabase(this.githubApi, this.validator, this.automation);
            await this.showTaskManager();
            await this.loadTasks();
            this.refreshCategoryOptions();
        } else {
            console.error('GitHub configuration missing. Please check TEMPLATE_CONFIG.GITHUB settings.');
            this.showConfigError();
        }
    }

    /** Load config. */
    loadConfig() {
        // Use pre-configured GitHub settings from tasks-template-config
        // Note: The project list may be defined in a centralized file `public/config/projects-config.js`
        // which defines a global `PROJECTS_CONFIG`. `tasks-template-config.js` will load and
        // prefer that configuration when available, allowing a single canonical projects list.
        const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
        if (!templateConfig || !templateConfig.GITHUB) {
            throw new Error('TEMPLATE_CONFIG.GITHUB not available. Check script loading order.');
        }

        // Resolve active project (query param wins, then localStorage, then default)
        const fromQuery = this.getQueryParam('project');
        const fromStorage = (typeof localStorage !== 'undefined') ? localStorage.getItem('taskManagerActiveProject') : null;
        const defaultProject = templateConfig.GITHUB.DEFAULT_PROJECT_ID || 'github-task-manager';
        const activeProject = (fromQuery || fromStorage || defaultProject || '').trim();
        const safeProject = activeProject.replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
        this.activeProjectId = safeProject;

        // Persist to global config so TaskDatabase can resolve it
        templateConfig.GITHUB.ACTIVE_PROJECT_ID = safeProject;
        const projCfg = (typeof templateConfig.GITHUB.getProjectConfig === 'function')
            ? templateConfig.GITHUB.getProjectConfig(safeProject)
            : {
                id: safeProject,
                owner: templateConfig.GITHUB.OWNER,
                repo: templateConfig.GITHUB.REPO,
                branch: templateConfig.GITHUB.BRANCH,
                tasksRoot: templateConfig.GITHUB.TASKS_ROOT
            };

        if (typeof templateConfig.GITHUB.getTasksFile === 'function') {
            templateConfig.GITHUB.TASKS_FILE = templateConfig.GITHUB.getTasksFile(safeProject);
        }

        this.config = {
            owner: projCfg.owner,
            repo: projCfg.repo,
            token: templateConfig.GITHUB.TOKEN,
            branch: projCfg.branch,
            tasksFile: templateConfig.GITHUB.TASKS_FILE
        };

        // Initialize components with config
        this.validator = new TemplateValidator(templateConfig);
        this.automation = new TemplateAutomation(templateConfig);
    }

    /** Set up project selector. */
    setupProjectSelector() {
        const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
        const select = document.getElementById('projectSelect');
        if (!select || !templateConfig || !templateConfig.GITHUB) return;

        const staticProjects = Array.isArray(templateConfig.GITHUB.PROJECTS) ? templateConfig.GITHUB.PROJECTS : [];
        const getSelectableProjects = (extraProjects = []) => [
            ...staticProjects,
            ...this.getStoredFolderProjects(),
            ...extraProjects
        ];

        const renderSelector = (projects) => {
            if (projects.length === 0) return;

            // Group projects by scope (external / local)
            const groups = {};
            for (const proj of projects) {
                if (!proj || !proj.id) continue;
                const scope = proj.scope || 'external';
                if (!groups[scope]) groups[scope] = [];
                // Deduplicate by id
                if (!groups[scope].find(p => p.id === proj.id)) groups[scope].push(proj);
            }

            select.innerHTML = '';
            const scopeLabels = { external: 'External Projects', local: 'Local Projects', folder: 'Opened Folders' };
            for (const scope of ['external', 'local', 'folder']) {
                const items = groups[scope];
                if (!items || items.length === 0) continue;
                const optgroup = document.createElement('optgroup');
                optgroup.label = scopeLabels[scope] || scope;
                for (const proj of items) {
                    const opt = document.createElement('option');
                    opt.value = proj.id;
                    opt.textContent = proj.label || proj.id;
                    optgroup.appendChild(opt);
                }
                select.appendChild(optgroup);
            }

            // Set current selection
            const current = this.activeProjectId || templateConfig.GITHUB.ACTIVE_PROJECT_ID || templateConfig.GITHUB.DEFAULT_PROJECT_ID;
            if (current) select.value = current;
        };

        renderSelector(getSelectableProjects());

        select.addEventListener('change', async () => {
            const nextId = (select.value || '').trim();
            await this.setActiveProject(nextId);
        });

        // Discover additional local projects via /api/projects (localhost only)
        const isLocalhost = typeof window !== 'undefined' && window.location &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '::1');
        if (isLocalhost) {
            fetch('/api/projects', { cache: 'no-store' })
                .then(r => r.ok ? r.json() : null)
                .then(result => {
                    if (!result || !Array.isArray(result.projects)) return;
                    const knownIds = new Set(getSelectableProjects().map(p => p.id));
                    const discovered = result.projects
                        .filter(p => !knownIds.has(p.id))
                        .map(p => ({ id: p.id, label: p.id, scope: p.scope || 'local' }));
                    if (discovered.length > 0) {
                        renderSelector(getSelectableProjects(discovered));
                    }
                })
                .catch(() => { /* non-critical */ });
        }
    }

    /** Set active project. */
    async setActiveProject(projectId) {
        const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
        if (!templateConfig || !templateConfig.GITHUB) return;

        const safeProject = String(projectId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
        if (safeProject === this.activeProjectId) return;

        // IMPORTANT: auth is scoped per project.
        // Switching projects must force Read-Only until unlocked for the new project.
        this.isAuthenticated = false;
        this.authExpiry = null;
        try {
            sessionStorage.removeItem(this.getProjectPasswordKey(this.activeProjectId));
        } catch (e) {
            // ignore
        }

        this.activeProjectId = safeProject;
        this.activeModulePath = '';
        this.activeModuleData = null;
        this.currentContextTasks = [];
        this.currentContextFlowSummary = { startTaskKeys: [], endTaskKeys: [], startLabels: [], endLabels: [] };
        this.navigationModules = [];
        this.moduleIndex = new Map();
        this.moduleNameIndex = new Map();
        this.moduleCache.clear();
        this.isModulePanelOpen = false;
        localStorage.setItem('taskManagerActiveProject', safeProject);

        templateConfig.GITHUB.ACTIVE_PROJECT_ID = safeProject;
        const projCfg = (typeof templateConfig.GITHUB.getProjectConfig === 'function')
            ? templateConfig.GITHUB.getProjectConfig(safeProject)
            : {
                id: safeProject,
                owner: templateConfig.GITHUB.OWNER,
                repo: templateConfig.GITHUB.REPO,
                branch: templateConfig.GITHUB.BRANCH,
                tasksRoot: templateConfig.GITHUB.TASKS_ROOT
            };
        if (typeof templateConfig.GITHUB.getTasksFile === 'function') {
            templateConfig.GITHUB.TASKS_FILE = templateConfig.GITHUB.getTasksFile(safeProject);
        }

        // Keep app config in sync
        if (this.config) {
            this.config.owner = projCfg.owner;
            this.config.repo = projCfg.repo;
            this.config.branch = projCfg.branch;
            this.config.tasksFile = templateConfig.GITHUB.TASKS_FILE;
        }

        // Keep GitHub API + DB wired to the active repo
        if (this.githubApi) {
            this.githubApi.config = this.config;
        }
        if (this.database) {
            this.database.githubApi = this.githubApi;
        }

        // Keep the header/status panel in sync with the newly selected project.
        // Previously this was only updated during initial initialize(), which made
        // project switching misleading (repo/tasks file stayed "Loading"/stale).
        await this.showTaskManager();

        // Reload tasks for the newly selected project
        this.showToast(`Switched project to: ${safeProject}`, 'info');
        this.updateAccessIndicator();
        await this.loadTasks();
        this.refreshCategoryOptions();

        // Keep embedded graph in sync with project switching.
        this.ensureGraphIframeLoaded();

        // Notify the iframe (if loaded) that the active project changed so it can update its UI
        try {
            const frame = document.getElementById('graphFrame');
            if (frame && frame.contentWindow) {
                frame.contentWindow.postMessage({ type: 'projectChanged', projectId: safeProject }, '*');
            }
        } catch (err) {
            // Non-fatal
        }
    }

    /** Normalize module path. */
    normalizeModulePath(value) {
        return String(value || '')
            .trim()
            .replace(/\\/g, '/')
            .replace(/^\.\//, '')
            .replace(/^\/+/, '');
    }

    /** Normalize module entry. */
    normalizeModuleEntry(moduleEntry) {
        if (!moduleEntry || typeof moduleEntry !== 'object') return null;

        const normalizedPath = this.normalizeModulePath(moduleEntry.path);
        if (!normalizedPath) return null;

        return {
            ...moduleEntry,
            path: normalizedPath,
            modulePath: this.normalizeModulePath(moduleEntry.modulePath || ''),
            taskIds: Array.isArray(moduleEntry.taskIds)
                ? moduleEntry.taskIds.filter(Boolean)
                : (Array.isArray(moduleEntry.task_ids) ? moduleEntry.task_ids.filter(Boolean) : []),
            startTasks: Array.isArray(moduleEntry.startTasks) ? moduleEntry.startTasks.filter(Boolean) : [],
            endTasks: Array.isArray(moduleEntry.endTasks) ? moduleEntry.endTasks.filter(Boolean) : [],
            pipeline: moduleEntry.pipeline && typeof moduleEntry.pipeline === 'object' ? moduleEntry.pipeline : null
        };
    }

    /** Get task key. */
    getTaskKey(task) {
        if (!task || typeof task !== 'object') return '';
        const taskName = String(task.task_name || task.title || '').trim();
        if (taskName) return taskName;

        const rawId = task.task_id ?? task.id ?? task.taskId;
        return rawId === null || rawId === undefined ? '' : String(rawId).trim();
    }

    /** Get task code. */
    getTaskCode(task) {
        const taskKey = this.getTaskKey(task);
        if (!taskKey) return '';
        return taskKey.includes(':') ? taskKey.slice(0, taskKey.indexOf(':')).trim() : taskKey;
    }

    /** Get task predecessor keys. */
    getTaskPredecessorKeys(task) {
        if (!task || !Array.isArray(task.dependencies)) return [];

        const predecessors = [];
        for (const dependency of task.dependencies) {
            if (!dependency || typeof dependency !== 'object') continue;

            const predecessorName = String(dependency.predecessor_task_name || '').trim();
            if (predecessorName) predecessors.push(predecessorName);

            const predecessorId = dependency.predecessor_task_id;
            if (predecessorId !== null && predecessorId !== undefined && predecessorId !== '') {
                predecessors.push(String(predecessorId).trim());
            }
        }

        return predecessors.filter(Boolean);
    }

    /** Build task flow summary. */
    buildTaskFlowSummary(tasks = []) {
        const taskList = Array.isArray(tasks) ? tasks.filter(task => task && typeof task === 'object') : [];
        const canonicalKeyByAlias = new Map();
        const labelsByKey = new Map();

        taskList.forEach((task) => {
            const taskKey = this.getTaskKey(task);
            if (!taskKey) return;

            labelsByKey.set(taskKey, String(task.task_name || task.title || taskKey));
            canonicalKeyByAlias.set(taskKey, taskKey);

            const taskCode = this.getTaskCode(task);
            if (taskCode && !canonicalKeyByAlias.has(taskCode)) canonicalKeyByAlias.set(taskCode, taskKey);
        });

        const predecessorCount = new Map(Array.from(labelsByKey.keys(), key => [key, 0]));
        const successorsByKey = new Map(Array.from(labelsByKey.keys(), key => [key, new Set()]));

        taskList.forEach((task) => {
            const taskKey = this.getTaskKey(task);
            if (!taskKey || !predecessorCount.has(taskKey)) return;

            const normalizedPredecessors = Array.from(new Set(
                this.getTaskPredecessorKeys(task)
                    .map(predecessor => canonicalKeyByAlias.get(predecessor) || predecessor)
                    .filter(predecessor => predecessorCount.has(predecessor))
            ));

            predecessorCount.set(taskKey, normalizedPredecessors.length);
            normalizedPredecessors.forEach((predecessor) => {
                const successors = successorsByKey.get(predecessor);
                if (successors) successors.add(taskKey);
            });
        });

        const startTaskKeys = Array.from(predecessorCount.entries())
            .filter(([, count]) => count === 0)
            .map(([key]) => key);
        const endTaskKeys = Array.from(successorsByKey.entries())
            .filter(([, successors]) => !successors || successors.size === 0)
            .map(([key]) => key);

        return {
            startTaskKeys,
            endTaskKeys,
            startLabels: startTaskKeys.map(key => labelsByKey.get(key) || key),
            endLabels: endTaskKeys.map(key => labelsByKey.get(key) || key)
        };
    }

    /** Apply project theme. */
    applyProjectTheme() {
        if (typeof document === 'undefined' || !document.body) return;
        const projectName = String(
            (this.database && this.database.currentProject && this.database.currentProject.name) ||
            (this.projectPayload && this.projectPayload.project && this.projectPayload.project.name) ||
            ''
        );
        const themeKey = (this.activeProjectId === 'web-e2e-bussines' || /acme-os/i.test(projectName))
            ? 'acme-os'
            : 'default';

        if (themeKey === 'default') {
            delete document.body.dataset.projectTheme;
            return;
        }

        document.body.dataset.projectTheme = themeKey;
    }

    /** Update task authoring availability. */
    updateTaskAuthoringAvailability() {
        const addTaskButton = document.getElementById('addTaskBtn');
        if (!addTaskButton) return;

        const templateType = String((this.database && this.database.templateType) || '').trim();
        const isTemplateLedger = templateType === 'project_task_template' || templateType === 'submodule_task_template';
        const isFolderProject = !!(this.database && this.database.sourceKind === 'folder');

        addTaskButton.disabled = isTemplateLedger || isFolderProject;
        addTaskButton.classList.toggle('disabled', isTemplateLedger || isFolderProject);
        addTaskButton.title = isFolderProject
            ? 'Browser-opened local folders are read-only in list mode.'
            : (isTemplateLedger ? 'Template-backed project ledgers are read-only in list mode.' : '');
    }

    /** Sync project context from database. */
    syncProjectContextFromDatabase() {
        this.projectPayload = (this.database && this.database.rawData && typeof this.database.rawData === 'object' && !Array.isArray(this.database.rawData))
            ? this.database.rawData
            : null;
        this.rootTasks = Array.isArray(this.database && this.database.tasks) ? [...this.database.tasks] : [];
        this.tasks = [...this.rootTasks];

        const rawModules = (this.database && this.database.navigation && Array.isArray(this.database.navigation.modules))
            ? this.database.navigation.modules
            : ((this.projectPayload && this.projectPayload.navigation && Array.isArray(this.projectPayload.navigation.modules))
                ? this.projectPayload.navigation.modules
                : []);

        this.navigationModules = rawModules
            .map(moduleEntry => this.normalizeModuleEntry(moduleEntry))
            .filter(Boolean);

        this.moduleIndex = new Map();
        this.moduleNameIndex = new Map();
        this.navigationModules.forEach((moduleEntry) => {
            this.moduleIndex.set(moduleEntry.path, moduleEntry);
            [moduleEntry.name, moduleEntry.label].forEach((candidateName) => {
                const normalizedName = String(candidateName || '').trim().toLowerCase();
                if (normalizedName && !this.moduleNameIndex.has(normalizedName)) {
                    this.moduleNameIndex.set(normalizedName, moduleEntry);
                }
            });
        });

        this.currentContextTasks = [...this.rootTasks];
        this.currentContextFlowSummary = this.buildTaskFlowSummary(this.rootTasks);
        this.applyProjectTheme();
        this.updateTaskAuthoringAvailability();
        this.renderProjectNavigation();
    }

    /** Get module by path. */
    getModuleByPath(modulePath) {
        return this.moduleIndex.get(this.normalizeModulePath(modulePath)) || null;
    }

    /** Get module by name. */
    getModuleByName(moduleName) {
        return this.moduleNameIndex.get(String(moduleName || '').trim().toLowerCase()) || null;
    }

    /** Get context base tasks. */
    getContextBaseTasks() {
        if (this.activeModulePath) {
            return Array.isArray(this.currentContextTasks) ? this.currentContextTasks : [];
        }
        return Array.isArray(this.rootTasks) ? this.rootTasks : [];
    }

    /** Filter task collection. */
    filterTaskCollection(tasks, { status = null, priority = null } = {}) {
        let filtered = Array.isArray(tasks) ? [...tasks] : [];

        if (status) {
            filtered = filtered.filter(task => {
                const taskStatus = String(task && task.status || '');
                if (status === 'Done' || status === 'Completed') {
                    return taskStatus === 'Done' || taskStatus === 'Completed';
                }
                return taskStatus === String(status);
            });
        }

        if (priority) {
            filtered = filtered.filter(task => String(task && task.priority || '') === String(priority));
        }

        return filtered;
    }

    /** Resolve task module path. */
    resolveTaskModulePath(task) {
        if (!task || !Array.isArray(this.navigationModules) || this.navigationModules.length === 0) return null;

        const taskName = String(task.task_name || task.title || '').trim();
        if (!taskName) return null;

        const lowerTaskName = taskName.toLowerCase();
        const taskCode = this.getTaskCode(task);

        const matchedByTaskId = taskCode
            ? this.navigationModules.filter(moduleEntry => Array.isArray(moduleEntry.taskIds) && moduleEntry.taskIds.includes(taskCode))
            : [];

        const matchedByName = this.navigationModules.filter((moduleEntry) => {
            const moduleName = String(moduleEntry.name || '').trim().toLowerCase();
            const moduleLabel = String(moduleEntry.label || '').trim().toLowerCase();
            return (moduleName && lowerTaskName.includes(moduleName)) || (moduleLabel && lowerTaskName.includes(moduleLabel));
        });

        if (matchedByTaskId.length === 1) return matchedByTaskId[0].path;
        if (matchedByName.length === 1) return matchedByName[0].path;

        if (matchedByTaskId.length > 1) {
            const narrowedMatch = matchedByTaskId.filter((moduleEntry) => {
                const moduleName = String(moduleEntry.name || '').trim().toLowerCase();
                const moduleLabel = String(moduleEntry.label || '').trim().toLowerCase();
                return (moduleName && lowerTaskName.includes(moduleName)) || (moduleLabel && lowerTaskName.includes(moduleLabel));
            });
            if (narrowedMatch.length === 1) return narrowedMatch[0].path;
        }

        return null;
    }

    /** Check whether task editing. */
    supportsTaskEditing(task) {
        const rawId = task && (task.task_id ?? task.id);
        if (typeof rawId === 'number' && Number.isFinite(rawId)) return true;
        return typeof rawId === 'string' && /^\d+$/.test(rawId.trim());
    }

    /** Format display date. */
    formatDisplayDate(value) {
        if (!value) return '';
        const parsedDate = new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toLocaleDateString();
    }

    /** Encode module path. */
    encodeModulePath(modulePath) {
        return encodeURIComponent(this.normalizeModulePath(modulePath));
    }

    /** Get module fetch candidates. */
    getModuleFetchCandidates(projectId, modulePath) {
        const normalizedPath = this.normalizeModulePath(modulePath);
        if (!normalizedPath) return [];

        const relativeModulePath = normalizedPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
        const encodedProject = encodeURIComponent(String(projectId || '').trim());
        const currentDir = (typeof window !== 'undefined' && window.location && window.location.pathname)
            ? window.location.pathname.replace(/\/[^\/]*$/, '/')
            : '/';
        const baseCandidates = [currentDir, currentDir.replace('/public/', '/'), '/'];
        const urlCandidates = new Set();

        if (typeof window !== 'undefined' && window.location && window.location.origin) {
            urlCandidates.add(`${window.location.origin}/api/module?project=${encodedProject}&path=${encodeURIComponent(normalizedPath)}`);
        }

        baseCandidates.forEach((basePath) => {
            const normalizedBase = String(basePath || '/').endsWith('/') ? String(basePath || '/') : `${String(basePath || '/')}/`;
            urlCandidates.add(`${normalizedBase}api/module?project=${encodedProject}&path=${encodeURIComponent(normalizedPath)}`);
            urlCandidates.add(`${normalizedBase}tasksDB/local/${encodedProject}/${relativeModulePath}`);
            urlCandidates.add(`${normalizedBase}tasksDB/external/${encodedProject}/${relativeModulePath}`);
            urlCandidates.add(`${normalizedBase}tasksDB/${encodedProject}/${relativeModulePath}`);
        });

        return Array.from(urlCandidates);
    }

    /** Fetch module data. */
    async fetchModuleData(modulePath) {
        const normalizedPath = this.normalizeModulePath(modulePath);
        if (!normalizedPath) return null;
        if (this.moduleCache.has(normalizedPath)) return this.moduleCache.get(normalizedPath);

        if (typeof window !== 'undefined' && window.FolderProjectService && typeof window.FolderProjectService.getModuleData === 'function') {
            const localModuleData = window.FolderProjectService.getModuleData(this.activeProjectId, normalizedPath);
            if (localModuleData) {
                this.moduleCache.set(normalizedPath, localModuleData);
                return localModuleData;
            }
        }

        const candidates = this.getModuleFetchCandidates(this.activeProjectId, normalizedPath);
        for (const candidate of candidates) {
            try {
                const response = await fetch(candidate, { cache: 'no-store' });
                if (!response.ok) continue;

                const data = await response.json();
                if (!data || (!Array.isArray(data.tasks) && !data.template_type)) continue;

                this.moduleCache.set(normalizedPath, data);
                return data;
            } catch {
                // Try next candidate.
            }
        }

        return null;
    }

    /** Build module context tasks. */
    buildModuleContextTasks(moduleEntry, moduleData, modulePath = '') {
        const normalizedPath = this.normalizeModulePath(modulePath || (moduleEntry && moduleEntry.path) || '');
        const rootTasksByKey = new Map();
        const rootTasksByCode = new Map();

        this.rootTasks.forEach((task) => {
            const taskKey = this.getTaskKey(task);
            if (taskKey && !rootTasksByKey.has(taskKey)) rootTasksByKey.set(taskKey, task);

            const taskCode = this.getTaskCode(task);
            if (taskCode && !rootTasksByCode.has(taskCode)) rootTasksByCode.set(taskCode, task);
        });

        if (moduleData && Array.isArray(moduleData.tasks) && moduleData.tasks.length > 0) {
            return moduleData.tasks.map((task) => {
                const taskKey = this.getTaskKey(task);
                const taskCode = this.getTaskCode(task);
                const rootMatch = rootTasksByKey.get(taskKey) || rootTasksByCode.get(taskCode);
                return rootMatch
                    ? { ...task, ...rootMatch, __modulePath: normalizedPath }
                    : { ...task, __modulePath: normalizedPath };
            });
        }

        const moduleTaskIds = Array.isArray(moduleEntry && moduleEntry.taskIds) ? moduleEntry.taskIds : [];
        if (moduleTaskIds.length > 0) {
            const matchedRootTasks = this.rootTasks.filter((task) => {
                const taskCode = this.getTaskCode(task);
                const taskKey = this.getTaskKey(task);
                return moduleTaskIds.includes(taskCode) || moduleTaskIds.includes(taskKey);
            });
            if (matchedRootTasks.length > 0) return matchedRootTasks;
        }

        return this.rootTasks.filter(task => this.resolveTaskModulePath(task) === normalizedPath);
    }

    /** Get active module label. */
    getActiveModuleLabel() {
        const moduleEntry = this.getModuleByPath(this.activeModulePath);
        return String(
            (this.activeModuleData && this.activeModuleData.module && this.activeModuleData.module.name) ||
            (moduleEntry && (moduleEntry.label || moduleEntry.name)) ||
            ''
        ).trim();
    }

    /** Sync graph module state. */
    syncGraphModuleState() {
        try {
            const frame = document.getElementById('graphFrame');
            if (!frame || !frame.contentWindow) return;

            frame.contentWindow.postMessage({
                type: 'syncActiveModule',
                projectId: this.activeProjectId,
                modulePath: this.activeModulePath || '',
                label: this.getActiveModuleLabel()
            }, '*');
        } catch (error) {
            console.warn('Unable to sync active module to graph iframe', error);
        }
    }

    /** Set active module. */
    async setActiveModule(modulePath, options = {}) {
        const normalizedPath = this.normalizeModulePath(modulePath);
        const shouldSyncGraph = options.syncGraph !== false;

        if (!normalizedPath) {
            this.activeModulePath = '';
            this.activeModuleData = null;
            this.currentContextTasks = [...this.rootTasks];
            this.currentContextFlowSummary = this.buildTaskFlowSummary(this.currentContextTasks);
            this.renderProjectNavigation();
            this.filterTasks();

            if (shouldSyncGraph) {
                this.ensureGraphIframeLoaded();
                this.syncGraphModuleState();
            }
            return;
        }

        if (normalizedPath === this.activeModulePath && !options.forceReload) {
            this.renderProjectNavigation();
            this.filterTasks();
            if (shouldSyncGraph) this.syncGraphModuleState();
            return;
        }

        const moduleEntry = this.getModuleByPath(normalizedPath);
        const moduleData = await this.fetchModuleData(normalizedPath);

        this.activeModulePath = normalizedPath;
        this.activeModuleData = moduleData;
        this.currentContextTasks = this.buildModuleContextTasks(moduleEntry, moduleData, normalizedPath);
        this.currentContextFlowSummary = this.buildTaskFlowSummary(this.currentContextTasks);
        this.renderProjectNavigation();
        this.filterTasks();

        if (shouldSyncGraph) {
            this.ensureGraphIframeLoaded();
            this.syncGraphModuleState();
        }
    }

    /** Restore current context. */
    async restoreCurrentContext(options = {}) {
        if (this.activeModulePath && this.getModuleByPath(this.activeModulePath)) {
            await this.setActiveModule(this.activeModulePath, { ...options, forceReload: true });
            return;
        }

        await this.setActiveModule('', options);
    }

    /** Open module view. */
    openModuleView(encodedModulePath) {
        const decodedPath = decodeURIComponent(String(encodedModulePath || ''));
        return this.setActiveModule(decodedPath);
    }

    /** Open module relation. */
    openModuleRelation(encodedModuleName) {
        const decodedName = decodeURIComponent(String(encodedModuleName || ''));
        const moduleEntry = this.getModuleByName(decodedName);
        if (!moduleEntry) return;
        return this.setActiveModule(moduleEntry.path);
    }

    /** Clear module view. */
    clearModuleView() {
        return this.setActiveModule('');
    }

    /** Toggle project navigation panel. */
    toggleProjectNavigationPanel() {
        this.isModulePanelOpen = !this.isModulePanelOpen;
        this.renderProjectNavigation();
    }

    /** Render project navigation. */
    renderProjectNavigation() {
        const shell = document.getElementById('projectNavigationShell');
        const titleEl = document.getElementById('projectContextTitle');
        const descriptionEl = document.getElementById('projectContextDescription');
        const eyebrowEl = document.getElementById('projectContextEyebrow');
        const flowEl = document.getElementById('projectContextFlow');
        const panel = document.getElementById('projectNavigationPanel');
        const toggleBtn = document.getElementById('projectNavToggleBtn');
        const rootBtn = document.getElementById('projectNavRootBtn');
        const upBtn = document.getElementById('projectNavUpBtn');
        if (!shell || !titleEl || !descriptionEl || !eyebrowEl || !flowEl || !panel || !toggleBtn || !rootBtn || !upBtn) return;

        const hasNavigation = this.navigationModules.length > 0 || !!this.activeModulePath;
        shell.style.display = hasNavigation ? '' : 'none';
        if (!hasNavigation) return;

        const projectTitle = String(
            (this.database && this.database.currentProject && this.database.currentProject.name) ||
            (this.projectPayload && this.projectPayload.project && this.projectPayload.project.name) ||
            this.activeProjectId ||
            'Project'
        ).trim();
        const projectDescription = String(
            (this.projectPayload && (this.projectPayload.description || (this.projectPayload.project && this.projectPayload.project.description))) ||
            (this.database && this.database.description) ||
            ''
        ).trim();

        const moduleEntry = this.getModuleByPath(this.activeModulePath);
        const moduleData = this.activeModuleData || {};
        const modulePipeline = (moduleData.module && moduleData.module.pipeline) || (moduleEntry && moduleEntry.pipeline) || {};
        const contextBadges = [];
        const contextSections = [];
        const pathLabels = [];
        const flowSummary = this.currentContextFlowSummary || this.buildTaskFlowSummary(this.getContextBaseTasks());

        const renderStaticChips = (items, extraClass = '') => {
            const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
            return safeItems.map(item => `<span class="project-context-chip ${extraClass}">${this.escapeHtml(String(item))}</span>`).join('');
        };

        const renderRelationChips = (items, kind) => {
            const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
            return safeItems.map((item) => {
                const relatedModule = this.getModuleByName(item);
                if (!relatedModule) {
                    return `<span class="project-context-chip muted">${this.escapeHtml(String(item))}</span>`;
                }
                return `<button type="button" class="project-context-chip relation-chip ${kind}" onclick="app.openModuleRelation('${encodeURIComponent(String(item))}')">${this.escapeHtml(String(item))}</button>`;
            }).join('');
        };

        const pushContextSection = (label, html, sectionClass = '') => {
            if (!html) return;
            contextSections.push(`
                <section class="project-context-section ${sectionClass}">
                    <h3>${this.escapeHtml(label)}</h3>
                    <div class="project-context-chip-row">${html}</div>
                </section>
            `);
        };

        if (this.activeModulePath) {
            const moduleTitle = String(
                (moduleData.module && moduleData.module.name) ||
                (moduleEntry && (moduleEntry.label || moduleEntry.name)) ||
                this.activeModulePath.split('/').filter(Boolean).slice(-2, -1)[0] ||
                this.activeModulePath
            ).trim();
            const moduleDescription = String(moduleData.description || (moduleEntry && moduleEntry.description) || '').trim();

            eyebrowEl.textContent = 'Submodule Taskflow';
            titleEl.textContent = moduleTitle;
            descriptionEl.textContent = moduleDescription || 'Module details, start and finish points, and upstream/downstream links are synchronized with the graph view.';

            if (moduleEntry && moduleEntry.department) contextBadges.push(moduleEntry.department);
            if (moduleEntry && moduleEntry.type) contextBadges.push(moduleEntry.type);
            contextBadges.push(`${this.getContextBaseTasks().length} tasks`);

            const relativeModuleDir = this.normalizeModulePath((moduleEntry && moduleEntry.modulePath) || this.activeModulePath.replace(/\/[^\/]*$/, ''));
            if (relativeModuleDir) pathLabels.push(...relativeModuleDir.split('/').filter(Boolean));

            const pipelineInputs = Array.isArray(modulePipeline.input_from) ? modulePipeline.input_from.filter(Boolean) : [];
            const pipelineOutputs = Array.isArray(modulePipeline.output_to) ? modulePipeline.output_to.filter(Boolean) : [];
            pushContextSection('Starts With', renderStaticChips(flowSummary.startLabels, 'flow-start'));
            pushContextSection('Finishes With', renderStaticChips(flowSummary.endLabels, 'flow-end'));
            pushContextSection('Inputs', renderRelationChips(pipelineInputs, 'input'), 'relation-group');
            pushContextSection('Outputs', renderRelationChips(pipelineOutputs, 'output'), 'relation-group');
            flowEl.innerHTML = `
                <div class="project-context-path">${renderStaticChips(pathLabels, 'path-chip')}</div>
                <div class="project-context-badges">${renderStaticChips(contextBadges, 'meta-chip')}</div>
                <div class="project-context-grid">${contextSections.join('')}</div>
                <div class="project-context-note">Template-backed sublists are read-only in list mode. Use the graph or root ledger for deeper planning context.</div>
            `;
        } else {
            eyebrowEl.textContent = 'Project Taskflow';
            titleEl.textContent = projectTitle;
            descriptionEl.textContent = projectDescription || 'Select a task card or browse the module tree to walk the project from root flow to submodule flow.';

            contextBadges.push(`${this.navigationModules.length} modules`);
            contextBadges.push(`${this.rootTasks.length} tasks`);
            pushContextSection('Project Starts', renderStaticChips(flowSummary.startLabels, 'flow-start'));
            pushContextSection('Project Finishes', renderStaticChips(flowSummary.endLabels, 'flow-end'));
            flowEl.innerHTML = `
                <div class="project-context-badges">${renderStaticChips(contextBadges, 'meta-chip')}</div>
                <div class="project-context-grid">${contextSections.join('')}</div>
            `;
        }

        rootBtn.disabled = !this.activeModulePath;
        upBtn.disabled = !this.activeModulePath;
        toggleBtn.textContent = this.isModulePanelOpen ? 'Hide Modules' : 'Browse Modules';
        toggleBtn.setAttribute('aria-expanded', this.isModulePanelOpen ? 'true' : 'false');
        panel.hidden = !this.isModulePanelOpen;

        const treeRoot = { folders: new Map(), modules: [] };
        this.navigationModules.forEach((moduleItem) => {
            const parts = this.normalizeModulePath(moduleItem.path).split('/').filter(Boolean);
            if (parts.length === 0) return;

            let cursor = treeRoot;
            parts.forEach((segment, index) => {
                const isLeaf = index === parts.length - 1;
                if (isLeaf) {
                    cursor.modules.push(moduleItem);
                    return;
                }
                if (!cursor.folders.has(segment)) {
                    cursor.folders.set(segment, { folders: new Map(), modules: [] });
                }
                cursor = cursor.folders.get(segment);
            });
        });

        const renderTree = (node, depth = 0) => {
            let html = '';
            const folderEntries = Array.from(node.folders.entries()).sort((a, b) => a[0].localeCompare(b[0]));
            const moduleEntries = [...node.modules].sort((a, b) => String(a.label || a.name || '').localeCompare(String(b.label || b.name || '')));

            folderEntries.forEach(([folderName, childNode]) => {
                // Collapse: if this folder has exactly one module and no sub-folders,
                // render the module button directly without a <details> wrapper to avoid
                // redundant "▾ crm / crm" pairs in the navigation tree.
                const isSingleLeaf = childNode.folders.size === 0 && childNode.modules.length === 1;
                if (isSingleLeaf) {
                    const moduleItem = childNode.modules[0];
                    const isActive = moduleItem.path === this.activeModulePath;
                    const badge = moduleItem.type ? `<span class="project-modules-badge">${this.escapeHtml(String(moduleItem.type))}</span>` : '';
                    html += `
                        <button type="button" class="project-modules-leaf${isActive ? ' active' : ''}" title="${this.escapeHtml(moduleItem.path)}" onclick="app.openModuleView('${this.encodeModulePath(moduleItem.path)}')">
                            <span class="project-modules-label">${this.escapeHtml(folderName)}</span>
                            ${badge}
                        </button>
                    `;
                    return;
                }
                html += `
                    <details class="project-modules-folder" open data-depth="${depth}">
                        <summary class="project-modules-summary">
                            <span class="project-modules-folder-icon">▾</span>
                            <span>${this.escapeHtml(folderName)}</span>
                        </summary>
                        <div class="project-modules-children">${renderTree(childNode, depth + 1)}</div>
                    </details>
                `;
            });

            moduleEntries.forEach((moduleItem) => {
                const isActive = moduleItem.path === this.activeModulePath;
                const badge = moduleItem.type ? `<span class="project-modules-badge">${this.escapeHtml(String(moduleItem.type))}</span>` : '';
                html += `
                    <button type="button" class="project-modules-leaf${isActive ? ' active' : ''}" title="${this.escapeHtml(moduleItem.path)}" onclick="app.openModuleView('${this.encodeModulePath(moduleItem.path)}')">
                        <span class="project-modules-label">${this.escapeHtml(String(moduleItem.label || moduleItem.name || moduleItem.path))}</span>
                        ${badge}
                    </button>
                `;
            });

            return html;
        };

        panel.innerHTML = `
            <div class="project-modules-toolbar">
                <button type="button" class="project-modules-root${!this.activeModulePath ? ' active' : ''}" onclick="app.clearModuleView()">Root Project</button>
            </div>
            <div class="project-modules-tree">${renderTree(treeRoot)}</div>
        `;
    }

    /** Get available category names. */
    getAvailableCategoryNames() {
        // Preferred source: per-project categories loaded from tasks.json
        const fromDb = (this.database && Array.isArray(this.database.categories))
            ? this.database.categories
                .map(c => (c && typeof c.name === 'string' ? c.name.trim() : ''))
                .filter(Boolean)
            : [];
        if (fromDb.length > 0) return fromDb;

        // Fallback: global template config categories (strings)
        try {
            const templateConfig = (typeof window !== 'undefined' && window.TEMPLATE_CONFIG) ? window.TEMPLATE_CONFIG : (typeof TEMPLATE_CONFIG !== 'undefined' ? TEMPLATE_CONFIG : null);
            const fromConfig = templateConfig && Array.isArray(templateConfig.CATEGORIES)
                ? templateConfig.CATEGORIES.map(n => String(n || '').trim()).filter(Boolean)
                : [];
            if (fromConfig.length > 0) return fromConfig;
        } catch {
            // ignore
        }

        // Last resort: keep any existing <option> values already in the DOM
        const select = document.getElementById('taskCategory');
        if (!select) return [];
        const existing = Array.from(select.querySelectorAll('option'))
            .map(o => (o && typeof o.value === 'string' ? o.value.trim() : ''))
            .filter(Boolean);
        return existing;
    }

    /** Refresh category options. */
    refreshCategoryOptions({ preserveValue = true } = {}) {
        const select = document.getElementById('taskCategory');
        if (!select) return;

        const currentValue = preserveValue ? (select.value || '') : '';
        const names = this.getAvailableCategoryNames();

        // Rebuild options (placeholder + category list)
        select.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Select Category';
        select.appendChild(placeholder);

        const unique = Array.from(new Set(names));
        for (const name of unique) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            select.appendChild(opt);
        }

        // Restore selection if it still exists
        if (currentValue && unique.includes(currentValue)) {
            select.value = currentValue;
            return;
        }

        // If no selection, choose a sensible default when possible
        if (!select.value && unique.length > 0) {
            // Prefer "Feature" when present, else first category
            select.value = unique.includes('Feature') ? 'Feature' : unique[0];
        }
    }

    /** Get project auth key. */
    getProjectAuthKey(projectId) {
        const safe = String(projectId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
        return `taskManagerAuth:${safe}`;
    }

    /** Get project password key. */
    getProjectPasswordKey(projectId) {
        const safe = String(projectId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
        return `taskManagerAccessPassword:${safe}`;
    }

    // User Management
    /** Load user name. */
    loadUserName() {
        const saved = localStorage.getItem('taskManagerUserName');
        if (saved) {
            this.currentUser = saved;
            const userInput = document.getElementById('userName');
            if (userInput) {
                userInput.value = saved;
            }
        }
    }

    /** Save user name. */
    saveUserName(name) {
        this.currentUser = name;
        localStorage.setItem('taskManagerUserName', name);
    }

    // Password Protection Methods
    /** Get access config. */
    getAccessConfig() {
        const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
        const baseConfig = templateConfig.ACCESS || { PASSWORD: '', PUBLIC_READ: true, SESSION_DURATION: 30 };
        // Password resolution order (most specific → least specific):
        // 1) Per-project password from ACCESS_PASSWORDS[projectId]
        // 2) Master password ACCESS_PASSWORD_MASTER
        // 3) Backwards compatibility: ACCESS_PASSWORD
        let resolvedPassword = '';
        try {
            const projectId = this.activeProjectId || templateConfig.GITHUB.ACTIVE_PROJECT_ID || templateConfig.GITHUB.DEFAULT_PROJECT_ID || 'github-task-manager';
            if (typeof ACCESS_PASSWORDS !== 'undefined' && ACCESS_PASSWORDS && typeof ACCESS_PASSWORDS === 'object') {
                const p = String(projectId || '').trim();
                if (p && ACCESS_PASSWORDS[p]) {
                    resolvedPassword = ACCESS_PASSWORDS[p];
                }
            }
        } catch (e) {
            // ignore
        }

        if (!resolvedPassword && typeof ACCESS_PASSWORD_MASTER !== 'undefined' && ACCESS_PASSWORD_MASTER) {
            resolvedPassword = ACCESS_PASSWORD_MASTER;
        }

        if (!resolvedPassword && typeof ACCESS_PASSWORD !== 'undefined' && ACCESS_PASSWORD) {
            resolvedPassword = ACCESS_PASSWORD;
        }

        return {
            ...baseConfig,
            PASSWORD: resolvedPassword
        };
    }

    /** Check whether git hub pages host. */
    isGitHubPagesHost() {
        if (typeof window === 'undefined' || !window.location) return false;
        const hostname = window.location.hostname || '';
        return hostname.endsWith('github.io');
    }

    /** Get query param. */
    getQueryParam(name) {
        try {
            if (typeof window === 'undefined' || !window.location) return null;
            const params = new URLSearchParams(window.location.search || '');
            return params.get(name);
        } catch {
            return null;
        }
    }

    /** Check whether local host. */
    isLocalHost() {
        if (typeof window === 'undefined' || !window.location) return true;
        const hostname = window.location.hostname || '';
        return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    }

    /** Check whether password protection enabled. */
    isPasswordProtectionEnabled() {
        // For local E2E validation: /?forcePassword=1
        if (this.getQueryParam('forcePassword') === '1') return true;

        // Local dev: no password required
        if (this.isLocalHost()) return false;

        // GitHub Pages: enforce password gate
        return this.isGitHubPagesHost();
    }

    /** Check whether password protected. */
    isPasswordProtected() {
        // “Protected” means we enforce auth for modifications in this environment.
        return this.isPasswordProtectionEnabled();
    }


    /** Check auth. */
    checkAuth() {
        // If password protection is not enabled for this environment, allow all actions
        if (!this.isPasswordProtected()) {
            return true;
        }
        
        // Check if authenticated and session is still valid
        if (this.isAuthenticated && this.authExpiry) {
            if (Date.now() < this.authExpiry) {
                return true;
            }
            // Session expired
            this.isAuthenticated = false;
            this.authExpiry = null;
        }
        
        // Check localStorage for persisted session (scoped per active project)
        const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
        const projectId = this.activeProjectId || (templateConfig && templateConfig.GITHUB && (templateConfig.GITHUB.ACTIVE_PROJECT_ID || templateConfig.GITHUB.DEFAULT_PROJECT_ID)) || 'github-task-manager';
        const storedAuth = localStorage.getItem(this.getProjectAuthKey(projectId));
        if (storedAuth) {
            const { expiry } = JSON.parse(storedAuth);
            if (expiry && Date.now() < expiry) {
                this.isAuthenticated = true;
                this.authExpiry = expiry;
                return true;
            }
            // Clear expired session
            localStorage.removeItem(this.getProjectAuthKey(projectId));
        }
        
        return false;
    }

    /** Require auth. */
    requireAuth(action, ...args) {
        // Check if already authenticated
        if (this.checkAuth()) {
            // Execute action immediately
            action.apply(this, args);
            return;
        }
        
        // Store pending action and show password modal
        this.pendingAction = { action, args };
        this.showPasswordModal();
    }

    /** Show password modal. */
    showPasswordModal() {
        const modal = document.getElementById('passwordModal');
        if (modal) {
            modal.style.display = 'block';
            document.getElementById('accessPassword').value = '';
            document.getElementById('accessPassword').focus();
            document.getElementById('passwordError').style.display = 'none';
            try {
                const help = document.getElementById('passwordHelp');
                if (help) {
                    const project = this.activeProjectId || (window.TEMPLATE_CONFIG && window.TEMPLATE_CONFIG.GITHUB && window.TEMPLATE_CONFIG.GITHUB.DEFAULT_PROJECT_ID) || 'github-task-manager';
                    help.textContent = `Project: ${project} — use the project password or the master password to unlock.`;
                }
            } catch (e) {
                // ignore
            }
        }
    }

    /** Close password modal. */
    closePasswordModal() {
        const modal = document.getElementById('passwordModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.pendingAction = null;
    }

    /** Verify password. */
    async verifyPassword(event) {
        event.preventDefault();
        
        const passwordInput = document.getElementById('accessPassword');
        const errorDiv = document.getElementById('passwordError');
        const enteredPassword = (passwordInput.value || '').trim();
        const accessConfig = this.getAccessConfig();

        // Accept either per-project password OR master password (and legacy ACCESS_PASSWORD)
        const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
        const projectId = this.activeProjectId || (templateConfig && templateConfig.GITHUB && (templateConfig.GITHUB.ACTIVE_PROJECT_ID || templateConfig.GITHUB.DEFAULT_PROJECT_ID)) || 'github-task-manager';
        const allowedPasswords = [];
        try {
            if (typeof ACCESS_PASSWORDS !== 'undefined' && ACCESS_PASSWORDS && typeof ACCESS_PASSWORDS === 'object') {
                const p = String(projectId || '').trim();
                if (p && ACCESS_PASSWORDS[p]) allowedPasswords.push(String(ACCESS_PASSWORDS[p] || '').trim());
            }
        } catch (e) {
            // ignore
        }
        try {
            if (typeof ACCESS_PASSWORD_MASTER !== 'undefined' && ACCESS_PASSWORD_MASTER) {
                allowedPasswords.push(String(ACCESS_PASSWORD_MASTER || '').trim());
            }
        } catch (e) {
            // ignore
        }
        try {
            if (typeof ACCESS_PASSWORD !== 'undefined' && ACCESS_PASSWORD) {
                allowedPasswords.push(String(ACCESS_PASSWORD || '').trim());
            }
        } catch (e) {
            // ignore
        }

        const uniqueAllowed = Array.from(new Set(allowedPasswords.filter(Boolean)));
        if (uniqueAllowed.length === 0) {
            errorDiv.innerHTML = '<span style="color: var(--danger-color);">⚠️ Access is not configured for this deployment. Please set the GitHub Secret(s) <code>ACCESS_PASSWORD_MASTER</code> and/or per-project keys via <code>ACCESS_PASSWORDS</code>.</span>';
            errorDiv.style.display = 'block';
            return false;
        }

        if (uniqueAllowed.includes(enteredPassword)) {
            // Password correct - set authentication
            const sessionDuration = (accessConfig.SESSION_DURATION || 30) * 60 * 1000; // Convert to ms
            this.authExpiry = Date.now() + sessionDuration;
            this.isAuthenticated = true;
            
            // Persist to localStorage
            localStorage.setItem(this.getProjectAuthKey(projectId), JSON.stringify({
                expiry: this.authExpiry
            }));

            // Store password in sessionStorage for Worker API calls (project-scoped)
            // (Worker validates password server-side before writing to GitHub)
            try {
                sessionStorage.setItem(this.getProjectPasswordKey(projectId), enteredPassword);
                // Backwards compatibility (older TaskDatabase versions)
                sessionStorage.setItem('taskManagerAccessPassword', enteredPassword);
            } catch (e) {
                // ignore
            }
            
            // Store pending action before closing modal (which clears it)
            const pendingAction = this.pendingAction;
            
            // Close modal and update UI
            this.closePasswordModal();
            this.updateAccessIndicator();
            this.showToast('🔓 Access granted!', 'success');
            
            // Execute pending action if any
            if (pendingAction) {
                const { action, args } = pendingAction;
                action.apply(this, args);
            }
        } else {
            // Wrong password
            errorDiv.innerHTML = '<span style="color: var(--danger-color);">❌ Incorrect password. Please try again.</span>';
            errorDiv.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
        
        return false;
    }

    /** Logout. */
    logout() {
        this.isAuthenticated = false;
        this.authExpiry = null;

        // Clear persisted auth for all projects
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('taskManagerAuth:')) keysToRemove.push(key);
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch (e) {
            // ignore
        }

        // Clear session passwords (used for Worker API calls)
        try {
            const keysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith('taskManagerAccessPassword:')) keysToRemove.push(key);
            }
            keysToRemove.forEach(k => sessionStorage.removeItem(k));
            sessionStorage.removeItem('taskManagerAccessPassword');
        } catch (e) {
            // ignore
        }
        this.updateAccessIndicator();
        this.showToast('🔒 Logged out', 'info');
    }

    // --- GitHub OAuth Device Flow ---
    /** Get git hub oauth token. */
    getGitHubOAuthToken() {
        try {
            const token = sessionStorage.getItem('githubOAuthToken');
            if (token && String(token).trim()) return String(token).trim();
        } catch (e) {
            // ignore
        }
        return '';
    }

    /** Set git hub oauth token. */
    setGitHubOAuthToken(token, user = '') {
        try {
            if (token && String(token).trim()) {
                sessionStorage.setItem('githubOAuthToken', String(token).trim());
                if (user) sessionStorage.setItem('githubOAuthUser', user);
                // Apply to runtime config
                if (this.config) this.config.token = token;
                const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
                if (templateConfig && templateConfig.GITHUB) {
                    templateConfig.GITHUB.TOKEN = token;
                }
            }
        } catch (e) {
            // ignore
        }
    }

    /** Clear git hub oauth token. */
    clearGitHubOAuthToken() {
        try {
            sessionStorage.removeItem('githubOAuthToken');
            sessionStorage.removeItem('githubOAuthUser');
        } catch (e) {
            // ignore
        }
        if (this.config) this.config.token = '';
    }

    /** Check whether git hub connected. */
    isGitHubConnected() {
        return !!this.getGitHubOAuthToken();
    }

    /** Show git hub login modal. */
    showGitHubLoginModal() {
        const modal = document.getElementById('githubLoginModal');
        if (!modal) return;
        modal.style.display = 'block';
        // Reset to step 1
        document.getElementById('githubLoginStep1').style.display = 'block';
        document.getElementById('githubLoginStep2').style.display = 'none';
        document.getElementById('githubLoginSuccess').style.display = 'none';
        const err = document.getElementById('githubLoginError');
        if (err) { err.style.display = 'none'; err.textContent = ''; }
    }

    /** Close git hub login modal. */
    closeGitHubLoginModal() {
        const modal = document.getElementById('githubLoginModal');
        if (modal) modal.style.display = 'none';
        // Stop polling if running
        if (this._deviceFlowPollTimer) {
            clearInterval(this._deviceFlowPollTimer);
            this._deviceFlowPollTimer = null;
        }
    }

    /** Start git hub device flow. */
    async startGitHubDeviceFlow() {
        const oauthConfig = window.GITHUB_OAUTH_CONFIG;
        if (!oauthConfig || !oauthConfig.CLIENT_ID) {
            this.showGitHubLoginError('GitHub OAuth is not configured. Set GITHUB_OAUTH_CLIENT_ID secret.');
            return;
        }

        try {
            // Note: GitHub Device Flow requires a CORS proxy or backend because
            // the /login/device/code endpoint doesn't support CORS from browsers.
            // For a fully static site, we'll need to guide users to manually authorize.
            // Alternative: Use a simple Cloudflare Worker as CORS proxy.
            
            // For now, show instructions for manual OAuth authorization
            this.showManualOAuthInstructions();
        } catch (e) {
            console.error('Device flow error:', e);
            this.showGitHubLoginError(`OAuth error: ${e.message}`);
        }
    }

    /** Show manual oauth instructions. */
    showManualOAuthInstructions() {
        const oauthConfig = window.GITHUB_OAUTH_CONFIG;
        const clientId = oauthConfig && oauthConfig.CLIENT_ID;
        
        // GitHub OAuth web flow (redirect-based)
        // This works for GitHub Pages but requires a callback URL
        const redirectUri = `${window.location.origin}${window.location.pathname}`;
        const scope = 'public_repo';
        const state = Math.random().toString(36).substring(2);
        sessionStorage.setItem('githubOAuthState', state);

        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

        // Show step 2 with manual link
        document.getElementById('githubLoginStep1').style.display = 'none';
        document.getElementById('githubLoginStep2').style.display = 'block';
        document.getElementById('deviceUserCode').textContent = 'See link below';
        document.getElementById('deviceVerificationLink').href = authUrl;
        document.getElementById('deviceVerificationLink').textContent = 'Authorize on GitHub →';
        document.getElementById('devicePollStatus').innerHTML = `
            After authorizing, you'll be redirected back here.<br>
            <small style="color: var(--text-secondary);">Note: GitHub OAuth requires a backend to exchange the code for a token. For a fully static site, consider using a CORS proxy or Cloudflare Worker.</small>
        `;
    }

    /** Show git hub login error. */
    showGitHubLoginError(message) {
        const err = document.getElementById('githubLoginError');
        if (err) {
            err.style.display = 'block';
            err.textContent = message;
        }
    }

    /** Copy device code. */
    copyDeviceCode() {
        const code = document.getElementById('deviceUserCode').textContent;
        if (code && navigator.clipboard) {
            navigator.clipboard.writeText(code);
            this.showToast('Code copied!', 'success');
        }
    }

    /** Update access indicator. */
    updateAccessIndicator() {
        const indicator = document.getElementById('accessIndicator');
        if (!indicator) return;
        
        // Hide indicator if password protection is not enabled
        if (!this.isPasswordProtected()) {
            indicator.style.display = 'none';
            return;
        }
        
        indicator.style.display = 'flex';
        
        if (this.checkAuth()) {
            indicator.className = 'auth-indicator unlocked';
            indicator.innerHTML = '🔓 <span>Unlocked</span>';
            indicator.title = 'Click to lock';
        } else {
            indicator.className = 'auth-indicator locked';
            indicator.innerHTML = '🔒 <span>Read-Only</span>';
            indicator.title = 'Click to unlock for editing';
        }
    }

    /** Toggle auth indicator. */
    toggleAuthIndicator() {
        if (this.checkAuth()) {
            // Already authenticated - log out
            this.logout();
        } else {
            // Not authenticated - show password modal to unlock
            this.showPasswordModal();
        }
    }

    /** Check whether configured. */
    isConfigured() {
        // For GitHub Pages deployment, we can use public repos without auth token
        return this.config.owner && this.config.repo;
    }

    /** Show config error. */
    showConfigError() {
        const mainElement = document.querySelector('main');
        mainElement.innerHTML = `
            <div class="error-message" style="background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; padding: 30px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #dc3545; margin-top: 0;">Configuration Error</h2>
                <p>GitHub token and repository configuration are missing. For GitHub Pages deployment, ensure environment variables are set:</p>
                <ul>
                    <li><code>REACT_APP_GITHUB_OWNER</code></li>
                    <li><code>REACT_APP_GITHUB_REPO</code></li>
                    <li><code>REACT_APP_GH_TOKEN</code></li>
                    <li><code>REACT_APP_GITHUB_BRANCH</code> (optional, defaults to 'main')</li>
                </ul>
                <p>Check GitHub Actions secrets and deployment configuration.</p>
            </div>
        `;
    }

    /** Show task manager. */
    async showTaskManager() {
        const taskManager = document.getElementById('taskManager');
        if (taskManager) {
            taskManager.style.display = 'block';
        }

        const localFolderProject = (typeof window !== 'undefined' && window.FolderProjectService && typeof window.FolderProjectService.getProjectRecord === 'function')
            ? window.FolderProjectService.getProjectRecord(this.activeProjectId)
            : null;
        
        const repoInfo = document.getElementById('repoInfo');
        if (repoInfo) {
            repoInfo.textContent = localFolderProject
                ? `Source: Local folder (${localFolderProject.label || localFolderProject.id})`
                : `Repository: ${this.config.owner}/${this.config.repo} (${this.config.branch})`;
        }

        const workerInfo = document.getElementById('workerInfo');
        if (workerInfo) {
            if (localFolderProject) {
                workerInfo.textContent = 'Worker: Local folder (read-only)';
            } else {
                const workerUrl = (typeof window !== 'undefined' && window.TEMPLATE_CONFIG && window.TEMPLATE_CONFIG.GITHUB && window.TEMPLATE_CONFIG.GITHUB.WORKER_URL)
                    ? String(window.TEMPLATE_CONFIG.GITHUB.WORKER_URL || '')
                    : (this.getWorkerUrl ? this.getWorkerUrl() : '');
                workerInfo.textContent = workerUrl ? `Worker: ${workerUrl}` : 'Worker: Not configured';
            }
        }

        const tasksInfo = document.getElementById('tasksInfo');
        if (tasksInfo) {
            const tasksFile = localFolderProject
                ? String(localFolderProject.rootModuleRelative || 'node.tasks.json')
                : (this.config && this.config.tasksFile ? String(this.config.tasksFile) : (window.TEMPLATE_CONFIG && window.TEMPLATE_CONFIG.GITHUB && window.TEMPLATE_CONFIG.GITHUB.TASKS_FILE ? String(window.TEMPLATE_CONFIG.GITHUB.TASKS_FILE) : '-'));
            tasksInfo.textContent = `TasksFile: ${tasksFile}`;
        }
    }

    // Task Management
    /** Load tasks. */
    async loadTasks() {
        if (!this.database) return;

        this.showLoading();
        try {
            await this.database.loadTasks();
            this.syncProjectContextFromDatabase();
            await this.restoreCurrentContext({ syncGraph: false });
            this.showToast('Tasks loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showToast('Error loading tasks: ' + error.message, 'error');
            this.tasks = [];
            this.rootTasks = [];
            this.currentContextTasks = [];
            this.filteredTasks = [];
            this.navigationModules = [];
            this.moduleIndex = new Map();
            this.moduleNameIndex = new Map();
            this.activeModulePath = '';
            this.activeModuleData = null;
            this.currentContextFlowSummary = { startTaskKeys: [], endTaskKeys: [], startLabels: [], endLabels: [] };
            this.renderProjectNavigation();
            this.renderTasks();
        } finally {
            this.hideLoading();
        }
    }

    /** Save tasks. */
    async saveTasks() {
        if (!this.database) return;

        this.showLoading();
        try {
            // Ensure actor name is attached to Worker writes for history/audit.
            this.database.actor = this.currentUser || '';
            const result = await this.database.saveTasks();

            // TaskDatabase.saveTasks() returns { success: false, error: ... } for validation/auth issues.
            // Treat that as a failure (otherwise UI incorrectly claims GitHub was updated).
            if (!result || result.success !== true) {
                throw new Error((result && result.error) ? result.error : 'Save failed');
            }
            // If save succeeded but nothing was actually committed (e.g., content identical), warn user
            if (result.committed === false) {
                this.showToast('No changes were committed (content appears identical).', 'warning');
                // Still refresh history if open, but avoid showing extra success toast below
                const historyModal = document.getElementById('historyModal');
                if (historyModal && historyModal.style.display === 'block') {
                    this.refreshHistory();
                }
                return;
            }
            const source = result.source === 'github'
                ? 'to GitHub'
                : (result.source === 'worker'
                    ? 'to GitHub (via Worker)'
                    : (result.source === 'local-disk' ? 'locally (disk)' : 'locally'));

            // If we're on GitHub Pages and we only saved locally, make that explicit.
            // This commonly happens when GH_WORKER_URL isn't configured.
            const isGhPages = this.isGitHubPagesHost && this.isGitHubPagesHost();
            if (isGhPages && (result.source === 'local' || result.source === 'local-disk')) {
                this.showToast(`Saved locally only (NOT pushed to GitHub). Configure Worker URL, then unlock and save again.`, 'warning');
            } else {
                this.showToast(`Tasks saved successfully ${source}`, 'success');
            }

            // If history modal is open, refresh it.
            const historyModal = document.getElementById('historyModal');
            if (historyModal && historyModal.style.display === 'block') {
                this.refreshHistory();
            }
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showToast('Error saving tasks: ' + error.message, 'error');
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    // History
    /** Open history modal. */
    openHistoryModal() {
        const modal = document.getElementById('historyModal');
        if (!modal) return;
        modal.style.display = 'block';
        this.refreshHistory();
    }

    /** Close history modal. */
    closeHistoryModal() {
        const modal = document.getElementById('historyModal');
        if (modal) modal.style.display = 'none';
    }

    /** Set history status. */
    setHistoryStatus(message, type = 'info') {
        const el = document.getElementById('historyStatus');
        if (!el) return;
        if (!message) {
            el.style.display = 'none';
            el.textContent = '';
            return;
        }
        el.style.display = 'block';
        el.className = `validation-messages ${type}`;
        el.textContent = message;
    }

    /** Get worker url. */
    getWorkerUrl() {
        try {
            const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
            const gh = templateConfig && templateConfig.GITHUB ? templateConfig.GITHUB : null;
            return (gh && gh.WORKER_URL) ? String(gh.WORKER_URL).trim() : '';
        } catch {
            return '';
        }
    }

    /** Get raw history url. */
    getRawHistoryUrl(projectId) {
        const owner = this.config && this.config.owner ? this.config.owner : '';
        const repo = this.config && this.config.repo ? this.config.repo : '';
        const branch = this.config && this.config.branch ? this.config.branch : 'main';
        let tasksFile = '';

        try {
            const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
            const gh = templateConfig && templateConfig.GITHUB ? templateConfig.GITHUB : null;
            if (gh && typeof gh.getTasksFile === 'function') {
                tasksFile = String(gh.getTasksFile(projectId) || '');
            }
        } catch {
            // Ignore and use the fallback below.
        }

        if (!tasksFile) {
            const safeProject = String(projectId || '').replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
            tasksFile = `public/tasksDB/external/${safeProject}/node.tasks.json`;
        }

        const historyPath = String(tasksFile)
            .replace(/\\/g, '/')
            .replace(/\/[^\/]+$/g, '/history/changes.ndjson');

        return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${historyPath}`;
    }

    /** Apply history filter. */
    applyHistoryFilter() {
        this.refreshHistory();
    }

    /** Refresh history. */
    async refreshHistory() {
        const projectId = this.activeProjectId || 'github-task-manager';
        const filterEl = document.getElementById('historyTaskIdFilter');
        const taskId = filterEl ? String(filterEl.value || '').trim() : '';

        this.setHistoryStatus('Loading history...', 'info');
        try {
            const items = await this.loadHistoryItems({ projectId, taskId, limit: 200 });
            this.renderHistory(items);
            this.setHistoryStatus(items.length ? `Loaded ${items.length} history entries.` : 'No history entries found yet.', items.length ? 'success' : 'info');
        } catch (e) {
            console.error('History load failed', e);
            this.renderHistory([]);
            this.setHistoryStatus(`Failed to load history: ${e.message}`, 'error');
        }
    }

    /** Load history items. */
    async loadHistoryItems({ projectId, taskId = '', limit = 200 }) {
        const safeProject = String(projectId || '').replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
        const workerUrl = this.getWorkerUrl();

        // Preferred: Worker endpoint (avoids GitHub raw caching quirks)
        if (workerUrl) {
            const url = new URL(`${workerUrl}/api/task-history`);
            url.searchParams.set('project', safeProject);
            url.searchParams.set('limit', String(limit));
            if (taskId) url.searchParams.set('taskId', taskId);

            const res = await fetch(url.toString(), { method: 'GET' });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
                throw new Error(err.error || `HTTP ${res.status}`);
            }
            const data = await res.json();
            return Array.isArray(data.items) ? data.items : [];
        }

        // Fallback: public raw file
        const rawUrl = this.getRawHistoryUrl(safeProject);
        const rawRes = await fetch(rawUrl, { method: 'GET', cache: 'no-store' });
        if (rawRes.status === 404) return [];
        if (!rawRes.ok) throw new Error(`HTTP ${rawRes.status}`);
        const text = await rawRes.text();
        const lines = text.split(/\r?\n/).filter(Boolean);
        const parsed = [];
        for (let i = lines.length - 1; i >= 0; i--) {
            try {
                const evt = JSON.parse(lines[i]);
                if (taskId && String(evt.taskId) !== String(taskId)) continue;
                parsed.push(evt);
                if (parsed.length >= limit) break;
            } catch {
                // ignore bad lines
            }
        }
        return parsed;
    }

    /** Render history. */
    renderHistory(items) {
        const list = document.getElementById('historyList');
        if (!list) return;

        const arr = Array.isArray(items) ? items : [];
        if (arr.length === 0) {
            list.innerHTML = `<div class="empty-state" style="display:block; padding: 14px;"><p>No history found for this project yet.</p></div>`;
            return;
        }

        list.innerHTML = arr.map(evt => {
            const ts = evt.ts ? new Date(evt.ts).toLocaleString() : '';
            const actor = evt.actor ? String(evt.actor) : 'unknown';
            const action = evt.action ? String(evt.action) : 'update';
            const taskId = evt.taskId ? String(evt.taskId) : '';
            const taskName = evt.taskName ? String(evt.taskName) : '';
            const summary = evt.changeSummary ? String(evt.changeSummary) : (evt.message || '');

            const title = `${action.toUpperCase()} • #${taskId} ${taskName}`.trim();
            const meta = `${ts} • by ${actor}${evt.commitSha ? ` • ${String(evt.commitSha).slice(0, 8)}` : ''}`;

            const detailObj = {
                ts: evt.ts,
                projectId: evt.projectId,
                actor: evt.actor,
                origin: evt.origin,
                file: evt.file,
                commitSha: evt.commitSha,
                message: evt.message,
                action: evt.action,
                taskId: evt.taskId,
                taskName: evt.taskName,
                changeSummary: evt.changeSummary,
                changes: evt.changes,
                before: evt.before,
                after: evt.after
            };

            const detailsText = this.escapeHtml(JSON.stringify(detailObj, null, 2));

            return `
                <details class="history-item">
                    <summary>
                        <span class="history-title">${this.escapeHtml(title)}</span>
                        <span class="history-meta">${this.escapeHtml(summary)}</span>
                    </summary>
                    <div class="history-meta">${this.escapeHtml(meta)}</div>
                    <pre class="history-changes">${detailsText}</pre>
                </details>
            `;
        }).join('');
    }

    /** Render tasks. */
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const timelineView = document.getElementById('timelineView');
        const graphView = document.getElementById('graphView');
        const emptyState = document.getElementById('emptyState');
        const emptyStateMessage = emptyState ? emptyState.querySelector('p') : null;

        this.renderProjectNavigation();

        const contextTasks = this.getContextBaseTasks();
        const flowSummary = this.currentContextFlowSummary || this.buildTaskFlowSummary(contextTasks);
        const startTaskKeys = new Set(Array.isArray(flowSummary.startTaskKeys) ? flowSummary.startTaskKeys : []);
        const endTaskKeys = new Set(Array.isArray(flowSummary.endTaskKeys) ? flowSummary.endTaskKeys : []);

        if (this.viewMode === 'graph' && graphView) {
            if (tasksList) tasksList.style.display = 'none';
            if (timelineView) {
                timelineView.innerHTML = '';
                timelineView.style.display = 'none';
            }
            if (emptyState) emptyState.style.display = 'none';

            graphView.style.display = 'block';
            this.ensureGraphIframeLoaded();
            this.updateViewToggle();
            return;
        }

        if (graphView) graphView.style.display = 'none';

        if (this.filteredTasks.length === 0) {
            tasksList.innerHTML = '';
            if (timelineView) {
                timelineView.innerHTML = '';
                timelineView.style.display = 'none';
            }
            if (emptyStateMessage) {
                emptyStateMessage.textContent = this.activeModulePath
                    ? 'No tasks found in this submodule. Use the module tree to switch context or return to the root project flow.'
                    : 'No tasks found. Click "Add New Task" to get started, or import a template above!';
            }
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        if (this.viewMode === 'timeline' && timelineView) {
            tasksList.style.display = 'none';
            timelineView.style.display = 'block';
            this.renderTimeline();
            this.updateViewToggle();
            return;
        }

        if (timelineView) {
            timelineView.style.display = 'none';
        }
        tasksList.style.display = '';
        this.updateViewToggle();

        tasksList.innerHTML = this.filteredTasks.map((task, index) => {
            const displayStatus = task.status === 'Completed' ? 'Done' : (task.status || '');
            const statusSlug = displayStatus.toLowerCase().replace(/\s+/g, '-');
            const statusClass = displayStatus ? `status-${statusSlug}${statusSlug === 'done' ? ' status-completed' : ''}` : '';
            const taskKey = this.getTaskKey(task);
            const taskReference = this.supportsTaskEditing(task) ? String(task.task_id ?? task.id).trim() : '';
            const modulePath = this.normalizeModulePath(task.__modulePath || this.resolveTaskModulePath(task) || '');
            const showModuleAction = modulePath && modulePath !== this.activeModulePath;
            // Card click always opens task detail modal; module navigation is only via task-actions button
            const cardAction = `app.openTaskDetail(${index})`;
            const taskDataAttribute = taskReference ? ` data-task-id="${this.escapeHtml(taskReference)}"` : '';
            const cardAttributes = cardAction ? `${taskDataAttribute} role="button" tabindex="0" onclick="${cardAction}"` : taskDataAttribute;
            const createdDate = this.formatDisplayDate(task.created_date || task.createdAt || '');
            const dueDate = this.formatDisplayDate(task.end_date || task.due_date || '');
            const dependencyCount = Array.isArray(task.dependencies) ? task.dependencies.length : 0;
            const subtaskCount = Array.isArray(task.subtasks) ? task.subtasks.length : 0;
            const linkedIssue = this.getLinkedIssue(task);

            const infoBits = [];
            if (task.assigned_workers && task.assigned_workers.length > 0) {
                infoBits.push(`<span>👤 ${task.assigned_workers.map(worker => worker.name || worker.worker_id || worker.email).filter(Boolean).join(', ')}</span>`);
            } else if (task.required_roles && Array.isArray(task.required_roles) && task.required_roles.length > 0) {
                infoBits.push(`<span>🧩 Suggested: ${task.required_roles.map(role => role.role).filter(Boolean).join(', ')}</span>`);
            }
            if (dueDate) infoBits.push(`<span>📅 ${dueDate}</span>`);
            if (task.estimated_hours) infoBits.push(`<span>⏱️ ${task.estimated_hours}h</span>`);
            if (dependencyCount > 0) infoBits.push(`<span>🔗 ${dependencyCount} dependencies</span>`);
            if (subtaskCount > 0) infoBits.push(`<span>🪜 ${subtaskCount} subtasks</span>`);
            if (linkedIssue) infoBits.push(`<span>🐙 <a href="${linkedIssue.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()">#${linkedIssue.number}</a></span>`);
            if (createdDate) infoBits.push(`<span>🕐 ${createdDate}</span>`);

            const actionBits = [];
            if (showModuleAction) {
                actionBits.push(`<button class="btn-secondary" onclick="event.stopPropagation(); app.openModuleView('${this.encodeModulePath(modulePath)}')">View Sublist</button>`);
            }
            if (taskReference) {
                actionBits.push(`<button class="btn-secondary" onclick="event.stopPropagation(); app.editTask('${this.escapeHtml(taskReference)}')">Edit</button>`);
                actionBits.push(`<button class="btn-danger" onclick="event.stopPropagation(); app.deleteTask('${this.escapeHtml(taskReference)}')">Delete</button>`);
                actionBits.push(linkedIssue
                    ? `<a class="btn-secondary" href="${linkedIssue.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Open Issue</a>`
                    : `<button class="btn-secondary" onclick="event.stopPropagation(); app.createIssueForTask('${this.escapeHtml(taskReference)}')">Create Issue</button>`);
            }

            const readOnlyNote = !taskReference
                ? '<div class="task-readonly-note">Template task view</div>'
                : '';

            return `
            <div class="task-card ${statusClass}${taskReference ? '' : ' readonly'}"${cardAttributes}>
                <div class="task-header">
                    <div>
                        <h3 class="task-title">${this.escapeHtml(task.task_name || task.title)}</h3>
                        <div class="task-meta">
                            <span class="badge badge-status-${displayStatus.replace(/ /g, '-').toLowerCase()}">${displayStatus.replace(/-/g, ' ')}</span>
                            <span class="badge badge-priority-${task.priority || 'medium'}">${task.priority || 'medium'}</span>
                            ${startTaskKeys.has(taskKey) ? '<span class="badge badge-flow-start">Start</span>' : ''}
                            ${endTaskKeys.has(taskKey) ? '<span class="badge badge-flow-end">Finish</span>' : ''}
                            ${task.is_critical_path ? '<span class="badge" style="background: rgba(220, 53, 69, 0.2); color: var(--danger-color);">Critical Path</span>' : ''}
                            ${showModuleAction ? '<span class="badge badge-module-link">Sublist</span>' : ''}
                        </div>
                    </div>
                </div>
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="task-footer">
                    <div class="task-info">
                        ${infoBits.join('')}
                    </div>
                    ${task.tags && task.tags.length > 0 ? `
                        <div class="task-tags">
                            ${task.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                ${readOnlyNote}
                ${actionBits.length > 0 ? `<div class="task-actions" onclick="event.stopPropagation()">${actionBits.join('')}</div>` : ''}
            </div>
        `;}).join('');
    }

    /** Set view mode. */
    setViewMode(mode) {
        const next = (mode === 'timeline' || mode === 'graph') ? mode : 'list';
        if (this.viewMode === next) return;
        this.viewMode = next;
        this.renderTasks();

        // Toggle fullscreen overlay for graph view
        try {
            const graphView = document.getElementById('graphView');
            if (!graphView) return;

            if (this.viewMode === 'graph') {
                graphView.classList.add('fullscreen');
                document.body.classList.add('graph-fullscreen-active');

                // Exit action handled via the menu panel button (#exitGraphViewBtn).
                const exitBtn = document.getElementById('exitGraphViewBtn');
                if (exitBtn && !exitBtn._hasExitHandler) {
                    exitBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.setViewMode('list');
                    });
                    // mark to avoid duplicate handlers
                    exitBtn._hasExitHandler = true;
                }

                // Add Escape key handler to exit fullscreen
                if (typeof this._graphEscHandler !== 'function') {
                    this._graphEscHandler = (e) => { if (e.key === 'Escape') this.setViewMode('list'); };
                    document.addEventListener('keydown', this._graphEscHandler);
                }

                // Ensure iframe fills the viewport immediately
                const frame = document.getElementById('graphFrame');
                if (frame) {
                    frame.style.width = '100%';
                    frame.style.height = '100%';
                }
            } else {
                graphView.classList.remove('fullscreen');
                document.body.classList.remove('graph-fullscreen-active');

                // Remove Escape key handler
                if (typeof this._graphEscHandler === 'function') {
                    document.removeEventListener('keydown', this._graphEscHandler);
                    this._graphEscHandler = null;
                }

                const frame = document.getElementById('graphFrame');
                if (frame) {
                    frame.style.removeProperty('width');
                    frame.style.removeProperty('height');
                }
            }
        } catch (e) {
            // Non-fatal - UI enhancement only
            console.warn('Could not toggle graph fullscreen:', e);
        }
    }

    /** Update view toggle. */
    updateViewToggle() {
        const listBtn = document.getElementById('viewListBtn');
        const timelineBtn = document.getElementById('viewTimelineBtn');
        const graphBtn = document.getElementById('viewGraphBtn');
        if (listBtn) listBtn.classList.toggle('active', this.viewMode === 'list');
        if (timelineBtn) timelineBtn.classList.toggle('active', this.viewMode === 'timeline');
        if (graphBtn) graphBtn.classList.toggle('active', this.viewMode === 'graph');
    }

    /** Set timeline scale. */
    setTimelineScale(scale) {
        const next = (scale === 'week') ? 'week' : 'day';
        this.timelineScale = next;
        if (this.viewMode === 'timeline') this.renderTasks();
    }

    /** Parse date. */
    parseDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return null;
        const d = new Date(`${dateStr}T00:00:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    /** Calculate the number of days between two dates. */
    daysBetween(a, b) {
        const ms = 24 * 60 * 60 * 1000;
        return Math.floor((b.getTime() - a.getTime()) / ms);
    }

    /** Format short date. */
    formatShortDate(d) {
        try {
            return d.toISOString().slice(0, 10);
        } catch {
            return '';
        }
    }

    /** Render timeline. */
    renderTimeline() {
        const timelineView = document.getElementById('timelineView');
        if (!timelineView) return;

        const tasks = (this.filteredTasks || []).slice();
        const dated = tasks
            .map(t => ({
                task: t,
                start: this.parseDate(t.start_date),
                end: this.parseDate(t.end_date) || this.parseDate(t.start_date)
            }))
            .filter(x => x.start && x.end);

        if (dated.length === 0) {
            timelineView.innerHTML = `<div class="empty-state" style="display:block; padding: 18px;">
                <p>No tasks with valid start/end dates to render on a timeline.</p>
            </div>`;
            return;
        }

        let min = dated[0].start;
        let max = dated[0].end;
        for (const item of dated) {
            if (item.start < min) min = item.start;
            if (item.end > max) max = item.end;
        }

        const totalDays = Math.max(1, this.daysBetween(min, max) + 1);
        const scale = (totalDays > 180) ? 'week' : this.timelineScale;
        const units = (scale === 'week') ? Math.ceil(totalDays / 7) : totalDays;
        const unitWidth = (scale === 'week') ? 10 : 16;

        // Sort by start date
        dated.sort((a, b) => a.start - b.start);

        const headerTitle = `Timeline (${this.formatShortDate(min)} → ${this.formatShortDate(max)})`;
        const rowsHtml = dated.map(({ task, start, end }) => {
            const statusClass = `status-${String(task.status || '').toLowerCase().replace(/\s+/g, '-')}`;
            const startOffsetDays = this.daysBetween(min, start);
            const endOffsetDays = this.daysBetween(min, end);
            const unitStart = (scale === 'week') ? Math.floor(startOffsetDays / 7) : startOffsetDays;
            const unitEnd = (scale === 'week') ? Math.floor(endOffsetDays / 7) : endOffsetDays;
            const unitLen = Math.max(1, (unitEnd - unitStart + 1));
            const leftCss = `calc(${unitStart} * var(--unit-width))`;
            const widthCss = `calc(${unitLen} * var(--unit-width))`;

            return `
                <div class="timeline-row" onclick="app.editTask('${task.task_id || task.id}')" role="button" tabindex="0">
                    <div class="timeline-task">
                        <div class="task-name">${this.escapeHtml(task.task_name || task.title)}</div>
                        <div class="task-sub">${this.escapeHtml(task.status || '')} • ${this.escapeHtml(task.start_date || '')} → ${this.escapeHtml(task.end_date || '')}</div>
                    </div>
                    <div class="timeline-track">
                        <div class="timeline-bar ${statusClass} ${task.is_critical_path ? 'critical' : ''}" style="left: ${leftCss}; width: ${widthCss};" title="${this.escapeHtml(task.task_name || task.title)}"></div>
                    </div>
                </div>
            `;
        }).join('');

        timelineView.innerHTML = `
            <div class="timeline-header">
                <h3>${this.escapeHtml(headerTitle)}</h3>
                <div class="timeline-actions">
                    <button type="button" class="btn-secondary" onclick="app.setTimelineScale('day')" ${scale === 'day' ? 'disabled' : ''}>Day</button>
                    <button type="button" class="btn-secondary" onclick="app.setTimelineScale('week')" ${scale === 'week' ? 'disabled' : ''}>Week</button>
                </div>
            </div>
            <div class="timeline-scroll">
                <div class="timeline-grid" style="--units:${units}; --unit-width:${unitWidth}px;">
                    ${rowsHtml}
                </div>
            </div>
        `;
    }

    // GitHub Issues Sync
    /** Open issues sync modal. */
    openIssuesSyncModal() {
        if (this.isPasswordProtected()) {
            this.requireAuth(this._openIssuesSyncModal);
        } else {
            this._openIssuesSyncModal();
        }
    }

    /** Open issues sync modal. */
    _openIssuesSyncModal() {
        const modal = document.getElementById('issuesModal');
        if (!modal) return;
        modal.style.display = 'block';
        this.loadIssuesForSync();
    }

    /** Close issues sync modal. */
    closeIssuesSyncModal() {
        const modal = document.getElementById('issuesModal');
        if (modal) modal.style.display = 'none';
    }

    /** Set issues sync status. */
    setIssuesSyncStatus(message, type = 'info') {
        const el = document.getElementById('issuesSyncStatus');
        if (!el) return;
        if (!message) {
            el.style.display = 'none';
            el.textContent = '';
            return;
        }
        el.style.display = 'block';
        el.className = `validation-messages ${type}`;
        el.textContent = message;
    }

    /** Load issues for sync. */
    async loadIssuesForSync() {
        if (!this.githubApi) {
            this.setIssuesSyncStatus('GitHub API not initialized yet.', 'error');
            return;
        }
        this.setIssuesSyncStatus('Loading issues...', 'info');

        try {
            const issues = await this.githubApi.listIssues('open');
            // Filter out PRs
            this.issuesForSync = (issues || []).filter(i => !i.pull_request);
            this.renderIssuesList();
            this.setIssuesSyncStatus(`Loaded ${this.issuesForSync.length} open issues.`, 'success');
        } catch (e) {
            console.error('Issues sync load failed', e);
            this.issuesForSync = [];
            this.renderIssuesList();
            this.setIssuesSyncStatus(`Failed to load issues: ${e.message}`, 'error');
        }
    }

    /** Render issues list. */
    renderIssuesList() {
        const list = document.getElementById('issuesList');
        if (!list) return;
        const issues = this.issuesForSync || [];

        if (issues.length === 0) {
            list.innerHTML = `<div class="empty-state" style="display:block; padding: 14px;"><p>No issues found.</p></div>`;
            return;
        }

        list.innerHTML = issues.map(issue => {
            const alreadyImported = this.isIssueAlreadyImported(issue.number);
            const checkbox = alreadyImported
                ? `<input type="checkbox" disabled title="Already imported" />`
                : `<input type="checkbox" class="issue-select" data-issue-number="${issue.number}" />`;

            return `
                <div class="issues-item">
                    <div>${checkbox}</div>
                    <div class="issue-title">
                        <a href="${issue.html_url}" target="_blank" rel="noopener">#${issue.number} ${this.escapeHtml(issue.title || '')}</a>
                        <div class="issue-meta">${alreadyImported ? 'Already imported' : 'Not imported'} • ${this.escapeHtml((issue.state || '').toUpperCase())}</div>
                    </div>
                    <div class="issue-meta">${issue.comments ? `${issue.comments} comments` : ''}</div>
                </div>
            `;
        }).join('');
    }

    /** Check whether issue already imported. */
    isIssueAlreadyImported(issueNumber) {
        const tag = `issue-#${issueNumber}`;
        return (this.database && Array.isArray(this.database.tasks))
            ? this.database.tasks.some(t => Array.isArray(t.tags) && t.tags.includes(tag))
            : false;
    }

    /** Import selected issues. */
    async importSelectedIssues() {
        if (this.isPasswordProtected()) {
            this.requireAuth(this._importSelectedIssues);
        } else {
            this._importSelectedIssues();
        }
    }

    /** Import selected issues. */
    _importSelectedIssues() {
        // async wrapper below
        this._importSelectedIssuesAsync();
    }

    /** Import selected issues async. */
    async _importSelectedIssuesAsync() {
        const list = document.getElementById('issuesList');
        if (!list) return;

        const selected = Array.from(list.querySelectorAll('input.issue-select:checked'))
            .map(cb => Number(cb.getAttribute('data-issue-number')))
            .filter(n => Number.isFinite(n));

        if (selected.length === 0) {
            this.setIssuesSyncStatus('Select at least one issue to import.', 'warning');
            return;
        }

        const issuesByNumber = new Map((this.issuesForSync || []).map(i => [i.number, i]));
        let imported = 0;
        const today = new Date();
        const startDate = today.toISOString().slice(0, 10);
        const dur = (this.automation && this.automation.config && this.automation.config.DEFAULTS && this.automation.config.DEFAULTS.TASK && this.automation.config.DEFAULTS.TASK.default_duration_days) || 7;
        const endDate = new Date(today.getTime() + dur * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        for (const num of selected) {
            const issue = issuesByNumber.get(num);
            if (!issue) continue;
            if (this.isIssueAlreadyImported(num)) continue;

            const taskData = {
                task_name: issue.title || `Issue #${num}`,
                description: (issue.body && issue.body.trim().length > 0)
                    ? issue.body
                    : `Imported from GitHub Issue #${num}: ${issue.html_url}`,
                start_date: startDate,
                end_date: endDate,
                priority: 'Medium',
                status: 'Not Started',
                estimated_hours: 2,
                category_name: 'Feature',
                tags: ['github', 'issues', `issue-#${num}`],
                comments: [{
                    author: this.currentUser || 'public@example.com',
                    timestamp: new Date().toISOString(),
                    text: `Imported from GitHub Issue #${num}: ${issue.html_url}`
                }]
            };

            const result = this.database.createTask(taskData, this.currentUser);
            if (result && result.success) {
                imported++;
            }
        }

        if (imported === 0) {
            this.setIssuesSyncStatus('No new issues were imported (already imported or none selected).', 'warning');
            this.renderIssuesList();
            return;
        }

        try {
            await this.saveTasks();
            this.syncProjectContextFromDatabase();
            await this.restoreCurrentContext({ syncGraph: false });
            await this.loadIssuesForSync();
            this.setIssuesSyncStatus(`Imported ${imported} issue(s) as tasks.`, 'success');
        } catch (e) {
            console.error('Issue import save failed', e);
            this.setIssuesSyncStatus(`Imported ${imported} issue(s), but failed to save: ${e.message}`, 'error');
        }
    }

    /** Get linked issue. */
    getLinkedIssue(task) {
        const tags = Array.isArray(task && task.tags) ? task.tags : [];
        const match = tags.find(t => typeof t === 'string' && /^issue-#\d+$/.test(t));
        if (!match) return null;
        const number = Number(match.replace('issue-#', ''));
        if (!Number.isFinite(number)) return null;
        return {
            number,
            url: `https://github.com/${this.config.owner}/${this.config.repo}/issues/${number}`
        };
    }

    /** Create issue for task. */
    createIssueForTask(taskId) {
        if (this.isPasswordProtected()) {
            this.requireAuth(this._createIssueForTask, taskId);
        } else {
            this._createIssueForTask(taskId);
        }
    }

    /** Create issue for task. */
    async _createIssueForTask(taskId) {
        if (!this.githubApi) {
            this.showToast('GitHub API not initialized', 'error');
            return;
        }

        const task = this.database.getTask(taskId);
        if (!task) {
            this.showToast('Task not found', 'error');
            return;
        }

        if (this.getLinkedIssue(task)) {
            window.open(this.getLinkedIssue(task).url, '_blank', 'noopener');
            return;
        }

        try {
            this.showLoading();
            const body = `${task.description || ''}\n\n---\nImported from GitHub Task Manager (task_id: ${task.task_id}).`;
            const issue = await this.githubApi.createIssue(task.task_name, body, task.tags || []);

            const nextTags = Array.isArray(task.tags) ? [...task.tags] : [];
            const linkTag = `issue-#${issue.number}`;
            if (!nextTags.includes(linkTag)) nextTags.push(linkTag);
            if (!nextTags.includes('github')) nextTags.push('github');
            if (!nextTags.includes('issues')) nextTags.push('issues');

            const nextComments = Array.isArray(task.comments) ? [...task.comments] : [];
            nextComments.push({
                author: this.currentUser || 'public@example.com',
                timestamp: new Date().toISOString(),
                text: `Created GitHub Issue #${issue.number}: ${issue.html_url}`
            });

            const updated = this.database.updateTask(task.task_id, {
                tags: nextTags,
                comments: nextComments
            });

            if (!updated || !updated.success) {
                throw new Error(updated && updated.errors ? updated.errors.join(', ') : 'Failed to update task with issue link');
            }

            await this.saveTasks();
            this.syncProjectContextFromDatabase();
            await this.restoreCurrentContext({ syncGraph: false });
            this.showToast(`Created Issue #${issue.number}`, 'success');
        } catch (e) {
            console.error('Create issue failed', e);
            this.showToast(`Create issue failed: ${e.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    /** Update stats. */
    updateStats(taskSource = null) {
        const tasks = Array.isArray(taskSource) ? taskSource : this.getContextBaseTasks();
        const stats = (this.automation && typeof this.automation.generateProjectSummary === 'function')
            ? this.automation.generateProjectSummary({ tasks })
            : {
                total_tasks: tasks.length,
                tasks_by_status: {}
            };
        document.getElementById('totalTasks').textContent = stats.total_tasks || 0;
        document.getElementById('todoTasks').textContent = (stats.tasks_by_status && stats.tasks_by_status['Not Started']) || 0;
        document.getElementById('inProgressTasks').textContent = (stats.tasks_by_status && stats.tasks_by_status['In Progress']) || 0;
        document.getElementById('doneTasks').textContent = ((stats.tasks_by_status && stats.tasks_by_status['Done']) || 0) + ((stats.tasks_by_status && stats.tasks_by_status['Completed']) || 0);
    }

    /** Set active stat card. */
    setActiveStatCard(statusValue) {
        const cards = Array.from(document.querySelectorAll('.stat-card[data-status]'));
        cards.forEach(card => card.classList.remove('active'));
        const match = cards.find(card => (card.dataset.status || '') === (statusValue || 'all'));
        if (match) match.classList.add('active');
    }

    /** Set up stat card filters. */
    setupStatCardFilters() {
        const cards = Array.from(document.querySelectorAll('.stat-card[data-status]'));
        if (cards.length === 0) return;

        const activate = (status) => {
            const filterStatus = document.getElementById('filterStatus');
            if (!filterStatus) return;

            const nextStatus = status || 'all';
            const isSame = filterStatus.value === nextStatus;
            filterStatus.value = isSame ? 'all' : nextStatus;
            this.filterTasks();
        };

        cards.forEach(card => {
            card.addEventListener('click', () => activate(card.dataset.status));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activate(card.dataset.status);
                }
            });
        });

        const current = document.getElementById('filterStatus')?.value || 'all';
        this.setActiveStatCard(current);
    }

    /** Filter tasks. */
    filterTasks() {
        const statusFilter = document.getElementById('filterStatus').value;
        const priorityFilter = document.getElementById('filterPriority').value;
        const baseTasks = this.getContextBaseTasks();

        this.filteredTasks = this.filterTaskCollection(baseTasks, {
            status: statusFilter === 'all' ? null : statusFilter,
            priority: priorityFilter === 'all' ? null : priorityFilter
        });

        this.renderTasks();
        this.updateStats(baseTasks);
        this.setActiveStatCard(statusFilter);
    }

    // Modal Functions (with password protection)
    /** Show add task modal. */
    showAddTaskModal() {
        // Require password for adding tasks
        if (this.isPasswordProtected()) {
            this.requireAuth(this._showAddTaskModal);
        } else {
            this._showAddTaskModal();
        }
    }

    /** Show add task modal. */
    _showAddTaskModal() {
        const modal = document.getElementById('taskModal');
        if (!modal) {
            console.error('Modal element not found!');
            return;
        }
        this.setTaskModalReadOnly(false);
        document.getElementById('modalTitle').textContent = 'Add New Task';
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        this.refreshCategoryOptions({ preserveValue: false });
        this.populateFormWithDefaults();
        modal.style.display = 'block';
        // Force visibility check
        setTimeout(() => {
            if (modal.offsetParent === null) {
                modal.style.display = 'block';
            }
        }, 100);
    }

    /** Edit task. */
    editTask(taskId) {
        // Require password for editing tasks
        if (this.isPasswordProtected()) {
            this.requireAuth(this._editTask, taskId);
        } else {
            this._editTask(taskId);
        }
    }

    /** Open task detail by filteredTasks index (works for all task types, numeric and string IDs). */
    /** Open the detail view for a task by its rendered index. */
    openTaskDetail(taskIndex) {
        const task = this.filteredTasks[taskIndex];
        if (!task) return;
        if (this.supportsTaskEditing(task)) {
            this.editTask(String(task.task_id ?? task.id).trim());
        } else {
            this._openReadOnlyTask(task);
        }
    }

    /** Open read only task. */
    _openReadOnlyTask(task) {
        const modal = document.getElementById('taskModal');
        if (!modal) return;
        this.setTaskModalReadOnly(false);
        document.getElementById('modalTitle').textContent = 'Task Details';
        this.refreshCategoryOptions({ preserveValue: false });
        this.populateFormWithTask(task);
        this.setTaskModalReadOnly(true);
        this._injectReadOnlyDepLinks(task);
        modal.style.display = 'block';
    }

    /**
     * In read-only task detail: hide the deps textarea and show clickable dep-link buttons.
     * Each button navigates to the predecessor task in the list.
     */
    _injectReadOnlyDepLinks(task) {
        const depsTextarea = document.getElementById('taskDependencies');
        const depsContainer = depsTextarea?.closest('.form-group');
        if (!depsContainer) return;

        // Remove any prior dep-link override before re-injecting
        depsContainer.querySelector('.readonly-dep-links')?.remove();
        depsTextarea.style.display = '';

        const deps = Array.isArray(task?.dependencies) ? task.dependencies.filter(d => d && d.predecessor_task_id != null) : [];
        if (!deps.length) return;

        // Build a fast lookup map across all loaded tasks
        const allTasks = [...(this.rootTasks || []), ...(this.currentContextTasks || [])];
        const taskMap = new Map(allTasks.map(t => [String(t.task_id ?? t.id ?? ''), t]));

        const buttons = deps.map(d => {
            const predId = String(d.predecessor_task_id);
            const predTask = taskMap.get(predId);
            const name = predTask ? (predTask.task_name || predTask.title || `Task ${predId}`) : `Task ${predId}`;
            const typeLabel = d.type || 'FS';
            return `<button type="button" class="dep-link-btn" data-pred-id="${predId}" title="Navigate to: ${name}">${name} <span class="dep-type-badge">${typeLabel}</span></button>`;
        }).join('');

        const wrapper = document.createElement('div');
        wrapper.className = 'readonly-dep-links';
        wrapper.innerHTML = `<label>Depends on</label><div class="dep-links-list">${buttons}</div>`;

        // Hide the raw textarea; show the pretty list instead
        depsTextarea.style.display = 'none';
        depsContainer.appendChild(wrapper);

        wrapper.querySelectorAll('.dep-link-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const predId = btn.getAttribute('data-pred-id');
                if (predId) this.navigateToDependency(predId);
            });
        });
    }

    /**
     * Close the current modal and open the task detail for the specified predecessor task ID.
     * Works across root tasks and the current module context.
     */
    navigateToDependency(predecessorId) {
        const target = String(predecessorId ?? '');
        const idx = this.filteredTasks.findIndex(t => String(t.task_id ?? t.id ?? '') === target);
        if (idx < 0) return;
        document.getElementById('taskModal').style.display = 'none';
        setTimeout(() => this.openTaskDetail(idx), 120);
    }

    /** Edit task. */
    _editTask(taskId) {
        const task = this.database.getTask(taskId);
        if (!task) {
            console.error('Task not found:', taskId);
            return;
        }

        const modal = document.getElementById('taskModal');
        if (!modal) {
            console.error('Modal element not found!');
            return;
        }

        this.setTaskModalReadOnly(false);
        document.getElementById('modalTitle').textContent = 'Edit Task';
        this.refreshCategoryOptions({ preserveValue: false });
        this.populateFormWithTask(task);
        modal.style.display = 'block';
        
        // Force visibility check
        setTimeout(() => {
            if (modal.offsetParent === null) {
                modal.style.display = 'block';
            }
        }, 100);
    }

    /** Set task modal read only. */
    setTaskModalReadOnly(readOnly = false) {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        if (!modal || !form) return;

        // When leaving read-only: clean up any dep-link overlay and restore the textarea
        if (!readOnly) {
            form.querySelector('.readonly-dep-links')?.remove();
            const depsTextarea = document.getElementById('taskDependencies');
            if (depsTextarea) depsTextarea.style.display = '';
        }

        form.querySelectorAll('input, select, textarea').forEach((field) => {
            if (field.id === 'taskId') return;
            if (readOnly) field.setAttribute('disabled', 'disabled');
            else field.removeAttribute('disabled');
        });

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.hidden = readOnly;
            submitButton.disabled = readOnly;
        }

        const cancelButton = form.querySelector('.form-actions .btn-secondary');
        if (cancelButton) {
            cancelButton.textContent = readOnly ? 'Close' : 'Cancel';
        }

        modal.classList.toggle('modal-readonly', readOnly);
    }

    /** Populate form with defaults. */
    populateFormWithDefaults() {
        // Set default values based on template
        document.getElementById('taskStatus').value = this.automation.config.DEFAULTS.TASK.status;
        document.getElementById('taskPriority').value = this.automation.config.DEFAULTS.TASK.priority;
        document.getElementById('taskProgress').value = this.automation.config.DEFAULTS.TASK.progress_percentage;
        document.getElementById('taskEstimatedHours').value = 8; // Default 1 day

        // Default dates: start = today, end = 7 days later
        try {
            const today = new Date();
            const startDate = today.toISOString().slice(0, 10);
            const dur = (this.automation && this.automation.config && this.automation.config.DEFAULTS && this.automation.config.DEFAULTS.TASK && this.automation.config.DEFAULTS.TASK.default_duration_days) || 7;
            const endDate = new Date(today.getTime() + dur * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
            document.getElementById('taskStartDate').value = startDate;
            document.getElementById('taskEndDate').value = endDate;
        } catch (e) {
            document.getElementById('taskStartDate').value = '';
            document.getElementById('taskEndDate').value = '';
        }

        // Clear automatic fields for new tasks
        document.getElementById('displayTaskId').textContent = '--';
        document.getElementById('displayCreatedDate').textContent = '--';
        document.getElementById('displayCreatorId').textContent = '--';
        document.getElementById('displayCompletedDate').textContent = '--';
    }

    /** Populate form with task. */
    populateFormWithTask(task) {
        document.getElementById('taskId').value = task.task_id || task.id;
        document.getElementById('taskName').value = task.task_name || task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskStatus').value = task.status === 'Completed' ? 'Done' : task.status;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskStartDate').value = task.start_date || '';
        document.getElementById('taskEndDate').value = task.end_date || task.dueDate || '';
        document.getElementById('taskProgress').value = task.progress_percentage || task.progress || 0;
        document.getElementById('taskEstimatedHours').value = task.estimated_hours || '';
        document.getElementById('taskActualHours').value = task.actual_hours || '';
        document.getElementById('taskCategory').value = task.category_name || '';
        document.getElementById('taskTags').value = task.tags ? task.tags.join(', ') : '';
        document.getElementById('taskCriticalPath').checked = task.is_critical_path || false;
        document.getElementById('parentTaskId').value = task.parent_task_id || '';

        // Handle assigned workers
        if (task.assigned_workers && task.assigned_workers.length > 0) {
            document.getElementById('taskAssignedWorkers').value = task.assigned_workers
                .map(w => w.worker_id || w.email || w.name).filter(Boolean).join(', ');
        } else {
            document.getElementById('taskAssignedWorkers').value = '';
        }

        // Handle dependencies
        if (task.dependencies && task.dependencies.length > 0) {
            const depsStr = task.dependencies
                .map(d => `${d.predecessor_task_id}: ${d.type}`).join('\n');
            document.getElementById('taskDependencies').value = depsStr;
        } else {
            document.getElementById('taskDependencies').value = '';
        }

        // Populate automatic fields
        document.getElementById('displayTaskId').textContent = task.task_id || task.id || '--';
        document.getElementById('displayCreatedDate').textContent = task.created_date ? new Date(task.created_date).toLocaleString() : '--';
        document.getElementById('displayCreatorId').textContent = task.creator_id || '--';
        document.getElementById('displayCompletedDate').textContent = task.completed_date ? new Date(task.completed_date).toLocaleString() : '--';
    }

    /** Close modal. */
    closeModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.setTaskModalReadOnly(false);
        this.clearValidationMessages();
        const form = document.getElementById('taskForm');
        if (form) {
            form.reset();
        }
    }

    /** Save task. */
    async saveTask(event) {
        event.preventDefault();

        const formData = this.getFormData();
        const isNewTask = !formData.task_id;

        // For new tasks, skip pre-validation since automation will populate required fields
        // Validation happens after createTask with the fully populated task
        if (!isNewTask) {
            // For existing tasks, validate before updating
            const validation = this.validator.validate(formData, 'task');
            if (!validation.isValid) {
                this.showValidationMessages(validation.errors, validation.warnings);
                return;
            }
        }

        this.clearValidationMessages();

        const result = isNewTask
            ? this.database.createTask(formData, this.currentUser)
            : this.database.updateTask(formData.task_id, { ...formData, task_id: undefined });

        if (!result.success) {
            this.showValidationMessages(result.errors || [result.error], []);
            return;
        }

        try {
            await this.saveTasks();
            this.syncProjectContextFromDatabase();
            await this.restoreCurrentContext({ syncGraph: false });
            this.closeModal();
        } catch (error) {
            // Error already shown in saveTasks
        }
    }

    /** Collect the current task form values into a task payload. */
    getFormData() {
        // Save user name if provided
        const userNameInput = document.getElementById('userName');
        if (userNameInput && userNameInput.value.trim()) {
            this.saveUserName(userNameInput.value.trim());
        }

        // Parse dependencies
        const depsText = document.getElementById('taskDependencies').value.trim();
        const dependencies = this.parseDependencies(depsText);

        const rawTaskId = (document.getElementById('taskId').value || '').trim();
        const parsedTaskId = rawTaskId ? parseInt(rawTaskId, 10) : null;

        return {
            task_id: Number.isFinite(parsedTaskId) ? parsedTaskId : null,
            task_name: document.getElementById('taskName').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            status: document.getElementById('taskStatus').value,
            priority: document.getElementById('taskPriority').value,
            start_date: document.getElementById('taskStartDate').value,
            end_date: document.getElementById('taskEndDate').value,
            progress_percentage: parseInt(document.getElementById('taskProgress').value) || 0,
            estimated_hours: parseFloat(document.getElementById('taskEstimatedHours').value) || 0,
            actual_hours: parseFloat(document.getElementById('taskActualHours').value) || 0,
            category_name: document.getElementById('taskCategory').value.trim(),
            tags: document.getElementById('taskTags').value.split(',').map(t => t.trim()).filter(t => t),
            is_critical_path: document.getElementById('taskCriticalPath')?.checked || false,
            assigned_workers: this.parseAssignedWorkers(document.getElementById('taskAssignedWorkers').value),
            parent_task_id: this.parseParentTaskId(document.getElementById('parentTaskId').value),
            dependencies: dependencies
        };
    }

    /** Parse assigned worker input into structured worker records. */
    parseAssignedWorkers(input) {
        if (!input.trim()) return [];
        return input.split(',').map(w => {
            const trimmed = w.trim();
            // Allow plain worker_id values (preferred), emails (legacy), or display names.
            const isEmail = trimmed.includes('@');
            const isWorkerId = /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,}$/.test(trimmed);
            return {
                name: isEmail || isWorkerId ? '' : trimmed,
                email: isEmail ? trimmed : '',
                worker_id: isWorkerId ? trimmed : '',
                role: 'Collaborator'
            };
        }).filter(w => w.worker_id || w.email || w.name);
    }

    /** Parse dependency input into structured dependency records. */
    parseDependencies(input) {
        if (!input.trim()) return [];
        const dependencies = [];
        const lines = input.split('\n');
        
        lines.forEach(line => {
            const match = line.match(/(\d+)\s*:\s*([A-Z]{2})/);
            if (match) {
                dependencies.push({
                    predecessor_task_id: parseInt(match[1]),
                    type: match[2],
                    lag_days: 0
                });
            }
        });

        return dependencies;
    }

    /** Parse the parent task id from form input. */
    parseParentTaskId(value) {
        const parsed = parseInt(value);
        return parsed > 0 ? parsed : null;
    }

    /** Delete task. */
    async deleteTask(taskId) {
        // Require password for deleting tasks
        if (this.isPasswordProtected()) {
            this.requireAuth(this._deleteTask, taskId);
        } else {
            this._deleteTask(taskId);
        }
    }

    /** Delete task. */
    async _deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        const result = this.database.deleteTask(taskId);
        if (!result.success) {
            this.showToast('Error deleting task: ' + result.error, 'error');
            return;
        }

        try {
            await this.saveTasks();
            this.syncProjectContextFromDatabase();
            await this.restoreCurrentContext({ syncGraph: false });
        } catch (error) {
            // Reload to restore state
            await this.loadTasks();
        }
    }

    // Template Management
    /** Update template ui. */
    updateTemplateUI() {
        const templateSection = document.getElementById('templateSection');
        if (!templateSection) return;

        const templates = this.database.templates;
        let html = '<h4>Available Templates:</h4>';

        if (templates.length === 0) {
            html += '<p>No templates available</p>';
        } else {
            templates.forEach(template => {
                html += `
                    <div class="template-item">
                        <strong>${template.template_type || 'Unknown'}</strong>
                        <p>${template.description || 'No description'}</p>
                        <button onclick="app.importTemplate('${template.template_type}')" class="btn-primary">Import</button>
                    </div>
                `;
            });
        }

        templateSection.innerHTML = html;
    }

    /** Import template. */
    async importTemplate(templateType) {
        const template = this.database.templates.find(t => t.template_type === templateType);
        if (!template) {
            this.showToast('Template not found', 'error');
            return;
        }

        this.showLoading();
        try {
            const result = await this.database.importFromTemplate(template, {
                creatorId: this.currentUser,
                replaceExisting: false
            });

            if (result.success) {
                this.syncProjectContextFromDatabase();
                await this.restoreCurrentContext({ syncGraph: false });
                this.showToast(`Imported ${result.importedCount} tasks from template`, 'success');
            } else {
                this.showToast('Error importing template: ' + result.error, 'error');
            }
        } catch (error) {
            this.showToast('Error importing template: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Export Functions
    /** Export to csv. */
    exportToCSV() {
        try {
            if (!this.database) {
                this.showToast('Database not initialized', 'error');
                return;
            }
            
            const csv = this.database.exportToCSV();
            if (!csv) {
                this.showToast('No tasks to export', 'warning');
                return;
            }
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `tasks-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Revoke URL to free memory
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            this.showToast('Tasks exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed: ' + error.message, 'error');
        }
    }

    /** Get download format. */
    getDownloadFormat() {
        const formatSelect = document.getElementById('downloadFormat');
        const selected = String(formatSelect?.value || 'ics').trim().toLowerCase();
        return ['ics', 'csv', 'json'].includes(selected) ? selected : 'ics';
    }

    /** Get download tasks by scope. */
    getDownloadTasksByScope(scope, workerName = '') {
        const tasks = Array.isArray(this.database?.tasks) ? [...this.database.tasks] : [];
        const normalizedScope = String(scope || 'all').trim().toLowerCase();

        const isPending = (task) => {
            const status = String(task?.status || '').trim().toLowerCase().replace(/_/g, ' ');
            return !['done', 'completed', 'cancelled', 'canceled'].includes(status);
        };

        const isCritical = (task) => task && (task.is_critical_path === true || task.is_critical_path === 'true' || task.is_critical_path === 1);

        const matchesWorker = (task) => {
            if (!workerName) return false;
            const normalizedWorker = String(workerName).trim().toLowerCase();
            const assigned = Array.isArray(task?.assigned_workers) ? task.assigned_workers : [];
            const matched = assigned.some((worker) => {
                const candidate = String(worker?.name || worker?.role || worker?.worker_id || worker?.workerId || worker?.id || worker?.email || '').trim().toLowerCase();
                return candidate === normalizedWorker;
            });
            return matched || String(task?.creator_id || '').trim().toLowerCase() === normalizedWorker;
        };

        if (normalizedScope === 'pending') {
            return tasks.filter(isPending);
        }
        if (normalizedScope === 'critical') {
            return tasks.filter(isCritical);
        }
        if (normalizedScope === 'mine') {
            return tasks.filter(matchesWorker);
        }
        return tasks;
    }

    /** Download blob. */
    downloadBlob(content, mimeType, filename) {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /** Download tasks file. */
    downloadTasksFile(tasks, format, fileBase) {
        if (!Array.isArray(tasks) || tasks.length === 0) {
            this.showToast('No tasks to export for the selected scope', 'warning');
            return;
        }

        const fileDate = new Date().toISOString().split('T')[0];
        if (format === 'json') {
            const json = JSON.stringify(tasks, null, 2);
            this.downloadBlob(json, 'application/json;charset=utf-8;', `${fileBase}-${fileDate}.json`);
            this.showToast('JSON export completed', 'success');
            return;
        }

        if (format === 'csv') {
            const csv = this.database.exportToCSV(tasks);
            if (!csv) {
                this.showToast('No tasks to export', 'warning');
                return;
            }
            this.downloadBlob(csv, 'text/csv;charset=utf-8;', `${fileBase}-${fileDate}.csv`);
            this.showToast('CSV export completed', 'success');
            return;
        }

        this.showToast('Unsupported download format', 'error');
    }

    /**
     * Download the current project's tasks in the selected format.
     * @param {string} scope - 'all' | 'pending' | 'critical' | 'mine'
     */
    downloadCalendar(scope) {
        if (typeof calendarExport === 'undefined') {
            this.showToast('Calendar export module not loaded', 'error');
            return;
        }

        const format = this.getDownloadFormat();
        const tasks = this.database?.tasks || [];
        if (!tasks.length) {
            this.showToast('No tasks to export', 'warning');
            return;
        }

        const projectName = String(this.database?.project?.name || this.activeProjectId || 'tasks').replace(/[^a-zA-Z0-9-_ ]+/g, '').trim() || 'tasks';
        const fileBase = `${projectName}-${scope || 'all'}`;

        if (scope === 'mine') {
            const nameInput = document.getElementById('userName');
            const workerName = nameInput?.value?.trim() || '';
            if (!workerName) {
                this.showToast('Enter your name in the "Your Name" field to download your tasks', 'warning');
                return;
            }

            const filteredTasks = this.getDownloadTasksByScope('mine', workerName);
            if (!filteredTasks.length) {
                this.showToast('No tasks assigned to your name', 'warning');
                return;
            }

            if (format === 'ics') {
                calendarExport.downloadCalendar(tasks, { scope: 'worker', projectName, workerName });
                return;
            }

            this.downloadTasksFile(filteredTasks, format, `${projectName}-mine`);
            return;
        }

        const filteredTasks = this.getDownloadTasksByScope(scope || 'all');
        if (!filteredTasks.length) {
            this.showToast('No tasks available for the selected export scope', 'warning');
            return;
        }

        if (format === 'ics') {
            calendarExport.downloadCalendar(filteredTasks, { scope: scope || 'all', projectName });
            return;
        }

        if (format === 'json') {
            calendarExport.downloadCalendarJson(filteredTasks, { scope: scope || 'all', projectName });
            return;
        }

        this.downloadTasksFile(filteredTasks, format, fileBase);
    }

    /**
     * Download one file per worker found in the current project's tasks.
     */
    downloadCalendarWorkers() {
        if (typeof calendarExport === 'undefined') {
            this.showToast('Calendar export module not loaded', 'error');
            return;
        }

        const format = this.getDownloadFormat();
        const tasks = this.database?.tasks || [];
        if (!tasks.length) {
            this.showToast('No tasks to export', 'warning');
            return;
        }

        const projectName = String(this.database?.project?.name || this.activeProjectId || 'tasks').replace(/[^a-zA-Z0-9-_ ]+/g, '').trim() || 'tasks';
        const workers = calendarExport.getWorkersFromTasks(tasks);
        if (!workers.length) {
            this.showToast('No workers assigned in current tasks', 'warning');
            return;
        }

        if (format === 'ics') {
            workers.forEach(w => calendarExport.downloadCalendar(tasks, { scope: 'worker', projectName, workerName: w }));
            this.showToast(`Downloaded ${workers.length} worker calendar${workers.length > 1 ? 's' : ''}`, 'success');
            return;
        }

        if (format === 'json') {
            workers.forEach(w => calendarExport.downloadCalendarJson(tasks, { scope: 'worker', projectName, workerName: w }));
            this.showToast(`Downloaded ${workers.length} worker calendar${workers.length > 1 ? 's' : ''}`, 'success');
            return;
        }

        let exportCount = 0;
        workers.forEach((workerName) => {
            const workerTasks = this.getDownloadTasksByScope('mine', workerName);
            if (!workerTasks.length) return;

            const safeWorkerName = String(workerName).replace(/[^a-zA-Z0-9-_ ]+/g, '').trim().replace(/\s+/g, '-');
            this.downloadTasksFile(workerTasks, format, `${projectName}-${safeWorkerName}`);
            exportCount += 1;
        });

        if (exportCount > 0) {
            this.showToast(`Downloaded ${exportCount} worker file${exportCount > 1 ? 's' : ''}`, 'success');
        } else {
            this.showToast('No worker task files were generated', 'warning');
        }
    }

    // Validation UI
    /** Show validation messages. */
    showValidationMessages(errors, warnings) {
        const container = document.getElementById('validationMessages');
        if (!container) return;

        container.innerHTML = '';

        errors.forEach(error => {
            container.innerHTML += `<div class="validation-error">${error}</div>`;
        });

        warnings.forEach(warning => {
            container.innerHTML += `<div class="validation-warning">${warning}</div>`;
        });
    }

    /** Clear validation messages. */
    clearValidationMessages() {
        const container = document.getElementById('validationMessages');
        if (container) container.innerHTML = '';
    }

    // Utility Functions
    /** Escape HTML text for safe rendering. */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /** Show loading. */
    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    /** Hide loading. */
    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    /** Show toast. */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Event Listeners
    /** Set up the main UI event listeners. */
    setupEventListeners() {
        // Form submissions
        document.getElementById('taskForm').addEventListener('submit', (e) => this.saveTask(e));

        // User name changes
        const userNameInput = document.getElementById('userName');
        if (userNameInput) {
            userNameInput.addEventListener('change', (e) => {
                if (e.target.value.trim()) {
                    this.saveUserName(e.target.value.trim());
                }
            });
        }

        // Filter changes
        document.getElementById('filterStatus').addEventListener('change', () => this.filterTasks());
        document.getElementById('filterPriority').addEventListener('change', () => this.filterTasks());

        // Modal close
        window.onclick = (event) => {
            const modal = document.getElementById('taskModal');
            if (event.target === modal) {
                this.closeModal();
            }

            const issuesModal = document.getElementById('issuesModal');
            if (event.target === issuesModal) {
                this.closeIssuesSyncModal();
            }

            const passwordModal = document.getElementById('passwordModal');
            if (event.target === passwordModal) {
                this.closePasswordModal();
            }
        };
    }
}

/**
 * Minimal GitHub REST wrapper for file and issue operations used by the UI.
 */
class GitHubAPI {
    /** Create the runtime controller state for this component. */
    constructor(config) {
        this.config = config;
    }

    /** Send a GitHub API request with the configured authentication. */
    async request(endpoint, method = 'GET', body = null) {
        const url = `https://api.github.com${endpoint}`;
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        // Only add auth header if we have a real token (not 'public-access')
        if (this.config.token && this.config.token !== 'public-access') {
            headers['Authorization'] = `token ${this.config.token}`;
        }

        const options = { method, headers };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        return await response.json();
    }

    /** Get file content from the configured GitHub repository. */
    async getFileContent(path) {
        try {
            const data = await this.request(`/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`);
            const content = atob(data.content);
            return { content, sha: data.sha };
        } catch (error) {
            if (error.message.includes('Not Found')) {
                return { content: '[]', sha: null };
            }
            throw error;
        }
    }

    /** Update a file in the configured GitHub repository. */
    async updateFile(path, content, message, sha = null) {
        const body = {
            message,
            content: btoa(unescape(encodeURIComponent(content))),
            branch: this.config.branch
        };

        if (sha) {
            body.sha = sha;
        }

        return await this.request(`/repos/${this.config.owner}/${this.config.repo}/contents/${path}`, 'PUT', body);
    }

    /** List GitHub issues for the configured repository. */
    async listIssues(state = 'open') {
        const qs = new URLSearchParams({ state, per_page: '100' }).toString();
        return await this.request(`/repos/${this.config.owner}/${this.config.repo}/issues?${qs}`);
    }

    /** Create a GitHub issue for the configured repository. */
    async createIssue(title, body, labels = []) {
        const payload = {
            title,
            body
        };
        if (Array.isArray(labels) && labels.length > 0) {
            // GitHub labels must already exist to attach cleanly; ignore failures server-side.
            payload.labels = labels.filter(l => typeof l === 'string' && l.trim().length > 0).slice(0, 10);
        }
        return await this.request(`/repos/${this.config.owner}/${this.config.repo}/issues`, 'POST', payload);
    }
}

// Initialize the application
const app = new TaskManagerApp();
document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
});

// Global functions for HTML onclick handlers
/** Show add task modal. */
function showAddTaskModal() { app.showAddTaskModal(); }
/** Close modal. */
function closeModal() { app.closeModal(); }
/** Export to csv. */
function exportToCSV() { app.exportToCSV(); }
/** Load tasks. */
function loadTasks() { app.loadTasks(); }
/** Close password modal. */
function closePasswordModal() { app.closePasswordModal(); }
/** Verify password. */
function verifyPassword(event) { app.verifyPassword(event); return false; }
