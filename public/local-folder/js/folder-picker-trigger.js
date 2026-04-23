/**
 * UI binding layer for launching the local-folder picker from browser surfaces.
 *
 * This module keeps DOM wiring separate from folder scanning so list and graph
 * UIs can reuse the same picker behavior with feature-specific callbacks.
 */

(function (globalScope) {
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
            trigger.disabled = true;
            trigger.textContent = loadingLabel;
            setResultState(result, 'Opening system folder picker...', 'info');

            try {
                const projectRecord = await service.pickAndRegisterProject();
                if (!projectRecord) {
                    setResultState(result, 'Folder selection canceled.', 'info');
                    return;
                }

                if (typeof options.onProjectLoaded === 'function') {
                    await options.onProjectLoaded(projectRecord);
                }

                const successMessage = typeof options.successMessage === 'function'
                    ? options.successMessage(projectRecord)
                    : `Loaded <strong>${projectRecord.label || projectRecord.id}</strong> (${projectRecord.fileCount || 0} task file${projectRecord.fileCount === 1 ? '' : 's'})`;
                setResultState(result, successMessage, 'success');
            } catch (error) {
                const message = error && error.message ? error.message : String(error);
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