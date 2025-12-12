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
        
        // Password protection state
        this.isAuthenticated = false;
        this.authExpiry = null;
        this.pendingAction = null; // Store action to execute after password verification

        // UI state
        this.viewMode = 'list';
        this.timelineScale = 'day'; // 'day' | 'week'

        // Issues sync state
        this.issuesForSync = [];

        // Multi-project state
        this.activeProjectId = null;
    }

    // Initialize the application
    async initialize() {
        // Load config now that all scripts should be loaded
        this.loadConfig();

        this.setupEventListeners();
        this.setupProjectSelector();
        this.setupStatCardFilters();
        this.loadUserName();
        this.updateAccessIndicator(); // Initialize access indicator

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

        // Resolve active project (query param wins, then localStorage, then default)
        const fromQuery = this.getQueryParam('project');
        const fromStorage = (typeof localStorage !== 'undefined') ? localStorage.getItem('taskManagerActiveProject') : null;
        const defaultProject = templateConfig.GITHUB.DEFAULT_PROJECT_ID || 'github-task-manager';
        const activeProject = (fromQuery || fromStorage || defaultProject || '').trim();
        const safeProject = activeProject.replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
        this.activeProjectId = safeProject;

        // Persist to global config so TaskDatabase can resolve it
        templateConfig.GITHUB.ACTIVE_PROJECT_ID = safeProject;
        if (typeof templateConfig.GITHUB.getTasksFile === 'function') {
            templateConfig.GITHUB.TASKS_FILE = templateConfig.GITHUB.getTasksFile(safeProject);
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

    setupProjectSelector() {
        const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
        const select = document.getElementById('projectSelect');
        if (!select || !templateConfig || !templateConfig.GITHUB) return;

        const projects = Array.isArray(templateConfig.GITHUB.PROJECTS) ? templateConfig.GITHUB.PROJECTS : [];
        if (projects.length === 0) return;

        // Populate options (id + label)
        select.innerHTML = '';
        for (const proj of projects) {
            if (!proj || !proj.id) continue;
            const opt = document.createElement('option');
            opt.value = proj.id;
            opt.textContent = proj.label || proj.id;
            select.appendChild(opt);
        }

        // Set current selection
        const current = this.activeProjectId || templateConfig.GITHUB.ACTIVE_PROJECT_ID || templateConfig.GITHUB.DEFAULT_PROJECT_ID;
        if (current) select.value = current;

        select.addEventListener('change', async () => {
            const nextId = (select.value || '').trim();
            await this.setActiveProject(nextId);
        });
    }

    async setActiveProject(projectId) {
        const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
        if (!templateConfig || !templateConfig.GITHUB) return;

        const safeProject = String(projectId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
        if (safeProject === this.activeProjectId) return;

        // IMPORTANT: auth is scoped per project.
        // Switching projects must force Read-Only until unlocked for the new project.
        this.isAuthenticated = false;
        this.authExpiry = null;
        try {
            sessionStorage.removeItem(this.getProjectPasswordKey(this.activeProjectId));
        } catch (e) {
            // ignore
        }

        this.activeProjectId = safeProject;
        localStorage.setItem('taskManagerActiveProject', safeProject);

        templateConfig.GITHUB.ACTIVE_PROJECT_ID = safeProject;
        if (typeof templateConfig.GITHUB.getTasksFile === 'function') {
            templateConfig.GITHUB.TASKS_FILE = templateConfig.GITHUB.getTasksFile(safeProject);
        }

        // Keep app config in sync
        if (this.config) {
            this.config.tasksFile = templateConfig.GITHUB.TASKS_FILE;
        }

        // Reload tasks for the newly selected project
        this.showToast(`Switched project to: ${safeProject}`, 'info');
        this.updateAccessIndicator();
        await this.loadTasks();
    }

    getProjectAuthKey(projectId) {
        const safe = String(projectId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
        return `taskManagerAuth:${safe}`;
    }

    getProjectPasswordKey(projectId) {
        const safe = String(projectId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
        return `taskManagerAccessPassword:${safe}`;
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

    // Password Protection Methods
    getAccessConfig() {
        const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
        const baseConfig = templateConfig.ACCESS || { PASSWORD: '', PUBLIC_READ: true, SESSION_DURATION: 30 };
        // Password resolution order (most specific → least specific):
        // 1) Per-project password from ACCESS_PASSWORDS[projectId]
        // 2) Master password ACCESS_PASSWORD_MASTER
        // 3) Backwards compatibility: ACCESS_PASSWORD
        let resolvedPassword = '';
        try {
            const projectId = this.activeProjectId || templateConfig.GITHUB.ACTIVE_PROJECT_ID || templateConfig.GITHUB.DEFAULT_PROJECT_ID || 'github-task-manager';
            if (typeof ACCESS_PASSWORDS !== 'undefined' && ACCESS_PASSWORDS && typeof ACCESS_PASSWORDS === 'object') {
                const p = String(projectId || '').trim();
                if (p && ACCESS_PASSWORDS[p]) {
                    resolvedPassword = ACCESS_PASSWORDS[p];
                }
            }
        } catch (e) {
            // ignore
        }

        if (!resolvedPassword && typeof ACCESS_PASSWORD_MASTER !== 'undefined' && ACCESS_PASSWORD_MASTER) {
            resolvedPassword = ACCESS_PASSWORD_MASTER;
        }

        if (!resolvedPassword && typeof ACCESS_PASSWORD !== 'undefined' && ACCESS_PASSWORD) {
            resolvedPassword = ACCESS_PASSWORD;
        }

        return {
            ...baseConfig,
            PASSWORD: resolvedPassword
        };
    }

    isGitHubPagesHost() {
        if (typeof window === 'undefined' || !window.location) return false;
        const hostname = window.location.hostname || '';
        return hostname.endsWith('github.io');
    }

    getQueryParam(name) {
        try {
            if (typeof window === 'undefined' || !window.location) return null;
            const params = new URLSearchParams(window.location.search || '');
            return params.get(name);
        } catch {
            return null;
        }
    }

    isLocalHost() {
        if (typeof window === 'undefined' || !window.location) return true;
        const hostname = window.location.hostname || '';
        return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    }

    isPasswordProtectionEnabled() {
        // For local E2E validation: /?forcePassword=1
        if (this.getQueryParam('forcePassword') === '1') return true;

        // Local dev: no password required
        if (this.isLocalHost()) return false;

        // GitHub Pages: enforce password gate
        return this.isGitHubPagesHost();
    }

    isPasswordProtected() {
        // “Protected” means we enforce auth for modifications in this environment.
        return this.isPasswordProtectionEnabled();
    }


    checkAuth() {
        // If password protection is not enabled for this environment, allow all actions
        if (!this.isPasswordProtected()) {
            return true;
        }
        
        // Check if authenticated and session is still valid
        if (this.isAuthenticated && this.authExpiry) {
            if (Date.now() < this.authExpiry) {
                return true;
            }
            // Session expired
            this.isAuthenticated = false;
            this.authExpiry = null;
        }
        
        // Check localStorage for persisted session (scoped per active project)
        const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
        const projectId = this.activeProjectId || (templateConfig && templateConfig.GITHUB && (templateConfig.GITHUB.ACTIVE_PROJECT_ID || templateConfig.GITHUB.DEFAULT_PROJECT_ID)) || 'github-task-manager';
        const storedAuth = localStorage.getItem(this.getProjectAuthKey(projectId));
        if (storedAuth) {
            const { expiry } = JSON.parse(storedAuth);
            if (expiry && Date.now() < expiry) {
                this.isAuthenticated = true;
                this.authExpiry = expiry;
                return true;
            }
            // Clear expired session
            localStorage.removeItem(this.getProjectAuthKey(projectId));
        }
        
        return false;
    }

    requireAuth(action, ...args) {
        // Check if already authenticated
        if (this.checkAuth()) {
            // Execute action immediately
            action.apply(this, args);
            return;
        }
        
        // Store pending action and show password modal
        this.pendingAction = { action, args };
        this.showPasswordModal();
    }

    showPasswordModal() {
        const modal = document.getElementById('passwordModal');
        if (modal) {
            modal.style.display = 'block';
            document.getElementById('accessPassword').value = '';
            document.getElementById('accessPassword').focus();
            document.getElementById('passwordError').style.display = 'none';
            try {
                const help = document.getElementById('passwordHelp');
                if (help) {
                    const project = this.activeProjectId || (window.TEMPLATE_CONFIG && window.TEMPLATE_CONFIG.GITHUB && window.TEMPLATE_CONFIG.GITHUB.DEFAULT_PROJECT_ID) || 'github-task-manager';
                    help.textContent = `Project: ${project} — use the project password or the master password to unlock.`;
                }
            } catch (e) {
                // ignore
            }
        }
    }

    closePasswordModal() {
        const modal = document.getElementById('passwordModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.pendingAction = null;
    }

    async verifyPassword(event) {
        event.preventDefault();
        
        const passwordInput = document.getElementById('accessPassword');
        const errorDiv = document.getElementById('passwordError');
        const enteredPassword = (passwordInput.value || '').trim();
        const accessConfig = this.getAccessConfig();
        const configuredPassword = (accessConfig.PASSWORD || '').trim();

        if (!configuredPassword) {
            errorDiv.innerHTML = '<span style="color: var(--danger-color);">⚠️ Access is not configured for this deployment. Please set the GitHub Secret(s) <code>ACCESS_PASSWORD_MASTER</code> and/or per-project keys via <code>ACCESS_PASSWORDS</code>.</span>';
            errorDiv.style.display = 'block';
            return false;
        }

        if (enteredPassword === configuredPassword) {
            // Password correct - set authentication
            const sessionDuration = (accessConfig.SESSION_DURATION || 30) * 60 * 1000; // Convert to ms
            this.authExpiry = Date.now() + sessionDuration;
            this.isAuthenticated = true;
            
            // Persist to localStorage
            const projectId = this.activeProjectId || (window.TEMPLATE_CONFIG && window.TEMPLATE_CONFIG.GITHUB && (window.TEMPLATE_CONFIG.GITHUB.ACTIVE_PROJECT_ID || window.TEMPLATE_CONFIG.GITHUB.DEFAULT_PROJECT_ID)) || 'github-task-manager';
            localStorage.setItem(this.getProjectAuthKey(projectId), JSON.stringify({
                expiry: this.authExpiry
            }));

            // Store password in sessionStorage for Worker API calls (project-scoped)
            // (Worker validates password server-side before writing to GitHub)
            try {
                sessionStorage.setItem(this.getProjectPasswordKey(projectId), enteredPassword);
                // Backwards compatibility (older TaskDatabase versions)
                sessionStorage.setItem('taskManagerAccessPassword', enteredPassword);
            } catch (e) {
                // ignore
            }
            
            // Store pending action before closing modal (which clears it)
            const pendingAction = this.pendingAction;
            
            // Close modal and update UI
            this.closePasswordModal();
            this.updateAccessIndicator();
            this.showToast('🔓 Access granted!', 'success');
            
            // Execute pending action if any
            if (pendingAction) {
                const { action, args } = pendingAction;
                action.apply(this, args);
            }
        } else {
            // Wrong password
            errorDiv.innerHTML = '<span style="color: var(--danger-color);">❌ Incorrect password. Please try again.</span>';
            errorDiv.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
        
        return false;
    }

    logout() {
        this.isAuthenticated = false;
        this.authExpiry = null;

        // Clear persisted auth for all projects
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('taskManagerAuth:')) keysToRemove.push(key);
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch (e) {
            // ignore
        }

        // Clear session passwords (used for Worker API calls)
        try {
            const keysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && key.startsWith('taskManagerAccessPassword:')) keysToRemove.push(key);
            }
            keysToRemove.forEach(k => sessionStorage.removeItem(k));
            sessionStorage.removeItem('taskManagerAccessPassword');
        } catch (e) {
            // ignore
        }
        this.updateAccessIndicator();
        this.showToast('🔒 Logged out', 'info');
    }

    // --- GitHub OAuth Device Flow ---
    getGitHubOAuthToken() {
        try {
            const token = sessionStorage.getItem('githubOAuthToken');
            if (token && String(token).trim()) return String(token).trim();
        } catch (e) {
            // ignore
        }
        return '';
    }

    setGitHubOAuthToken(token, user = '') {
        try {
            if (token && String(token).trim()) {
                sessionStorage.setItem('githubOAuthToken', String(token).trim());
                if (user) sessionStorage.setItem('githubOAuthUser', user);
                // Apply to runtime config
                if (this.config) this.config.token = token;
                const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
                if (templateConfig && templateConfig.GITHUB) {
                    templateConfig.GITHUB.TOKEN = token;
                }
            }
        } catch (e) {
            // ignore
        }
    }

    clearGitHubOAuthToken() {
        try {
            sessionStorage.removeItem('githubOAuthToken');
            sessionStorage.removeItem('githubOAuthUser');
        } catch (e) {
            // ignore
        }
        if (this.config) this.config.token = '';
    }

    isGitHubConnected() {
        return !!this.getGitHubOAuthToken();
    }

    showGitHubLoginModal() {
        const modal = document.getElementById('githubLoginModal');
        if (!modal) return;
        modal.style.display = 'block';
        // Reset to step 1
        document.getElementById('githubLoginStep1').style.display = 'block';
        document.getElementById('githubLoginStep2').style.display = 'none';
        document.getElementById('githubLoginSuccess').style.display = 'none';
        const err = document.getElementById('githubLoginError');
        if (err) { err.style.display = 'none'; err.textContent = ''; }
    }

    closeGitHubLoginModal() {
        const modal = document.getElementById('githubLoginModal');
        if (modal) modal.style.display = 'none';
        // Stop polling if running
        if (this._deviceFlowPollTimer) {
            clearInterval(this._deviceFlowPollTimer);
            this._deviceFlowPollTimer = null;
        }
    }

    async startGitHubDeviceFlow() {
        const oauthConfig = window.GITHUB_OAUTH_CONFIG;
        if (!oauthConfig || !oauthConfig.CLIENT_ID) {
            this.showGitHubLoginError('GitHub OAuth is not configured. Set GITHUB_OAUTH_CLIENT_ID secret.');
            return;
        }

        try {
            // Note: GitHub Device Flow requires a CORS proxy or backend because
            // the /login/device/code endpoint doesn't support CORS from browsers.
            // For a fully static site, we'll need to guide users to manually authorize.
            // Alternative: Use a simple Cloudflare Worker as CORS proxy.
            
            // For now, show instructions for manual OAuth authorization
            this.showManualOAuthInstructions();
        } catch (e) {
            console.error('Device flow error:', e);
            this.showGitHubLoginError(`OAuth error: ${e.message}`);
        }
    }

    showManualOAuthInstructions() {
        const oauthConfig = window.GITHUB_OAUTH_CONFIG;
        const clientId = oauthConfig && oauthConfig.CLIENT_ID;
        
        // GitHub OAuth web flow (redirect-based)
        // This works for GitHub Pages but requires a callback URL
        const redirectUri = `${window.location.origin}${window.location.pathname}`;
        const scope = 'public_repo';
        const state = Math.random().toString(36).substring(2);
        sessionStorage.setItem('githubOAuthState', state);

        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

        // Show step 2 with manual link
        document.getElementById('githubLoginStep1').style.display = 'none';
        document.getElementById('githubLoginStep2').style.display = 'block';
        document.getElementById('deviceUserCode').textContent = 'See link below';
        document.getElementById('deviceVerificationLink').href = authUrl;
        document.getElementById('deviceVerificationLink').textContent = 'Authorize on GitHub →';
        document.getElementById('devicePollStatus').innerHTML = `
            After authorizing, you'll be redirected back here.<br>
            <small style="color: var(--text-secondary);">Note: GitHub OAuth requires a backend to exchange the code for a token. For a fully static site, consider using a CORS proxy or Cloudflare Worker.</small>
        `;
    }

    showGitHubLoginError(message) {
        const err = document.getElementById('githubLoginError');
        if (err) {
            err.style.display = 'block';
            err.textContent = message;
        }
    }

    copyDeviceCode() {
        const code = document.getElementById('deviceUserCode').textContent;
        if (code && navigator.clipboard) {
            navigator.clipboard.writeText(code);
            this.showToast('Code copied!', 'success');
        }
    }

    updateAccessIndicator() {
        const indicator = document.getElementById('accessIndicator');
        if (!indicator) return;
        
        // Hide indicator if password protection is not enabled
        if (!this.isPasswordProtected()) {
            indicator.style.display = 'none';
            return;
        }
        
        indicator.style.display = 'flex';
        
        if (this.checkAuth()) {
            indicator.className = 'auth-indicator unlocked';
            indicator.innerHTML = '🔓 <span>Unlocked</span>';
            indicator.title = 'Click to lock';
        } else {
            indicator.className = 'auth-indicator locked';
            indicator.innerHTML = '🔒 <span>Read-Only</span>';
            indicator.title = 'Click to unlock for editing';
        }
    }

    toggleAuthIndicator() {
        if (this.checkAuth()) {
            // Already authenticated - log out
            this.logout();
        } else {
            // Not authenticated - show password modal to unlock
            this.showPasswordModal();
        }
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
            // Ensure actor name is attached to Worker writes for history/audit.
            this.database.actor = this.currentUser || '';
            const result = await this.database.saveTasks();
            const source = result.source === 'github'
                ? 'to GitHub'
                : (result.source === 'local-disk' ? 'locally (disk)' : 'locally');
            this.showToast(`Tasks saved successfully ${source}`, 'success');

            // If history modal is open, refresh it.
            const historyModal = document.getElementById('historyModal');
            if (historyModal && historyModal.style.display === 'block') {
                this.refreshHistory();
            }
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showToast('Error saving tasks: ' + error.message, 'error');
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    // History
    openHistoryModal() {
        const modal = document.getElementById('historyModal');
        if (!modal) return;
        modal.style.display = 'block';
        this.refreshHistory();
    }

    closeHistoryModal() {
        const modal = document.getElementById('historyModal');
        if (modal) modal.style.display = 'none';
    }

    setHistoryStatus(message, type = 'info') {
        const el = document.getElementById('historyStatus');
        if (!el) return;
        if (!message) {
            el.style.display = 'none';
            el.textContent = '';
            return;
        }
        el.style.display = 'block';
        el.className = `validation-messages ${type}`;
        el.textContent = message;
    }

    getWorkerUrl() {
        try {
            const templateConfig = window.TEMPLATE_CONFIG || TEMPLATE_CONFIG;
            const gh = templateConfig && templateConfig.GITHUB ? templateConfig.GITHUB : null;
            return (gh && gh.WORKER_URL) ? String(gh.WORKER_URL).trim() : '';
        } catch {
            return '';
        }
    }

    getRawHistoryUrl(projectId) {
        const owner = this.config && this.config.owner ? this.config.owner : '';
        const repo = this.config && this.config.repo ? this.config.repo : '';
        const branch = this.config && this.config.branch ? this.config.branch : 'main';
        const safeProject = String(projectId || '').replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
        return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/public/tasksDB/${encodeURIComponent(safeProject)}/history/changes.ndjson`;
    }

    applyHistoryFilter() {
        this.refreshHistory();
    }

    async refreshHistory() {
        const projectId = this.activeProjectId || 'github-task-manager';
        const filterEl = document.getElementById('historyTaskIdFilter');
        const taskId = filterEl ? String(filterEl.value || '').trim() : '';

        this.setHistoryStatus('Loading history...', 'info');
        try {
            const items = await this.loadHistoryItems({ projectId, taskId, limit: 200 });
            this.renderHistory(items);
            this.setHistoryStatus(items.length ? `Loaded ${items.length} history entries.` : 'No history entries found yet.', items.length ? 'success' : 'info');
        } catch (e) {
            console.error('History load failed', e);
            this.renderHistory([]);
            this.setHistoryStatus(`Failed to load history: ${e.message}`, 'error');
        }
    }

    async loadHistoryItems({ projectId, taskId = '', limit = 200 }) {
        const safeProject = String(projectId || '').replace(/[^a-zA-Z0-9_-]/g, '') || 'github-task-manager';
        const workerUrl = this.getWorkerUrl();

        // Preferred: Worker endpoint (avoids GitHub raw caching quirks)
        if (workerUrl) {
            const url = new URL(`${workerUrl}/api/task-history`);
            url.searchParams.set('project', safeProject);
            url.searchParams.set('limit', String(limit));
            if (taskId) url.searchParams.set('taskId', taskId);

            const res = await fetch(url.toString(), { method: 'GET' });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
                throw new Error(err.error || `HTTP ${res.status}`);
            }
            const data = await res.json();
            return Array.isArray(data.items) ? data.items : [];
        }

        // Fallback: public raw file
        const rawUrl = this.getRawHistoryUrl(safeProject);
        const rawRes = await fetch(rawUrl, { method: 'GET', cache: 'no-store' });
        if (rawRes.status === 404) return [];
        if (!rawRes.ok) throw new Error(`HTTP ${rawRes.status}`);
        const text = await rawRes.text();
        const lines = text.split(/\r?\n/).filter(Boolean);
        const parsed = [];
        for (let i = lines.length - 1; i >= 0; i--) {
            try {
                const evt = JSON.parse(lines[i]);
                if (taskId && String(evt.taskId) !== String(taskId)) continue;
                parsed.push(evt);
                if (parsed.length >= limit) break;
            } catch {
                // ignore bad lines
            }
        }
        return parsed;
    }

    renderHistory(items) {
        const list = document.getElementById('historyList');
        if (!list) return;

        const arr = Array.isArray(items) ? items : [];
        if (arr.length === 0) {
            list.innerHTML = `<div class="empty-state" style="display:block; padding: 14px;"><p>No history found for this project yet.</p></div>`;
            return;
        }

        list.innerHTML = arr.map(evt => {
            const ts = evt.ts ? new Date(evt.ts).toLocaleString() : '';
            const actor = evt.actor ? String(evt.actor) : 'unknown';
            const action = evt.action ? String(evt.action) : 'update';
            const taskId = evt.taskId ? String(evt.taskId) : '';
            const taskName = evt.taskName ? String(evt.taskName) : '';
            const summary = evt.changeSummary ? String(evt.changeSummary) : (evt.message || '');

            const title = `${action.toUpperCase()} • #${taskId} ${taskName}`.trim();
            const meta = `${ts} • by ${actor}${evt.commitSha ? ` • ${String(evt.commitSha).slice(0, 8)}` : ''}`;

            const detailObj = {
                ts: evt.ts,
                projectId: evt.projectId,
                actor: evt.actor,
                origin: evt.origin,
                file: evt.file,
                commitSha: evt.commitSha,
                message: evt.message,
                action: evt.action,
                taskId: evt.taskId,
                taskName: evt.taskName,
                changeSummary: evt.changeSummary,
                changes: evt.changes,
                before: evt.before,
                after: evt.after
            };

            const detailsText = this.escapeHtml(JSON.stringify(detailObj, null, 2));

            return `
                <details class="history-item">
                    <summary>
                        <span class="history-title">${this.escapeHtml(title)}</span>
                        <span class="history-meta">${this.escapeHtml(summary)}</span>
                    </summary>
                    <div class="history-meta">${this.escapeHtml(meta)}</div>
                    <pre class="history-changes">${detailsText}</pre>
                </details>
            `;
        }).join('');
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const timelineView = document.getElementById('timelineView');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredTasks.length === 0) {
            tasksList.innerHTML = '';
            if (timelineView) {
                timelineView.innerHTML = '';
                timelineView.style.display = 'none';
            }
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        if (this.viewMode === 'timeline' && timelineView) {
            tasksList.style.display = 'none';
            timelineView.style.display = 'block';
            this.renderTimeline();
            this.updateViewToggle();
            return;
        }

        if (timelineView) {
            timelineView.style.display = 'none';
        }
        tasksList.style.display = '';
        this.updateViewToggle();

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
                        ${this.getLinkedIssue(task) ? `<span>🐙 <a href="${this.getLinkedIssue(task).url}" target="_blank" rel="noopener" onclick="event.stopPropagation()">#${this.getLinkedIssue(task).number}</a></span>` : ''}
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
                    ${this.getLinkedIssue(task) ? `<a class="btn-secondary" href="${this.getLinkedIssue(task).url}" target="_blank" rel="noopener">Open Issue</a>` : `<button class="btn-secondary" onclick="app.createIssueForTask('${task.task_id || task.id}')">Create Issue</button>`}
                </div>
            </div>
        `).join('');
    }

    setViewMode(mode) {
        const next = (mode === 'timeline') ? 'timeline' : 'list';
        if (this.viewMode === next) return;
        this.viewMode = next;
        this.renderTasks();
    }

    updateViewToggle() {
        const listBtn = document.getElementById('viewListBtn');
        const timelineBtn = document.getElementById('viewTimelineBtn');
        if (listBtn) listBtn.classList.toggle('active', this.viewMode === 'list');
        if (timelineBtn) timelineBtn.classList.toggle('active', this.viewMode === 'timeline');
    }

    setTimelineScale(scale) {
        const next = (scale === 'week') ? 'week' : 'day';
        this.timelineScale = next;
        if (this.viewMode === 'timeline') this.renderTasks();
    }

    parseDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return null;
        const d = new Date(`${dateStr}T00:00:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    daysBetween(a, b) {
        const ms = 24 * 60 * 60 * 1000;
        return Math.floor((b.getTime() - a.getTime()) / ms);
    }

    formatShortDate(d) {
        try {
            return d.toISOString().slice(0, 10);
        } catch {
            return '';
        }
    }

    renderTimeline() {
        const timelineView = document.getElementById('timelineView');
        if (!timelineView) return;

        const tasks = (this.filteredTasks || []).slice();
        const dated = tasks
            .map(t => ({
                task: t,
                start: this.parseDate(t.start_date),
                end: this.parseDate(t.end_date) || this.parseDate(t.start_date)
            }))
            .filter(x => x.start && x.end);

        if (dated.length === 0) {
            timelineView.innerHTML = `<div class="empty-state" style="display:block; padding: 18px;">
                <p>No tasks with valid start/end dates to render on a timeline.</p>
            </div>`;
            return;
        }

        let min = dated[0].start;
        let max = dated[0].end;
        for (const item of dated) {
            if (item.start < min) min = item.start;
            if (item.end > max) max = item.end;
        }

        const totalDays = Math.max(1, this.daysBetween(min, max) + 1);
        const scale = (totalDays > 180) ? 'week' : this.timelineScale;
        const units = (scale === 'week') ? Math.ceil(totalDays / 7) : totalDays;
        const unitWidth = (scale === 'week') ? 10 : 16;

        // Sort by start date
        dated.sort((a, b) => a.start - b.start);

        const headerTitle = `Timeline (${this.formatShortDate(min)} → ${this.formatShortDate(max)})`;
        const rowsHtml = dated.map(({ task, start, end }) => {
            const statusClass = `status-${String(task.status || '').toLowerCase().replace(/\s+/g, '-')}`;
            const startOffsetDays = this.daysBetween(min, start);
            const endOffsetDays = this.daysBetween(min, end);
            const unitStart = (scale === 'week') ? Math.floor(startOffsetDays / 7) : startOffsetDays;
            const unitEnd = (scale === 'week') ? Math.floor(endOffsetDays / 7) : endOffsetDays;
            const unitLen = Math.max(1, (unitEnd - unitStart + 1));
            const leftCss = `calc(${unitStart} * var(--unit-width))`;
            const widthCss = `calc(${unitLen} * var(--unit-width))`;

            return `
                <div class="timeline-row" onclick="app.editTask('${task.task_id || task.id}')" role="button" tabindex="0">
                    <div class="timeline-task">
                        <div class="task-name">${this.escapeHtml(task.task_name || task.title)}</div>
                        <div class="task-sub">${this.escapeHtml(task.status || '')} • ${this.escapeHtml(task.start_date || '')} → ${this.escapeHtml(task.end_date || '')}</div>
                    </div>
                    <div class="timeline-track">
                        <div class="timeline-bar ${statusClass} ${task.is_critical_path ? 'critical' : ''}" style="left: ${leftCss}; width: ${widthCss};" title="${this.escapeHtml(task.task_name || task.title)}"></div>
                    </div>
                </div>
            `;
        }).join('');

        timelineView.innerHTML = `
            <div class="timeline-header">
                <h3>${this.escapeHtml(headerTitle)}</h3>
                <div class="timeline-actions">
                    <button type="button" class="btn-secondary" onclick="app.setTimelineScale('day')" ${scale === 'day' ? 'disabled' : ''}>Day</button>
                    <button type="button" class="btn-secondary" onclick="app.setTimelineScale('week')" ${scale === 'week' ? 'disabled' : ''}>Week</button>
                </div>
            </div>
            <div class="timeline-scroll">
                <div class="timeline-grid" style="--units:${units}; --unit-width:${unitWidth}px;">
                    ${rowsHtml}
                </div>
            </div>
        `;
    }

    // GitHub Issues Sync
    openIssuesSyncModal() {
        if (this.isPasswordProtected()) {
            this.requireAuth(this._openIssuesSyncModal);
        } else {
            this._openIssuesSyncModal();
        }
    }

    _openIssuesSyncModal() {
        const modal = document.getElementById('issuesModal');
        if (!modal) return;
        modal.style.display = 'block';
        this.loadIssuesForSync();
    }

    closeIssuesSyncModal() {
        const modal = document.getElementById('issuesModal');
        if (modal) modal.style.display = 'none';
    }

    setIssuesSyncStatus(message, type = 'info') {
        const el = document.getElementById('issuesSyncStatus');
        if (!el) return;
        if (!message) {
            el.style.display = 'none';
            el.textContent = '';
            return;
        }
        el.style.display = 'block';
        el.className = `validation-messages ${type}`;
        el.textContent = message;
    }

    async loadIssuesForSync() {
        if (!this.githubApi) {
            this.setIssuesSyncStatus('GitHub API not initialized yet.', 'error');
            return;
        }
        this.setIssuesSyncStatus('Loading issues...', 'info');

        try {
            const issues = await this.githubApi.listIssues('open');
            // Filter out PRs
            this.issuesForSync = (issues || []).filter(i => !i.pull_request);
            this.renderIssuesList();
            this.setIssuesSyncStatus(`Loaded ${this.issuesForSync.length} open issues.`, 'success');
        } catch (e) {
            console.error('Issues sync load failed', e);
            this.issuesForSync = [];
            this.renderIssuesList();
            this.setIssuesSyncStatus(`Failed to load issues: ${e.message}`, 'error');
        }
    }

    renderIssuesList() {
        const list = document.getElementById('issuesList');
        if (!list) return;
        const issues = this.issuesForSync || [];

        if (issues.length === 0) {
            list.innerHTML = `<div class="empty-state" style="display:block; padding: 14px;"><p>No issues found.</p></div>`;
            return;
        }

        list.innerHTML = issues.map(issue => {
            const alreadyImported = this.isIssueAlreadyImported(issue.number);
            const checkbox = alreadyImported
                ? `<input type="checkbox" disabled title="Already imported" />`
                : `<input type="checkbox" class="issue-select" data-issue-number="${issue.number}" />`;

            return `
                <div class="issues-item">
                    <div>${checkbox}</div>
                    <div class="issue-title">
                        <a href="${issue.html_url}" target="_blank" rel="noopener">#${issue.number} ${this.escapeHtml(issue.title || '')}</a>
                        <div class="issue-meta">${alreadyImported ? 'Already imported' : 'Not imported'} • ${this.escapeHtml((issue.state || '').toUpperCase())}</div>
                    </div>
                    <div class="issue-meta">${issue.comments ? `${issue.comments} comments` : ''}</div>
                </div>
            `;
        }).join('');
    }

    isIssueAlreadyImported(issueNumber) {
        const tag = `issue-#${issueNumber}`;
        return (this.database && Array.isArray(this.database.tasks))
            ? this.database.tasks.some(t => Array.isArray(t.tags) && t.tags.includes(tag))
            : false;
    }

    async importSelectedIssues() {
        if (this.isPasswordProtected()) {
            this.requireAuth(this._importSelectedIssues);
        } else {
            this._importSelectedIssues();
        }
    }

    _importSelectedIssues() {
        // async wrapper below
        this._importSelectedIssuesAsync();
    }

    async _importSelectedIssuesAsync() {
        const list = document.getElementById('issuesList');
        if (!list) return;

        const selected = Array.from(list.querySelectorAll('input.issue-select:checked'))
            .map(cb => Number(cb.getAttribute('data-issue-number')))
            .filter(n => Number.isFinite(n));

        if (selected.length === 0) {
            this.setIssuesSyncStatus('Select at least one issue to import.', 'warning');
            return;
        }

        const issuesByNumber = new Map((this.issuesForSync || []).map(i => [i.number, i]));
        let imported = 0;
        const today = new Date();
        const startDate = today.toISOString().slice(0, 10);
        const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        for (const num of selected) {
            const issue = issuesByNumber.get(num);
            if (!issue) continue;
            if (this.isIssueAlreadyImported(num)) continue;

            const taskData = {
                task_name: issue.title || `Issue #${num}`,
                description: (issue.body && issue.body.trim().length > 0)
                    ? issue.body
                    : `Imported from GitHub Issue #${num}: ${issue.html_url}`,
                start_date: startDate,
                end_date: endDate,
                priority: 'Medium',
                status: 'Not Started',
                estimated_hours: 2,
                category_name: 'Feature',
                tags: ['github', 'issues', `issue-#${num}`],
                comments: [{
                    author: this.currentUser || 'public@example.com',
                    timestamp: new Date().toISOString(),
                    text: `Imported from GitHub Issue #${num}: ${issue.html_url}`
                }]
            };

            const result = this.database.createTask(taskData, this.currentUser);
            if (result && result.success) {
                imported++;
            }
        }

        if (imported === 0) {
            this.setIssuesSyncStatus('No new issues were imported (already imported or none selected).', 'warning');
            this.renderIssuesList();
            return;
        }

        try {
            await this.saveTasks();
            this.tasks = this.database.tasks;
            this.filteredTasks = [...this.tasks];
            this.renderTasks();
            this.updateStats();
            await this.loadIssuesForSync();
            this.setIssuesSyncStatus(`Imported ${imported} issue(s) as tasks.`, 'success');
        } catch (e) {
            console.error('Issue import save failed', e);
            this.setIssuesSyncStatus(`Imported ${imported} issue(s), but failed to save: ${e.message}`, 'error');
        }
    }

    getLinkedIssue(task) {
        const tags = Array.isArray(task && task.tags) ? task.tags : [];
        const match = tags.find(t => typeof t === 'string' && /^issue-#\d+$/.test(t));
        if (!match) return null;
        const number = Number(match.replace('issue-#', ''));
        if (!Number.isFinite(number)) return null;
        return {
            number,
            url: `https://github.com/${this.config.owner}/${this.config.repo}/issues/${number}`
        };
    }

    createIssueForTask(taskId) {
        if (this.isPasswordProtected()) {
            this.requireAuth(this._createIssueForTask, taskId);
        } else {
            this._createIssueForTask(taskId);
        }
    }

    async _createIssueForTask(taskId) {
        if (!this.githubApi) {
            this.showToast('GitHub API not initialized', 'error');
            return;
        }

        const task = this.database.getTask(taskId);
        if (!task) {
            this.showToast('Task not found', 'error');
            return;
        }

        if (this.getLinkedIssue(task)) {
            window.open(this.getLinkedIssue(task).url, '_blank', 'noopener');
            return;
        }

        try {
            this.showLoading();
            const body = `${task.description || ''}\n\n---\nImported from GitHub Task Manager (task_id: ${task.task_id}).`;
            const issue = await this.githubApi.createIssue(task.task_name, body, task.tags || []);

            const nextTags = Array.isArray(task.tags) ? [...task.tags] : [];
            const linkTag = `issue-#${issue.number}`;
            if (!nextTags.includes(linkTag)) nextTags.push(linkTag);
            if (!nextTags.includes('github')) nextTags.push('github');
            if (!nextTags.includes('issues')) nextTags.push('issues');

            const nextComments = Array.isArray(task.comments) ? [...task.comments] : [];
            nextComments.push({
                author: this.currentUser || 'public@example.com',
                timestamp: new Date().toISOString(),
                text: `Created GitHub Issue #${issue.number}: ${issue.html_url}`
            });

            const updated = this.database.updateTask(task.task_id, {
                tags: nextTags,
                comments: nextComments
            });

            if (!updated || !updated.success) {
                throw new Error(updated && updated.errors ? updated.errors.join(', ') : 'Failed to update task with issue link');
            }

            await this.saveTasks();
            this.renderTasks();
            this.showToast(`Created Issue #${issue.number}`, 'success');
        } catch (e) {
            console.error('Create issue failed', e);
            this.showToast(`Create issue failed: ${e.message}`, 'error');
        } finally {
            this.hideLoading();
        }
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

    // Modal Functions (with password protection)
    showAddTaskModal() {
        // Require password for adding tasks
        if (this.isPasswordProtected()) {
            this.requireAuth(this._showAddTaskModal);
        } else {
            this._showAddTaskModal();
        }
    }

    _showAddTaskModal() {
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
        // Require password for editing tasks
        if (this.isPasswordProtected()) {
            this.requireAuth(this._editTask, taskId);
        } else {
            this._editTask(taskId);
        }
    }

    _editTask(taskId) {
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
        // Require password for deleting tasks
        if (this.isPasswordProtected()) {
            this.requireAuth(this._deleteTask, taskId);
        } else {
            this._deleteTask(taskId);
        }
    }

    async _deleteTask(taskId) {
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

            const issuesModal = document.getElementById('issuesModal');
            if (event.target === issuesModal) {
                this.closeIssuesSyncModal();
            }

            const passwordModal = document.getElementById('passwordModal');
            if (event.target === passwordModal) {
                this.closePasswordModal();
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

    async listIssues(state = 'open') {
        const qs = new URLSearchParams({ state, per_page: '100' }).toString();
        return await this.request(`/repos/${this.config.owner}/${this.config.repo}/issues?${qs}`);
    }

    async createIssue(title, body, labels = []) {
        const payload = {
            title,
            body
        };
        if (Array.isArray(labels) && labels.length > 0) {
            // GitHub labels must already exist to attach cleanly; ignore failures server-side.
            payload.labels = labels.filter(l => typeof l === 'string' && l.trim().length > 0).slice(0, 10);
        }
        return await this.request(`/repos/${this.config.owner}/${this.config.repo}/issues`, 'POST', payload);
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
function closePasswordModal() { app.closePasswordModal(); }
function verifyPassword(event) { app.verifyPassword(event); return false; }
