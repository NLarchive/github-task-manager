// Template Validation Configuration
// Based on TEMPLATE_VALIDATION_GUIDE.md and starter_project_template.json

const TEMPLATE_CONFIG = {
  version: "1.3",
  template_type: "project_task_template",

  // Field Categories for Form Generation
  FIELD_CATEGORIES: {
    // Fields that are automatically generated - user doesn't input these
    AUTOMATIC: [
      "task_id",
      "created_date",
      "creator_id",
      "completed_date"
    ],
    // Fields that user MUST fill in the form
    REQUIRED_INPUT: [
      "task_name",
      "description",
      "start_date",
      "end_date",
      "priority",
      "status",
      "estimated_hours",
      "category_name"
    ],
    // Fields that user can optionally fill
    OPTIONAL_INPUT: [
      "progress_percentage",
      "actual_hours",
      "is_critical_path",
      "tags",
      "assigned_workers",
      "parent_task_id",
      "dependencies",
      "comments",
      "attachments"
    ]
  },

  // ENUM Values from validation guide
  ENUMS: {
    PROJECT_STATUS: [
      "Not Started",
      "In Progress",
      "On Hold",
      "Completed",
      "Cancelled"
    ],

    TASK_STATUS: [
      "Not Started",
      "In Progress",
      "On Hold",
      "Blocked",
      "Completed",
      "Cancelled",
      "Pending Review"
    ],

    TASK_PRIORITY: [
      "Low",
      "Medium",
      "High",
      "Critical"
    ],

    DEPENDENCY_TYPES: [
      "FS", // Finish-to-Start
      "SS", // Start-to-Start
      "FF", // Finish-to-Finish
      "SF"  // Start-to-Finish
    ]
  },

  // Required fields for validation
  REQUIRED_FIELDS: {
    PROJECT: [
      "name",
      "start_date",
      "end_date",
      "status"
    ],

    TASK: [
      "task_id",
      "task_name",
      "description",
      "start_date",
      "end_date",
      "priority",
      "status",
      "estimated_hours",
      "category_name"
    ]
  },

  // Optional but recommended fields
  OPTIONAL_FIELDS: {
    PROJECT: [
      "description",
      "budget"
    ],

    TASK: [
      "progress_percentage",
      "actual_hours",
      "is_critical_path",
      "tags",
      "assigned_workers",
      "parent_task_id",
      "creator_id",
      "created_date",
      "completed_date",
      "comments",
      "attachments",
      "dependencies"
    ]
  },

  // Default values for automation
  DEFAULTS: {
    TASK: {
      status: "Not Started",
      priority: "Medium",
      progress_percentage: 0,
      actual_hours: 0,
      is_critical_path: false,
      assigned_workers: [],
      dependencies: [],
      comments: [],
      attachments: [],
      tags: [],
      parent_task_id: null,
      completed_date: null
    },

    PROJECT: {
      status: "Not Started",
      budget: 0
    }
  },

  // Validation rules
  VALIDATION_RULES: {
    DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
    EMAIL_FORMAT: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    TASK_ID_PATTERN: /^[1-9]\d*$/, // Positive integers only
    ESTIMATED_HOURS_MIN: 0,
    PROGRESS_PERCENTAGE_RANGE: [0, 100]
  },

  // Status normalization mapping
  STATUS_NORMALIZATION: {
    "planning": "Not Started",
    "not started": "Not Started",
    "in progress": "In Progress",
    "in_progress": "In Progress",
    "on hold": "On Hold",
    "on_hold": "On Hold",
    "completed": "Completed",
    "done": "Completed",
    "finished": "Completed",
    "cancelled": "Cancelled",
    "canceled": "Cancelled",
    "blocked": "Blocked",
    "pending review": "Pending Review",
    "pending_review": "Pending Review"
  },

  // Automation settings
  AUTOMATION: {
    AUTO_GENERATE_IDS: true,
    AUTO_SET_CREATED_DATE: true,
    AUTO_SET_CREATOR_ID: true,
    DEFAULT_CREATOR_ID: "system@example.com",
    AUTO_NORMALIZE_STATUSES: true,
    AUTO_VALIDATE_DEPENDENCIES: true
  },

  // GitHub Configuration (Pre-configured for public collaboration)
  // For NLarchive/github-task-manager repository
  GITHUB: {
    // Owner and repo are fixed for this deployment
    OWNER: 'NLarchive',
    REPO: 'github-task-manager',
    // Token is loaded from github-token.js (gitignored) or environment
    // For GitHub Pages, we can load public repos without token
    TOKEN: (typeof GH_TOKEN !== 'undefined' ? GH_TOKEN : 'public-access'),
    BRANCH: 'main',
    TASKS_FILE: 'tasksDB/tasks.json',
    BASE_PATH: '/github-task-manager',
    // Allow app to work in read-only mode for public repos
    ALLOW_PUBLIC_READ: true
  },

  // Categories available for tasks
  CATEGORIES: [
    "Project Setup",
    "Backend Development",
    "Frontend Development",
    "Testing",
    "Deployment",
    "Documentation",
    "Retrospective",
    "Bug Fix",
    "Feature",
    "Maintenance"
  ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TEMPLATE_CONFIG;
}
