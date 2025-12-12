// Main Application Controller
// Integrates all components for the GitHub Task Manager

class TaskManagerApp {
    constructor() {
        // Defer config loading until initialize() to ensure TEMPLATE_CONFIG is available
        this.config = null;

        this.database = null;
        this.validator = null;
        this.automation = null;
        this.githubApi = null;

        this.tasks = [];
        this.filteredTasks = [];
        this.currentUser = null;
    }

    // Initialize the application
    async initialize() {
        // Load config now that all scripts should be loaded
        this.loadConfig();

        this.setupEventListeners();
        this.setupStatCardFilters();
        this.loadUserName();

        // Setup GitHub API with pre-configured settings
        if (this.isConfigured()) {
            this.githubApi = new GitHubAPI(this.config);
            this.database = new TaskDatabase(this.githubApi, this.validator, this.automation);
            await this.showTaskManager();
            await this.loadTasks();
        } else {
            console.error('GitHub configuration missing. Please check TEMPLATE_CONFIG.GITHUB settings.');
            this.showConfigError();
        }
    }

    loadConfig() {
        // Use pre-configured GitHub settings from template-config
        const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
        if (!templateConfig || !templateConfig.GITHUB) {
            throw new Error('TEMPLATE_CONFIG.GITHUB not available. Check script loading order.');
        }

        this.config = {
            owner: templateConfig.GITHUB.OWNER,
            repo: templateConfig.GITHUB.REPO,
            token: templateConfig.GITHUB.TOKEN,
            branch: templateConfig.GITHUB.BRANCH,
            tasksFile: templateConfig.GITHUB.TASKS_FILE
        };

        // Initialize components with config
        this.validator = new TemplateValidator(templateConfig);
        this.automation = new TemplateAutomation(templateConfig);
    }

    // User Management
    loadUserName() {
        const saved = localStorage.getItem('taskManagerUserName');
        if (saved) {
            this.currentUser = saved;
            const userInput = document.getElementById('userName');
            if (userInput) {
                userInput.value = saved;
            }
        }
    }

    saveUserName(name) {
        this.currentUser = name;
        localStorage.setItem('taskManagerUserName', name);
    }

    isConfigured() {
        // For GitHub Pages deployment, we can use public repos without auth token
        return this.config.owner && this.config.repo;
    }

    showConfigError() {
        const mainElement = document.querySelector('main');
        mainElement.innerHTML = `
            <div class="error-message" style="background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; padding: 30px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #dc3545; margin-top: 0;">Configuration Error</h2>
                <p>GitHub token and repository configuration are missing. For GitHub Pages deployment, ensure environment variables are set:</p>
                <ul>
                    <li><code>REACT_APP_GITHUB_OWNER</code></li>
                    <li><code>REACT_APP_GITHUB_REPO</code></li>
                    <li><code>REACT_APP_GH_TOKEN</code></li>
                    <li><code>REACT_APP_GITHUB_BRANCH</code> (optional, defaults to 'main')</li>
                </ul>
                <p>Check GitHub Actions secrets and deployment configuration.</p>
            </div>
        `;
    }

    async showTaskManager() {
        const taskManager = document.getElementById('taskManager');
        if (taskManager) {
            taskManager.style.display = 'block';
        }
        
        const repoInfo = document.getElementById('repoInfo');
        if (repoInfo) {
            repoInfo.textContent = `Repository: ${this.config.owner}/${this.config.repo} (${this.config.branch})`;
        }
    }

    // Task Management
    async loadTasks() {
        if (!this.database) return;

        this.showLoading();
        try {
            const result = await this.database.loadTasks();
            this.tasks = this.database.tasks;
            this.filteredTasks = [...this.tasks];
            this.renderTasks();
            this.updateStats();
            this.showToast('Tasks loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showToast('Error loading tasks: ' + error.message, 'error');
            this.tasks = [];
            this.filteredTasks = [];
            this.renderTasks();
        } finally {
            this.hideLoading();
        }
    }

    async saveTasks() {
        if (!this.database) return;

        this.showLoading();
        try {
            const result = await this.database.saveTasks();
            const source = result.source === 'github'
                ? 'to GitHub'
                : (result.source === 'local-disk' ? 'locally (disk)' : 'locally');
            this.showToast(`Tasks saved successfully ${source}`, 'success');
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showToast('Error saving tasks: ' + error.message, 'error');
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredTasks.length === 0) {
            tasksList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tasksList.innerHTML = this.filteredTasks.map(task => `
            <div class="task-card" onclick="app.editTask('${task.task_id || task.id}')">
                <div class="task-header" onclick="app.editTask('${task.task_id || task.id}')">
                    <div>
                        <h3 class="task-title">${this.escapeHtml(task.task_name || task.title)}</h3>
                        <div class="task-meta">
                            <span class="badge badge-status-${(task.status || '').replace(/ /g, '-').toLowerCase()}">${(task.status || '').replace(/-/g, ' ')}</span>
                            <span class="badge badge-priority-${task.priority || 'medium'}">${task.priority || 'medium'}</span>
                            ${task.is_critical_path ? '<span class="badge" style="background: rgba(220, 53, 69, 0.2); color: var(--danger-color);">Critical Path</span>' : ''}
                        </div>
                    </div>
                </div>
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="task-footer">
                    <div class="task-info">
                        ${task.assigned_workers && task.assigned_workers.length > 0 ? `<span>👤 ${task.assigned_workers.map(w => w.name).join(', ')}</span>` : ''}
                        ${task.end_date ? `<span>📅 ${task.end_date}</span>` : ''}
                        ${task.estimated_hours ? `<span>⏱️ ${task.estimated_hours}h</span>` : ''}
                        <span>🕐 ${new Date(task.created_date || task.createdAt).toLocaleDateString()}</span>
                    </div>
                    ${task.tags && task.tags.length > 0 ? `
                        <div class="task-tags">
                            ${task.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="task-actions" onclick="event.stopPropagation()">
                    <button class="btn-secondary" onclick="app.editTask('${task.task_id || task.id}')">Edit</button>
                    <button class="btn-danger" onclick="app.deleteTask('${task.task_id || task.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const stats = this.database.getStatistics();
        document.getElementById('totalTasks').textContent = stats.total_tasks || 0;
        document.getElementById('todoTasks').textContent = (stats.tasks_by_status && stats.tasks_by_status['Not Started']) || 0;
        document.getElementById('inProgressTasks').textContent = (stats.tasks_by_status && stats.tasks_by_status['In Progress']) || 0;
        document.getElementById('doneTasks').textContent = (stats.tasks_by_status && stats.tasks_by_status['Completed']) || 0;
    }

    setActiveStatCard(statusValue) {
        const cards = Array.from(document.querySelectorAll('.stat-card[data-status]'));
        cards.forEach(card => card.classList.remove('active'));
        const match = cards.find(card => (card.dataset.status || '') === (statusValue || 'all'));
        if (match) match.classList.add('active');
    }

    setupStatCardFilters() {
        const cards = Array.from(document.querySelectorAll('.stat-card[data-status]'));
        if (cards.length === 0) return;

        const activate = (status) => {
            const filterStatus = document.getElementById('filterStatus');
            if (!filterStatus) return;

            const nextStatus = status || 'all';
            const isSame = filterStatus.value === nextStatus;
            filterStatus.value = isSame ? 'all' : nextStatus;
            this.filterTasks();
        };

        cards.forEach(card => {
            card.addEventListener('click', () => activate(card.dataset.status));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activate(card.dataset.status);
                }
            });
        });

        const current = document.getElementById('filterStatus')?.value || 'all';
        this.setActiveStatCard(current);
    }

    filterTasks() {
        const statusFilter = document.getElementById('filterStatus').value;
        const priorityFilter = document.getElementById('filterPriority').value;

        this.filteredTasks = this.database.getTasks({
            status: statusFilter === 'all' ? null : statusFilter,
            priority: priorityFilter === 'all' ? null : priorityFilter
        });

        this.renderTasks();
        this.setActiveStatCard(statusFilter);
    }

    // Modal Functions
    showAddTaskModal() {
        const modal = document.getElementById('taskModal');
        if (!modal) {
            console.error('Modal element not found!');
            return;
        }
        document.getElementById('modalTitle').textContent = 'Add New Task';
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        this.populateFormWithDefaults();
        modal.style.display = 'block';
        // Force visibility check
        setTimeout(() => {
            if (modal.offsetParent === null) {
                modal.style.display = 'block';
            }
        }, 100);
    }

    editTask(taskId) {
        const task = this.database.getTask(taskId);
        if (!task) {
            console.error('Task not found:', taskId);
            return;
        }

        const modal = document.getElementById('taskModal');
        if (!modal) {
            console.error('Modal element not found!');
            return;
        }

        document.getElementById('modalTitle').textContent = 'Edit Task';
        this.populateFormWithTask(task);
        modal.style.display = 'block';
        
        // Force visibility check
        setTimeout(() => {
            if (modal.offsetParent === null) {
                modal.style.display = 'block';
            }
        }, 100);
    }

    populateFormWithDefaults() {
        // Set default values based on template
        document.getElementById('taskStatus').value = this.automation.config.DEFAULTS.TASK.status;
        document.getElementById('taskPriority').value = this.automation.config.DEFAULTS.TASK.priority;
        document.getElementById('taskProgress').value = this.automation.config.DEFAULTS.TASK.progress_percentage;
        document.getElementById('taskEstimatedHours').value = 8; // Default 1 day

        // Clear automatic fields for new tasks
        document.getElementById('displayTaskId').textContent = '--';
        document.getElementById('displayCreatedDate').textContent = '--';
        document.getElementById('displayCreatorId').textContent = '--';
        document.getElementById('displayCompletedDate').textContent = '--';
    }

    populateFormWithTask(task) {
        document.getElementById('taskId').value = task.task_id || task.id;
        document.getElementById('taskName').value = task.task_name || task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskStartDate').value = task.start_date || '';
        document.getElementById('taskEndDate').value = task.end_date || task.dueDate || '';
        document.getElementById('taskProgress').value = task.progress_percentage || task.progress || 0;
        document.getElementById('taskEstimatedHours').value = task.estimated_hours || '';
        document.getElementById('taskActualHours').value = task.actual_hours || '';
        document.getElementById('taskCategory').value = task.category_name || '';
        document.getElementById('taskTags').value = task.tags ? task.tags.join(', ') : '';
        document.getElementById('taskCriticalPath').checked = task.is_critical_path || false;
        document.getElementById('parentTaskId').value = task.parent_task_id || '';

        // Handle assigned workers
        if (task.assigned_workers && task.assigned_workers.length > 0) {
            document.getElementById('taskAssignedWorkers').value = task.assigned_workers
                .map(w => w.email || w.name).join(', ');
        } else {
            document.getElementById('taskAssignedWorkers').value = '';
        }

        // Handle dependencies
        if (task.dependencies && task.dependencies.length > 0) {
            const depsStr = task.dependencies
                .map(d => `${d.predecessor_task_id}: ${d.type}`).join('\n');
            document.getElementById('taskDependencies').value = depsStr;
        } else {
            document.getElementById('taskDependencies').value = '';
        }

        // Populate automatic fields
        document.getElementById('displayTaskId').textContent = task.task_id || task.id || '--';
        document.getElementById('displayCreatedDate').textContent = task.created_date ? new Date(task.created_date).toLocaleString() : '--';
        document.getElementById('displayCreatorId').textContent = task.creator_id || '--';
        document.getElementById('displayCompletedDate').textContent = task.completed_date ? new Date(task.completed_date).toLocaleString() : '--';
    }

    closeModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.clearValidationMessages();
        const form = document.getElementById('taskForm');
        if (form) {
            form.reset();
        }
    }

    async saveTask(event) {
        event.preventDefault();

        const formData = this.getFormData();
        const isNewTask = !formData.task_id;

        // For new tasks, skip pre-validation since automation will populate required fields
        // Validation happens after createTask with the fully populated task
        if (!isNewTask) {
            // For existing tasks, validate before updating
            const validation = this.validator.validate(formData, 'task');
            if (!validation.isValid) {
                this.showValidationMessages(validation.errors, validation.warnings);
                return;
            }
        }

        this.clearValidationMessages();

        const result = isNewTask
            ? this.database.createTask(formData, this.currentUser)
            : this.database.updateTask(formData.task_id, { ...formData, task_id: undefined });

        if (!result.success) {
            this.showValidationMessages(result.errors || [result.error], []);
            return;
        }

        try {
            await this.saveTasks();
            this.filteredTasks = [...this.database.tasks];
            this.renderTasks();
            this.updateStats();
            this.closeModal();
        } catch (error) {
            // Error already shown in saveTasks
        }
    }

    getFormData() {
        // Save user name if provided
        const userNameInput = document.getElementById('userName');
        if (userNameInput && userNameInput.value.trim()) {
            this.saveUserName(userNameInput.value.trim());
        }

        // Parse dependencies
        const depsText = document.getElementById('taskDependencies').value.trim();
        const dependencies = this.parseDependencies(depsText);

        const rawTaskId = (document.getElementById('taskId').value || '').trim();
        const parsedTaskId = rawTaskId ? parseInt(rawTaskId, 10) : null;

        return {
            task_id: Number.isFinite(parsedTaskId) ? parsedTaskId : null,
            task_name: document.getElementById('taskName').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            status: document.getElementById('taskStatus').value,
            priority: document.getElementById('taskPriority').value,
            start_date: document.getElementById('taskStartDate').value,
            end_date: document.getElementById('taskEndDate').value,
            progress_percentage: parseInt(document.getElementById('taskProgress').value) || 0,
            estimated_hours: parseFloat(document.getElementById('taskEstimatedHours').value) || 0,
            actual_hours: parseFloat(document.getElementById('taskActualHours').value) || 0,
            category_name: document.getElementById('taskCategory').value.trim(),
            tags: document.getElementById('taskTags').value.split(',').map(t => t.trim()).filter(t => t),
            is_critical_path: document.getElementById('taskCriticalPath')?.checked || false,
            assigned_workers: this.parseAssignedWorkers(document.getElementById('taskAssignedWorkers').value),
            parent_task_id: this.parseParentTaskId(document.getElementById('parentTaskId').value),
            dependencies: dependencies
        };
    }

    parseAssignedWorkers(input) {
        if (!input.trim()) return [];
        return input.split(',').map(w => {
            const trimmed = w.trim();
            return {
                name: trimmed,
                email: trimmed.includes('@') ? trimmed : '',
                role: 'Collaborator'
            };
        });
    }

    parseDependencies(input) {
        if (!input.trim()) return [];
        const dependencies = [];
        const lines = input.split('\n');
        
        lines.forEach(line => {
            const match = line.match(/(\d+)\s*:\s*([A-Z]{2})/);
            if (match) {
                dependencies.push({
                    predecessor_task_id: parseInt(match[1]),
                    type: match[2],
                    lag_days: 0
                });
            }
        });

        return dependencies;
    }

    parseParentTaskId(value) {
        const parsed = parseInt(value);
        return parsed > 0 ? parsed : null;
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        const result = this.database.deleteTask(taskId);
        if (!result.success) {
            this.showToast('Error deleting task: ' + result.error, 'error');
            return;
        }

        try {
            await this.saveTasks();
            this.filteredTasks = [...this.database.tasks];
            this.renderTasks();
            this.updateStats();
        } catch (error) {
            // Reload to restore state
            await this.loadTasks();
        }
    }

    // Template Management
    updateTemplateUI() {
        const templateSection = document.getElementById('templateSection');
        if (!templateSection) return;

        const templates = this.database.templates;
        let html = '<h4>Available Templates:</h4>';

        if (templates.length === 0) {
            html += '<p>No templates available</p>';
        } else {
            templates.forEach(template => {
                html += `
                    <div class="template-item">
                        <strong>${template.template_type || 'Unknown'}</strong>
                        <p>${template.description || 'No description'}</p>
                        <button onclick="app.importTemplate('${template.template_type}')" class="btn-primary">Import</button>
                    </div>
                `;
            });
        }

        templateSection.innerHTML = html;
    }

    async importTemplate(templateType) {
        const template = this.database.templates.find(t => t.template_type === templateType);
        if (!template) {
            this.showToast('Template not found', 'error');
            return;
        }

        this.showLoading();
        try {
            const result = await this.database.importFromTemplate(template, {
                creatorId: this.currentUser,
                replaceExisting: false
            });

            if (result.success) {
                this.tasks = this.database.tasks;
                this.filteredTasks = [...this.tasks];
                this.renderTasks();
                this.updateStats();
                this.showToast(`Imported ${result.importedCount} tasks from template`, 'success');
            } else {
                this.showToast('Error importing template: ' + result.error, 'error');
            }
        } catch (error) {
            this.showToast('Error importing template: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Export Functions
    exportToCSV() {
        try {
            if (!this.database) {
                this.showToast('Database not initialized', 'error');
                return;
            }
            
            const csv = this.database.exportToCSV();
            if (!csv) {
                this.showToast('No tasks to export', 'warning');
                return;
            }
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `tasks-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Revoke URL to free memory
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            this.showToast('Tasks exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed: ' + error.message, 'error');
        }
    }

    // Validation UI
    showValidationMessages(errors, warnings) {
        const container = document.getElementById('validationMessages');
        if (!container) return;

        container.innerHTML = '';

        errors.forEach(error => {
            container.innerHTML += `<div class="validation-error">${error}</div>`;
        });

        warnings.forEach(warning => {
            container.innerHTML += `<div class="validation-warning">${warning}</div>`;
        });
    }

    clearValidationMessages() {
        const container = document.getElementById('validationMessages');
        if (container) container.innerHTML = '';
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Event Listeners
    setupEventListeners() {
        // Form submissions
        document.getElementById('taskForm').addEventListener('submit', (e) => this.saveTask(e));

        // User name changes
        const userNameInput = document.getElementById('userName');
        if (userNameInput) {
            userNameInput.addEventListener('change', (e) => {
                if (e.target.value.trim()) {
                    this.saveUserName(e.target.value.trim());
                }
            });
        }

        // Filter changes
        document.getElementById('filterStatus').addEventListener('change', () => this.filterTasks());
        document.getElementById('filterPriority').addEventListener('change', () => this.filterTasks());

        // Modal close
        window.onclick = (event) => {
            const modal = document.getElementById('taskModal');
            if (event.target === modal) {
                this.closeModal();
            }
        };
    }
}

// GitHub API Wrapper
class GitHubAPI {
    constructor(config) {
        this.config = config;
    }

    async request(endpoint, method = 'GET', body = null) {
        const url = `https://api.github.com${endpoint}`;
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        // Only add auth header if we have a real token (not 'public-access')
        if (this.config.token && this.config.token !== 'public-access') {
            headers['Authorization'] = `token ${this.config.token}`;
        }

        const options = { method, headers };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        return await response.json();
    }

    async getFileContent(path) {
        try {
            const data = await this.request(`/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`);
            const content = atob(data.content);
            return { content, sha: data.sha };
        } catch (error) {
            if (error.message.includes('Not Found')) {
                return { content: '[]', sha: null };
            }
            throw error;
        }
    }

    async updateFile(path, content, message, sha = null) {
        const body = {
            message,
            content: btoa(unescape(encodeURIComponent(content))),
            branch: this.config.branch
        };

        if (sha) {
            body.sha = sha;
        }

        return await this.request(`/repos/${this.config.owner}/${this.config.repo}/contents/${path}`, 'PUT', body);
    }
}

// Initialize the application
const app = new TaskManagerApp();
document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
});

// Global functions for HTML onclick handlers
function showAddTaskModal() { app.showAddTaskModal(); }
function closeModal() { app.closeModal(); }
function exportToCSV() { app.exportToCSV(); }
function loadTasks() { app.loadTasks(); }
