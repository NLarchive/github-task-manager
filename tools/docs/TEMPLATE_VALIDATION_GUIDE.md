# Template Validation Guide

The `TEMPLATE_VALIDATION_GUIDE.md` complements the JSON template by providing explicit rules and best practices for defining project and task variables. This guide ensures that templates are:

*   **Consistent:** By defining valid ENUM values for `Project Status`, `Task Status`, `Task Priority`, and `Dependency Types`.
*   **Structured:** By specifying the correct `YYYY-MM-DD` ISO 8601 format for all date fields (`start_date`, `end_date`).
*   **Actionable:** By guiding the effective use of `is_critical_path`, `dependencies`, and the `Blocked` status for professional project management.
*   **Validatable:** Through the use of `required_fields` and `optional_fields` arrays, reinforcing their role in template validation and generation.

In summary, this guide ensures that template variables are used correctly and effectively for robust project management, making the template suitable for both automated processing (e.g., database, CSV) and informed generation by an LLM.

## Required Database ENUM Values

### Project Status
Valid values ONLY:
- `Not Started`
- `In Progress`
- `On Hold`
- `Completed`
- `Cancelled`

❌ **Invalid examples:**
- `"planning"` → Use `"Not Started"`
- `"Completed - Description"` → Use `"Completed"`
- `"completed"` → Use `"Completed"` (case-sensitive before normalization)

### Task Status
Valid values ONLY:
- `Not Started`
- `In Progress`
- `On Hold`
- `Blocked`
- `Completed`
- `Cancelled`
- `Pending Review`

### Task Priority
Valid values ONLY:
- `Low`
- `Medium`
- `High`
- `Critical`

### Dependency Types
Valid values ONLY:
- `FS` (Finish-to-Start)
- `SS` (Start-to-Start)
- `FF` (Finish-to-Finish)
- `SF` (Start-to-Finish)

## Template Structure Examples

### 1. Standard Project Template (Flat Structure)

```json
{
  "template_type": "sample_project",
  "version": "1.0",
  "description": "Description of template",
  "project": {
    "name": "Project Name (Required)",
    "description": "Project description",
    "start_date": "2025-11-01",
    "end_date": "2025-12-31",
    "status": "Not Started",
    "budget": 10000.00
  },
  "categories": [
    {
      "name": "Category Name",
      "parent_category_name": null
    }
  ],
  "workers": [
    {
      "name": "Worker Name",
      "email": "worker@example.com",
      "role": "Job Title",
      "skills": ["Skill 1", "Skill 2"],
      "hourly_rate": 50.00
    }
  ],
  "tasks": [
    {
      "task_name": "Task Name (Required)",
      "description": "Task description",
      "start_date": "2025-11-01",
      "end_date": "2025-11-05",
      "priority": "High",
      "status": "Not Started",
      "progress_percentage": 0,
      "estimated_hours": 40,
      "actual_hours": 0,
      "is_critical_path": true,
      "tags": ["tag1", "tag2"],
      "category_name": "Category Name",
      "assigned_workers": [
        {
          "name": "Worker Name",
          "email": "worker@example.com",
          "role": "Job Title"
        }
      ],
      "dependencies": [
        {
          "predecessor_task_name": "Previous Task",
          "type": "FS",
          "lag_days": 0
        }
      ]
    }
  ]
}
```

### 2. Current State Template (Timeline/Subtasks Structure)

```json
{
  "template_type": "current_project_state",
  "version": "1.0",
  "project_name": "Project Name",
  "start_date": "2025-11-01",
  "end_date": "2025-12-31",
  "status": "In Progress",
  "timeline": {
    "phase_key": {
      "phase": "Phase Display Name",
      "start_date": "2025-11-01",
      "end_date": "2025-11-10",
      "status": "Completed",
      "subtasks": {
        "task_key": {
          "task_id": 1,
          "task_name": "Task Name",
          "description": "Task description",
          "status": "Completed",
          "priority": "High",
          "start_date": "2025-11-01",
          "end_date": "2025-11-05",
          "estimated_hours": 40,
          "completion_percentage": 100,
          "dependencies": [1, 2]
        }
      }
    }
  }
}
```

## Required Fields

### Project (Minimum)
- ✅ `name` (string)
- ✅ `start_date` (YYYY-MM-DD format)
- ✅ `end_date` (YYYY-MM-DD format)
- ✅ `status` (valid ENUM value)

### Task (Minimum for Functional Tracking)
For robust tracking, project management systems and LLMs require these fields to create actionable and meaningful tasks:
- ✅ `task_id` (number): **NEW: Critical for stable dependency linking.** Each task must have a unique numerical ID within the project. This ID is immutable and superior to `task_name` for referencing.
- ✅ `task_name` (string): **Critical:** Must be unique within the project for clear identification and human readability.
- ✅ `description` (string): Provides essential context, objectives, and specific instructions for the task. Vital for LLM content generation.
- ✅ `start_date` (YYYY-MM-DD format)
- ✅ `end_date` (YYYY-MM-DD format)
- ✅ `priority` (valid ENUM value)
- ✅ `status` (valid ENUM value)
- ✅ `estimated_hours` (number): Crucial for resource planning, workload management, and project estimation.
- ✅ `category_name` (string): Links the task to an organizational category, ensuring proper categorization and filtering.

### Using `required_fields` and `optional_fields` for Validation
The `starter_project_template.json` includes two arrays that define the schema for validation: `required_fields` and `optional_fields`. When creating or processing a template, these can be used to ensure data integrity:
- **`required_fields`**: Any system processing a template (including an LLM or an import script) must validate that all fields listed here are present and non-empty. This ensures the core integrity of the project data.
- **`optional_fields`**: These fields are recommended for comprehensive project management but are not strictly required for the template to be valid.

This structure provides a clear, self-documenting schema for automated validation.

### Optional but Recommended (for Advanced Tracking and LLM Content Generation)
These fields significantly enhance the utility of the template for detailed project management and provide richer context for LLM generation.
- `project.description`: Detailed overview of the project goals.
- `project.budget`: Financial allocation for the project.
- `tasks[].progress_percentage` (number): Essential for visual progress tracking and reporting. Default to `0`.
- `tasks[].actual_hours` (number): For recording actual effort spent versus estimated. Default to `0`.
- `tasks[].is_critical_path` (boolean): Flag to identify tasks directly impacting project completion. Default to `false`. Explicitly setting this guides project managers to bottlenecks.
- `tasks[].tags` (array of strings): For enhanced filtering, searchability, and flexible categorization beyond hierarchical categories.
- `tasks[].assigned_workers` (array of objects):
    - Details: Each object should contain `{ "name": "Worker Name", "email": "worker@example.com", "role": "Job Title" }`.
    - Purpose: Assign specific workers to tasks for responsibility, workload management, and communication. Consider referencing worker `email` or a `worker_id` for less redundancy if worker details change.
- `tasks[].dependencies` (array of objects):
    - Details: Each object should contain `{ "predecessor_task_id": 123, "type": "FS", "lag_days": 0 }`. (`predecessor_task_id` is preferred over `predecessor_task_name` for robustness).
    - Purpose: Define inter-task relationships for accurate scheduling, identifying bottlenecks, and critical path analysis. `lag_days` provides flexibility for staggered dependencies.
- `categories` (array of objects): For defining a custom set of project categories.
- `workers` (array of objects): For defining a custom pool of project workers and their attributes.

### New Collaboration & Hierarchy Fields (Recommended)
These fields add richer collaboration, traceability, and hierarchical structure to tasks:

- `tasks[].parent_task_id` (number|null): Optional reference to another `task_id` indicating a parent task (sub-task relationship). Use `null` or omit for top-level tasks.
  - Value: integer or `null`. Example: `"parent_task_id": 8` or `"parent_task_id": null`.
  - Purpose: Enables Work Breakdown Structure (WBS) and nested task views.

- `tasks[].creator_id` (string): Email or `worker_id` of the user that created the task.
  - Value: string (email or identifier). Example: `"creator_id": "manager@example.com"`.
  - Purpose: For audit, ownership and traceability when auditing task origin.

- `tasks[].created_date` (ISO 8601 timestamp): When the task was created.
  - Value: ISO 8601 timestamp. Example: `"2025-12-06T10:00:00Z"`.

- `tasks[].completed_date` (ISO 8601 timestamp|null): When the task was completed (if applicable).
  - Value: ISO 8601 timestamp or `null`.

- `tasks[].comments` (array of objects): A chronological list of comment objects for this task.
  - Details: Each comment object: `{ "author": "email", "timestamp": "ISO8601", "text": "Comment text" }`.
  - Purpose: Store discussions, decisions, and context inside the template.

- `tasks[].attachments` (array of objects): Links to files or supporting documents.
  - Details: `{ "filename": "name.pdf", "url": "https://...", "uploaded_by": "email", "uploaded_date": "ISO8601" }`.
  - Purpose: Keep references to specifications, designs, or reports attached to the task.

## Status Normalization

The system now automatically normalizes status values:
- `"completed"` → `"Completed"`
- `"in progress"` → `"In Progress"`
- `"Completed - Additional Info"` → `"Completed"` (strips suffix)
- Invalid values → `"Not Started"` (default)

## Date Format

All dates must use ISO 8601 format:
- ✅ `"2025-11-01"`
- ✅ `"2025-12-31T00:00:00Z"` (will be normalized to YYYY-MM-DD)
- ❌ `"11/01/2025"` (will fail)
- ❌ `"November 1, 2025"` (will fail)

## Dependency References

Dependencies can be specified in multiple ways:

1.  **By task ID** (recommended and most robust):
    ```json
    "dependencies": [
      {
        "predecessor_task_id": 1,
        "type": "FS",
        "lag_days": 0
      }
    ]
    ```

2.  **By task name** (for backward compatibility, or when `task_id` is not available):
    ```json
    "dependencies": [
      {
        "predecessor_task_name": "Previous Task",
        "type": "FS",
        "lag_days": 0
      }
    ]
    ```

3.  **Mixed format** (supported, but prefer `task_id` where possible):
    ```json
    "dependencies": [
      {
        "predecessor_task_id": 1,
        "type": "FS"
      },
      {
        "predecessor_task_name": "Task Name",
        "type": "SS"
      }
    ]
    ```

## CSV Formatting Conventions

When converting the JSON template to CSV (or vice-versa), specific conventions are used to flatten nested data structures:

*   **Array of Strings (`tags`):** Individual tags are joined by a semicolon (`;`).
    *   *JSON Example:* `["planning", "requirements"]`
    *   *CSV Output:* `"planning;requirements"`
*   **Array of Objects (`assigned_workers`):** Each worker object is flattened into a structured string `Name:Email:Role`. Multiple workers are joined by a pipe (`|`). This allows for easier re-parsing into JSON.
    *   *JSON Example:* `[{ "name": "Alice Example", "email": "alice@example.com", "role": "Backend Developer" }, { "name": "Bob Example", "email": "bob@example.com", "role": "Frontend Developer" }]`
    *   *CSV Output:* `"Alice Example:alice@example.com:Backend Developer|Bob Example:bob@example.com:Frontend Developer"`
    *   *Previous CSV Output:* `"Alice Example (Backend Developer) <alice@example.com>"` (single worker only example, difficult to parse back)
*   **Array of Objects (`dependencies`):** Each dependency object is flattened into a string containing `PredecessorTaskID::Type::LagDays`. If `predecessor_task_id` is not present, `PredecessorTaskName` can be used (e.g., `PreviousTaskName::Type::LagDays`). Multiple dependencies are joined by a semicolon (`;`).
    *   *JSON Example:* `[{ "predecessor_task_id": 1, "type": "FS", "lag_days": 0 }]`
    *   *CSV Output:* `"1::FS::0"`
    *   *JSON Example (with name):* `[{ "predecessor_task_name": "Setup Project Repository", "type": "FS", "lag_days": 0 }]`
    *   *CSV Output:* `"Setup Project Repository::FS::0"`
    *   *Note:* The `::` delimiter is specific to separating dependency attributes.

## Testing Your Template

1.  **Validate JSON syntax:**
    ```bash
    php -r "json_decode(file_get_contents('template.json'));"
    ```

2.  **Test import via UI:**
    - Navigate to Dashboard
    - Click "Load Project"
    - Select your template file
    - Check for success toast or error messages

3.  **Verify in multiple views:**
    - ✅ Table view: All tasks visible
    - ✅ Gantt chart: Timeline renders correctly
    - ✅ Kanban board: Tasks in correct status columns
    - ✅ Calendar view: Dates display properly

## Logical Flow & Bottleneck Tracking

Beyond pure syntax, a professional template must represent a realistic project flow. When creating or validating a template, check the following:

-   **Clear Critical Path**: Identify the sequence of tasks that directly impacts the project's completion date. Mark these tasks with `"is_critical_path": true`. A delay in any of these tasks will delay the entire project.
-   **Accurate Dependencies**: Ensure that the `dependencies` array for each task correctly lists all predecessor tasks. Use the appropriate dependency `type` (e.g., `FS` - Finish-to-Start) to model the workflow. Note `lag_days` for flexible scheduling.
-   **Identify Bottlenecks**: A bottleneck is a task (like an API development task) that holds up multiple other tasks. The dependent tasks should be clearly linked.
-   **Use the `Blocked` Status**: For tasks that cannot begin until a dependency is met, set their initial status to `"Blocked"`. This immediately highlights critical dependencies and potential project risks in the management tool.
-   **Prioritize Logically**: Assign `priority` (`Low`, `Medium`, `High`, `Critical`) based on the task's impact on the project timeline and its dependencies, not just its perceived importance. Critical path tasks should generally have `High` or `Critical` priority.
-   **Unique `task_name` and `task_id`**: Each task's `task_name` should be unique. **Crucially, each `task_id` must be a unique, immutable integer identifier within the project.** Use `task_id` as the primary reference for dependencies.

## Template Versioning

To ensure templates can evolve without breaking existing integrations or old project data, implement a clear versioning strategy:

-   **`version` field:** The `version` field in the template (e.g., `"1.1"`) should follow a semantic versioning-like approach (e.g., `MAJOR.MINOR`).
    -   Increment `MINOR` for backward-compatible changes (e.g., adding optional fields, clarifying descriptions).
    -   Increment `MAJOR` for backward-incompatible changes (e.g., removing required fields, significantly altering data structures, changing ENUM values for existing fields).
-   **Documentation:** Always update this `TEMPLATE_VALIDATION_GUIDE.md` when the template schema or conventions change, explicitly noting which template versions these guidelines apply to.
-   **Migration Path:** For `MAJOR` version changes, consider providing a migration guide or script to help users update older templates.

## Common Validation Errors

### Error: "Data truncated for column 'status'"
**Cause:** Invalid status value not in ENUM list
**Fix:** Use exact ENUM values (case-sensitive): `"Not Started"`, `"In Progress"`, etc.

### Error: "Invalid project file: missing tasks array"
**Cause:** No tasks array or timeline structure found
**Fix:** Include `"tasks": [...]` or `"timeline": {...}` with subtasks

### Error: "Unknown column 'dependency_type'"
**Cause:** Database schema mismatch (legacy database)
**Fix:** Use `"type"` field for dependency type, system handles both

### Error: Task dates invalid
**Cause:** Date format not YYYY-MM-DD
**Fix:** Use ISO 8601 date format: `"2025-11-01"`

## Business Template Examples

See complete working examples:
- ✅ `01_TEMPLATES/sample_project.json` - Web development project
- ✅ `01_TEMPLATES/tshirt-store-project.json` - E-commerce store
- ✅ `01_TEMPLATES/online-consultancy-project.json` - Service business
- ✅ `01_TEMPLATES/current_project_state_task_scheduler.json` - Nested timeline

## Template Checklist

Before submitting a new template:

- [x] JSON syntax is valid (no trailing commas, correct quotes)
- [x] Project status uses valid ENUM value
- [x] All task statuses use valid ENUM values
- [x] All priorities use valid ENUM values (`Low`, `Medium`, `High`, `Critical`)
- [x] Dates in YYYY-MM-DD format
- [x] At least 1 task exists
- [x] **Each task has a unique `task_id` (number).**
- [x] Dependencies reference valid `task_id`s or `task_name`s (preferring `task_id`).
- [x] Worker emails are unique (if included)
- [x] Category parent references exist (if using hierarchy)
- [x] Estimated hours are numeric (if included)
- [x] Budget is numeric (if included)
- [x] Template tested in UI (loads successfully)
- [x] **Task `task_name` is unique across all tasks.**
- [x] `description`, `estimated_hours`, `category_name` are included for all tasks (recommended minimum).
- [x] `progress_percentage` and `actual_hours` are initialized (e.g., to 0).
- [x] `is_critical_path` is explicitly set (true/false) for relevant tasks.
- [x] Structure of `assigned_workers` and `dependencies` arrays of objects is correct.
- [x] All `category_name` references in tasks correspond to an existing category.
- [x] All worker `name`/`email` references in `assigned_workers` correspond to an existing worker.
- [x] The `version` field is set appropriately and matches the template's schema.

## Status Mapping Reference

For convenience when creating templates:

| Common Input | Normalized Output |
|-------------|-------------------|
| `planning` | `Not Started` |
| `not started` | `Not Started` |
| `in progress` | `In Progress` |
| `in_progress` | `In Progress` |
| `on hold` | `On Hold` |
| `on_hold` | `On Hold` |
| `completed` | `Completed` |
| `done` | `Not Started` (invalid) |
| `finished` | `Not Started` (invalid) |
| `cancelled` | `Cancelled` |
| `canceled` | `Cancelled` |
| `blocked` | `Blocked` |
| `pending review` | `Pending Review` |
| `pending_review` | `Pending Review` |

**Tip:** Always use the exact ENUM values to avoid normalization overhead.

## Coverage: Top 20 Task Fields (score)
Below is a quick coverage table comparing the guide/template to a standard set of 20 important task-management fields. This helps you quickly see which fields are covered and which were recently added.

| # | Column Name | Present in template / CSV | Notes |
|---:|---|:---:|---|
| 1 | task_id | ✅ | Unique integer id — required
| 2 | task_name | ✅ | Required
| 3 | description | ✅ | Required
| 4 | status | ✅ | Required (ENUM)
| 5 | priority | ✅ | Required (ENUM)
| 6 | assignee_id / assigned_workers | ✅ | Rich object(s) (name,email,role)
| 7 | start_date | ✅ | Required
| 8 | due_date / end_date | ✅ | Required
| 9 | estimated_effort / estimated_hours | ✅ | Required
|10 | actual_effort / actual_hours | ✅ | Optional but present
|11 | progress_percentage | ✅ | Present
|12 | dependencies | ✅ | Present; supports task_id, type, lag_days
|13 | parent_task_id | ✅ | New — supports WBS / sub-tasks
|14 | creator_id | ✅ | New — audit / author tracking
|15 | created_date | ✅ | New — audit timestamp
|16 | completed_date | ✅ | New — completion timestamp
|17 | tags | ✅ | Present
|18 | project_id / project | ✅ | Present via `project` object
|19 | comments | ✅ | New — present as array of comment objects
|20 | attachments | ✅ | New — present as array of attachment objects

Overall score: **20 / 20** — all recommended top-20 fields are present in either `starter_project_template.json` and its CSV export sample.

Recommendation: Consider which of the newly added fields should be promoted from optional to required for your use-case (for example `creator_id` and `created_date` are great required fields if you need full auditing). Also confirm your UI/DB import/export paths honor the CSV flattening conventions for comments and attachments.
