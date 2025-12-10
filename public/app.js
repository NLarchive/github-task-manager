// GitHub API Configuration
let config = {
    owner: '',
    repo: '',
    token: '',
    branch: 'main',
    tasksFile: 'tasks.json'
};

// Task storage
let tasks = [];
let filteredTasks = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    if (isConfigured()) {
        showTaskManager();
        loadTasks();
    }
});

// Configuration Management
function saveConfig() {
    const owner = document.getElementById('repoOwner').value.trim();
    const repo = document.getElementById('repoName').value.trim();
    const token = document.getElementById('githubToken').value.trim();
    const branch = document.getElementById('branch').value.trim() || 'main';

    if (!owner || !repo || !token) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    config = { owner, repo, token, branch, tasksFile: 'tasks.json' };
    localStorage.setItem('githubTaskManagerConfig', JSON.stringify(config));
    
    showTaskManager();
    loadTasks();
    showToast('Connected successfully!', 'success');
}

function loadConfig() {
    const saved = localStorage.getItem('githubTaskManagerConfig');
    if (saved) {
        config = JSON.parse(saved);
        document.getElementById('repoInfo').textContent = `${config.owner}/${config.repo} (${config.branch})`;
    }
}

function isConfigured() {
    return config.owner && config.repo && config.token;
}

function showTaskManager() {
    document.getElementById('loginMessage').style.display = 'none';
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('authStatus').style.display = 'flex';
    document.getElementById('taskManager').style.display = 'block';
    document.getElementById('repoInfo').textContent = `${config.owner}/${config.repo} (${config.branch})`;
}

function disconnect() {
    localStorage.removeItem('githubTaskManagerConfig');
    config = { owner: '', repo: '', token: '', branch: 'main', tasksFile: 'tasks.json' };
    tasks = [];
    
    document.getElementById('loginMessage').style.display = 'block';
    document.getElementById('authForm').style.display = 'flex';
    document.getElementById('authStatus').style.display = 'none';
    document.getElementById('taskManager').style.display = 'none';
    
    // Clear form
    document.getElementById('repoOwner').value = '';
    document.getElementById('repoName').value = '';
    document.getElementById('githubToken').value = '';
    document.getElementById('branch').value = 'main';
}

// GitHub API Functions
async function githubRequest(endpoint, method = 'GET', body = null) {
    const url = `https://api.github.com${endpoint}`;
    const headers = {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    };

    const options = { method, headers };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('GitHub API Error:', error);
        throw error;
    }
}

async function getFileContent(path) {
    try {
        const data = await githubRequest(`/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`);
        const content = atob(data.content);
        return { content, sha: data.sha };
    } catch (error) {
        if (error.message.includes('404')) {
            return { content: '[]', sha: null };
        }
        throw error;
    }
}

async function updateFile(path, content, message, sha = null) {
    const body = {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        branch: config.branch
    };
    
    if (sha) {
        body.sha = sha;
    }

    return await githubRequest(`/repos/${config.owner}/${config.repo}/contents/${path}`, 'PUT', body);
}

// Task Management Functions
async function loadTasks() {
    showLoading();
    try {
        const { content } = await getFileContent(config.tasksFile);
        tasks = JSON.parse(content);
        filteredTasks = [...tasks];
        renderTasks();
        updateStats();
        showToast('Tasks loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Error loading tasks: ' + error.message, 'error');
        tasks = [];
        filteredTasks = [];
        renderTasks();
    } finally {
        hideLoading();
    }
}

async function saveTasks() {
    showLoading();
    try {
        const { sha } = await getFileContent(config.tasksFile);
        const content = JSON.stringify(tasks, null, 2);
        await updateFile(config.tasksFile, content, 'Update tasks', sha);
        showToast('Tasks saved successfully', 'success');
    } catch (error) {
        console.error('Error saving tasks:', error);
        showToast('Error saving tasks: ' + error.message, 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    const emptyState = document.getElementById('emptyState');

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-card" onclick="editTask('${task.id}')">
            <div class="task-header">
                <div>
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    <div class="task-meta">
                        <span class="badge badge-status-${task.status}">${task.status.replace('-', ' ')}</span>
                        <span class="badge badge-priority-${task.priority}">${task.priority}</span>
                    </div>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            <div class="task-footer">
                <div class="task-info">
                    ${task.assignee ? `<span>👤 ${escapeHtml(task.assignee)}</span>` : ''}
                    ${task.dueDate ? `<span>📅 ${task.dueDate}</span>` : ''}
                    <span>🕐 ${new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
                ${task.tags && task.tags.length > 0 ? `
                    <div class="task-tags">
                        ${task.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="task-actions" onclick="event.stopPropagation()">
                <button class="btn-secondary" onclick="editTask('${task.id}')">Edit</button>
                <button class="btn-danger" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('todoTasks').textContent = tasks.filter(t => t.status === 'todo').length;
    document.getElementById('inProgressTasks').textContent = tasks.filter(t => t.status === 'in-progress').length;
    document.getElementById('doneTasks').textContent = tasks.filter(t => t.status === 'done').length;
}

function filterTasks() {
    const statusFilter = document.getElementById('filterStatus').value;
    const priorityFilter = document.getElementById('filterPriority').value;

    filteredTasks = tasks.filter(task => {
        const statusMatch = statusFilter === 'all' || task.status === statusFilter;
        const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
        return statusMatch && priorityMatch;
    });

    renderTasks();
}

// Modal Functions
function showAddTaskModal() {
    document.getElementById('modalTitle').textContent = 'Add New Task';
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    document.getElementById('taskModal').style.display = 'block';
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDueDate').value = task.dueDate || '';
    document.getElementById('taskAssignee').value = task.assignee || '';
    document.getElementById('taskTags').value = task.tags ? task.tags.join(', ') : '';
    document.getElementById('taskModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
}

async function saveTask(event) {
    event.preventDefault();

    const id = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const status = document.getElementById('taskStatus').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const assignee = document.getElementById('taskAssignee').value.trim();
    const tagsInput = document.getElementById('taskTags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

    const task = {
        id: id || generateId(),
        title,
        description,
        status,
        priority,
        dueDate,
        assignee,
        tags,
        createdAt: id ? tasks.find(t => t.id === id).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (id) {
        const index = tasks.findIndex(t => t.id === id);
        tasks[index] = task;
    } else {
        tasks.push(task);
    }

    try {
        await saveTasks();
        filteredTasks = [...tasks];
        renderTasks();
        updateStats();
        closeModal();
    } catch (error) {
        // Error already shown in saveTasks
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    tasks = tasks.filter(t => t.id !== id);
    
    try {
        await saveTasks();
        filteredTasks = [...tasks];
        renderTasks();
        updateStats();
    } catch (error) {
        // Reload to restore state
        await loadTasks();
    }
}

// Export Functions
function exportToCSV() {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Assignee', 'Tags', 'Created At', 'Updated At'];
    const rows = tasks.map(task => [
        task.id,
        task.title,
        task.description || '',
        task.status,
        task.priority,
        task.dueDate || '',
        task.assignee || '',
        task.tags ? task.tags.join('; ') : '',
        task.createdAt,
        task.updatedAt
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Tasks exported to CSV', 'success');
}

// Utility Functions
function generateId() {
    return 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('taskModal');
    if (event.target === modal) {
        closeModal();
    }
}
