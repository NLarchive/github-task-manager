# Task Database (tasksDB)

This directory contains the task database in both JSON and CSV formats, managed through the web UI.

## Files

### tasks.json
- **Format**: JSON (JavaScript Object Notation)
- **Purpose**: Primary database format with full schema support
- **Usage**: Loaded by the application for all task operations
- **Features**:
  - Complete task objects with all fields
  - Nested objects for workers, comments, attachments, dependencies
  - Full project metadata and categories
  - Suitable for complex task relationships

### tasks.csv
- **Format**: CSV (Comma-Separated Values)
- **Purpose**: Tabular view of tasks for spreadsheet compatibility
- **Usage**: Export/import for data analysis and reporting
- **Features**:
  - Flattened task data for easy viewing
  - Compatible with Excel, Google Sheets, and other spreadsheet tools
  - Task summary for quick reference

### history/
- **Format**: JSON/CSV snapshots
- **Purpose**: Immutable archives of older task databases (e.g., legacy repo-root `tasks.json`)
- **Usage**: Not loaded by the app at runtime; kept for audit/history and potential future migration

## Data Synchronization

`tasks.json` is the source of truth.

- The UI reads/writes `tasks.json`.
- `tasks.csv` and `state/` files are derived artifacts generated from `tasks.json`.
- Derived artifacts are intentionally ignored by git to reduce merge conflicts.
  - They may still be generated locally (for testing) and/or during CI before deploying GitHub Pages.

## Adding Tasks Through UI

When you add a task through the web application:

1. Task data is validated against the template schema
2. Auto-populated fields include:
   - `task_id` (auto-incremented)
   - `created_date` (current timestamp)
   - `creator_id` (current user)
3. The JSON file is updated in memory
4. Changes are persisted to the repository via GitHub API
5. CSV is generated from the latest JSON state

## Manual Updates

If updating these files manually:

### JSON
```json
{
  "project": { ... },
  "categories": [ ... ],
  "workers": [ ... ],
  "tasks": [
    {
      "task_id": 1,
      "task_name": "Example Task",
      "status": "Not Started",
      ...
    }
  ]
}
```

### CSV
- One task per row
- Headers match the JSON field names
- All required fields must be populated
- Use empty strings for null/optional fields

## Schema Validation

All tasks must conform to the template validation schema defined in:
- `/public/config/template-config.js`
- `/task-templates/TEMPLATE_VALIDATION_GUIDE.md`

## Backup & Recovery

The complete task history is maintained in git commits:
- View history: `git log public/tasksDB/`
- Restore previous version: `git checkout <commit> public/tasksDB/github-task-manager/tasks.json`

## Integration Points

- **Task Manager App**: Loads and updates `tasks.json`
- **Template Validator**: Validates new tasks against schema
- **Template Automation**: Auto-populates standard fields
- **Task Database**: Persists data to GitHub repository

## Best Practices

1. **Always validate** through the UI form
2. **Use version control** - never directly edit production data
3. **Treat `tasks.json` as canonical** - avoid editing derived files.
4. **Regenerate derived artifacts for testing** - use `npm run tasks:regenerate-all`.
5. **Document changes** - commit messages explain updates.

## Future Enhancements

- [ ] Real-time synchronization between JSON and CSV
- [ ] Multiple export formats (XML, YAML)
- [ ] Advanced filtering and reporting views
- [ ] Data migration tools for legacy systems
