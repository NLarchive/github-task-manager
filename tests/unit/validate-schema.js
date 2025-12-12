/**
 * Schema Validation Script
 * Validates tasks.json against the template schema
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}📋 Schema Validation${colors.reset}`);
console.log('='.repeat(50));

// Load tasks database JSON (deployed under /public)
const tasksPath = path.join(__dirname, '../../public/tasksDB/tasks.json');
let tasks;

try {
  const content = fs.readFileSync(tasksPath, 'utf8');
  tasks = JSON.parse(content);
  console.log(`${colors.green}✓${colors.reset} tasks.json parsed successfully`);
} catch (error) {
  console.error(`${colors.red}✗ Failed to parse tasks.json: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Validation functions
const errors = [];
const warnings = [];

function validateRequired(obj, fields, prefix = '') {
  fields.forEach(field => {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      errors.push(`Missing required field: ${prefix}${field}`);
    }
  });
}

function validateEnum(value, validValues, fieldName) {
  if (value && !validValues.includes(value)) {
    errors.push(`Invalid ${fieldName}: "${value}". Valid values: ${validValues.join(', ')}`);
  }
}

function validateDateFormat(dateStr, fieldName) {
  if (dateStr && !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    errors.push(`Invalid date format for ${fieldName}: "${dateStr}". Expected YYYY-MM-DD`);
  }
}

// Valid enum values
const PROJECT_STATUS = ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
const TASK_STATUS = ['Not Started', 'In Progress', 'On Hold', 'Blocked', 'Completed', 'Cancelled', 'Pending Review'];
const TASK_PRIORITY = ['Low', 'Medium', 'High', 'Critical'];
const DEPENDENCY_TYPES = ['FS', 'SS', 'FF', 'SF'];

// Validate project
console.log(`\n${colors.cyan}Validating project...${colors.reset}`);
if (tasks.project) {
  validateRequired(tasks.project, ['name', 'start_date', 'end_date', 'status'], 'project.');
  validateEnum(tasks.project.status, PROJECT_STATUS, 'project.status');
  validateDateFormat(tasks.project.start_date, 'project.start_date');
  validateDateFormat(tasks.project.end_date, 'project.end_date');
  
  if (tasks.project.start_date && tasks.project.end_date) {
    if (tasks.project.start_date > tasks.project.end_date) {
      errors.push('Project start_date is after end_date');
    }
  }
} else {
  errors.push('Missing project object');
}

// Validate tasks
console.log(`${colors.cyan}Validating tasks...${colors.reset}`);
if (tasks.tasks && Array.isArray(tasks.tasks)) {
  const taskIds = new Set();
  const taskNames = new Set();
  
  tasks.tasks.forEach((task, index) => {
    const prefix = `tasks[${index}].`;
    
    // Required fields
    validateRequired(task, [
      'task_id', 'task_name', 'description', 
      'start_date', 'end_date', 'priority', 
      'status', 'estimated_hours', 'category_name'
    ], prefix);
    
    // Enum validations
    validateEnum(task.status, TASK_STATUS, `${prefix}status`);
    validateEnum(task.priority, TASK_PRIORITY, `${prefix}priority`);
    
    // Date validations
    validateDateFormat(task.start_date, `${prefix}start_date`);
    validateDateFormat(task.end_date, `${prefix}end_date`);
    
    if (task.start_date && task.end_date && task.start_date > task.end_date) {
      errors.push(`${prefix}start_date is after end_date`);
    }
    
    // Unique task_id
    if (task.task_id) {
      if (taskIds.has(task.task_id)) {
        errors.push(`Duplicate task_id: ${task.task_id}`);
      }
      taskIds.add(task.task_id);
      
      if (typeof task.task_id !== 'number' || task.task_id < 1) {
        errors.push(`${prefix}task_id must be a positive integer`);
      }
    }
    
    // Unique task_name
    if (task.task_name) {
      if (taskNames.has(task.task_name)) {
        warnings.push(`Duplicate task_name: "${task.task_name}"`);
      }
      taskNames.add(task.task_name);
    }
    
    // Validate estimated_hours
    if (task.estimated_hours !== undefined) {
      if (typeof task.estimated_hours !== 'number' || task.estimated_hours < 0) {
        errors.push(`${prefix}estimated_hours must be a non-negative number`);
      }
    }
    
    // Validate progress_percentage
    if (task.progress_percentage !== undefined) {
      if (typeof task.progress_percentage !== 'number' || 
          task.progress_percentage < 0 || 
          task.progress_percentage > 100) {
        errors.push(`${prefix}progress_percentage must be between 0 and 100`);
      }
    }
    
    // Validate dependencies
    if (task.dependencies && Array.isArray(task.dependencies)) {
      task.dependencies.forEach((dep, depIndex) => {
        if (dep.predecessor_task_id && !taskIds.has(dep.predecessor_task_id)) {
          // Check if the dependency exists (might be declared later)
          const exists = tasks.tasks.some(t => t.task_id === dep.predecessor_task_id);
          if (!exists) {
            warnings.push(`${prefix}dependencies[${depIndex}] references non-existent task_id: ${dep.predecessor_task_id}`);
          }
        }
        if (dep.type) {
          validateEnum(dep.type, DEPENDENCY_TYPES, `${prefix}dependencies[${depIndex}].type`);
        }
      });
    }
    
    // Check for circular dependency (self-reference)
    if (task.parent_task_id && task.parent_task_id === task.task_id) {
      errors.push(`${prefix}parent_task_id cannot reference itself`);
    }
  });
  
  console.log(`  Found ${tasks.tasks.length} tasks`);
} else {
  errors.push('Missing or invalid tasks array');
}

// Print results
console.log('\n' + '='.repeat(50));

if (errors.length > 0) {
  console.log(`${colors.red}❌ Validation Errors (${errors.length}):${colors.reset}`);
  errors.forEach(err => console.log(`  ${colors.red}•${colors.reset} ${err}`));
}

if (warnings.length > 0) {
  console.log(`${colors.yellow}⚠ Warnings (${warnings.length}):${colors.reset}`);
  warnings.forEach(warn => console.log(`  ${colors.yellow}•${colors.reset} ${warn}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log(`${colors.green}✅ All validations passed!${colors.reset}`);
  console.log(`  Project: ${tasks.project.name}`);
  console.log(`  Tasks: ${tasks.tasks.length}`);
  console.log(`  Status: ${tasks.project.status}`);
}

// Exit with error code if there are errors
if (errors.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
