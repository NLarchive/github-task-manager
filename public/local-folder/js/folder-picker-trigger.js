/**
 * UI binding layer for launching the local-folder picker from browser surfaces.
 *
 * This module keeps DOM wiring separate from folder scanning so list and graph
 * UIs can reuse the same picker behavior with feature-specific callbacks.
 */

(function (globalScope) {
    function logPrefix(trigger, action) {
        const triggerId = trigger && trigger.id ? `#${trigger.id}` : '[unknown-trigger]';
        return `[FolderProjectUI] ${triggerId} ${action}`;
    }

    function resolveElement(target) {
        if (!target) return null;
        if (typeof target === 'string') return globalScope.document ? globalScope.document.getElementById(target) : null;
        return target;
    }

    function setResultState(resultEl, message, status = 'info') {
        if (!resultEl) return;
        if (!message) {
            resultEl.hidden = true;
            resultEl.innerHTML = '';
            resultEl.dataset.status = '';
            return;
        }

        resultEl.hidden = false;
        resultEl.dataset.status = status;
        resultEl.innerHTML = message;
    }

    function bindFolderProjectPicker(options = {}) {
        const trigger = resolveElement(options.trigger);
        const result = resolveElement(options.result);
        const service = globalScope.FolderProjectService;
        if (!trigger || !service || typeof service.pickAndRegisterProject !== 'function') return null;

        const idleLabel = String(options.idleLabel || trigger.textContent || 'Open Local Folder').trim();
        const loadingLabel = String(options.loadingLabel || 'Opening folder picker...').trim();

        const handleClick = async () => {
            console.info(logPrefix(trigger, 'start'), {
                idleLabel,
                loadingLabel,
                hasResultElement: Boolean(result)
            });
            trigger.disabled = true;
            trigger.textContent = loadingLabel;
            setResultState(result, 'Opening folder picker. The app will index paths and read only node.tasks.json files.', 'info');

            try {
                const projectRecord = await service.pickAndRegisterProject();
                if (!projectRecord) {
                    const cancelMessage = typeof options.cancelMessage === 'function'
                        ? options.cancelMessage()
                        : 'No folder was loaded. If you selected a folder and this still appears, use Chrome/Edge and check console logs starting with [FolderProjectService].';
                    console.info(logPrefix(trigger, 'cancelled'));
                    setResultState(result, cancelMessage, 'error');
                    if (typeof options.onCancel === 'function') {
                        options.onCancel();
                    }
                    return;
                }

                console.info(logPrefix(trigger, 'project-picked'), {
                    projectId: projectRecord.id,
                    templateId: projectRecord.templateId,
                    rootModuleRelative: projectRecord.rootModuleRelative,
                    fileCount: projectRecord.fileCount || 0,
                    discoveredFiles: Array.isArray(projectRecord.discoveredFiles) ? projectRecord.discoveredFiles : []
                });

                if (typeof options.onProjectLoaded === 'function') {
                    const activationResult = await options.onProjectLoaded(projectRecord);
                    if (activationResult === false) {
                        throw new Error(`Folder project ${projectRecord.id} was parsed but the UI did not activate it.`);
                    }
                }

                const successMessage = typeof options.successMessage === 'function'
                    ? options.successMessage(projectRecord)
                    : `Loaded <strong>${projectRecord.label || projectRecord.id}</strong> (${projectRecord.fileCount || 0} node.tasks.json file${projectRecord.fileCount === 1 ? '' : 's'}, ${projectRecord.indexedPathCount || 0} indexed path${projectRecord.indexedPathCount === 1 ? '' : 's'})`;
                console.info(logPrefix(trigger, 'success'), {
                    projectId: projectRecord.id,
                    successMessage
                });
                setResultState(result, successMessage, 'success');
            } catch (error) {
                const message = error && error.message ? error.message : String(error);
                console.error(logPrefix(trigger, 'error'), error);
                setResultState(result, `Error: ${message}`, 'error');
                if (typeof options.onError === 'function') {
                    options.onError(error);
                }
            } finally {
                trigger.disabled = false;
                trigger.textContent = idleLabel;
            }
        };

        trigger.addEventListener('click', handleClick);
        return {
            destroy() {
                trigger.removeEventListener('click', handleClick);
            }
        };
    }

    globalScope.FolderProjectUI = {
        bindFolderProjectPicker
    };
})(typeof window !== 'undefined' ? window : globalThis);