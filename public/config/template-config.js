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

  // Access Control
  // Password required for modifications (create, edit, delete)
  // Reading/viewing tasks is always public
  ACCESS: {
    // GitHub Pages: inject this at deploy-time from a GitHub Secret (not committed).
    // NOTE: This is still client-side only. Anyone can view served JS.
    // See .github/workflows/deploy.yml for how ACCESS_PASSWORD is injected.
    PASSWORD: (typeof ACCESS_PASSWORD !== 'undefined' ? ACCESS_PASSWORD : ''),
    // Session duration in minutes (0 = until page refresh)
    SESSION_DURATION: 30,
    // Allow read-only access without password
    PUBLIC_READ: true
  },

  // GitHub Configuration (Pre-configured for public collaboration)
  // For NLarchive/github-task-manager repository
  GITHUB: {
    // Owner and repo are fixed for this deployment
    OWNER: 'nlarchive',
    REPO: 'github-task-manager',
    // Token is loaded from github-token.js (gitignored) or environment
    // For GitHub Pages, public repos can be read without a token
    TOKEN: (typeof GH_TOKEN !== 'undefined' ? GH_TOKEN : ''),
    BRANCH: 'main',
    // Multi-project TasksDB
    // Each project lives under: public/tasksDB/<projectId>/{tasks.json,tasks.csv,state/,history/}
    TASKS_ROOT: 'public/tasksDB',
    DEFAULT_PROJECT_ID: 'github-task-manager',
    // App can set this at runtime (UI selector). If empty, DEFAULT_PROJECT_ID is used.
    ACTIVE_PROJECT_ID: '',
    PROJECTS: [
      { id: 'github-task-manager', label: 'GitHub Task Manager' },
      { id: 'ai-career-roadmap', label: 'AI Career Roadmap (learn.deeplearning.ai)' }
    ],
    getTasksFile(projectId) {
      const id = (projectId || this.ACTIVE_PROJECT_ID || this.DEFAULT_PROJECT_ID || '').trim();
      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
      return `${this.TASKS_ROOT}/${safeId}/tasks.json`;
    },
    // Default tasks file (app may override at runtime)
    TASKS_FILE: 'public/tasksDB/github-task-manager/tasks.json',
    // Use GitHub Pages base path only when actually hosted under it
    BASE_PATH: (typeof window !== 'undefined' && window.location && window.location.pathname.startsWith('/github-task-manager'))
      ? '/github-task-manager'
      : '',
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
    "Maintenance",

    // Product / research categories (used by additional projects)
    "Discovery",
    "Exploration",
    "Design",
    "Validation",
    "Implementation",
    "Research",
    "UX",
    "Content",
    "Analytics"
  ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TEMPLATE_CONFIG;
}

// Make available globally for browser environment
if (typeof window !== 'undefined') {
  window.TEMPLATE_CONFIG = TEMPLATE_CONFIG;
}
