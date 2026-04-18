// Template Validation Component
// Validates tasks and projects against template rules

class TemplateValidator {
  constructor(config = TEMPLATE_CONFIG) {
    this.config = config;
  }

  // Main validation method
  validate(data, type = 'task') {
    const errors = [];
    const warnings = [];

    if (type === 'project') {
      return this.validateProject(data);
    } else if (type === 'task') {
      return this.validateTask(data);
    } else if (type === 'template') {
      return this.validateTemplate(data);
    }

    return { isValid: false, errors: ['Unknown validation type'], warnings: [] };
  }

  // Validate entire project template
  validateTemplate(template) {
    const errors = [];
    const warnings = [];

    // Check required project fields
    if (!template.project) {
      errors.push('Missing project object');
    } else {
      const projectValidation = this.validateProject(template.project);
      errors.push(...projectValidation.errors);
      warnings.push(...projectValidation.warnings);
    }

    // Check tasks array
    if (!template.tasks || !Array.isArray(template.tasks)) {
      errors.push('Missing or invalid tasks array');
    } else if (template.tasks.length === 0) {
      warnings.push('Template has no tasks');
    } else {
      // Validate each task
      const taskIds = new Set();
      const taskNames = new Set();

      template.tasks.forEach((task, index) => {
        const taskValidation = this.validateTask(task, template);
        errors.push(...taskValidation.errors.map(err => `Task ${index + 1}: ${err}`));
        warnings.push(...taskValidation.warnings.map(warn => `Task ${index + 1}: ${warn}`));

        // Check for duplicate IDs and names
        if (task.task_id) {
          if (taskIds.has(task.task_id)) {
            errors.push(`Task ${index + 1}: Duplicate task_id ${task.task_id}`);
          }
          taskIds.add(task.task_id);
        }

        if (task.task_name) {
          if (taskNames.has(task.task_name)) {
            errors.push(`Task ${index + 1}: Duplicate task_name "${task.task_name}"`);
          }
          taskNames.add(task.task_name);
        }
      });

      // Validate dependencies
      const dependencyErrors = this.validateDependencies(template.tasks);
      errors.push(...dependencyErrors);
    }

    // Check categories and workers if present
    if (template.categories) {
      const categoryValidation = this.validateCategories(template.categories);
      errors.push(...categoryValidation.errors);
      warnings.push(...categoryValidation.warnings);
    }

    if (template.workers) {
      const workerValidation = this.validateWorkers(template.workers);
      errors.push(...workerValidation.errors);
      warnings.push(...workerValidation.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validate project object
  validateProject(project) {
    const errors = [];
    const warnings = [];

    // Check required fields
    this.config.REQUIRED_FIELDS.PROJECT.forEach(field => {
      if (!project[field]) {
        errors.push(`Missing required project field: ${field}`);
      }
    });

    // Validate status
    if (project.status && !this.config.ENUMS.PROJECT_STATUS.includes(project.status)) {
      const normalized = this.normalizeStatus(project.status);
      if (normalized) {
        warnings.push(`Project status "${project.status}" normalized to "${normalized}"`);
      } else {
        errors.push(`Invalid project status: ${project.status}`);
      }
    }

    // Validate dates
    if (project.start_date && !this.isValidDate(project.start_date)) {
      errors.push(`Invalid project start_date format: ${project.start_date}`);
    }

    if (project.end_date && !this.isValidDate(project.end_date)) {
      errors.push(`Invalid project end_date format: ${project.end_date}`);
    }

    // Validate date order
    if (project.start_date && project.end_date && project.start_date > project.end_date) {
      errors.push('Project start_date cannot be after end_date');
    }

    // Validate budget
    if (project.budget !== undefined && (typeof project.budget !== 'number' || project.budget < 0)) {
      errors.push('Project budget must be a non-negative number');
    }

    // Validate budget_spent
    if (project.budget_spent !== undefined && (typeof project.budget_spent !== 'number' || project.budget_spent < 0)) {
      errors.push('Project budget_spent must be a non-negative number');
    }

    // Validate project_manager
    if (project.project_manager !== undefined && project.project_manager !== null) {
      if (typeof project.project_manager !== 'object') {
        errors.push('Project project_manager must be an object');
      } else {
        if (!project.project_manager.name && !project.project_manager.email) {
          warnings.push('Project project_manager should have a name or email');
        }
        if (project.project_manager.email && !this.isValidEmail(project.project_manager.email)) {
          errors.push('Project project_manager email is invalid');
        }
      }
    }

    // Validate stakeholders
    if (project.stakeholders !== undefined) {
      if (!Array.isArray(project.stakeholders)) {
        errors.push('Project stakeholders must be an array');
      } else {
        project.stakeholders.forEach((s, i) => {
          if (!s || typeof s !== 'object') {
            errors.push(`Project stakeholder ${i + 1}: must be an object`);
          } else if (s.email && !this.isValidEmail(s.email)) {
            errors.push(`Project stakeholder ${i + 1}: invalid email`);
          }
        });
      }
    }

    // Validate milestones
    if (project.milestones !== undefined) {
      if (!Array.isArray(project.milestones)) {
        errors.push('Project milestones must be an array');
      } else {
        const msEnum = this.config.ENUMS && this.config.ENUMS.MILESTONE_STATUS;
        project.milestones.forEach((m, i) => {
          if (!m || typeof m !== 'object') {
            errors.push(`Project milestone ${i + 1}: must be an object`);
            return;
          }
          if (!m.name) errors.push(`Project milestone ${i + 1}: missing name`);
          if (m.due_date && !this.isValidDate(m.due_date)) errors.push(`Project milestone ${i + 1}: invalid due_date format`);
          if (m.status && msEnum && !msEnum.includes(m.status)) errors.push(`Project milestone ${i + 1}: invalid status "${m.status}"`);
        });
      }
    }

    // Validate sprints
    if (project.sprints !== undefined) {
      if (!Array.isArray(project.sprints)) {
        errors.push('Project sprints must be an array');
      } else {
        const spEnum = this.config.ENUMS && this.config.ENUMS.SPRINT_STATUS;
        project.sprints.forEach((sp, i) => {
          if (!sp || typeof sp !== 'object') {
            errors.push(`Project sprint ${i + 1}: must be an object`);
            return;
          }
          if (!sp.name) errors.push(`Project sprint ${i + 1}: missing name`);
          if (sp.start_date && !this.isValidDate(sp.start_date)) errors.push(`Project sprint ${i + 1}: invalid start_date`);
          if (sp.end_date && !this.isValidDate(sp.end_date)) errors.push(`Project sprint ${i + 1}: invalid end_date`);
          if (sp.start_date && sp.end_date && sp.start_date > sp.end_date) errors.push(`Project sprint ${i + 1}: start_date after end_date`);
          if (sp.status && spEnum && !spEnum.includes(sp.status)) errors.push(`Project sprint ${i + 1}: invalid status "${sp.status}"`);
        });
      }
    }

    // Validate risks
    if (project.risks !== undefined) {
      if (!Array.isArray(project.risks)) {
        errors.push('Project risks must be an array');
      } else {
        const rpEnum = this.config.ENUMS && this.config.ENUMS.RISK_PROBABILITY;
        const riEnum = this.config.ENUMS && this.config.ENUMS.RISK_IMPACT;
        const rsEnum = this.config.ENUMS && this.config.ENUMS.RISK_STATUS;
        project.risks.forEach((r, i) => {
          if (!r || typeof r !== 'object') {
            errors.push(`Project risk ${i + 1}: must be an object`);
            return;
          }
          if (!r.name) errors.push(`Project risk ${i + 1}: missing name`);
          if (r.probability && rpEnum && !rpEnum.includes(r.probability)) errors.push(`Project risk ${i + 1}: invalid probability "${r.probability}"`);
          if (r.impact && riEnum && !riEnum.includes(r.impact)) errors.push(`Project risk ${i + 1}: invalid impact "${r.impact}"`);
          if (r.status && rsEnum && !rsEnum.includes(r.status)) errors.push(`Project risk ${i + 1}: invalid status "${r.status}"`);
        });
      }
    }

    // Validate change_log
    if (project.change_log !== undefined) {
      if (!Array.isArray(project.change_log)) {
        errors.push('Project change_log must be an array');
      } else {
        const csEnum = this.config.ENUMS && this.config.ENUMS.CHANGE_STATUS;
        project.change_log.forEach((c, i) => {
          if (!c || typeof c !== 'object') {
            errors.push(`Project change_log ${i + 1}: must be an object`);
            return;
          }
          if (c.date && !this.isValidDate(c.date)) errors.push(`Project change_log ${i + 1}: invalid date format`);
          if (c.status && csEnum && !csEnum.includes(c.status)) errors.push(`Project change_log ${i + 1}: invalid status "${c.status}"`);
        });
      }
    }

    return { errors, warnings };
  }

  // Validate task object
  validateTask(task, template = null) {
    const errors = [];
    const warnings = [];

    // Check required fields
    this.config.REQUIRED_FIELDS.TASK.forEach(field => {
      if (!task[field]) {
        errors.push(`Missing required task field: ${field}`);
      }
    });

    // Validate task_id
    if (task.task_id !== undefined) {
      if (!this.config.VALIDATION_RULES.TASK_ID_PATTERN.test(task.task_id)) {
        errors.push(`Invalid task_id: must be a positive integer`);
      }
    }

    // Validate status
    if (task.status) {
      if (!this.config.ENUMS.TASK_STATUS.includes(task.status)) {
        const normalized = this.normalizeStatus(task.status);
        if (normalized) {
          warnings.push(`Task status "${task.status}" normalized to "${normalized}"`);
        } else {
          errors.push(`Invalid task status: ${task.status}`);
        }
      }
    }

    // Validate priority
    if (task.priority && !this.config.ENUMS.TASK_PRIORITY.includes(task.priority)) {
      errors.push(`Invalid task priority: ${task.priority}`);
    }

    // Validate dates
    if (task.start_date && !this.isValidDate(task.start_date)) {
      errors.push(`Invalid task start_date format: ${task.start_date}`);
    }

    if (task.end_date && !this.isValidDate(task.end_date)) {
      errors.push(`Invalid task end_date format: ${task.end_date}`);
    }

    // Validate date order
    if (task.start_date && task.end_date && task.start_date > task.end_date) {
      errors.push('Task start_date cannot be after end_date');
    }

    // Validate numeric fields
    if (task.estimated_hours !== undefined && (typeof task.estimated_hours !== 'number' || task.estimated_hours < this.config.VALIDATION_RULES.ESTIMATED_HOURS_MIN)) {
      errors.push('Task estimated_hours must be a non-negative number');
    }

    if (task.actual_hours !== undefined && (typeof task.actual_hours !== 'number' || task.actual_hours < 0)) {
      errors.push('Task actual_hours must be a non-negative number');
    }

    if (task.progress_percentage !== undefined) {
      const [min, max] = this.config.VALIDATION_RULES.PROGRESS_PERCENTAGE_RANGE;
      if (typeof task.progress_percentage !== 'number' || task.progress_percentage < min || task.progress_percentage > max) {
        errors.push(`Task progress_percentage must be between ${min} and ${max}`);
      }
    }

    // Validate assigned workers
    // NOTE: For privacy-safe templates, worker identity may be provided via worker_id (preferred)
    // and email may be omitted.
    if (task.assigned_workers && Array.isArray(task.assigned_workers)) {
      task.assigned_workers.forEach((worker, index) => {
        if (!worker || typeof worker !== 'object') {
          errors.push(`Task assigned_worker ${index + 1}: must be an object`);
          return;
        }

        const hasName = !!(worker.name && String(worker.name).trim());
        const hasEmail = !!(worker.email && String(worker.email).trim());
        const hasWorkerId = !!(worker.worker_id && String(worker.worker_id).trim());

        // Require some way to identify the assignee (worker_id preferred)
        if (!hasWorkerId && !hasEmail && !hasName) {
          errors.push(`Task assigned_worker ${index + 1}: missing identifier (worker_id, email, or name)`);
        }

        if (hasEmail && !this.isValidEmail(worker.email)) {
          errors.push(`Task assigned_worker ${index + 1}: invalid email format`);
        }

        if (hasWorkerId && this.config.VALIDATION_RULES.WORKER_ID_FORMAT && !this.config.VALIDATION_RULES.WORKER_ID_FORMAT.test(String(worker.worker_id))) {
          errors.push(`Task assigned_worker ${index + 1}: invalid worker_id format`);
        }

        // Role is strongly recommended for clarity
        if (!worker.role || !String(worker.role).trim()) {
          warnings.push(`Task assigned_worker ${index + 1}: missing role (recommended)`);
        }
      });
    }

    // Validate dependencies
    if (task.dependencies && Array.isArray(task.dependencies)) {
      task.dependencies.forEach((dep, index) => {
        if (!dep.predecessor_task_id && !dep.predecessor_task_name) {
          errors.push(`Task dependency ${index + 1}: missing predecessor_task_id or predecessor_task_name`);
        }
        if (dep.type && !this.config.ENUMS.DEPENDENCY_TYPES.includes(dep.type)) {
          errors.push(`Task dependency ${index + 1}: invalid type "${dep.type}"`);
        }
        if (dep.lag_days !== undefined && typeof dep.lag_days !== 'number') {
          errors.push(`Task dependency ${index + 1}: lag_days must be a number`);
        }
      });
    }

    // Validate due_date (v3)
    if (task.due_date !== undefined && task.due_date !== null) {
      if (!this.isValidDate(task.due_date)) {
        errors.push(`Invalid task due_date format: ${task.due_date}`);
      } else if (task.start_date && this.isValidDate(task.start_date) && task.due_date < task.start_date) {
        errors.push('Task due_date cannot be before start_date');
      }
    }

    // Validate complexity (v3)
    if (task.complexity !== undefined && task.complexity !== null) {
      const complexityEnum = this.config.ENUMS && this.config.ENUMS.COMPLEXITY;
      if (complexityEnum && !complexityEnum.includes(task.complexity)) {
        errors.push(`Invalid task complexity: "${task.complexity}"`);
      }
    }

    // Validate sprint_name (v3)
    if (task.sprint_name !== undefined && task.sprint_name !== null) {
      if (typeof task.sprint_name !== 'string') {
        errors.push('Task sprint_name must be a string');
      }
    }

    // Validate blocker_reason (v3)
    if (task.blocker_reason !== undefined && task.blocker_reason !== null) {
      if (typeof task.blocker_reason !== 'string') {
        errors.push('Task blocker_reason must be a string');
      }
    }

    // Validate reviewer (v3)
    if (task.reviewer !== undefined && task.reviewer !== null) {
      if (typeof task.reviewer !== 'object') {
        errors.push('Task reviewer must be an object');
      } else {
        if (!task.reviewer.name && !task.reviewer.email) {
          warnings.push('Task reviewer should have a name or email');
        }
        if (task.reviewer.email && !this.isValidEmail(task.reviewer.email)) {
          errors.push('Task reviewer email is invalid');
        }
      }
    }

    // Validate acceptance_criteria (v3)
    if (task.acceptance_criteria !== undefined && task.acceptance_criteria !== null) {
      if (!Array.isArray(task.acceptance_criteria)) {
        errors.push('Task acceptance_criteria must be an array');
      } else {
        task.acceptance_criteria.forEach((ac, i) => {
          if (typeof ac !== 'string') {
            errors.push(`Task acceptance_criteria[${i}] must be a string`);
          }
        });
      }
    }

    // Validate subtasks (v3)
    if (task.subtasks !== undefined && task.subtasks !== null) {
      if (!Array.isArray(task.subtasks)) {
        errors.push('Task subtasks must be an array');
      } else {
        task.subtasks.forEach((sub, i) => {
          if (!sub || typeof sub !== 'object') {
            errors.push(`Task subtask ${i + 1}: must be an object`);
            return;
          }
          if (!sub.name) errors.push(`Task subtask ${i + 1}: missing name`);
          const taskStatusEnum = this.config.ENUMS && this.config.ENUMS.TASK_STATUS;
          if (sub.status && taskStatusEnum && !taskStatusEnum.includes(sub.status)) {
            errors.push(`Task subtask ${i + 1}: invalid status "${sub.status}"`);
          }
          if (sub.estimated_hours !== undefined && (typeof sub.estimated_hours !== 'number' || sub.estimated_hours < 0)) {
            errors.push(`Task subtask ${i + 1}: estimated_hours must be a non-negative number`);
          }
          if (sub.due_date && !this.isValidDate(sub.due_date)) {
            errors.push(`Task subtask ${i + 1}: invalid due_date format`);
          }
        });
      }
    }

    // Validate links (v3)
    if (task.links !== undefined && task.links !== null) {
      if (!Array.isArray(task.links)) {
        errors.push('Task links must be an array');
      } else {
        task.links.forEach((link, i) => {
          if (!link || typeof link !== 'object') {
            errors.push(`Task link ${i + 1}: must be an object`);
            return;
          }
          if (!link.url && !link.href) {
            errors.push(`Task link ${i + 1}: missing url`);
          }
          if (!link.label) {
            warnings.push(`Task link ${i + 1}: missing label (recommended)`);
          }
        });
      }
    }

    // Validate category exists in template
    if (template && template.categories && task.category_name) {
      const categoryExists = template.categories.some(cat => cat.name === task.category_name);
      if (!categoryExists) {
        errors.push(`Task category "${task.category_name}" does not exist in template categories`);
      }
    }

    // Validate parent_task_id exists
    if (task.parent_task_id && template && template.tasks) {
      const parentExists = template.tasks.some(t => t.task_id === task.parent_task_id);
      if (!parentExists) {
        errors.push(`Task parent_task_id ${task.parent_task_id} does not exist in template tasks`);
      }
    }

    return { 
      isValid: errors.length === 0, 
      errors, 
      warnings 
    };
  }

  // Validate categories
  validateCategories(categories) {
    const errors = [];
    const warnings = [];
    const categoryNames = new Set();

    if (!Array.isArray(categories)) {
      errors.push('Categories must be an array');
      return { errors, warnings };
    }

    categories.forEach((category, index) => {
      if (!category.name) {
        errors.push(`Category ${index + 1}: missing name`);
      } else {
        if (categoryNames.has(category.name)) {
          errors.push(`Category ${index + 1}: duplicate name "${category.name}"`);
        }
        categoryNames.add(category.name);
      }

      // Check parent reference
      if (category.parent_category_name) {
        const parentExists = categories.some(cat => cat.name === category.parent_category_name);
        if (!parentExists) {
          errors.push(`Category ${index + 1}: parent_category_name "${category.parent_category_name}" does not exist`);
        }
      }
    });

    return { errors, warnings };
  }

  // Validate workers
  validateWorkers(workers) {
    const errors = [];
    const warnings = [];
    const seenKeys = new Set();

    if (!Array.isArray(workers)) {
      errors.push('Workers must be an array');
      return { errors, warnings };
    }

    workers.forEach((worker, index) => {
      if (!worker || typeof worker !== 'object') {
        errors.push(`Worker ${index + 1}: must be an object`);
        return;
      }

      const name = worker.name ? String(worker.name).trim() : '';
      const role = worker.role ? String(worker.role).trim() : '';
      const email = worker.email ? String(worker.email).trim() : '';
      const workerId = worker.worker_id ? String(worker.worker_id).trim() : '';

      // Require at least a stable identifier: worker_id (preferred) or email (legacy)
      if (!workerId && !email) {
        errors.push(`Worker ${index + 1}: missing worker_id (preferred) or email (legacy)`);
      }

      if (workerId && this.config.VALIDATION_RULES.WORKER_ID_FORMAT && !this.config.VALIDATION_RULES.WORKER_ID_FORMAT.test(workerId)) {
        errors.push(`Worker ${index + 1}: invalid worker_id format`);
      }

      if (email) {
        if (!this.isValidEmail(email)) {
          errors.push(`Worker ${index + 1}: invalid email format`);
        }
      }

      // Require a human label for clarity (name or role)
      if (!name && !role) {
        errors.push(`Worker ${index + 1}: missing name or role`);
      }

      const dedupeKey = workerId ? `id:${workerId}` : `email:${email.toLowerCase()}`;
      if (seenKeys.has(dedupeKey)) {
        errors.push(`Worker ${index + 1}: duplicate ${workerId ? 'worker_id' : 'email'} "${workerId || email}"`);
      }
      seenKeys.add(dedupeKey);

      if (worker.hourly_rate !== undefined && (typeof worker.hourly_rate !== 'number' || worker.hourly_rate < 0)) {
        errors.push(`Worker ${index + 1}: hourly_rate must be a non-negative number`);
      }
    });

    return { errors, warnings };
  }

  // Validate dependencies across all tasks
  validateDependencies(tasks) {
    const errors = [];
    const taskIds = new Set(tasks.map(t => t.task_id).filter(id => id));
    const taskNames = new Set(tasks.map(t => t.task_name).filter(name => name));

    tasks.forEach(task => {
      if (task.dependencies && Array.isArray(task.dependencies)) {
        task.dependencies.forEach(dep => {
          if (dep.predecessor_task_id && !taskIds.has(dep.predecessor_task_id)) {
            errors.push(`Task "${task.task_name}": dependency predecessor_task_id ${dep.predecessor_task_id} does not exist`);
          }
          if (dep.predecessor_task_name && !taskNames.has(dep.predecessor_task_name)) {
            errors.push(`Task "${task.task_name}": dependency predecessor_task_name "${dep.predecessor_task_name}" does not exist`);
          }
        });
      }
    });

    return errors;
  }

  // Utility methods
  isValidDate(dateString) {
    return this.config.VALIDATION_RULES.DATE_FORMAT.test(dateString);
  }

  isValidEmail(email) {
    return this.config.VALIDATION_RULES.EMAIL_FORMAT.test(email);
  }

  normalizeStatus(status) {
    return this.config.STATUS_NORMALIZATION[status.toLowerCase()] || null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemplateValidator;
}
