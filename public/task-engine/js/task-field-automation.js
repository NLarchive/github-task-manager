/**
 * Task field automation rules for project and task authoring.
 *
 * The automation layer fills defaults, normalizes status-related values, and
 * derives helper metadata so the list-display controller and storage layer can
 * work with consistent TaskDB records.
 */

/**
 * Populate and repair task/project fields using TEMPLATE_CONFIG defaults.
 */
class TemplateAutomation {
  /**
   * Create an automation helper with config-backed defaults and validation.
   *
   * @param {object} [config=TEMPLATE_CONFIG]
   * @param {TemplateValidator} [validator=new TemplateValidator()]
   */
  constructor(config = TEMPLATE_CONFIG, validator = new TemplateValidator()) {
    this.config = config;
    this.validator = validator;
    this.nextTaskId = 1;
  }

  // Generate next available task ID
  /**
   * Generate the next available numeric task id for a task collection.
   *
   * @param {object[]} [existingTasks=[]]
   * @returns {number|null}
   */
  generateTaskId(existingTasks = []) {
    if (!this.config.AUTOMATION.AUTO_GENERATE_IDS) {
      return null;
    }

    const existingIds = existingTasks
      .map(task => task.task_id)
      .filter(id => id && typeof id === 'number')
      .sort((a, b) => a - b);

    // Find the first gap or use next number
    for (let i = 1; i <= existingIds.length + 1; i++) {
      if (!existingIds.includes(i)) {
        return i;
      }
    }

    return existingIds.length + 1;
  }

  // Auto-populate task fields
  /**
   * Fill task defaults, normalize values, and derive missing metadata.
   *
   * @param {object} task
   * @param {object|null} [template=null]
   * @param {string|null} [creatorId=null]
   * @returns {object}
   */
  autoPopulateTask(task, template = null, creatorId = null) {
    const populated = { ...task };

    // Generate ID if not provided
    if (!populated.task_id) {
      populated.task_id = this.generateTaskId(template ? template.tasks : []);
    }

    // Set defaults
    Object.keys(this.config.DEFAULTS.TASK).forEach(field => {
      if (populated[field] === undefined) {
        populated[field] = this.config.DEFAULTS.TASK[field];
      }
    });

    // If start/end dates are missing, default to today and 7 days later (YYYY-MM-DD)
    if (!populated.start_date) {
      const today = new Date();
      populated.start_date = today.toISOString().slice(0, 10);
    }
    if (!populated.end_date) {
      const start = new Date(populated.start_date + 'T00:00:00');
      const dur = (this.config && this.config.DEFAULTS && this.config.DEFAULTS.TASK && this.config.DEFAULTS.TASK.default_duration_days) || 7;
      const end = new Date(start.getTime() + dur * 24 * 60 * 60 * 1000);
      populated.end_date = end.toISOString().slice(0, 10);
    }
    // Auto-set due_date to end_date if not provided (v3)
    if (!populated.due_date) {
      populated.due_date = populated.end_date;
    }

    // Auto-set creation metadata
    if (this.config.AUTOMATION.AUTO_SET_CREATED_DATE && !populated.created_date) {
      populated.created_date = new Date().toISOString();
    }

    if (this.config.AUTOMATION.AUTO_SET_CREATOR_ID && !populated.creator_id) {
      populated.creator_id = creatorId || this.config.AUTOMATION.DEFAULT_CREATOR_ID;
    }

    // Normalize status if enabled
    if (this.config.AUTOMATION.AUTO_NORMALIZE_STATUSES && populated.status) {
      const normalized = this.validator.normalizeStatus(populated.status);
      if (normalized && normalized !== populated.status) {
        populated.status = normalized;
      }
    }

    // Set completed_date if status is completed or done
    if ((populated.status === 'Completed' || populated.status === 'Done') && !populated.completed_date) {
      populated.completed_date = new Date().toISOString();
    }

    // Auto-set progress based on status
    if ((populated.status === 'Completed' || populated.status === 'Done') && populated.progress_percentage === 0) {
      populated.progress_percentage = 100;
    }

    // Clear blocker_reason if task is no longer blocked
    if (populated.status && populated.status !== 'Blocked' && populated.blocker_reason) {
      // do not clear — keep as audit trail but warn via validator
    }

    // Mark intentionally-created test tasks (created during E2E) if tags contain e2e-test
    if (Array.isArray(populated.tags) && populated.tags.includes('e2e-test')) {
      populated.is_test = true;
    }

    return populated;
  }

  // Auto-populate project fields
  /**
   * Fill project-level defaults and normalize configured fields.
   *
   * @param {object} project
   * @returns {object}
   */
  autoPopulateProject(project) {
    const populated = { ...project };

    // Set defaults
    Object.keys(this.config.DEFAULTS.PROJECT).forEach(field => {
      if (populated[field] === undefined) {
        populated[field] = this.config.DEFAULTS.PROJECT[field];
      }
    });

    // Normalize status if enabled
    if (this.config.AUTOMATION.AUTO_NORMALIZE_STATUSES && populated.status) {
      const normalized = this.validator.normalizeStatus(populated.status);
      if (normalized && normalized !== populated.status) {
        populated.status = normalized;
      }
    }

    return populated;
  }

  // Create task from template with smart defaults
  /**
   * Create a task from a template record and apply automation defaults.
   *
   * @param {object} templateTask
   * @param {object} template
   * @param {object} [customizations={}]
   * @returns {object}
   */
  createTaskFromTemplate(templateTask, template, customizations = {}) {
    const baseTask = { ...templateTask };

    // Apply customizations
    Object.assign(baseTask, customizations);

    // Auto-populate
    return this.autoPopulateTask(baseTask, template);
  }

  // Generate task dependencies automatically based on dates
  /**
   * Suggest finish-to-start dependencies by comparing task date ranges.
   *
   * @param {object[]} tasks
   * @returns {object[]}
   */
  autoGenerateDependencies(tasks) {
    const tasksWithDates = tasks.filter(task =>
      task.start_date && task.end_date && task.task_id
    ).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    const dependencies = [];

    tasksWithDates.forEach((task, index) => {
      // Find tasks that should precede this one based on date overlap
      const predecessors = tasksWithDates.slice(0, index).filter(prevTask => {
        const prevEnd = new Date(prevTask.end_date);
        const currentStart = new Date(task.start_date);
        return prevEnd >= currentStart;
      });

      predecessors.forEach(pred => {
        if (!task.dependencies.some(dep => dep.predecessor_task_id === pred.task_id)) {
          dependencies.push({
            predecessor_task_id: pred.task_id,
            type: 'FS',
            lag_days: 0
          });
        }
      });

      if (dependencies.length > 0) {
        task.dependencies = task.dependencies || [];
        task.dependencies.push(...dependencies);
      }
    });

    return tasks;
  }

  // Suggest task assignments based on worker skills
  /**
   * Rank workers whose skills best match the task tags.
   *
   * @param {object} task
   * @param {object[]} workers
   * @returns {object[]}
   */
  suggestAssignments(task, workers) {
    if (!task.tags || !Array.isArray(task.tags) || !workers) {
      return [];
    }

    const suggestions = workers
      .filter(worker => {
        if (!worker.skills || !Array.isArray(worker.skills)) return false;

        // Check if worker has skills matching task tags
        return task.tags.some(tag =>
          worker.skills.some(skill =>
            skill.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(skill.toLowerCase())
          )
        );
      })
      .map(worker => ({
        name: worker.name,
        email: worker.email || '',
        worker_id: worker.worker_id || '',
        role: worker.role,
        match_score: this.calculateSkillMatch(task.tags, worker.skills)
      }))
      .sort((a, b) => b.match_score - a.match_score);

    return suggestions;
  }

  // Calculate skill match score
  /**
   * Calculate a simple overlap score between task tags and worker skills.
   *
   * @param {string[]} taskTags
   * @param {string[]} workerSkills
   * @returns {number}
   */
  calculateSkillMatch(taskTags, workerSkills) {
    if (!taskTags || !workerSkills) return 0;

    let matches = 0;
    taskTags.forEach(tag => {
      workerSkills.forEach(skill => {
        if (skill.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(skill.toLowerCase())) {
          matches++;
        }
      });
    });

    return matches / Math.max(taskTags.length, workerSkills.length);
  }

  // Auto-categorize task based on tags and description
  /**
   * Suggest a category name using keyword matches from the task content.
   *
   * @param {object} task
   * @param {object[]} categories
   * @returns {string|null}
   */
  autoCategorize(task, categories) {
    if (!categories || !Array.isArray(categories)) return null;

    const text = `${task.task_name} ${task.description || ''} ${task.tags ? task.tags.join(' ') : ''}`.toLowerCase();

    // Simple keyword matching for categories
    const categoryKeywords = {
      'Project Setup': ['setup', 'planning', 'requirements', 'init'],
      'Backend Development': ['backend', 'api', 'database', 'server'],
      'Frontend Development': ['frontend', 'ui', 'react', 'interface'],
      'Deployment': ['deploy', 'ci-cd', 'devops', 'server']
    };

    for (const category of categories) {
      const keywords = categoryKeywords[category.name] || [];
      if (keywords.some(keyword => text.includes(keyword))) {
        return category.name;
      }
    }

    return null;
  }

  // Validate and fix common issues
  /**
   * Repair common task issues and return the fixes that were applied.
   *
   * @param {object} task
   * @param {object|null} [template=null]
   * @returns {{task: object, issues: string[]}}
   */
  validateAndFix(task, template = null) {
    let fixedTask = { ...task };
    const issues = [];

    // Fix missing required fields with defaults
    this.config.REQUIRED_FIELDS.TASK.forEach(field => {
      if (!fixedTask[field]) {
        if (field === 'task_id') {
          fixedTask[field] = this.generateTaskId(template ? template.tasks : []);
          issues.push(`Auto-generated ${field}`);
        } else if (field === 'status') {
          fixedTask[field] = this.config.DEFAULTS.TASK.status;
          issues.push(`Set default ${field}`);
        } else if (field === 'priority') {
          fixedTask[field] = this.config.DEFAULTS.TASK.priority;
          issues.push(`Set default ${field}`);
        } else if (field === 'estimated_hours') {
          fixedTask[field] = 8; // Default 1 day
          issues.push(`Set default ${field} to 8`);
        } else if (field === 'start_date') {
          const today = new Date();
          fixedTask[field] = today.toISOString().split('T')[0];
          issues.push(`Set default ${field} to today`);
        } else if (field === 'end_date') {
          const today = new Date();
          const dur = (this.config && this.config.DEFAULTS && this.config.DEFAULTS.TASK && this.config.DEFAULTS.TASK.default_duration_days) || 7;
          const end = new Date(today.getTime() + dur * 24 * 60 * 60 * 1000);
          fixedTask[field] = end.toISOString().split('T')[0];
          issues.push(`Set default ${field} to ${dur} days from today`);
        } else {
          issues.push(`Missing required field: ${field}`);
        }
      }
    });

    // Auto-set due_date from end_date if missing (v3)
    if (!fixedTask.due_date && fixedTask.end_date) {
      fixedTask.due_date = fixedTask.end_date;
      issues.push('Set due_date from end_date');
    }

    // Fix date formats
    ['start_date', 'end_date', 'due_date'].forEach(field => {
      if (fixedTask[field] && !this.validator.isValidDate(fixedTask[field])) {
        try {
          // Try to parse and reformat
          const date = new Date(fixedTask[field]);
          if (!isNaN(date.getTime())) {
            fixedTask[field] = date.toISOString().split('T')[0];
            issues.push(`Reformatted ${field} to YYYY-MM-DD`);
          }
        } catch (e) {
          issues.push(`Invalid ${field} format`);
        }
      }
    });

    // Fix status normalization
    if (fixedTask.status && !this.config.ENUMS.TASK_STATUS.includes(fixedTask.status)) {
      const normalized = this.validator.normalizeStatus(fixedTask.status);
      if (normalized) {
        fixedTask.status = normalized;
        issues.push(`Normalized status to "${normalized}"`);
      }
    }

    return { task: fixedTask, issues };
  }

  // Generate project summary
  /**
   * Build a derived summary block from the current template task list.
   *
   * @param {object} template
   * @returns {object}
   */
  generateProjectSummary(template) {
    if (!template.tasks) return {};

    const summary = {
      total_tasks: template.tasks.length,
      tasks_by_status: {},
      tasks_by_priority: {},
      total_estimated_hours: 0,
      total_actual_hours: 0,
      critical_path_tasks: 0,
      tasks_with_dependencies: 0,
      assigned_tasks: 0
    };

    template.tasks.forEach(task => {
      // Count by status
      summary.tasks_by_status[task.status] = (summary.tasks_by_status[task.status] || 0) + 1;

      // Count by priority
      summary.tasks_by_priority[task.priority] = (summary.tasks_by_priority[task.priority] || 0) + 1;

      // Sum hours
      summary.total_estimated_hours += task.estimated_hours || 0;
      summary.total_actual_hours += task.actual_hours || 0;

      // Count special categories
      if (task.is_critical_path) summary.critical_path_tasks++;
      if (task.dependencies && task.dependencies.length > 0) summary.tasks_with_dependencies++;
      if (task.assigned_workers && task.assigned_workers.length > 0) summary.assigned_tasks++;
    });

    return summary;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemplateAutomation;
}
