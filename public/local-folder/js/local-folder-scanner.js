/**
 * Browser-side local-folder scanner and TaskDB project registry.
 *
 * It discovers `node.tasks.json` files from user-selected directories, builds a
 * normalized project payload, and stores the result for reuse across sessions.
 */

(function (globalScope) {
    const STORAGE_KEY = 'taskManagerLocalFolderProjects';
    const TASK_FILE_CANDIDATES = ['node.tasks.json'];
    const DISCOVERY_IGNORED_DIRS = new Set(['history', 'state', 'tour', 'node_modules', '.git']);

    function logFolderProject(action, details) {
        if (details === undefined) {
            console.info(`[FolderProjectService] ${action}`);
            return;
        }
        console.info(`[FolderProjectService] ${action}`, details);
    }

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

    function createEmptyFolderIndex() {
        return { directories: [], files: [] };
    }

    function addFolderIndexDirectory(folderIndex, relativePath) {
        const normalized = normalizeRelativePath(relativePath);
        if (!normalized) return;
        if (!folderIndex || !Array.isArray(folderIndex.directories)) return;
        folderIndex.directories.push(normalized);
    }

    function addFolderIndexFile(folderIndex, relativePath) {
        const normalized = normalizeRelativePath(relativePath);
        if (!normalized) return;
        if (!folderIndex || !Array.isArray(folderIndex.files)) return;
        folderIndex.files.push(normalized);
    }

    function addFolderIndexAncestors(folderIndex, relativePath) {
        const normalized = normalizeRelativePath(relativePath);
        if (!normalized || !normalized.includes('/')) return;

        const parts = normalized.split('/');
        let current = '';
        for (let index = 0; index < parts.length - 1; index += 1) {
            current = current ? `${current}/${parts[index]}` : parts[index];
            addFolderIndexDirectory(folderIndex, current);
        }
    }

    function finalizeFolderIndex(folderIndex) {
        const safeFolderIndex = folderIndex && typeof folderIndex === 'object'
            ? folderIndex
            : createEmptyFolderIndex();

        safeFolderIndex.directories = Array.from(new Set(
            (safeFolderIndex.directories || []).map(normalizeRelativePath).filter(Boolean)
        )).sort((a, b) => a.localeCompare(b));
        safeFolderIndex.files = Array.from(new Set(
            (safeFolderIndex.files || []).map(normalizeRelativePath).filter(Boolean)
        )).sort((a, b) => a.localeCompare(b));

        return safeFolderIndex;
    }

    function countFolderIndexEntries(folderIndex) {
        const safeFolderIndex = finalizeFolderIndex(folderIndex);
        return safeFolderIndex.directories.length + safeFolderIndex.files.length;
    }

    function buildFolderIndexFromPaths(paths) {
        const folderIndex = createEmptyFolderIndex();
        Array.from(paths || []).forEach((relativePath) => {
            addFolderIndexFile(folderIndex, relativePath);
            addFolderIndexAncestors(folderIndex, relativePath);
        });
        return finalizeFolderIndex(folderIndex);
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

    async function saveReplacementCopy(relativePath, updatedData) {
        const safePath = normalizeRelativePath(relativePath || 'node.tasks.json') || 'node.tasks.json';
        const fallbackName = fileNameFromPath(safePath) || 'node.tasks.json';
        const content = JSON.stringify(updatedData, null, 2);

        if (typeof globalScope.showSaveFilePicker === 'function') {
            try {
                const handle = await globalScope.showSaveFilePicker({
                    suggestedName: fallbackName,
                    types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
                });
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
                return {
                    success: true,
                    source: 'save-copy',
                    note: `Saved replacement copy as ${fallbackName}. Replace your existing file with this copy.`
                };
            } catch (error) {
                if (error && error.name === 'AbortError') {
                    return { success: false, source: 'save-copy', error: 'Save copy cancelled by user' };
                }
            }
        }

        if (typeof globalScope.document !== 'undefined' && typeof globalScope.URL !== 'undefined') {
            const blob = new globalScope.Blob([content], { type: 'application/json' });
            const url = globalScope.URL.createObjectURL(blob);
            const a = globalScope.document.createElement('a');
            a.href = url;
            a.download = fallbackName;
            globalScope.document.body.appendChild(a);
            a.click();
            globalScope.document.body.removeChild(a);
            globalScope.URL.revokeObjectURL(url);
            return {
                success: true,
                source: 'save-copy',
                note: `Downloaded replacement copy (${fallbackName}). Replace your existing file with the downloaded copy.`
            };
        }

        return { success: false, source: 'save-copy', error: 'Unable to create a replacement copy in this environment' };
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
        if (normalized === 'node.tasks.json') score += 105;
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

        for (const candidate of ['src/node.tasks.json', 'node.tasks.json']) {
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

    async function collectHandleFiles(directoryHandle, prefix = '', scanResult = null) {
        const result = scanResult && typeof scanResult === 'object'
            ? scanResult
            : { fileMap: {}, folderIndex: createEmptyFolderIndex() };
        if (!result.fileMap || typeof result.fileMap !== 'object') result.fileMap = {};
        if (!result.folderIndex || typeof result.folderIndex !== 'object') result.folderIndex = createEmptyFolderIndex();

        for await (const [entryName, entryHandle] of directoryHandle.entries()) {
            if (entryHandle.kind === 'directory') {
                if (DISCOVERY_IGNORED_DIRS.has(entryName)) continue;
                const nextPrefix = normalizeRelativePath(prefix ? `${prefix}/${entryName}` : entryName);
                addFolderIndexDirectory(result.folderIndex, nextPrefix);
                await collectHandleFiles(entryHandle, nextPrefix, result);
                continue;
            }

            if (entryHandle.kind !== 'file') continue;

            // Only read and index task files; skip all other files to avoid
            // processing the entire project tree content.
            if (!isTaskFileCandidate(entryName)) continue;

            const relativePath = normalizeRelativePath(prefix ? `${prefix}/${entryName}` : entryName);
            addFolderIndexFile(result.folderIndex, relativePath);

            const file = await entryHandle.getFile();
            const text = await file.text();
            result.fileMap[relativePath] = parseJsonFileText(text, relativePath);
        }

        result.folderIndex = finalizeFolderIndex(result.folderIndex);
        return result;
    }

    function collectInputFiles(fileList) {
        const files = Array.from(fileList || []);
        if (!files.length) {
            logFolderProject('collectInputFiles:empty-selection');
            return Promise.resolve(null);
        }

        const folderName = (() => {
            const relativePath = String(files[0].webkitRelativePath || '').replace(/\\/g, '/');
            return relativePath.split('/').filter(Boolean)[0] || 'local-folder';
        })();

        logFolderProject('collectInputFiles:start', {
            folderName,
            fileCount: files.length,
            candidateFileNames: files.filter(file => isTaskFileCandidate(file.name)).map(file => String(file.webkitRelativePath || file.name).replace(/\\/g, '/'))
        });

        const folderIndex = createEmptyFolderIndex();
        files.forEach((file) => {
            const relativePath = normalizeRelativePath(String(file.webkitRelativePath || file.name).replace(/\\/g, '/'));
            if (!relativePath) return;
            // Always collect ancestor directories (builds the folder structure index).
            addFolderIndexAncestors(folderIndex, relativePath);
            // Only record the file path itself for task files.
            if (isTaskFileCandidate(file.name)) {
                addFolderIndexFile(folderIndex, relativePath);
            }
        });

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
            logFolderProject('collectInputFiles:done', {
                folderName,
                discoveredFiles: Object.keys(fileMap),
                indexedPathCount: countFolderIndexEntries(folderIndex)
            });
            return { folderName, fileMap, folderIndex: finalizeFolderIndex(folderIndex) };
        });
    }

    function openInputDirectoryPicker() {
        return new Promise((resolve, reject) => {
            if (!globalScope.document || typeof globalScope.document.createElement !== 'function') {
                reject(new Error('Directory picker is not available in this browser.'));
                return;
            }

            logFolderProject('openInputDirectoryPicker:start');

            const input = globalScope.document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            // Accept only JSON files so the browser dialog shows a targeted file picker
            // rather than asking the user to upload their entire project folder.
            input.accept = '.json,application/json';
            input.style.position = 'fixed';
            input.style.left = '-9999px';
            input.style.opacity = '0';

            let settled = false;
            let cancelCheckTimer = null;
            let focusProbeAttempts = 0;
            const MAX_FOCUS_PROBE_ATTEMPTS = 20;
            const FOCUS_PROBE_INTERVAL_MS = 120;

            const finalize = (callback) => {
                if (settled) return;
                settled = true;
                cleanup();
                callback();
            };

            const cleanup = () => {
                input.removeEventListener('change', onChange);
                input.removeEventListener('cancel', onCancel);
                if (typeof globalScope.removeEventListener === 'function') {
                    globalScope.removeEventListener('focus', onWindowFocus);
                }
                if (cancelCheckTimer !== null) {
                    const clearTimer = typeof globalScope.clearTimeout === 'function'
                        ? globalScope.clearTimeout.bind(globalScope)
                        : clearTimeout;
                    clearTimer(cancelCheckTimer);
                    cancelCheckTimer = null;
                }
                if (input.parentNode) input.parentNode.removeChild(input);
            };

            const onChange = async () => {
                try {
                    logFolderProject('openInputDirectoryPicker:change', {
                        fileCount: input.files ? input.files.length : 0
                    });
                    const result = await collectInputFiles(input.files);
                    finalize(() => resolve(result));
                } catch (error) {
                    console.error('[FolderProjectService] openInputDirectoryPicker:error', error);
                    finalize(() => reject(error));
                }
            };

            const onCancel = () => {
                logFolderProject('openInputDirectoryPicker:cancel');
                finalize(() => resolve(null));
            };

            const onWindowFocus = () => {
                const schedule = typeof globalScope.setTimeout === 'function'
                    ? globalScope.setTimeout.bind(globalScope)
                    : setTimeout;

                // Browsers can return focus before the directory picker has finished
                // populating input.files; probe briefly before treating focus as cancel.
                focusProbeAttempts = 0;
                const probeForSelection = () => {
                    cancelCheckTimer = null;
                    if (settled) return;
                    const hasFiles = Boolean(input.files && input.files.length > 0);
                    if (hasFiles) {
                        logFolderProject('openInputDirectoryPicker:focus-selection-detected', {
                            fileCount: input.files.length
                        });
                        return;
                    }

                    focusProbeAttempts += 1;
                    if (focusProbeAttempts >= MAX_FOCUS_PROBE_ATTEMPTS) {
                        logFolderProject('openInputDirectoryPicker:focus-cancelled');
                        finalize(() => resolve(null));
                        return;
                    }

                    cancelCheckTimer = schedule(probeForSelection, FOCUS_PROBE_INTERVAL_MS);
                };

                cancelCheckTimer = schedule(probeForSelection, FOCUS_PROBE_INTERVAL_MS);
            };

            input.addEventListener('change', onChange, { once: true });
            input.addEventListener('cancel', onCancel, { once: true });
            if (typeof globalScope.addEventListener === 'function') {
                globalScope.addEventListener('focus', onWindowFocus);
            }
            globalScope.document.body.appendChild(input);
            input.click();
        });
    }

    async function pickFolderFiles() {
        if (typeof globalScope.showDirectoryPicker === 'function') {
            try {
                logFolderProject('pickFolderFiles:showDirectoryPicker');
                const directoryHandle = await globalScope.showDirectoryPicker({ mode: 'read' }).catch(async () => {
                    // Fall back to the browser default when explicit read mode is rejected.
                    logFolderProject('pickFolderFiles:showDirectoryPicker-fallback-default');
                    return await globalScope.showDirectoryPicker();
                });
                if (!directoryHandle) return null;
                const scanResult = await collectHandleFiles(directoryHandle);
                logFolderProject('pickFolderFiles:directoryHandle-picked', {
                    folderName: directoryHandle.name || 'local-folder',
                    discoveredFiles: Object.keys(scanResult.fileMap),
                    indexedPathCount: countFolderIndexEntries(scanResult.folderIndex)
                });
                return {
                    folderName: directoryHandle.name || 'local-folder',
                    fileMap: scanResult.fileMap,
                    folderIndex: scanResult.folderIndex,
                    __directoryHandle: directoryHandle
                };
            } catch (error) {
                if (error && error.name === 'AbortError') return null;
                console.warn('[FolderProjectService] pickFolderFiles:showDirectoryPicker-failed; falling back to input picker', error && error.message ? error.message : error);
                return openInputDirectoryPicker();
            }
        }

        logFolderProject('pickFolderFiles:no-showDirectoryPicker-fallback-input');
        return openInputDirectoryPicker();
    }

    function buildProjectRecordFromFileMap({ folderName, fileMap, folderIndex }) {
        const safeFileMap = fileMap && typeof fileMap === 'object' ? fileMap : {};
        const discoveredFiles = discoverProjectTaskFilesFromMap(safeFileMap);
        const resolvedFolderIndex = finalizeFolderIndex(folderIndex || buildFolderIndexFromPaths(Object.keys(safeFileMap)));
        logFolderProject('buildProjectRecordFromFileMap:start', {
            folderName,
            discoveredFiles,
            rawKeys: Object.keys(safeFileMap),
            indexedPathCount: countFolderIndexEntries(resolvedFolderIndex)
        });
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

        logFolderProject('buildProjectRecordFromFileMap:resolved', {
            projectId,
            projectName,
            rootModuleRelative: rootModuleRelative || 'node.tasks.json',
            fileCount: discoveredFiles.length,
            indexedPathCount: countFolderIndexEntries(resolvedFolderIndex)
        });

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
            folderIndex: resolvedFolderIndex,
            indexedPathCount: countFolderIndexEntries(resolvedFolderIndex),
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

        console.info('[FolderProjectService] writeModuleToDisk:start', { projectId: id, relativePath: normalizeRelativePath(relativePath) });

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
                    console.info('[FolderProjectService] writeModuleToDisk:fs-access:success', { projectId: id, relativePath: normalizeRelativePath(relativePath) });
                    return { success: true, source: 'fs-access' };
                }
            } catch (fsErr) {
                const msg = fsErr && fsErr.message ? fsErr.message : String(fsErr);
                console.warn('FolderCache FS writeback failed:', msg);
                const copyResult = await saveReplacementCopy(relativePath, updatedData);
                if (copyResult && copyResult.success) {
                    return copyResult;
                }
                return { success: false, error: msg, source: 'fs-access' };
            }
        }

        // Fallback: no writable handle is available, so create a replacement copy.
        const copyResult = await saveReplacementCopy(relativePath, updatedData);
        if (copyResult && copyResult.success) {
            console.info('[FolderProjectService] writeModuleToDisk:save-copy:success', { projectId: id, relativePath: normalizeRelativePath(relativePath) });
            return copyResult;
        }

        // Final fallback: keep browser cache only.
        return { success: true, source: 'localStorage-only', note: 'No writable folder handle available.' };
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
        logFolderProject('pickAndRegisterProject:picked', {
            folderName: picked.folderName,
            discoveredFiles: Object.keys(picked.fileMap || {}),
            indexedPathCount: countFolderIndexEntries(picked.folderIndex)
        });
        const record = buildProjectRecordFromFileMap(picked);
        registerProjectRecord(record);
        console.info('[FolderProjectService] pickAndRegisterProject:loaded', {
            projectId: record.id,
            rootModule: record.rootModuleRelative,
            fileCount: record.fileCount,
            indexedPathCount: record.indexedPathCount || 0
        });

        // Persist full scan to IndexedDB cache with the directory handle if available
        if (globalScope.FolderCache && typeof globalScope.FolderCache.saveProjectCache === 'function') {
            const dirHandle = picked.__directoryHandle || null;
            globalScope.FolderCache.saveProjectCache(record, picked.fileMap, dirHandle).catch((err) => {
                console.warn('FolderCache.saveProjectCache failed:', err && err.message ? err.message : err);
            });
        }

        return record;
    }

    /**
     * Create a new local project with a starter node.tasks.json.
     *
     * On localhost: calls POST /api/create-project to create the project under tasksDB/local/.
     * With FS Access API: prompts the user to pick a directory and writes starter JSON there.
     *
     * @param {string} projectName - Human-readable project name.
     * @returns {Promise<{projectId: string, templateId: string}|null>}
     */
    async function createLocalProject(projectName) {
        const rawName = String(projectName || '').trim();
        if (!rawName) throw new Error('Project name is required.');

        const localRuntime = (() => {
            try {
                const host = String(globalScope.location && globalScope.location.hostname || '');
                const port = String(globalScope.location && globalScope.location.port || '');
                const isLocalHost = host === 'localhost' || host === '127.0.0.1';
                const hasLocalApi = isLocalHost && (port === '3000' || port === '3100');
                return { isLocalHost, hasLocalApi };
            } catch {
                return { isLocalHost: false, hasLocalApi: false };
            }
        })();

        // Path 1: Dev server — create project via API (only when the Node.js dev server is available)
        if (localRuntime.hasLocalApi && typeof globalScope.fetch === 'function') {
            try {
                const res = await globalScope.fetch('/api/create-project', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectName: rawName })
                });
                if (res.status === 405 || res.status === 404) {
                    // Not the Node.js dev server (e.g. VS Code Live Server) — fall through to FS Access API
                } else {
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(data.error || `Server error: ${res.status}`);
                    return { projectId: data.projectId, templateId: data.templateId };
                }
            } catch (err) {
                if (err instanceof TypeError) {
                    // Network error — dev server not running, fall through to FS Access API
                } else {
                    throw err;
                }
            }
        }

        // Path 2: FS Access API — user picks a parent directory; app creates project subfolder.
        if (typeof globalScope.showDirectoryPicker === 'function') {
            let parentDirHandle;
            try {
                parentDirHandle = await globalScope.showDirectoryPicker({ mode: 'readwrite' });
            } catch {
                return null; // User cancelled
            }
            const projectId = sanitizeProjectId(rawName);
            const templateId = `${projectId}-tasks`;
            const starterPayload = {
                project: { name: rawName, description: '', start_date: new Date().toISOString().slice(0, 10), status: 'Not Started' },
                categories: [{ name: 'General', parent_category_name: null }],
                workers: [],
                tasks: [
                    { task_id: 1, task_name: 'Project Setup', description: 'Initial project setup', priority: 'High', status: 'Not Started', estimated_hours: 4, dependencies: [], subtasks: [] }
                ]
            };

            let projectDirHandle = parentDirHandle;
            try {
                if (typeof parentDirHandle.getDirectoryHandle === 'function') {
                    projectDirHandle = await parentDirHandle.getDirectoryHandle(projectId, { create: true });
                }
            } catch {
                // If subfolder creation fails, write directly in selected folder.
                projectDirHandle = parentDirHandle;
            }

            const fileHandle = await projectDirHandle.getFileHandle('node.tasks.json', { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(starterPayload, null, 2));
            await writable.close();

            // Build and register the project record from the new file
            const fileMap = { 'node.tasks.json': starterPayload };
            const record = buildProjectRecordFromFileMap({ folderName: projectId, fileMap, __directoryHandle: projectDirHandle });
            registerProjectRecord(record);
            if (globalScope.FolderCache && typeof globalScope.FolderCache.saveProjectCache === 'function') {
                globalScope.FolderCache.saveProjectCache(record, fileMap, projectDirHandle).catch(() => {});
            }
            return { projectId: record.id, templateId: record.templateId };
        }

        // Path 3: Download fallback — offer the starter JSON as a file download.
        // The user saves it to a folder of their choice, then uses "Open Local Folder" to load it.
        if (typeof globalScope.document !== 'undefined' && typeof globalScope.URL !== 'undefined') {
            const starterPayload = {
                project: { name: rawName, description: '', start_date: new Date().toISOString().slice(0, 10), status: 'Not Started' },
                categories: [{ name: 'General', parent_category_name: null }],
                workers: [],
                tasks: [
                    { task_id: 1, task_name: 'Project Setup', description: 'Initial project setup', priority: 'High', status: 'Not Started', estimated_hours: 4, dependencies: [], subtasks: [] }
                ]
            };
            const blob = new globalScope.Blob([JSON.stringify(starterPayload, null, 2)], { type: 'application/json' });
            const url = globalScope.URL.createObjectURL(blob);
            const a = globalScope.document.createElement('a');
            a.href = url;
            a.download = 'node.tasks.json';
            globalScope.document.body.appendChild(a);
            a.click();
            globalScope.document.body.removeChild(a);
            globalScope.URL.revokeObjectURL(url);
            throw new Error(
                'Your browser does not support direct folder creation. ' +
                'A starter node.tasks.json file has been downloaded — ' +
                'save it in a new folder, then use "📂 Open Local Folder" to load it.'
            );
        }

        throw new Error('New project creation requires the Node.js dev server (npm start) or a modern browser (Chrome/Edge) with File System Access API support.');
    }

    globalScope.FolderProjectService = {
        pickAndRegisterProject,
        createLocalProject,
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
            openInputDirectoryPicker,
            updateModuleData,
            writeModuleToDisk
        }
    };
})(typeof window !== 'undefined' ? window : globalThis);