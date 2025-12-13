# GitHub Task Manager

A lightweight task manager for GitHub Pages with template-driven validation and automation.

## Key Features
- Template-based validation and automation
- GitHub-backed storage (`tasks.json`) and CSV export
- Simple, dependency-free static deployment to GitHub Pages
- Playwright-based UI automation for updating tasks via the web UI

## Quick Commands
- Regenerate state and CSV locally:
  ```bash
  npm run tasks:regenerate-all
  ```
- Start a local static server:
  ```bash
  cd public
  npx http-server -p 8000
  ```
- Run Playwright tests:
  ```bash
  npx playwright test tests/e2e/update-task-via-ui.spec.js --headed
  ```

## 📁 Project Structure

```
public/
├── config/
│   └── template-config.js          # Template validation rules and ENUMs
├── scripts/
│   ├── template-validator.js       # Validation component
│   ├── template-automation.js      # Automation component
│   └── task-manager-app.js         # Main application controller
├── styles/
│   └── task-manager.css            # Enhanced styling with validation UI
├── tasksDB/
│   └── task-database.js            # Database abstraction layer
├── docs/                           # Documentation (future)
├── index.html                      # Main UI with enhanced forms
└── README.md                       # This file

task-templates/
├── starter_project_template.json   # Professional project template
├── starter_project_template.csv    # CSV export of template
└── TEMPLATE_VALIDATION_GUIDE.md    # Comprehensive validation guide
```

## 🛠️ Setup Instructions

### 1. GitHub Repository Setup

1. Create a repository (or use an existing one)
2. Enable GitHub Pages
3. Deploy the `public/` folder

### 2. Configuration Model

The app is configured via `public/config/template-config.js` (repo owner/name/branch, projects list, tasks file path helper, etc.).

For writes, do **not** ship a repo write token to the browser. Use one of:

- **Cloudflare Worker mode (recommended)**: configure a Worker URL and keep the write token server-side.
- **Local development token**: provide your own token via `public/config/github-token.local.js` (gitignored).

## 📋 Template Validation System

### Core Components

#### 1. Template Config (`public/config/template-config.js`)
- Defines valid ENUM values for all fields
- Sets validation rules and defaults
- Configures automation behavior

#### 2. Template Validator (`scripts/template-validator.js`)
- Validates tasks against template rules
- Checks required fields and data types
- Validates dependencies and relationships
- Provides detailed error messages

#### 3. Template Automation (`scripts/template-automation.js`)
- Auto-generates task IDs
- Sets default values
- Normalizes status values
- Suggests task assignments

#### 4. Task Database (`tasksDB/task-database.js`)
- Handles GitHub API interactions
- Manages CSV import/export
- Provides CRUD operations with validation

### Validation Rules

#### Required Fields (per task):
- `task_id` (auto-generated)
- `task_name`
- `description`
- `start_date`
- `end_date`
- `priority`
- `status`
- `estimated_hours`
- `category_name`

#### Valid Status Values:
- `Not Started`, `In Progress`, `On Hold`, `Blocked`, `Completed`, `Cancelled`, `Pending Review`

#### Valid Priority Values:
- `Low`, `Medium`, `High`, `Critical`

#### Date Format:
- ISO 8601: `YYYY-MM-DD`

## 🎯 Using Templates

### Importing a Template

1. Connect to your GitHub repository
2. Click "Import" on any available template
3. Tasks are automatically created with proper validation

### Manual Task Creation

1. Click "+ Add New Task"
2. Fill required fields (marked with *)
3. System auto-validates and shows errors/warnings
4. Save creates task with auto-generated ID

### Template Features

#### Automated Fields:
- **Task ID**: Auto-generated unique integer
- **Created Date**: Current timestamp
- **Creator ID**: Current user or default
- **Status Normalization**: Converts common inputs to valid ENUMs

#### Smart Defaults:
- Status: "Not Started"
- Priority: "Medium"
- Progress: 0%
- Critical Path: false

#### Validation Checks:
- Required field presence
- Data type validation
- Date format and order
- Dependency validity
- Worker assignment format

## 🔧 API Reference

### TaskManagerApp Class

```javascript
const app = new TaskManagerApp();

// Core methods
app.saveConfig()           // Save GitHub configuration
app.loadTasks()            // Load tasks from GitHub
app.saveTasks()            // Save tasks to GitHub
app.createTask(taskData)   // Create new task with validation
app.updateTask(id, data)   // Update existing task
app.deleteTask(id)         // Delete task
app.importTemplate(type)   // Import project template
app.exportToCSV()          // Export tasks to CSV
```

### TemplateValidator Class

```javascript
const validator = new TemplateValidator();

// Validate single task
const result = validator.validate(taskData, 'task');
// result: { isValid: boolean, errors: [], warnings: [] }

// Validate full template
const result = validator.validate(templateData, 'template');
```

### TemplateAutomation Class

```javascript
const automation = new TemplateAutomation();

// Auto-populate task
const populatedTask = automation.autoPopulateTask(taskData);

// Generate task ID
const newId = automation.generateTaskId(existingTasks);

// Validate and fix issues
const { task, issues } = automation.validateAndFix(taskData);
```

## 📊 CSV Format

### Export Format:
```csv
task_id,task_name,description,start_date,end_date,priority,status,progress_percentage,estimated_hours,is_critical_path,tags,category_name,assigned_workers,dependencies,parent_task_id,creator_id,created_date,completed_date,comments,attachments
1,"Define Project Specifications","Finalize requirements...",2025-12-08,2025-12-10,Critical,Not Started,0,16,true,"planning;requirements","Project Setup",,"",,"manager@example.com","2025-12-06T09:00:00Z",, ,
```

### Import Support:
- Automatic field type detection
- Array parsing for tags, workers, dependencies
- Validation during import
- Error reporting for invalid rows

## 🔒 Security & Best Practices

### Token Security:
- Never commit tokens to repository.
- Never inject a repo write token into GitHub Pages (everything under `public/` is public).
- Prefer Worker-based writes where the token stays server-side.

### Data Validation:
- All data validated client-side before GitHub API calls
- Server-side validation through GitHub's constraints
- Comprehensive error messages for user guidance

### Performance:
- Local caching of validation rules
- Efficient GitHub API usage
- Minimal re-renders through targeted updates

## 🐛 Troubleshooting

### Common Issues:

**"Validation failed" errors:**
- Check required fields are filled
- Verify date formats (YYYY-MM-DD)
- Ensure status/priority use valid ENUM values

**"GitHub API error":**
- Verify token has `repo` scope
- Check repository exists and is accessible
- Confirm branch name is correct

**Template import fails:**
- Ensure template JSON is valid
- Check for duplicate task IDs
- Verify all dependencies reference valid tasks

### Debug Mode:
Open browser console to see detailed validation logs and API responses.

## 🚀 Advanced Usage

### Custom Templates:
1. Create JSON following the template schema
2. Include all required fields and valid ENUMs
3. Add to `task-templates/` directory
4. Update template loader in `task-database.js`

### Custom Validation Rules:
Modify `public/config/template-config.js` to add:
- New ENUM values
- Custom validation functions
- Additional required fields

### Integration with External Tools:
- CSV export compatible with Excel/Google Sheets
- JSON format suitable for other project management tools
- GitHub API allows integration with CI/CD pipelines

## 📈 Future Enhancements

- [ ] Gantt chart visualization
- [ ] Kanban board view
- [ ] Calendar integration
- [ ] Team collaboration features
- [ ] Advanced reporting and analytics
- [ ] Mobile app companion
- [ ] Integration with popular PM tools

## 🤝 Contributing

1. Follow the component architecture
2. Add validation for new features
3. Update templates and documentation
4. Test with various template scenarios

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with vanilla JavaScript for maximum compatibility
- Inspired by professional project management methodologies
- Uses GitHub Pages for free, reliable hosting
- Template system based on industry best practices

---

**Built with ❤️ for efficient project management**
