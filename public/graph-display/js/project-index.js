import {
    buildLegendEntries,
    escapeHtml,
    formatBytes,
    getFileExtension,
    getFileTypeKey,
    getLegendLabel,
    getNodeColor,
    getNodeRadius,
    isTextLikeFileName,
    truncateLabel
} from './shared/project-graph-utils.js';

const BROWSER_IGNORED_DIRS = new Set(['.git', 'node_modules', 'playwright-report', 'test-results', 'history', 'state', 'tour', '.wrangler']);
const PREVIEW_MAX_CHARS = 160000;
const ROOT_LABELS = Object.freeze({
    repo: 'Repo Root',
    public: 'Public/',
    graph: 'Graph Display/',
    tasksdb: 'tasksDB/',
    browser: 'Browser Folder'
});

const state = {
    mode: 'server',
    rootKey: 'repo',
    rootLabel: ROOT_LABELS.repo,
    currentPath: '',
    currentSnapshot: null,
    selectedEntry: null,
    browserRootHandle: null,
    browserHandleMap: new Map(),
    browserStatsCache: new Map()
};

const dom = {};

document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    bindEvents();
    loadServerDirectory('repo', '');
});

function cacheDom() {
    dom.loadRepoRoot = document.getElementById('load-repo-root');
    dom.loadPublicRoot = document.getElementById('load-public-root');
    dom.loadGraphRoot = document.getElementById('load-graph-root');
    dom.pickBrowserFolder = document.getElementById('pick-browser-folder');
    dom.pathInput = document.getElementById('path-input');
    dom.openPathButton = document.getElementById('open-path-button');
    dom.statusLine = document.getElementById('status-line');
    dom.breadcrumbs = document.getElementById('breadcrumbs');
    dom.graphCanvas = document.getElementById('graph-canvas');
    dom.graphLegend = document.getElementById('graph-legend');
    dom.selectionSummary = document.getElementById('selection-summary');
    dom.directoryList = document.getElementById('directory-list');
    dom.filePreview = document.getElementById('file-preview');
}

function bindEvents() {
    dom.loadRepoRoot.addEventListener('click', () => loadServerDirectory('repo', ''));
    dom.loadPublicRoot.addEventListener('click', () => loadServerDirectory('public', ''));
    dom.loadGraphRoot.addEventListener('click', () => loadServerDirectory('graph', ''));
    dom.pickBrowserFolder.addEventListener('click', pickBrowserFolder);
    dom.openPathButton.addEventListener('click', openTypedPath);
    dom.pathInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') openTypedPath();
    });
}

function normalizePath(value) {
    return String(value || '')
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/^\.\//, '')
        .split('/')
        .filter(Boolean)
        .join('/');
}

function setStatus(message, tone = 'info') {
    dom.statusLine.textContent = message;
    dom.statusLine.dataset.tone = tone;
}

function describeDirectory(entry) {
    return `${entry.totalNodeCount || 0} total nodes · ${entry.totalFileCount || 0} files · ${entry.totalDirectoryCount || 0} folders`;
}

function describeFile(entry) {
    const extension = getFileExtension(entry.name || entry.relativePath || '');
    const typeLabel = extension ? extension : 'file';
    return `${typeLabel} · ${formatBytes(entry.sizeBytes || 0)}`;
}

async function openTypedPath() {
    const normalizedPath = normalizePath(dom.pathInput.value);
    if (state.mode === 'browser') {
        const record = state.browserHandleMap.get(normalizedPath || '');
        if (!record || record.kind !== 'directory') {
            setStatus('That path is not available in the currently picked folder. Use the graph, breadcrumbs, or pick a new folder.', 'error');
            return;
        }
        await loadBrowserDirectory(record.handle, normalizedPath);
        return;
    }

    await loadServerDirectory(state.rootKey, normalizedPath);
}

async function loadServerDirectory(rootKey, relativePath = '') {
    const normalizedPath = normalizePath(relativePath);
    const rootLabel = ROOT_LABELS[rootKey] || rootKey;
    setStatus(`Loading ${rootLabel}${normalizedPath ? `/${normalizedPath}` : ''}...`);

    try {
        const response = await fetch(`/api/project-tree?root=${encodeURIComponent(rootKey)}&path=${encodeURIComponent(normalizedPath)}`, {
            cache: 'no-store'
        });
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
            throw new Error(payload.error || `Server responded with ${response.status}`);
        }

        state.mode = 'server';
        state.rootKey = rootKey;
        state.rootLabel = rootLabel;
        state.currentPath = payload.directory.relativePath || '';
        state.currentSnapshot = payload;
        state.selectedEntry = payload.directory;
        dom.pathInput.value = state.currentPath;

        renderAll();
        setStatus(`Loaded ${payload.directory.name} with ${payload.directory.children.length} visible items from ${rootLabel}.`, 'success');
    } catch (error) {
        setStatus(`Could not load the server tree: ${error.message}. Use the browser folder picker as a fallback.`, 'error');
    }
}

function buildBrowserBreadcrumbs(relativePath) {
    const breadcrumbs = [{ name: state.browserRootHandle?.name || ROOT_LABELS.browser, relativePath: '' }];
    if (!relativePath) return breadcrumbs;

    const parts = relativePath.split('/');
    parts.forEach((part, index) => {
        breadcrumbs.push({
            name: part,
            relativePath: parts.slice(0, index + 1).join('/')
        });
    });
    return breadcrumbs;
}

async function pickBrowserFolder() {
    if (typeof window.showDirectoryPicker !== 'function') {
        setStatus('The browser folder picker requires a Chromium-based browser with File System Access enabled.', 'error');
        return;
    }

    try {
        const handle = await window.showDirectoryPicker({ mode: 'read' });
        if (!handle) return;

        state.browserRootHandle = handle;
        state.browserHandleMap = new Map();
        state.browserStatsCache = new Map();
        await loadBrowserDirectory(handle, '');
    } catch (error) {
        if (error && error.name === 'AbortError') return;
        setStatus(`Could not open a browser folder: ${error.message}`, 'error');
    }
}

async function getBrowserDirectoryStats(directoryHandle, relativePath) {
    const cacheKey = relativePath || '';
    if (state.browserStatsCache.has(cacheKey)) {
        return state.browserStatsCache.get(cacheKey);
    }

    const pending = (async () => {
        state.browserHandleMap.set(cacheKey, { kind: 'directory', handle: directoryHandle });

        let directFileCount = 0;
        let directDirectoryCount = 0;
        let descendantFileCount = 0;
        let descendantDirectoryCount = 0;

        for await (const [entryName, entryHandle] of directoryHandle.entries()) {
            const childPath = normalizePath(cacheKey ? `${cacheKey}/${entryName}` : entryName);

            if (entryHandle.kind === 'directory') {
                if (BROWSER_IGNORED_DIRS.has(entryName)) continue;
                directDirectoryCount += 1;
                const childStats = await getBrowserDirectoryStats(entryHandle, childPath);
                descendantFileCount += childStats.totalFileCount;
                descendantDirectoryCount += childStats.totalDirectoryCount;
                continue;
            }

            if (entryHandle.kind !== 'file') continue;
            state.browserHandleMap.set(childPath, { kind: 'file', handle: entryHandle });
            directFileCount += 1;
        }

        const totalFileCount = directFileCount + descendantFileCount;
        const totalDirectoryCount = directDirectoryCount + descendantDirectoryCount;
        return {
            kind: 'directory',
            name: cacheKey ? directoryHandle.name : (state.browserRootHandle?.name || directoryHandle.name),
            relativePath: cacheKey,
            directFileCount,
            directDirectoryCount,
            descendantFileCount,
            descendantDirectoryCount,
            totalFileCount,
            totalDirectoryCount,
            totalNodeCount: totalFileCount + totalDirectoryCount
        };
    })();

    state.browserStatsCache.set(cacheKey, pending);
    return pending;
}

async function buildBrowserFileSummary(fileHandle, relativePath) {
    state.browserHandleMap.set(relativePath, { kind: 'file', handle: fileHandle });
    const file = await fileHandle.getFile();
    return {
        kind: 'file',
        name: file.name,
        relativePath,
        extension: getFileExtension(file.name),
        sizeBytes: file.size,
        totalNodeCount: 1,
        contentType: file.type || ''
    };
}

async function buildBrowserDirectorySnapshot(directoryHandle, relativePath = '') {
    const directory = await getBrowserDirectoryStats(directoryHandle, relativePath);
    const children = [];

    for await (const [entryName, entryHandle] of directoryHandle.entries()) {
        const childPath = normalizePath(relativePath ? `${relativePath}/${entryName}` : entryName);

        if (entryHandle.kind === 'directory') {
            if (BROWSER_IGNORED_DIRS.has(entryName)) continue;
            children.push(await getBrowserDirectoryStats(entryHandle, childPath));
            continue;
        }

        if (entryHandle.kind !== 'file') continue;
        children.push(await buildBrowserFileSummary(entryHandle, childPath));
    }

    children.sort((left, right) => {
        const leftRank = left.kind === 'directory' ? 0 : 1;
        const rightRank = right.kind === 'directory' ? 0 : 1;
        if (leftRank !== rightRank) return leftRank - rightRank;
        return left.name.localeCompare(right.name);
    });

    return {
        ok: true,
        root: 'browser',
        directory: {
            ...directory,
            children
        },
        breadcrumbs: buildBrowserBreadcrumbs(relativePath)
    };
}

async function loadBrowserDirectory(directoryHandle, relativePath = '') {
    const normalizedPath = normalizePath(relativePath);
    setStatus(`Scanning ${state.browserRootHandle?.name || ROOT_LABELS.browser}${normalizedPath ? `/${normalizedPath}` : ''}...`);

    state.browserStatsCache = new Map();
    const snapshot = await buildBrowserDirectorySnapshot(directoryHandle, normalizedPath);

    state.mode = 'browser';
    state.rootKey = 'browser';
    state.rootLabel = state.browserRootHandle?.name || ROOT_LABELS.browser;
    state.currentPath = snapshot.directory.relativePath || '';
    state.currentSnapshot = snapshot;
    state.selectedEntry = snapshot.directory;
    dom.pathInput.value = state.currentPath;

    renderAll();
    setStatus(`Loaded ${snapshot.directory.name} with ${snapshot.directory.children.length} visible items from the browser picker.`, 'success');
}

function renderAll() {
    renderBreadcrumbs();
    renderGraph();
    renderLegend();
    renderSelection();
    renderDirectoryList();
    clearPreview();
}

function renderBreadcrumbs() {
    const breadcrumbs = state.currentSnapshot?.breadcrumbs || [];
    dom.breadcrumbs.innerHTML = '';

    breadcrumbs.forEach((entry, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = entry.name;
        if (index === breadcrumbs.length - 1) button.classList.add('active');
        button.addEventListener('click', async () => {
            if (state.mode === 'browser') {
                const record = state.browserHandleMap.get(entry.relativePath || '');
                if (!record || record.kind !== 'directory') return;
                await loadBrowserDirectory(record.handle, entry.relativePath || '');
                return;
            }
            await loadServerDirectory(state.rootKey, entry.relativePath || '');
        });
        dom.breadcrumbs.appendChild(button);
    });
}

function renderLegend() {
    const entries = state.currentSnapshot?.directory?.children || [];
    const legendEntries = buildLegendEntries(entries);
    dom.graphLegend.innerHTML = legendEntries.map((entry) => `
        <span class="legend-chip">
            <span class="legend-swatch" style="background:${entry.color}"></span>
            <span>${escapeHtml(entry.label)} (${entry.count})</span>
        </span>
    `).join('');
}

function renderSelection() {
    const entry = state.selectedEntry || state.currentSnapshot?.directory;
    if (!entry) {
        dom.selectionSummary.innerHTML = '<p>No directory loaded yet.</p>';
        return;
    }

    const isDirectory = entry.kind === 'directory' || entry.kind === 'root' || Boolean(entry.children);
    const statsMarkup = isDirectory
        ? `
            <div class="stat-grid">
                <div class="stat-card"><strong>${entry.totalNodeCount || 0}</strong><span>Total visible descendants</span></div>
                <div class="stat-card"><strong>${entry.totalFileCount || 0}</strong><span>Files below this folder</span></div>
                <div class="stat-card"><strong>${entry.totalDirectoryCount || 0}</strong><span>Folders below this folder</span></div>
                <div class="stat-card"><strong>${entry.directFileCount || 0}/${entry.directDirectoryCount || 0}</strong><span>Direct files / folders</span></div>
            </div>
        `
        : `
            <div class="stat-grid">
                <div class="stat-card"><strong>${formatBytes(entry.sizeBytes || 0)}</strong><span>File size</span></div>
                <div class="stat-card"><strong>${escapeHtml(getLegendLabel(getFileTypeKey(entry)))}</strong><span>Detected file type</span></div>
            </div>
        `;

    dom.selectionSummary.innerHTML = `
        <div class="selection-card">
            <h3>${escapeHtml(entry.name || state.rootLabel)}</h3>
            <div class="selection-kind">${escapeHtml(isDirectory ? 'Directory node' : 'File node')}</div>
            <div class="selection-path">${escapeHtml(entry.relativePath || '/')}</div>
            <p>${escapeHtml(isDirectory ? describeDirectory(entry) : describeFile(entry))}</p>
            ${statsMarkup}
        </div>
    `;
}

function clearPreview() {
    if (state.selectedEntry && state.selectedEntry.kind === 'file' && typeof state.selectedEntry.content === 'string') {
        const suffix = state.selectedEntry.truncated ? '\n\n... preview truncated ...' : '';
        dom.filePreview.textContent = `${state.selectedEntry.content}${suffix}`;
        dom.filePreview.dataset.empty = 'false';
        return;
    }

    dom.filePreview.textContent = 'Select a file node to load a text preview.';
    dom.filePreview.dataset.empty = 'true';
}

function renderDirectoryList() {
    const entries = state.currentSnapshot?.directory?.children || [];
    if (!entries.length) {
        dom.directoryList.innerHTML = '<p>This directory has no visible children after ignored folders are removed.</p>';
        return;
    }

    dom.directoryList.innerHTML = '';
    entries.forEach((entry) => {
        const button = document.createElement('button');
        button.type = 'button';
        if (state.selectedEntry && state.selectedEntry.relativePath === entry.relativePath) {
            button.classList.add('active');
        }
        button.innerHTML = `
            <span class="entry-copy">
                <span>${entry.kind === 'directory' ? '📁' : '📄'}</span>
                <span class="entry-name">${escapeHtml(entry.name)}</span>
            </span>
            <span class="entry-meta">${escapeHtml(entry.kind === 'directory' ? `${entry.totalNodeCount || 0} nodes` : formatBytes(entry.sizeBytes || 0))}</span>
        `;
        button.addEventListener('click', () => handleEntryAction(entry));
        dom.directoryList.appendChild(button);
    });
}

async function handleEntryAction(entry) {
    if (!entry) return;

    if (entry.kind === 'directory') {
        if (state.mode === 'browser') {
            const record = state.browserHandleMap.get(entry.relativePath || '');
            if (!record || record.kind !== 'directory') {
                setStatus('That directory is not available in the current browser-picked tree.', 'error');
                return;
            }
            await loadBrowserDirectory(record.handle, entry.relativePath || '');
            return;
        }

        await loadServerDirectory(state.rootKey, entry.relativePath || '');
        return;
    }

    state.selectedEntry = entry;
    renderSelection();
    renderDirectoryList();
    await loadFilePreview(entry);
}

async function readBrowserFilePreview(relativePath) {
    const record = state.browserHandleMap.get(relativePath);
    if (!record || record.kind !== 'file') {
        throw new Error('The requested browser file is no longer available.');
    }

    const file = await record.handle.getFile();
    if (!isTextLikeFileName(file.name)) {
        return {
            kind: 'file',
            name: file.name,
            relativePath,
            extension: getFileExtension(file.name),
            sizeBytes: file.size,
            isText: false,
            truncated: false,
            content: `[Binary preview unavailable for ${file.name}]`
        };
    }

    const text = await file.text();
    return {
        kind: 'file',
        name: file.name,
        relativePath,
        extension: getFileExtension(file.name),
        sizeBytes: file.size,
        isText: true,
        truncated: text.length > PREVIEW_MAX_CHARS,
        content: text.slice(0, PREVIEW_MAX_CHARS)
    };
}

async function loadFilePreview(entry) {
    dom.filePreview.textContent = 'Loading preview...';
    dom.filePreview.dataset.empty = 'false';

    try {
        let filePayload;
        if (state.mode === 'browser') {
            filePayload = await readBrowserFilePreview(entry.relativePath);
        } else {
            const response = await fetch(`/api/file-content?root=${encodeURIComponent(state.rootKey)}&path=${encodeURIComponent(entry.relativePath)}`, {
                cache: 'no-store'
            });
            const payload = await response.json();
            if (!response.ok || !payload.ok) {
                throw new Error(payload.error || `Preview responded with ${response.status}`);
            }
            filePayload = payload.file;
        }

        state.selectedEntry = { ...entry, ...filePayload };
        renderSelection();
        clearPreview();
        setStatus(`Loaded preview for ${entry.name}.`, 'success');
    } catch (error) {
        dom.filePreview.textContent = `Preview unavailable.\n\n${error.message}`;
        dom.filePreview.dataset.empty = 'false';
        setStatus(`Could not load file preview: ${error.message}`, 'error');
    }
}

function renderGraph() {
    const d3Api = window.d3;
    const snapshot = state.currentSnapshot;
    if (!d3Api || !snapshot) return;

    const width = Math.max(dom.graphCanvas.clientWidth || 640, 640);
    const height = Math.max(dom.graphCanvas.clientHeight || 620, 620);
    dom.graphCanvas.innerHTML = '';

    const svg = d3Api.select(dom.graphCanvas)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('role', 'img')
        .attr('aria-label', 'Project explorer graph');

    const rootNode = {
        id: '__root__',
        kind: 'root',
        name: snapshot.directory.name,
        relativePath: snapshot.directory.relativePath || '',
        totalNodeCount: snapshot.directory.totalNodeCount || 1
    };

    const childNodes = snapshot.directory.children.map((entry) => ({
        ...entry,
        id: entry.relativePath || entry.name
    }));

    const nodes = [rootNode, ...childNodes];
    const links = childNodes.map((entry) => ({
        source: rootNode.id,
        target: entry.id
    }));

    rootNode.fx = width / 2;
    rootNode.fy = height / 2;

    const simulation = d3Api.forceSimulation(nodes)
        .force('link', d3Api.forceLink(links).id((node) => node.id).distance((link) => link.target.kind === 'directory' ? 160 : 124))
        .force('charge', d3Api.forceManyBody().strength(-560))
        .force('center', d3Api.forceCenter(width / 2, height / 2))
        .force('x', d3Api.forceX(width / 2).strength(0.04))
        .force('y', d3Api.forceY(height / 2).strength(0.04))
        .force('collide', d3Api.forceCollide().radius((node) => getNodeRadius(node) + 12));

    simulation.stop();
    for (let tickIndex = 0; tickIndex < 220; tickIndex += 1) {
        simulation.tick();
    }

    svg.append('g')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('class', 'graph-link')
        .attr('x1', (link) => link.source.x)
        .attr('y1', (link) => link.source.y)
        .attr('x2', (link) => link.target.x)
        .attr('y2', (link) => link.target.y);

    const selectedPath = state.selectedEntry?.relativePath || '';
    const nodeGroups = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('class', (node) => {
            const classes = ['graph-node'];
            if (node.kind === 'root') classes.push('root');
            if (node.relativePath === selectedPath && node.kind !== 'root') classes.push('selected');
            return classes.join(' ');
        })
        .attr('transform', (node) => `translate(${node.x}, ${node.y})`)
        .on('click', async (event, node) => {
            event.preventDefault();
            if (node.kind === 'root') {
                state.selectedEntry = snapshot.directory;
                renderSelection();
                renderDirectoryList();
                clearPreview();
                return;
            }
            await handleEntryAction(node);
        });

    nodeGroups.append('circle')
        .attr('r', (node) => getNodeRadius(node))
        .attr('fill', (node) => getNodeColor(node));

    nodeGroups.append('text')
        .attr('class', 'node-name')
        .attr('y', 4)
        .text((node) => truncateLabel(node.name, node.kind === 'root' ? 20 : 18));

    nodeGroups.append('text')
        .attr('class', 'node-meta')
        .attr('y', (node) => getNodeRadius(node) + 18)
        .text((node) => {
            if (node.kind === 'root') return `${node.totalNodeCount || 0} nodes visible below`;
            return node.kind === 'directory'
                ? `${node.totalNodeCount || 0} nodes`
                : (getFileExtension(node.name) || 'file');
        });

    nodeGroups.append('title')
        .text((node) => {
            if (node.kind === 'root') return `${node.name}\n${snapshot.directory.totalNodeCount || 0} descendant nodes`;
            return node.kind === 'directory'
                ? `${node.relativePath}\n${describeDirectory(node)}`
                : `${node.relativePath}\n${describeFile(node)}`;
        });
}