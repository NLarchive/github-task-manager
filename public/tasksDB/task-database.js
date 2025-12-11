// Task Database Component
// Handles task storage, retrieval, and synchronization with GitHub

class TaskDatabase {
  constructor(githubApi, validator = new TemplateValidator(), automation = new TemplateAutomation()) {
    this.githubApi = githubApi;
    this.validator = validator;
    this.automation = automation;
    this.tasks = [];
    this.templates = [];
    this.currentProject = null;
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

  // Load tasks from GitHub or fallback to local file
  async loadTasks() {
    try {
      // Try to load from GitHub API first
      try {
        const { content } = await this.githubApi.getFileContent(this.githubApi.config.TASKS_FILE);
        const data = JSON.parse(content || '{}');
        // Handle both full project structure and flat tasks array
        this.tasks = data.tasks || (Array.isArray(data) ? data : []);
      } catch (apiError) {
        // Fallback to local tasks.json file if API fails
        console.warn('GitHub API failed, attempting to load local tasks.json:', apiError.message);
        try {
          const response = await fetch(`/${this.githubApi.config.TASKS_FILE}`);
          if (response.ok) {
            const data = await response.json();
            // Handle both full project structure and flat tasks array
            this.tasks = data.tasks || (Array.isArray(data) ? data : []);
          } else {
            console.warn('Local tasks.json not found, using empty array');
            this.tasks = [];
          }
        } catch (fetchError) {
          console.error('Failed to load local tasks.json:', fetchError);
          this.tasks = [];
        }
      }

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

  // Save tasks to GitHub
  async saveTasks(message = 'Update tasks') {
    try {
      // Validate all tasks before saving
      const validationResults = this.tasks.map(task => this.validator.validate(task, 'task'));
      const hasErrors = validationResults.some(result => !result.isValid);

      if (hasErrors) {
        const errors = validationResults.flatMap(result => result.errors);
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      // Save with full project structure to match tasks.json format
      const fullData = {
        project: {
          name: "GitHub Task Manager - Web Application",
          description: "Build a collaborative task management system integrated with GitHub, enabling public users to manage tasks through a modern web UI with automatic task ID generation and template-based task creation.",
          start_date: "2025-12-08",
          end_date: "2026-02-28",
          status: "In Progress",
          budget: 15000
        },
        categories: [
          { "name": "Project Setup", "parent_category_name": null },
          { "name": "Backend Development", "parent_category_name": null },
          { "name": "Frontend Development", "parent_category_name": null },
          { "name": "Testing", "parent_category_name": null },
          { "name": "Deployment", "parent_category_name": null },
          { "name": "Documentation", "parent_category_name": null },
          { "name": "Retrospective", "parent_category_name": null }
        ],
        workers: [
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
        tasks: this.tasks
      };

      const content = JSON.stringify(fullData, null, 2);
      const { sha } = await this.githubApi.getFileContent(this.githubApi.config.TASKS_FILE);
      await this.githubApi.updateFile(this.githubApi.config.TASKS_FILE, content, message, sha);

      return { success: true };
    } catch (error) {
      console.error('Error saving tasks:', error);
      return { success: false, error: error.message };
    }
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

  // CRUD operations
  createTask(taskData, creatorId = null) {
    const task = this.automation.autoPopulateTask(taskData, { tasks: this.tasks }, creatorId);
    const validation = this.validator.validate(task, 'task');

    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    this.tasks.push(task);
    return { success: true, task };
  }

  updateTask(taskId, updates) {
    const taskIndex = this.tasks.findIndex(t => t.task_id === taskId);
    if (taskIndex === -1) {
      return { success: false, error: 'Task not found' };
    }

    const updatedTask = { ...this.tasks[taskIndex], ...updates };
    const validation = this.validator.validate(updatedTask, 'task');

    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    this.tasks[taskIndex] = updatedTask;
    return { success: true, task: updatedTask };
  }

  deleteTask(taskId) {
    const taskIndex = this.tasks.findIndex(t => t.task_id === taskId);
    if (taskIndex === -1) {
      return { success: false, error: 'Task not found' };
    }

    const deletedTask = this.tasks.splice(taskIndex, 1)[0];
    return { success: true, task: deletedTask };
  }

  getTask(taskId) {
    return this.tasks.find(t => t.task_id === taskId);
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
