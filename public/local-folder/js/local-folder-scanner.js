/**
 * Browser-side local-folder scanner and TaskDB project registry.
 *
 * It discovers `node.tasks.json` files from user-selected directories, builds a
 * normalized project payload, and stores the result for reuse across sessions.
 */

(function (globalScope) {
    const STORAGE_KEY = 'taskManagerLocalFolderProjects';
    const TASK_FILE_CANDIDATES = ['node.tasks.json', 'TODO_project_task.json'];
    const DISCOVERY_IGNORED_DIRS = new Set(['history', 'state', 'tour', 'node_modules', '.git']);

    function deepClone(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return value;
        }
    }

    function normalizeRelativePath(value) {
        const normalized = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/^\.\//, '');
        if (!normalized) return '';
        return normalized.split('/').filter(Boolean).join('/');
    }

    function fileNameFromPath(relativePath) {
        const normalized = normalizeRelativePath(relativePath);
        if (!normalized) return '';
        const segments = normalized.split('/');
        return segments[segments.length - 1] || '';
    }

    function dirNameFromPath(relativePath) {
        const normalized = normalizeRelativePath(relativePath);
        if (!normalized || !normalized.includes('/')) return '';
        return normalized.slice(0, normalized.lastIndexOf('/'));
    }

    function sanitizeProjectId(value) {
        const normalized = String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        return normalized || 'local-folder-project';
    }

    function isTaskFileCandidate(fileName) {
        return TASK_FILE_CANDIDATES.includes(String(fileName || '').trim());
    }

    function readStore() {
        try {
            const raw = globalScope.localStorage ? globalScope.localStorage.getItem(STORAGE_KEY) : '';
            if (!raw) return { projects: {} };
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return { projects: {} };
            if (!parsed.projects || typeof parsed.projects !== 'object') parsed.projects = {};
            return parsed;
        } catch {
            return { projects: {} };
        }
    }

    function writeStore(store) {
        if (!globalScope.localStorage) return;
        globalScope.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }

    function getTaskKey(task) {
        if (!task || typeof task !== 'object') return '';
        const name = String(task.task_name || task.title || '').trim();
        if (name) return name;
        const rawId = task.task_id ?? task.id ?? task.taskId;
        return rawId === null || rawId === undefined ? '' : String(rawId).trim();
    }

    function getTaskCode(task) {
        const key = getTaskKey(task);
        if (!key) return '';
        return key.includes(':') ? key.slice(0, key.indexOf(':')).trim() : key;
    }

    function getTaskPredecessorKeys(task) {
        if (!task || !Array.isArray(task.dependencies)) return [];

        const predecessors = [];
        for (const dependency of task.dependencies) {
            if (!dependency || typeof dependency !== 'object') continue;

            const predecessorName = String(dependency.predecessor_task_name || '').trim();
            if (predecessorName) predecessors.push(predecessorName);

            const predecessorId = dependency.predecessor_task_id;
            if (predecessorId !== null && predecessorId !== undefined && predecessorId !== '') {
                predecessors.push(String(predecessorId).trim());
            }
        }

        return predecessors.filter(Boolean);
    }

    function computeTaskFlowSummary(tasks) {
        const taskList = Array.isArray(tasks) ? tasks.filter(task => task && typeof task === 'object') : [];
        const canonicalKeyByAlias = new Map();
        const labelsByKey = new Map();

        for (const task of taskList) {
            const key = getTaskKey(task);
            if (!key) continue;
            labelsByKey.set(key, String(task.task_name || task.title || key));
            canonicalKeyByAlias.set(key, key);

            const code = getTaskCode(task);
            if (code && !canonicalKeyByAlias.has(code)) canonicalKeyByAlias.set(code, key);
        }

        const predecessorCount = new Map(Array.from(labelsByKey.keys(), key => [key, 0]));
        const successorsByKey = new Map(Array.from(labelsByKey.keys(), key => [key, new Set()]));

        for (const task of taskList) {
            const key = getTaskKey(task);
            if (!key || !predecessorCount.has(key)) continue;

            const normalizedPredecessors = Array.from(new Set(
                getTaskPredecessorKeys(task)
                    .map(predecessor => canonicalKeyByAlias.get(predecessor) || predecessor)
                    .filter(predecessor => predecessorCount.has(predecessor))
            ));

            predecessorCount.set(key, normalizedPredecessors.length);
            for (const predecessor of normalizedPredecessors) {
                const successors = successorsByKey.get(predecessor);
                if (successors) successors.add(key);
            }
        }

        const startTaskKeys = Array.from(predecessorCount.entries())
            .filter(([, count]) => count === 0)
            .map(([key]) => key);
        const endTaskKeys = Array.from(successorsByKey.entries())
            .filter(([, successors]) => !successors || successors.size === 0)
            .map(([key]) => key);

        return {
            startTaskKeys,
            endTaskKeys,
            startTasks: startTaskKeys.map(key => labelsByKey.get(key) || key),
            endTasks: endTaskKeys.map(key => labelsByKey.get(key) || key)
        };
    }

    function inferModuleDepartment(relativePath) {
        const normalized = normalizeRelativePath(relativePath);
        if (!normalized) return 'other';
        const withoutSrc = normalized.startsWith('src/') ? normalized.slice('src/'.length) : normalized;
        if (withoutSrc.startsWith('apps/PRIVATE/')) {
            const parts = withoutSrc.split('/');
            return parts[2] || 'other';
        }
        if (withoutSrc.startsWith('SHARED/')) return 'SHARED';
        if (withoutSrc.startsWith('infra/')) return 'infrastructure';
        if (withoutSrc.startsWith('shop-db/')) return 'database';
        return withoutSrc.split('/')[0] || 'other';
    }

    function inferModuleType(relativePath, moduleData) {
        if (moduleData && moduleData.type) return moduleData.type;
        const normalized = normalizeRelativePath(relativePath);
        const withoutSrc = normalized.startsWith('src/') ? normalized.slice('src/'.length) : normalized;
        if (withoutSrc.startsWith('apps/PRIVATE/')) return 'private-app';
        if (withoutSrc.startsWith('SHARED/')) return 'shared-module';
        if (withoutSrc.startsWith('shop-db/')) return 'database-module';
        if (withoutSrc.startsWith('infra/')) return 'infrastructure';
        return 'module';
    }

    function pickPreferredTaskFileName(fileNames) {
        for (const candidate of TASK_FILE_CANDIDATES) {
            if (fileNames.includes(candidate)) return candidate;
        }
        return '';
    }

    function discoverProjectTaskFilesFromMap(fileMap) {
        const grouped = new Map();

        Object.keys(fileMap || {}).forEach((relativePath) => {
            const normalizedPath = normalizeRelativePath(relativePath);
            const fileName = fileNameFromPath(normalizedPath);
            if (!isTaskFileCandidate(fileName)) return;

            const dirName = dirNameFromPath(normalizedPath);
            const segments = dirName ? dirName.split('/') : [];
            if (segments.some(segment => DISCOVERY_IGNORED_DIRS.has(segment))) return;

            if (!grouped.has(dirName)) grouped.set(dirName, []);
            grouped.get(dirName).push(fileName);
        });

        const discovered = [];
        for (const [dirName, fileNames] of grouped.entries()) {
            const preferred = pickPreferredTaskFileName(fileNames);
            if (!preferred) continue;
            discovered.push(normalizeRelativePath(dirName ? `${dirName}/${preferred}` : preferred));
        }

        return Array.from(new Set(discovered.filter(Boolean))).sort((a, b) => a.localeCompare(b));
    }

    function scoreRootModuleCandidate(relativePath, rawData) {
        const normalized = normalizeRelativePath(relativePath);
        if (!normalized) return -1;

        let score = 0;
        if (normalized === 'src/node.tasks.json') score += 120;
        if (normalized === 'src/TODO_project_task.json') score += 115;
        if (normalized === 'node.tasks.json') score += 105;
        if (normalized === 'TODO_project_task.json') score += 100;
        if (normalized.startsWith('src/')) score += 30;
        if (rawData && rawData.template_type === 'project_task_template') score += 40;
        if (rawData && rawData.project && Array.isArray(rawData.tasks)) score += 25;

        score -= normalized.split('/').length;
        return score;
    }

    function resolveRootModuleRelativeFromMap(fileMap, tasksIndexData) {
        const explicitRoot = normalizeRelativePath(
            tasksIndexData && tasksIndexData.navigation && tasksIndexData.navigation.rootModule
                ? tasksIndexData.navigation.rootModule
                : ''
        );
        if (explicitRoot && fileMap[explicitRoot]) return explicitRoot;

        for (const candidate of ['src/node.tasks.json', 'src/TODO_project_task.json', 'node.tasks.json', 'TODO_project_task.json']) {
            if (fileMap[candidate]) return candidate;
        }

        const candidates = discoverProjectTaskFilesFromMap(fileMap)
            .map((relativePath) => ({
                relativePath,
                rawData: fileMap[relativePath] || null
            }))
            .filter(({ rawData }) => rawData && (
                rawData.template_type === 'project_task_template' ||
                (rawData.project && Array.isArray(rawData.tasks))
            ))
            .sort((a, b) => scoreRootModuleCandidate(b.relativePath, b.rawData) - scoreRootModuleCandidate(a.relativePath, a.rawData));

        if (candidates.length > 0) return candidates[0].relativePath;
        if (tasksIndexData) return 'node.tasks.json';
        return '';
    }

    function collectProjectModulesFromMap(fileMap, rootModuleRelative) {
        const modules = [];
        const normalizedRootModule = normalizeRelativePath(rootModuleRelative || '');

        for (const relativePath of discoverProjectTaskFilesFromMap(fileMap)) {
            if (!relativePath) continue;
            if (relativePath === 'node.tasks.json') continue;
            if (normalizedRootModule && relativePath === normalizedRootModule) continue;

            const raw = fileMap[relativePath] || {};
            const moduleInfo = (raw && typeof raw.module === 'object' && raw.module) ? raw.module : {};
            const moduleName = String(moduleInfo.name || dirNameFromPath(relativePath).split('/').slice(-1)[0] || '').trim();
            const taskList = Array.isArray(raw.tasks) ? raw.tasks : [];
            const taskIds = Array.isArray(moduleInfo.task_ids)
                ? moduleInfo.task_ids.filter(Boolean)
                : (Array.isArray(moduleInfo.taskIds) ? moduleInfo.taskIds.filter(Boolean) : []);
            const flow = computeTaskFlowSummary(taskList);

            modules.push({
                name: moduleName || dirNameFromPath(relativePath).split('/').slice(-1)[0] || 'Module',
                label: String(moduleInfo.label || moduleName || dirNameFromPath(relativePath).split('/').slice(-1)[0] || 'Module').trim(),
                path: relativePath,
                fileName: fileNameFromPath(relativePath),
                modulePath: normalizeRelativePath(moduleInfo.path || dirNameFromPath(relativePath)),
                department: inferModuleDepartment(relativePath),
                type: inferModuleType(relativePath, moduleInfo),
                taskIds: taskIds.length > 0 ? taskIds : Array.from(new Set(taskList.map(getTaskCode).filter(Boolean))),
                taskCount: taskList.length,
                startTasks: flow.startTasks,
                endTasks: flow.endTasks,
                summary: raw && typeof raw.summary === 'object' ? raw.summary : null,
                pipeline: moduleInfo && typeof moduleInfo.pipeline === 'object' ? moduleInfo.pipeline : null,
                description: String(raw.description || '').trim() || null
            });
        }

        modules.sort((a, b) => String(a.path || '').localeCompare(String(b.path || '')));
        return modules;
    }

    function parseJsonFileText(text, relativePath) {
        try {
            return JSON.parse(text);
        } catch (error) {
            throw new Error(`Invalid JSON in ${relativePath}: ${error.message}`);
        }
    }

    async function collectHandleFiles(directoryHandle, prefix = '', fileMap = {}) {
        for await (const [entryName, entryHandle] of directoryHandle.entries()) {
            if (entryHandle.kind === 'directory') {
                if (DISCOVERY_IGNORED_DIRS.has(entryName)) continue;
                const nextPrefix = normalizeRelativePath(prefix ? `${prefix}/${entryName}` : entryName);
                await collectHandleFiles(entryHandle, nextPrefix, fileMap);
                continue;
            }

            if (entryHandle.kind !== 'file' || !isTaskFileCandidate(entryName)) continue;

            const relativePath = normalizeRelativePath(prefix ? `${prefix}/${entryName}` : entryName);
            const file = await entryHandle.getFile();
            const text = await file.text();
            fileMap[relativePath] = parseJsonFileText(text, relativePath);
        }

        return fileMap;
    }

    function collectInputFiles(fileList) {
        const files = Array.from(fileList || []);
        if (!files.length) return Promise.resolve(null);

        const folderName = (() => {
            const relativePath = String(files[0].webkitRelativePath || '').replace(/\\/g, '/');
            return relativePath.split('/').filter(Boolean)[0] || 'local-folder';
        })();

        const fileReaders = files
            .filter(file => isTaskFileCandidate(file.name))
            .map(async (file) => {
                const relativePath = normalizeRelativePath(String(file.webkitRelativePath || file.name).replace(/\\/g, '/'));
                const text = await file.text();
                return { relativePath, data: parseJsonFileText(text, relativePath) };
            });

        return Promise.all(fileReaders).then((entries) => {
            const fileMap = {};
            entries.forEach((entry) => {
                fileMap[entry.relativePath] = entry.data;
            });
            return { folderName, fileMap };
        });
    }

    function openInputDirectoryPicker() {
        return new Promise((resolve, reject) => {
            if (!globalScope.document || typeof globalScope.document.createElement !== 'function') {
                reject(new Error('Directory picker is not available in this browser.'));
                return;
            }

            const input = globalScope.document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.setAttribute('webkitdirectory', '');
            input.setAttribute('directory', '');
            input.style.position = 'fixed';
            input.style.left = '-9999px';
            input.style.opacity = '0';

            const cleanup = () => {
                input.removeEventListener('change', onChange);
                if (input.parentNode) input.parentNode.removeChild(input);
            };

            const onChange = async () => {
                try {
                    const result = await collectInputFiles(input.files);
                    cleanup();
                    resolve(result);
                } catch (error) {
                    cleanup();
                    reject(error);
                }
            };

            input.addEventListener('change', onChange, { once: true });
            globalScope.document.body.appendChild(input);
            input.click();
        });
    }

    async function pickFolderFiles() {
        if (typeof globalScope.showDirectoryPicker === 'function') {
            try {
                const directoryHandle = await globalScope.showDirectoryPicker({ mode: 'readwrite' }).catch(async () => {
                    // Fall back to read-only if readwrite is rejected
                    return await globalScope.showDirectoryPicker({ mode: 'read' });
                });
                if (!directoryHandle) return null;
                const fileMap = await collectHandleFiles(directoryHandle);
                return {
                    folderName: directoryHandle.name || 'local-folder',
                    fileMap,
                    __directoryHandle: directoryHandle
                };
            } catch (error) {
                if (error && error.name === 'AbortError') return null;
                return openInputDirectoryPicker();
            }
        }

        return openInputDirectoryPicker();
    }

    function buildProjectRecordFromFileMap({ folderName, fileMap }) {
        const safeFileMap = fileMap && typeof fileMap === 'object' ? fileMap : {};
        const discoveredFiles = discoverProjectTaskFilesFromMap(safeFileMap);
        if (discoveredFiles.length === 0) {
            throw new Error('No node.tasks.json files were found in the selected folder.');
        }

        const tasksIndexData = safeFileMap['node.tasks.json'] || null;
        const rootModuleRelative = resolveRootModuleRelativeFromMap(safeFileMap, tasksIndexData);
        const rootData = rootModuleRelative ? safeFileMap[rootModuleRelative] || null : null;
        const baseData = rootData || tasksIndexData || null;
        if (!baseData) {
            throw new Error('Could not resolve a root tasks file from the selected folder.');
        }

        const modules = collectProjectModulesFromMap(safeFileMap, rootModuleRelative);
        const payload = {
            ...baseData,
            navigation: {
                ...((baseData && typeof baseData.navigation === 'object' && baseData.navigation) ? baseData.navigation : {}),
                ...((tasksIndexData && typeof tasksIndexData.navigation === 'object' && tasksIndexData.navigation) ? tasksIndexData.navigation : {}),
                rootModule: rootModuleRelative,
                modules
            }
        };

        const projectName = String(
            (payload.project && payload.project.name) ||
            payload.description ||
            folderName ||
            'Local Folder Project'
        ).trim();
        const projectId = `folder-${sanitizeProjectId(folderName || projectName)}`;

        return {
            id: projectId,
            templateId: `${projectId}-tasks`,
            label: projectName,
            sourceKind: 'folder',
            folderName: String(folderName || '').trim() || projectId,
            rootModuleRelative: rootModuleRelative || 'node.tasks.json',
            payload,
            discoveredFiles,
            fileCount: discoveredFiles.length,
            moduleDataByPath: discoveredFiles.reduce((acc, relativePath) => {
                acc[relativePath] = safeFileMap[relativePath];
                return acc;
            }, {}),
            selectedAt: new Date().toISOString()
        };
    }

    function registerProjectRecord(projectRecord) {
        if (!projectRecord || !projectRecord.id) return null;
        const store = readStore();
        store.projects[projectRecord.id] = deepClone(projectRecord);
        writeStore(store);
        return deepClone(projectRecord);
    }

    function getProjectRecord(projectIdOrTemplateId) {
        const raw = String(projectIdOrTemplateId || '').trim();
        if (!raw) return null;
        const projectId = raw.endsWith('-tasks') ? raw.slice(0, -'-tasks'.length) : raw;
        const store = readStore();
        const project = store.projects && store.projects[projectId] ? store.projects[projectId] : null;
        return project ? deepClone(project) : null;
    }

    function getProjectPayload(projectIdOrTemplateId) {
        const project = getProjectRecord(projectIdOrTemplateId);
        return project && project.payload ? deepClone(project.payload) : null;
    }

    function getModuleData(projectIdOrTemplateId, modulePath) {
        const project = getProjectRecord(projectIdOrTemplateId);
        if (!project || !project.moduleDataByPath) return null;
        const normalizedPath = normalizeRelativePath(modulePath);
        const moduleData = project.moduleDataByPath[normalizedPath] || null;
        return moduleData ? deepClone(moduleData) : null;
    }

    function listProjects() {
        const store = readStore();
        return Object.values(store.projects || {})
            .filter(Boolean)
            .sort((a, b) => String(a.label || a.id || '').localeCompare(String(b.label || b.id || '')))
            .map(project => deepClone(project));
    }

    function isFolderProject(projectIdOrTemplateId) {
        return !!getProjectRecord(projectIdOrTemplateId);
    }

    // ── Write-back helpers ────────────────────────────────────────────────────

    /**
     * Update a single module's data inside the in-memory localStorage record.
     * Also pushes the change to FolderCache (IndexedDB) if available.
     *
     * @param {string} projectId
     * @param {string} relativePath - e.g. "src/node.tasks.json"
     * @param {object} updatedData  - full JSON payload to write
     * @returns {boolean} true when the localStorage record was updated
     */
    function updateModuleData(projectId, relativePath, updatedData) {
        const raw = String(projectId || '').trim();
        if (!raw) return false;
        const id = raw.endsWith('-tasks') ? raw.slice(0, -'-tasks'.length) : raw;
        const store = readStore();
        const project = store.projects && store.projects[id];
        if (!project) return false;

        const normalizedPath = normalizeRelativePath(relativePath);
        project.moduleDataByPath = project.moduleDataByPath || {};
        project.moduleDataByPath[normalizedPath] = deepClone(updatedData);

        // Refresh root payload tasks if this is the root module
        if (normalizedPath === normalizeRelativePath(project.rootModuleRelative || '')) {
            project.payload = { ...deepClone(updatedData) };
        }

        project.lastEditedAt = new Date().toISOString();
        store.projects[id] = project;
        writeStore(store);

        // Push to IndexedDB cache if FolderCache is available
        if (globalScope.FolderCache && typeof globalScope.FolderCache.updateModuleInCache === 'function') {
            globalScope.FolderCache.updateModuleInCache(id, normalizedPath, updatedData).catch((err) => {
                console.warn('FolderCache.updateModuleInCache failed:', err && err.message ? err.message : err);
            });
        }

        return true;
    }

    /**
     * Write-back a module file to disk using the FileSystemDirectoryHandle stored
     * in FolderCache.  Requires a browser that supports the FS Access API and a
     * handle that was obtained while requesting "readwrite" permission.
     *
     * @param {string} projectId
     * @param {string} relativePath - e.g. "src/node.tasks.json"
     * @param {object} updatedData  - full JSON payload to write
     * @returns {Promise<{success: boolean, error?: string, source: string}>}
     */
    async function writeModuleToDisk(projectId, relativePath, updatedData) {
        const id = String(projectId || '').trim().replace(/-tasks$/, '');
        if (!id || !relativePath) return { success: false, error: 'Missing projectId or path', source: 'none' };

        // First update the in-memory / localStorage record
        updateModuleData(id, relativePath, updatedData);

        // Try FS Access API writeback if we have a cached directory handle
        if (globalScope.FolderCache && typeof globalScope.FolderCache.loadProjectCache === 'function') {
            try {
                const cached = await globalScope.FolderCache.loadProjectCache(id);
                const dirHandle = cached && cached.directoryHandle;
                if (dirHandle && typeof dirHandle.getFileHandle === 'function') {
                    // Verify we still have write permission; request it if needed
                    const perm = await dirHandle.queryPermission({ mode: 'readwrite' });
                    if (perm !== 'granted') {
                        const requested = await dirHandle.requestPermission({ mode: 'readwrite' });
                        if (requested !== 'granted') {
                            return { success: false, error: 'Write permission denied by browser', source: 'fs-access' };
                        }
                    }

                    // Navigate to the correct sub-directory
                    const segments = normalizeRelativePath(relativePath).split('/').filter(Boolean);
                    const fileName = segments.pop();
                    let dirRef = dirHandle;
                    for (const seg of segments) {
                        dirRef = await dirRef.getDirectoryHandle(seg, { create: false });
                    }
                    const fileHandle = await dirRef.getFileHandle(fileName, { create: false });
                    const writable   = await fileHandle.createWritable();
                    await writable.write(JSON.stringify(updatedData, null, 2));
                    await writable.close();

                    return { success: true, source: 'fs-access' };
                }
            } catch (fsErr) {
                const msg = fsErr && fsErr.message ? fsErr.message : String(fsErr);
                console.warn('FolderCache FS writeback failed:', msg);
                return { success: false, error: msg, source: 'fs-access' };
            }
        }

        // Fallback: saved to localStorage only — no disk write available
        return { success: true, source: 'localStorage-only' };
    }

    /**
     * Re-request readwrite permission and attach the handle to FolderCache.
     * Call this from a button click (requires user gesture).
     *
     * @param {string} projectId
     * @param {FileSystemDirectoryHandle} directoryHandle
     * @returns {Promise<boolean>}
     */
    async function attachWriteHandle(projectId, directoryHandle) {
        if (!directoryHandle || typeof directoryHandle.requestPermission !== 'function') return false;
        const perm = await directoryHandle.requestPermission({ mode: 'readwrite' });
        if (perm !== 'granted') return false;
        const id = String(projectId || '').trim().replace(/-tasks$/, '');
        if (globalScope.FolderCache && typeof globalScope.FolderCache.attachDirectoryHandle === 'function') {
            return globalScope.FolderCache.attachDirectoryHandle(id, directoryHandle);
        }
        return false;
    }

    async function pickAndRegisterProject() {
        const picked = await pickFolderFiles();
        if (!picked) return null;
        const record = buildProjectRecordFromFileMap(picked);
        registerProjectRecord(record);

        // Persist full scan to IndexedDB cache with the directory handle if available
        if (globalScope.FolderCache && typeof globalScope.FolderCache.saveProjectCache === 'function') {
            const dirHandle = picked.__directoryHandle || null;
            globalScope.FolderCache.saveProjectCache(record, picked.fileMap, dirHandle).catch((err) => {
                console.warn('FolderCache.saveProjectCache failed:', err && err.message ? err.message : err);
            });
        }

        return record;
    }

    globalScope.FolderProjectService = {
        pickAndRegisterProject,
        buildProjectRecordFromFileMap,
        registerProjectRecord,
        getProjectRecord,
        getProjectPayload,
        getModuleData,
        updateModuleData,
        writeModuleToDisk,
        attachWriteHandle,
        listProjects,
        isFolderProject,
        __test__: {
            normalizeRelativePath,
            discoverProjectTaskFilesFromMap,
            resolveRootModuleRelativeFromMap,
            collectProjectModulesFromMap,
            buildProjectRecordFromFileMap,
            updateModuleData,
            writeModuleToDisk
        }
    };
})(typeof window !== 'undefined' ? window : globalThis);