// Task Database Component
// Handles task storage, retrieval, and synchronization with GitHub

function resolveTemplateConfig() {
  if (typeof window !== 'undefined' && window.TEMPLATE_CONFIG) return window.TEMPLATE_CONFIG;
  if (typeof globalThis !== 'undefined' && globalThis.TEMPLATE_CONFIG) return globalThis.TEMPLATE_CONFIG;
  // eslint-disable-next-line no-undef
  if (typeof TEMPLATE_CONFIG !== 'undefined') return TEMPLATE_CONFIG;
  return null;
}

function hasValidGitHubToken() {
  const templateConfig = resolveTemplateConfig();
  if (!templateConfig || !templateConfig.GITHUB) return false;
  const token = templateConfig.GITHUB.TOKEN;
  return typeof token === 'string' && token.trim().length > 0;
}

function resolveActiveProjectId() {
  const templateConfig = resolveTemplateConfig();
  const gh = templateConfig && templateConfig.GITHUB ? templateConfig.GITHUB : null;

  const active = (gh && (gh.ACTIVE_PROJECT_ID || gh.DEFAULT_PROJECT_ID)) ? String(gh.ACTIVE_PROJECT_ID || gh.DEFAULT_PROJECT_ID) : '';
  const fromActive = active.trim();
  if (fromActive) return fromActive;

  // Best-effort: infer from TASKS_FILE (public/tasksDB/<projectId>/tasks.json)
  const tasksFile = (gh && gh.TASKS_FILE) ? String(gh.TASKS_FILE) : '';
  const match = tasksFile.match(/tasksDB\/([^\/]+)\/(?:tasks\.(?:json|csv))/i);
  if (match && match[1]) return match[1];

  return 'github-task-manager';
}

function getProjectScopedStorageKey() {
  const projectId = resolveActiveProjectId();
  const safe = String(projectId || '').replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
  return `taskManagerData:${safe}`;
}

class TaskDatabase {
  constructor(githubApi, validator = new TemplateValidator(), automation = new TemplateAutomation()) {
    this.githubApi = githubApi;
    this.validator = validator;
    this.automation = automation;
    this.tasks = [];
    this.templates = [];
    this.currentProject = null;
    this.categories = null;
    this.workers = null;
  }

  isLocalDevHost() {
    try {
      if (typeof window === 'undefined' || !window.location) return false;
      const host = (window.location.hostname || '').toLowerCase();
      return host === 'localhost' || host === '127.0.0.1';
    } catch {
      return false;
    }
  }

  buildFullData(tasks = this.tasks) {
    const templateConfig = resolveTemplateConfig();
    const categoriesFromConfig = templateConfig && Array.isArray(templateConfig.CATEGORIES)
      ? templateConfig.CATEGORIES.map(name => ({ name, parent_category_name: null }))
      : null;

    return {
      project: this.currentProject || {
        name: "GitHub Task Manager - Web Application",
        description: "Build a collaborative task management system integrated with GitHub, enabling public users to manage tasks through a modern web UI with automatic task ID generation and template-based task creation.",
        start_date: "2025-12-08",
        end_date: "2026-02-28",
        status: "In Progress",
        budget: 15000
      },
      categories: this.categories || categoriesFromConfig || [
        { "name": "Project Setup", "parent_category_name": null },
        { "name": "Backend Development", "parent_category_name": null },
        { "name": "Frontend Development", "parent_category_name": null },
        { "name": "Testing", "parent_category_name": null },
        { "name": "Deployment", "parent_category_name": null },
        { "name": "Documentation", "parent_category_name": null },
        { "name": "Retrospective", "parent_category_name": null },
        { "name": "Bug Fix", "parent_category_name": null },
        { "name": "Feature", "parent_category_name": null },
        { "name": "Maintenance", "parent_category_name": null }
      ],
      workers: this.workers || [
        {
          "name": "Public User",
          "email": "public@example.com",
          "role": "Collaborator",
          "skills": ["Task Management", "GitHub"],
          "hourly_rate": 0.0
        },
        {
          "name": "Developer",
          "email": "dev@example.com",
          "role": "Full Stack Developer",
          "skills": ["JavaScript", "React", "Node.js", "GitHub API"],
          "hourly_rate": 75.0
        },
        {
          "name": "QA Tester",
          "email": "qa@example.com",
          "role": "Quality Assurance",
          "skills": ["Testing", "GitHub"],
          "hourly_rate": 50.0
        }
      ],
      tasks: tasks
    };
  }

  generateStateFiles(tasks = this.tasks) {
    const now = new Date().toISOString();
    const byStatus = {};
    (tasks || []).forEach(task => {
      const status = (task && task.status) ? String(task.status) : 'Unknown';
      byStatus[status] = byStatus[status] || [];
      byStatus[status].push(task);
    });

    const summary = {
      generated_at: now,
      total_tasks: (tasks || []).length,
      counts_by_status: Object.fromEntries(Object.entries(byStatus).map(([k, v]) => [k, v.length])),
      tasks_by_status: byStatus
    };

    const makeStatusPayload = (status) => ({
      status,
      generated_at: now,
      tasks: byStatus[status] || []
    });

    return {
      'tasks-by-status.json': JSON.stringify(summary, null, 2),
      'tasks-not-started.json': JSON.stringify(makeStatusPayload('Not Started'), null, 2),
      'tasks-in-progress.json': JSON.stringify(makeStatusPayload('In Progress'), null, 2),
      'tasks-completed.json': JSON.stringify(makeStatusPayload('Completed'), null, 2)
    };
  }

  async saveTasksLocalDisk(message = 'Update tasks') {
    // Block saving if duplicates exist
    const duplicateIds = this.getDuplicateTaskIds(this.tasks);
    if (duplicateIds.length > 0) {
      throw new Error(`Duplicate task_id detected: ${duplicateIds.join(', ')}`);
    }

    // Validate all tasks before saving
    const validationResults = this.tasks.map(task => this.validator.validate(task, 'task'));
    const hasErrors = validationResults.some(result => !result.isValid);
    if (hasErrors) {
      const errors = validationResults.flatMap(result => result.errors);
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    if (typeof fetch !== 'function') {
      throw new Error('Local disk API not available (fetch missing)');
    }

    const fullData = this.buildFullData(this.tasks);
    const projectId = resolveActiveProjectId();
    const safeProject = String(projectId || '').replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
    const res = await fetch(`/api/tasks?project=${encodeURIComponent(safeProject)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullData)
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data && data.error) msg = data.error;
      } catch {
        // ignore
      }
      throw new Error(`Local disk save failed: ${msg}`);
    }

    // Also keep localStorage as a backup
    this.saveTasksLocal(message);
    return { success: true, source: 'local-disk' };
  }

  // Initialize database
  async initialize() {
    try {
      await this.loadTasks();
      await this.loadTemplates();
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  }

  // Load tasks from localStorage, GitHub, or local file
  async loadTasks() {
    try {
      let loadedTasks = null;

      // Try to load from localStorage first (local development)
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const storageKey = getProjectScopedStorageKey();
          const stored = window.localStorage.getItem(storageKey);
          if (stored) {
            const storageData = JSON.parse(stored);
            if (storageData && storageData.json && storageData.json.tasks) {
              this.currentProject = storageData.json.project || this.currentProject;
              this.categories = storageData.json.categories || this.categories;
              this.workers = storageData.json.workers || this.workers;
              loadedTasks = storageData.json.tasks;
              console.log('Loaded', loadedTasks.length, 'tasks from localStorage (project:', resolveActiveProjectId(), ', last saved:', storageData.lastSaved, ')');
            }
          }
        } catch (storageError) {
          console.warn('Could not load from localStorage:', storageError);
        }
      }

      // If no localStorage data, try GitHub API
      if (!loadedTasks) {
        try {
          if (hasValidGitHubToken()) {
            const templateConfig = resolveTemplateConfig();
            const gh = (templateConfig && templateConfig.GITHUB) ? templateConfig.GITHUB : null;
            const tasksFile = (gh && typeof gh.getTasksFile === 'function')
              ? gh.getTasksFile(resolveActiveProjectId())
              : ((gh && gh.TASKS_FILE) ? gh.TASKS_FILE : 'public/tasksDB/github-task-manager/tasks.json');
            console.log('Loading tasks from GitHub API with file path:', tasksFile);
            const { content } = await this.githubApi.getFileContent(tasksFile);
            const data = JSON.parse(content || '{}');
            loadedTasks = data.tasks || (Array.isArray(data) ? data : []);
            console.log('Successfully loaded', loadedTasks.length, 'tasks from GitHub API');
          } else {
            console.log('No valid GitHub token, skipping GitHub API load');
          }
        } catch (apiError) {
          console.warn('GitHub API failed:', apiError.message);
        }
      }

      // If GitHub API failed, try local static file
      if (!loadedTasks) {
        try {
          const templateConfig = resolveTemplateConfig();
          const basePath = (templateConfig && templateConfig.GITHUB && templateConfig.GITHUB.BASE_PATH)
            ? templateConfig.GITHUB.BASE_PATH
            : '';
          const gh = (templateConfig && templateConfig.GITHUB) ? templateConfig.GITHUB : null;
          let tasksFile = (gh && typeof gh.getTasksFile === 'function')
            ? gh.getTasksFile(resolveActiveProjectId())
            : ((gh && gh.TASKS_FILE) ? gh.TASKS_FILE : 'public/tasksDB/github-task-manager/tasks.json');
          
          // For local fetch, strip 'public/' prefix since /public is the root
          tasksFile = tasksFile.replace(/^public\//i, '');
          
          const fetchUrl = basePath ? `${basePath}/${tasksFile}` : `/${tasksFile}`;
          console.log('Attempting local fetch from URL:', fetchUrl);
          const response = await fetch(fetchUrl);
          if (response.ok) {
            const data = await response.json();
            this.currentProject = data.project || this.currentProject;
            this.categories = data.categories || this.categories;
            this.workers = data.workers || this.workers;
            loadedTasks = data.tasks || (Array.isArray(data) ? data : []);
            console.log('Successfully loaded', loadedTasks.length, 'tasks from local file');
          } else {
            console.warn('Local tasks file not found (404), using empty array');
            loadedTasks = [];
          }
        } catch (fetchError) {
          console.error('Failed to load local tasks.json:', fetchError);
          loadedTasks = [];
        }
      }

      this.tasks = loadedTasks || [];

      // Ensure this.tasks is always an array
      if (!Array.isArray(this.tasks)) {
        console.warn('Tasks is not an array, converting to empty array');
        this.tasks = [];
      }

      // Validate loaded tasks
      const invalidTasks = [];
      this.tasks.forEach((task, index) => {
        const validation = this.validator.validate(task, 'task');
        if (!validation.isValid) {
          console.warn(`Task ${index} validation errors:`, validation.errors);
          invalidTasks.push({ index, task, errors: validation.errors });
        }
      });

      return { success: true, tasks: this.tasks, invalidTasks };
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.tasks = [];
      return { success: false, error: error.message };
    }
  }

  getDuplicateTaskIds(tasks = this.tasks) {
    const seen = new Set();
    const duplicates = new Set();
    tasks.forEach(task => {
      const id = task && task.task_id;
      if (typeof id !== 'number') return;
      if (seen.has(id)) duplicates.add(id);
      seen.add(id);
    });
    return Array.from(duplicates).sort((a, b) => a - b);
  }

  escapeCsvValue(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    if (str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str}"`;
    }
    return str;
  }

  // Persisted reporting CSV (kept in repo alongside tasks.json)
  generatePersistedCSV(tasks = this.tasks) {
    const fields = [
      'task_id',
      'task_name',
      'description',
      'start_date',
      'end_date',
      'priority',
      'status',
      'progress_percentage',
      'estimated_hours',
      'actual_hours',
      'is_critical_path',
      'category_name',
      'parent_task_id',
      'creator_id',
      'created_date',
      'completed_date'
    ];

    const header = fields.join(',');
    const rows = (tasks || []).map(task => {
      return fields
        .map(field => this.escapeCsvValue(task ? task[field] : ''))
        .join(',');
    });

    return [header, ...rows].join('\n') + '\n';
  }

  // Save tasks locally (browser localStorage)
  saveTasksLocal(message = 'Update tasks') {
    try {
      // Block saving if duplicates exist
      const duplicateIds = this.getDuplicateTaskIds(this.tasks);
      if (duplicateIds.length > 0) {
        throw new Error(`Duplicate task_id detected: ${duplicateIds.join(', ')}`);
      }

      // Validate all tasks before saving
      const validationResults = this.tasks.map(task => this.validator.validate(task, 'task'));
      const hasErrors = validationResults.some(result => !result.isValid);

      if (hasErrors) {
        const errors = validationResults.flatMap(result => result.errors);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      // Save full data structure to localStorage
      const fullData = this.buildFullData(this.tasks);

      const content = JSON.stringify(fullData, null, 2);
      const csvContent = this.generatePersistedCSV(this.tasks);

      // Store in localStorage with timestamp
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const storageKey = getProjectScopedStorageKey();
          const storageData = {
            version: '1.0',
            lastSaved: new Date().toISOString(),
            message: message,
            json: fullData,
            csv: csvContent
          };
          window.localStorage.setItem(storageKey, JSON.stringify(storageData));
          console.log('Tasks saved to local storage');
        } catch (storageError) {
          console.warn('Could not save to localStorage:', storageError);
        }
      }

      return { success: true, source: 'local' };
    } catch (error) {
      console.error('Error saving tasks locally:', error);
      return { success: false, error: error.message };
    }
  }

  // Save tasks to GitHub
  async saveTasks(message = 'Update tasks') {
    try {
      // Block saving if duplicates exist (prevents corrupting tasks.csv and tasks.json)
      // Do this BEFORE choosing GitHub vs local persistence so behavior is consistent.
      const duplicateIds = this.getDuplicateTaskIds(this.tasks);
      if (duplicateIds.length > 0) {
        return { success: false, error: `Duplicate task_id detected: ${duplicateIds.join(', ')}` };
      }

      // Validate all tasks before saving
      const validationResults = this.tasks.map(task => this.validator.validate(task, 'task'));
      const hasErrors = validationResults.some(result => !result.isValid);
      if (hasErrors) {
        const errors = validationResults.flatMap(result => result.errors);
        return { success: false, error: `Validation failed: ${errors.join(', ')}` };
      }

      const templateConfig = resolveTemplateConfig();
      const gh = (templateConfig && templateConfig.GITHUB) ? templateConfig.GITHUB : null;

      // Check if we have a Worker URL configured (secure proxy mode)
      const workerUrl = (gh && gh.WORKER_URL) ? String(gh.WORKER_URL).trim() : '';
      if (workerUrl) {
        return await this.saveTasksViaWorker(message, workerUrl);
      }

      // Check if we have a valid GitHub token (direct mode - less secure)
      if (!hasValidGitHubToken()) {
        // If running locally with the dev server, persist to disk so clearing cache doesn't lose data.
        if (this.isLocalDevHost()) {
          try {
            return await this.saveTasksLocalDisk(message);
          } catch (diskError) {
            console.warn('Local disk save not available, falling back to local storage:', diskError.message);
          }
        }

        console.warn('No valid GitHub token available, falling back to local storage');
        return this.saveTasksLocal(message);
      }

      // Direct GitHub API mode (token in browser - NOT recommended for production)
      return await this.saveTasksDirectGitHub(message);

    } catch (error) {
      console.error('Error saving tasks to GitHub:', error);
      // Fallback to local storage on GitHub API failure
      console.log('Attempting to save to local storage as fallback...');
      try {
        return this.saveTasksLocal(message);
      } catch (fallbackError) {
        console.error('Fallback to local storage also failed:', fallbackError);
        return { success: false, error: error.message };
      }
    }
  }

  // Save via Cloudflare Worker (secure - token stays server-side)
  async saveTasksViaWorker(message, workerUrl) {
    const templateConfig = resolveTemplateConfig();
    const projectId = resolveActiveProjectId();
    const gh = (templateConfig && templateConfig.GITHUB) ? templateConfig.GITHUB : null;
    const tasksFile = (gh && typeof gh.getTasksFile === 'function')
      ? gh.getTasksFile(projectId)
      : ((gh && gh.TASKS_FILE) ? gh.TASKS_FILE : 'public/tasksDB/github-task-manager/tasks.json');

    // Get access password from session (user already entered it to unlock)
    const accessPassword = this.getSessionAccessPassword();
    if (!accessPassword) {
      return { success: false, error: 'Access password required. Please unlock first.' };
    }

    const fullData = this.buildFullData(this.tasks);
    const content = JSON.stringify(fullData, null, 2);

    // Save tasks.json
    const jsonResponse = await fetch(`${workerUrl}/api/tasks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        accessPassword,
        filePath: tasksFile,
        content,
        message
      })
    });

    if (!jsonResponse.ok) {
      const err = await jsonResponse.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `Worker error: ${jsonResponse.status}`);
    }

    // Save tasks.csv
    const tasksCsvFile = tasksFile.replace(/\.json$/i, '.csv');
    const csvContent = this.generatePersistedCSV(this.tasks);
    await fetch(`${workerUrl}/api/tasks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        accessPassword,
        filePath: tasksCsvFile,
        content: csvContent,
        message: `${message} (csv)`
      })
    });

    // Save state files
    try {
      const stateFiles = this.generateStateFiles(this.tasks);
      const baseDir = tasksFile.replace(/\/[^\/]+$/, '');
      const stateDir = `${baseDir}/state`;
      for (const [filename, stateContent] of Object.entries(stateFiles)) {
        await fetch(`${workerUrl}/api/tasks`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            accessPassword,
            filePath: `${stateDir}/${filename}`,
            content: stateContent,
            message: `${message} (state)`
          })
        });
      }
    } catch (stateError) {
      console.warn('Could not persist state files:', stateError.message);
    }

    // Also save locally as backup
    this.saveTasksLocal(message);

    return { success: true, source: 'worker' };
  }

  getSessionAccessPassword() {
    // Retrieve the password from sessionStorage (set when user unlocked)
    try {
      const projectId = resolveActiveProjectId();
      const key = `taskManagerAccessPassword:${String(projectId || '').replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager'}`;
      return sessionStorage.getItem(key) || sessionStorage.getItem('taskManagerAccessPassword') || '';
    } catch (e) {
      return '';
    }
  }

  // Direct GitHub API mode (token in browser - legacy, not recommended)
  async saveTasksDirectGitHub(message) {
      // Save with full project structure to match tasks.json format
      const fullData = this.buildFullData(this.tasks);

      const content = JSON.stringify(fullData, null, 2);
      const templateConfig = resolveTemplateConfig();
      const gh = (templateConfig && templateConfig.GITHUB) ? templateConfig.GITHUB : null;
      const tasksFile = (gh && typeof gh.getTasksFile === 'function')
        ? gh.getTasksFile(resolveActiveProjectId())
        : ((gh && gh.TASKS_FILE) ? gh.TASKS_FILE : 'public/tasksDB/github-task-manager/tasks.json');

      // Persist JSON
      const { sha: tasksSha } = await this.githubApi.getFileContent(tasksFile);
      await this.githubApi.updateFile(tasksFile, content, message, tasksSha);

      // Persist CSV alongside JSON
      const tasksCsvFile = tasksFile.endsWith('.json') ? tasksFile.replace(/\.json$/i, '.csv') : 'tasksDB/tasks.csv';
      const csvContent = this.generatePersistedCSV(this.tasks);
      const { sha: csvSha } = await this.githubApi.getFileContent(tasksCsvFile);
      await this.githubApi.updateFile(tasksCsvFile, csvContent, `${message} (csv)`, csvSha);

      // Persist LLM-friendly state files by status (optional but useful)
      try {
        const stateFiles = this.generateStateFiles(this.tasks);
        const baseDir = tasksFile.replace(/\/[^\/]+$/, '');
        const stateDir = `${baseDir}/state`;
        for (const [filename, stateContent] of Object.entries(stateFiles)) {
          const path = `${stateDir}/${filename}`;
          const { sha } = await this.githubApi.getFileContent(path);
          await this.githubApi.updateFile(path, stateContent, `${message} (state)`, sha);
        }
      } catch (stateError) {
        console.warn('Could not persist state files:', stateError.message);
      }

      // Also save locally as backup
      this.saveTasksLocal(message);

      return { success: true, source: 'github' };
  }

  // Load project templates
  async loadTemplates() {
    try {
      // Load from task-templates directory
      const templates = [];

      // Try to load starter template
      try {
        const { content } = await this.githubApi.getFileContent('task-templates/starter_project_template.json');
        const template = JSON.parse(content);
        templates.push(template);
      } catch (error) {
        console.warn('Could not load starter template:', error.message);
      }

      this.templates = templates;
      return { success: true, templates };
    } catch (error) {
      console.error('Error loading templates:', error);
      return { success: false, error: error.message };
    }
  }

  // Import tasks from template
  async importFromTemplate(template, options = {}) {
    try {
      // Validate template
      const validation = this.validator.validate(template, 'template');
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      const importedTasks = [];
      const creatorId = options.creatorId || this.automation.config.AUTOMATION.DEFAULT_CREATOR_ID;

      // Process each task in template
      for (const templateTask of template.tasks) {
        const task = this.automation.autoPopulateTask(templateTask, template, creatorId);

        // Apply any customizations
        if (options.taskCustomizations) {
          Object.assign(task, options.taskCustomizations);
        }

        // Validate final task
        const taskValidation = this.validator.validate(task, 'task');
        if (!taskValidation.isValid) {
          throw new Error(`Task "${task.task_name}" validation failed: ${taskValidation.errors.join(', ')}`);
        }

        importedTasks.push(task);
      }

      // Add to existing tasks or replace
      if (options.replaceExisting) {
        this.tasks = importedTasks;
      } else {
        // Merge with existing, avoiding duplicates
        const existingIds = new Set(this.tasks.map(t => t.task_id));
        const newTasks = importedTasks.filter(t => !existingIds.has(t.task_id));
        this.tasks.push(...newTasks);
      }

      // Save to GitHub
      const message = options.replaceExisting ? 'Import project template' : 'Add tasks from template';
      await this.saveTasks(message);

      return { success: true, importedCount: importedTasks.length };
    } catch (error) {
      console.error('Error importing from template:', error);
      return { success: false, error: error.message };
    }
  }

  // Export tasks to CSV
  exportToCSV(tasks = null) {
    const exportTasks = tasks || this.tasks;

    if (exportTasks.length === 0) {
      return '';
    }

    // Get all possible fields from template config
    const allFields = [
      ...this.validator.config.REQUIRED_FIELDS.TASK,
      ...this.validator.config.OPTIONAL_FIELDS.TASK
    ];

    // Create CSV header
    const headers = allFields.join(',');

    // Create CSV rows
    const rows = exportTasks.map(task => {
      return allFields.map(field => {
        let value = task[field];

        // Handle complex fields
        if (field === 'assigned_workers' && Array.isArray(value)) {
          value = value.map(w => `${w.name}:${w.email}:${w.role || ''}`).join('|');
        } else if (field === 'dependencies' && Array.isArray(value)) {
          value = value.map(d => `${d.predecessor_task_id || d.predecessor_task_name}::${d.type}::${d.lag_days || 0}`).join(';');
        } else if (field === 'tags' && Array.isArray(value)) {
          value = value.join(';');
        } else if (field === 'comments' && Array.isArray(value)) {
          value = value.map(c => `${c.author}::${c.timestamp}::${c.text}`).join(';');
        } else if (field === 'attachments' && Array.isArray(value)) {
          value = value.map(a => `${a.filename}::${a.url}::${a.uploaded_by}::${a.uploaded_date}`).join(';');
        } else if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }

        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }

        return value || '';
      }).join(',');
    });

    return [headers, ...rows].join('\n');
  }

  // Import tasks from CSV
  importFromCSV(csvContent, options = {}) {
    try {
      const lines = csvContent.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }

      const headers = this.parseCSVLine(lines[0]);
      const importedTasks = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        const task = {};

        headers.forEach((header, index) => {
          let value = values[index] || '';

          // Parse complex fields
          if (header === 'assigned_workers' && value) {
            task[header] = value.split('|').map(w => {
              const [name, email, role] = w.split(':');
              return { name, email, role: role || '' };
            });
          } else if (header === 'dependencies' && value) {
            task[header] = value.split(';').map(d => {
              const [predecessor, type, lagDays] = d.split('::');
              const dep = { type, lag_days: parseInt(lagDays) || 0 };
              if (/^\d+$/.test(predecessor)) {
                dep.predecessor_task_id = parseInt(predecessor);
              } else {
                dep.predecessor_task_name = predecessor;
              }
              return dep;
            });
          } else if (header === 'tags' && value) {
            task[header] = value.split(';').map(t => t.trim()).filter(t => t);
          } else if (header === 'comments' && value) {
            task[header] = value.split(';').map(c => {
              const [author, timestamp, text] = c.split('::');
              return { author, timestamp, text };
            });
          } else if (header === 'attachments' && value) {
            task[header] = value.split(';').map(a => {
              const [filename, url, uploadedBy, uploadedDate] = a.split('::');
              return { filename, url, uploaded_by: uploadedBy, uploaded_date: uploadedDate };
            });
          } else if (value && !isNaN(value)) {
            task[header] = parseFloat(value);
          } else {
            task[header] = value;
          }
        });

        // Auto-populate and validate
        const populatedTask = this.automation.autoPopulateTask(task, null, options.creatorId);
        const validation = this.validator.validate(populatedTask, 'task');

        if (!validation.isValid) {
          console.warn(`Task ${i} validation errors:`, validation.errors);
          if (options.skipInvalid) continue;
        }

        importedTasks.push(populatedTask);
      }

      // Add to existing tasks
      if (options.replaceExisting) {
        this.tasks = importedTasks;
      } else {
        const existingIds = new Set(this.tasks.map(t => t.task_id));
        const newTasks = importedTasks.filter(t => !existingIds.has(t.task_id));
        this.tasks.push(...newTasks);
      }

      return { success: true, importedCount: importedTasks.length };
    } catch (error) {
      console.error('Error importing from CSV:', error);
      return { success: false, error: error.message };
    }
  }

  // Parse CSV line handling quotes
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  // Record a task change event in history
  async recordTaskChange(taskId, action, field, beforeValue, afterValue, actor = 'User') {
    try {
      const projectId = resolveActiveProjectId();
      const accessPassword = this.getSessionAccessPassword();
      
      // Try to append via Worker if available
      const workerUrl = this.getWorkerUrl();
      if (workerUrl && accessPassword) {
        const payload = {
          projectId,
          taskId: String(taskId),
          action,
          field: field || '',
          beforeValue: beforeValue === undefined ? '' : String(beforeValue),
          afterValue: afterValue === undefined ? '' : String(afterValue),
          actor,
          accessPassword
        };
        
        try {
          const res = await fetch(`${workerUrl}/api/history/append`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (res.ok) {
            console.log(`[History] Recorded: ${action} task ${taskId} field ${field}`);
            return true;
          } else {
            const err = await res.json().catch(() => ({}));
            console.error('[History] Append failed:', err);
            return false;
          }
        } catch (e) {
          console.error('[History] Worker error:', e.message);
          return false;
        }
      }
    } catch (e) {
      console.error('[History] Error recording change:', e);
      return false;
    }
  }

  getWorkerUrl() {
    try {
      if (typeof window !== 'undefined' && window.GITHUB_WORKER_URL) return window.GITHUB_WORKER_URL;
      if (typeof globalThis !== 'undefined' && globalThis.GITHUB_WORKER_URL) return globalThis.GITHUB_WORKER_URL;
      // eslint-disable-next-line no-undef
      if (typeof GITHUB_WORKER_URL !== 'undefined') return GITHUB_WORKER_URL;
    } catch (e) {}
    return '';
  }

  getSessionAccessPassword() {
    try {
      const projectId = resolveActiveProjectId();
      const key = `taskManagerAccessPassword:${projectId}`;
      return sessionStorage.getItem(key) || '';
    } catch (e) {
      return '';
    }
  }

  // CRUD operations
  createTask(taskData, creatorId = null) {
    const task = this.automation.autoPopulateTask(taskData, { tasks: this.tasks }, creatorId);
    const validation = this.validator.validate(task, 'task');

    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    this.tasks.push(task);
    
    // Record creation in history
    this.recordTaskChange(task.task_id, 'createTask', '*', '', JSON.stringify(task), 'System');
    
    return { success: true, task };
  }

  updateTask(taskId, updates) {
    const id = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
    const taskIndex = this.tasks.findIndex(t => t.task_id === id);
    if (taskIndex === -1) {
      return { success: false, error: 'Task not found' };
    }

    const oldTask = this.tasks[taskIndex];
    const updatedTask = { ...oldTask, ...updates };
    // Never allow task_id to be changed (or coerced to string) through updates
    updatedTask.task_id = oldTask.task_id;
    const validation = this.validator.validate(updatedTask, 'task');

    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Record changes per field
    for (const [field, newValue] of Object.entries(updates)) {
      if (field !== 'task_id' && oldTask[field] !== newValue) {
        this.recordTaskChange(id, 'updateTask', field, oldTask[field], newValue, 'User');
      }
    }

    this.tasks[taskIndex] = updatedTask;
    return { success: true, task: updatedTask };
  }

  deleteTask(taskId) {
    const id = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
    const taskIndex = this.tasks.findIndex(t => t.task_id === id);
    if (taskIndex === -1) {
      return { success: false, error: 'Task not found' };
    }

    const deletedTask = this.tasks.splice(taskIndex, 1)[0];
    
    // Record deletion in history
    this.recordTaskChange(id, 'deleteTask', '*', JSON.stringify(deletedTask), '', 'User');
    
    return { success: true, task: deletedTask };
  }

  getTask(taskId) {
    const id = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
    return this.tasks.find(t => t.task_id === id);
  }

  getTasks(filters = {}) {
    let filtered = [...this.tasks];

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }

    if (filters.category) {
      filtered = filtered.filter(t => t.category_name === filters.category);
    }

    if (filters.assigned_to) {
      filtered = filtered.filter(t =>
        t.assigned_workers &&
        t.assigned_workers.some(w => w.email === filters.assigned_to)
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.task_name.toLowerCase().includes(searchTerm) ||
        (t.description && t.description.toLowerCase().includes(searchTerm)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    return filtered;
  }

  // Get project statistics
  getStatistics() {
    return this.automation.generateProjectSummary({ tasks: this.tasks });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TaskDatabase;
}
