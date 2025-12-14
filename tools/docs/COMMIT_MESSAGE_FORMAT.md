# TaskDB Commit Message Format

This document describes the machine-readable format for TaskDB commit subjects, enabling downstream tools, dashboards, and automation to parse task change events from Git commit history.

## Format Specification

### Subject Line
```
TaskDB: <action> <id>|<task_name>|<description_or_summary>
```

### Components

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **Prefix** | Literal | Always `TaskDB:` | `TaskDB:` |
| **Action** | Enum | One of: `create`, `update`, `delete` | `create` |
| **ID** | Integer | Numeric task ID (positive) | `15` |
| **Task Name** | String | Sanitized task name (no pipes, newlines; ~50 chars max) | `Secure token config` |
| **Summary** | String | Context-dependent (see below) | `Remove the personal token input section...` |

### Summary Field by Action

- **create**: First 120 characters of task description (sanitized)
- **update**: Comma-separated list of changed field names
- **delete**: Literal string `"deleted"`

## Examples

### Create
```
TaskDB: create 15|Secure token config|Remove the personal token input section from the UI
```
- Numeric ID: `15`
- Name: `Secure token config`
- Summary: first 120 chars of task description

### Update
```
TaskDB: update 7|Fix auth flow|status, priority, progress_percentage
```
- Numeric ID: `7`
- Name: `Fix auth flow`
- Summary: fields that changed (comma-separated)

### Delete
```
TaskDB: delete 3|Old cleanup task|deleted
```
- Numeric ID: `3`
- Name: `Old cleanup task`
- Summary: `deleted` (placeholder)

## Machine Parsing

The format uses **pipe (`|`) as the separator** because pipes are rare in user-generated text and make simple, robust splitting trivial.

### JavaScript Parsing Helper

```javascript
// In TaskDatabase class:
const parsed = db.parseTaskDbCommitSubject(subjectLine);
if (parsed.valid) {
  console.log(parsed.action);   // 'create', 'update', or 'delete'
  console.log(parsed.id);       // numeric task ID
  console.log(parsed.taskName); // sanitized task name
  console.log(parsed.summary);  // description, field list, or 'deleted'
}
```

### Example: Parsing in Your Tool

```javascript
function parseTaskDbSubject(line) {
  // Remove prefix and action
  const match = line.match(/^TaskDB:\s*(\w+)\s+(.+)$/i);
  if (!match) return null;
  
  const [, action, payload] = match;
  const [id, taskName, summary] = payload.split('|').map(s => s.trim());
  
  return {
    action: action.toLowerCase(),
    id: parseInt(id, 10),
    taskName,
    summary
  };
}

const result = parseTaskDbSubject('TaskDB: create 15|Task Name|Description');
// { action: 'create', id: 15, taskName: 'Task Name', summary: 'Description' }
```

## Commit Body

In addition to the structured subject, commit messages include the full **TASKDB_CHANGE_V1** JSON payload:

```
TaskDB: create 15|Secure token config|Remove the personal token input section...

---TASKDB_CHANGE_V1---
{
  "spec": "taskdb.commit.v1",
  "ts": "2025-12-14T...",
  "projectId": "github-task-manager",
  "tasksFile": "public/tasksDB/github-task-manager/tasks.json",
  "artifact": "tasks.json",
  "actor": "user@example.com",
  "events": [
    {
      "action": "create",
      "taskId": "15",
      "task": { ... full task object ... },
      "changes": null
    }
  ]
}
---/TASKDB_CHANGE_V1---
```

This payload contains:
- Full task object(s) involved in the change
- Field-level change diffs (for updates)
- Metadata (actor, timestamp, project, file)

## Use Cases

1. **Commit History Dashboard**: Parse subjects to list recent task changes
2. **Automation**: Extract task ID and action to trigger downstream workflows
3. **Reporting**: Filter commits by action (e.g., all deletes in the last week)
4. **Sync Tools**: Match commit IDs with task objects in the payload for reconciliation
5. **Analytics**: Count creates/updates/deletes over time

## Sanitization Rules

Task names and descriptions are sanitized before inclusion in subjects:

- Newlines (CR/LF) → spaces
- Pipe characters (`|`) → spaces (to preserve separator integrity)
- Multiple consecutive spaces → single space
- Leading/trailing whitespace → trimmed

This ensures subjects remain single-line and machine-parseable even with problematic user input.

## Validation Schema

The `TaskDatabase.parseTaskDbCommitSubject(line)` function includes a full schema for validation:

```javascript
schema = {
  format: 'TaskDB: <action> <id>|<task_name>|<description_or_summary>',
  separator: '|',
  actions: ['create', 'update', 'delete'],
  parts: {
    action: 'one of: create, update, delete',
    id: 'numeric task ID (positive integer)',
    taskName: 'sanitized task name (no pipes, newlines)',
    summary: 'context-dependent (description|fields|deleted)'
  }
}
```
