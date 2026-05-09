import { CT, TYPE_META, CODE_TPL } from './types.js';
import { S, saveState, addRuntimeReport, clearRuntimeReports } from './state.js';
import { esc, ct, childrenOf, edgesInScope, toast, mkSvg, svgTxt, svgPt, loadFileContent } from './utils.js';
import { runRuntimeNode, runRuntimeTests } from './bridge.js';

// ─── DRAG + SIDEBAR STATE ───────────────────────────────────────────────────────
let _drag = null;
let _resize = null;
let _sidebarTab = 'library'; // 'library' | 'graph'
const _treeOpen = new Set([
  'root', 'lib:root',
  'lib:components', 'lib:components/agents', 'lib:components/tools',
  'lib:components/models', 'lib:components/subgraphs',
  'lib:workflows', 'lib:workflows/benchmarks'
]);
// ─── CANVAS ZOOM STATE ────────────────────────────────────────────────────────
let _canvasZoom = { scale: 1, tx: 0, ty: 0 };
let _canvasRenderQueued = false;
let _pan = null; // canvas background pan state

function requestCanvasRender() {
  if (_canvasRenderQueued) return;
  _canvasRenderQueued = true;
  const scheduler = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : (callback) => setTimeout(callback, 16);
  scheduler(() => {
    _canvasRenderQueued = false;
    renderCanvas();
  });
}

function wireCanvasInteractions(svg) {
  if (!svg || svg._agenticIdeWired) return;
  svg._agenticIdeWired = true;
  // Wheel: zoom toward cursor position
  svg.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const rect = svg.getBoundingClientRect();
    zoomCanvas(ev.deltaY < 0 ? 1.12 : 1 / 1.12, ev.clientX - rect.left, ev.clientY - rect.top);
  }, { passive: false });
  // Background mousedown: start canvas pan (deselect on click-without-drag is handled in mouseup)
  svg.addEventListener('mousedown', (ev) => {
    const tgt = ev.target;
    const isBackground = tgt === svg || tgt.id === 'cv';
    if (!isBackground) return;
    ev.preventDefault();
    _pan = { sx: ev.clientX, sy: ev.clientY, otx: _canvasZoom.tx, oty: _canvasZoom.ty, moved: false };
  });
}

function getTasksIntegrationConfig() {
  const config = window.AGENTIC_IDE_TASKS_INTEGRATION || {};
  return {
    enabled: config.enabled === true,
    registryUrl: config.registryUrl || null,
    projectBaseUrl: config.projectBaseUrl || null,
  };
}

function resolveTasksUrl(base, relativePath) {
  return new URL(relativePath, base || window.location.href).toString();
}

/** Switch sidebar view ('library' = component registry, 'graph' = graph hierarchy). */
export function setSidebarTab(tab) {
  _sidebarTab = tab;
  renderSidebar();
}

// Convert a mouse event to inner canvas coordinates (accounts for zoom/pan).
function svgPtInner(e) {
  const svg = document.getElementById('g');
  if (!svg) return { x: e.clientX, y: e.clientY };
  const cv = document.getElementById('cv');
  if (cv) {
    try {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(cv.getScreenCTM().inverse());
    } catch {}
  }
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const outer = pt.matrixTransform(svg.getScreenCTM().inverse());
  return {
    x: (outer.x - _canvasZoom.tx) / _canvasZoom.scale,
    y: (outer.y - _canvasZoom.ty) / _canvasZoom.scale
  };
}

/** Wire document-level drag events. Call once from main.js. */
export function setupDragEvents(saveStateFn) {
  document.addEventListener('mousemove', e => {
    // Canvas pan
    if (_pan) {
      const dx = e.clientX - _pan.sx;
      const dy = e.clientY - _pan.sy;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) _pan.moved = true;
      _canvasZoom.tx = _pan.otx + dx;
      _canvasZoom.ty = _pan.oty + dy;
      requestCanvasRender();
      return;
    }
    if (_resize) {
      const pt=svgPtInner(e); const n=S.nodes[_resize.nid]; if(!n) return;
      n.w=Math.max(96,_resize.ow+(pt.x-_resize.sx));
      n.h=Math.max(42,_resize.oh+(pt.y-_resize.sy));
      requestCanvasRender();
      return;
    }
    if (!_drag) return;
    const pt=svgPtInner(e); const n=S.nodes[_drag.nid]; if(!n) return;
    const dx=pt.x-_drag.sx, dy=pt.y-_drag.sy;
    if (Math.abs(dx)>2||Math.abs(dy)>2) _drag.moved=true;
    n.x=Math.max(0,_drag.ox+dx); n.y=Math.max(0,_drag.oy+dy);
    requestCanvasRender();
  });
  document.addEventListener('mouseup', () => {
    // End canvas pan; if no movement occurred treat it as a deselect click
    if (_pan) {
      if (!_pan.moved) {
        S.sel = null;
        S.selType = null;
        renderInspector();
        renderSidebar();
      }
      _pan = null;
      renderCanvas();
      return;
    }
    if (_resize) {
      saveStateFn();
      _resize = null;
      _drag = null;
      renderCanvas();
      return;
    }
    if (_drag) {
      const moved = !!_drag.moved;
      _drag = null;
      if (moved) {
        saveStateFn();
        renderCanvas();
      }
    }
  });
}

function typeRank(type) {
  const order = ['workflow','subgraph','agent','tool','model','file','prompt','skill','task','test','benchmark'];
  const idx = order.indexOf(type);
  return idx === -1 ? order.length : idx;
}

function childNodesOfId(nodeId) {
  return Object.values(S.nodes)
    .filter(n => n.parent === nodeId)
    .sort((a, b) => typeRank(a.type) - typeRank(b.type) || a.label.localeCompare(b.label));
}

function buildScopeCrumbs(scopeId) {
  const crumbs = [];
  let current = S.nodes[scopeId];
  while (current) {
    crumbs.push(current.id);
    current = current.parent ? S.nodes[current.parent] : null;
  }
  return crumbs.reverse();
}

function setScope(scopeId) {
  if (!S.nodes[scopeId]) return;
  S.scope = scopeId;
  S.crumbs = buildScopeCrumbs(scopeId);
}

function getFileNode(nodeId, file) {
  return Object.values(S.nodes).find(node => node.parent === nodeId && node.meta?.relative_file === file) || null;
}

function hasVisibleFiles(node) {
  const hasFileNodes = childNodesOfId(node.id).some(child => !!child.meta?.relative_file);
  return Array.isArray(node.files) && node.files.length > 0 && !hasFileNodes;
}

function hasVisibleChildren(node) {
  return childNodesOfId(node.id).length > 0;
}

function isTreeOpen(nodeId) {
  return _treeOpen.has(nodeId);
}

function ensureTreePathVisible(nodeId) {
  let current = S.nodes[nodeId];
  while (current) {
    _treeOpen.add(current.id);
    current = current.parent ? S.nodes[current.parent] : null;
  }
}

function toggleTreeNode(nodeId) {
  if (_treeOpen.has(nodeId)) _treeOpen.delete(nodeId);
  else _treeOpen.add(nodeId);
  renderSidebar();
}

function libraryEntryRank(kind) {
  const order = ['folder', 'node', 'file', 'symbol'];
  const idx = order.indexOf(kind);
  return idx === -1 ? order.length : idx;
}

function createLibraryEntry(id, kind, label, extra = {}) {
  return { id, kind, label, children: [], ...extra };
}

function ensureLibraryFolder(parent, segment, fullPath) {
  let child = parent.children.find(entry => entry.kind === 'folder' && entry.path === fullPath);
  if (!child) {
    child = createLibraryEntry(`lib:${fullPath || 'root'}`, 'folder', segment || 'workspace', {
      path: fullPath,
      title: fullPath || 'workspace'
    });
    parent.children.push(child);
  }
  return child;
}

function buildFileSymbolEntries(nodeId, file) {
  const fileNode = getFileNode(nodeId, file);
  const symbols = Array.isArray(fileNode?.meta?.symbols) ? fileNode.meta.symbols : [];
  return symbols.map((symbol, index) => createLibraryEntry(
    `lib:symbol:${nodeId}:${file}:${index}`,
    'symbol',
    symbol.label || symbol.name || `symbol_${index + 1}`,
    {
      symbolType: symbol.type || 'symbol',
      title: symbol.label || symbol.name || 'symbol',
      nodeId,
      file,
    }
  ));
}

function buildComponentFileTree(node) {
  const root = createLibraryEntry(`lib:node-files:${node.id}`, 'folder', node.label, { path: node.path });
  (node.files || []).forEach((file) => {
    const parts = String(file || '').split('/').filter(Boolean);
    if (!parts.length) return;
    let cursor = root;
    let currentPath = '';
    parts.forEach((segment, index) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const isLeaf = index === parts.length - 1;
      if (isLeaf) {
        const fileEntry = createLibraryEntry(`lib:file:${node.id}:${currentPath}`, 'file', segment, {
          nodeId: node.id,
          file,
          title: `${node.path}/${file}`,
          role: getFileNode(node.id, file)?.meta?.file_role || 'file',
        });
        fileEntry.children.push(...buildFileSymbolEntries(node.id, file));
        cursor.children.push(fileEntry);
        return;
      }
      cursor = ensureLibraryFolder(cursor, segment, `${node.id}/${currentPath}`);
    });
  });
  return root.children;
}

function buildLibraryTree() {
  const root = createLibraryEntry('lib:root', 'folder', 'workspace', { path: '' });
  Object.values(S.nodes)
    .filter(node => node.id !== 'root' && !node.meta?.relative_file)
    .sort((a, b) => String(a.path || '').localeCompare(String(b.path || '')) || typeRank(a.type) - typeRank(b.type) || a.label.localeCompare(b.label))
    .forEach((node) => {
      const parts = String(node.path || '').split('/').filter(Boolean);
      // Navigate to parent folder only (exclude the node's own directory from folder nesting)
      const folderParts = parts.length > 1 ? parts.slice(0, -1) : [];
      let cursor = root;
      let currentPath = '';
      folderParts.forEach((segment) => {
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;
        cursor = ensureLibraryFolder(cursor, segment, currentPath);
      });
      const nodeEntry = createLibraryEntry(`lib:node:${node.id}`, 'node', node.label, {
        nodeId: node.id,
        type: node.type,
        title: node.desc || node.path || node.label,
        children: buildComponentFileTree(node),
      });
      cursor.children.push(nodeEntry);
    });
  return root;
}

function renderLibraryEntry(entry, depth = 0) {
  const children = [...(entry.children || [])].sort((a, b) => {
    const rank = libraryEntryRank(a.kind) - libraryEntryRank(b.kind);
    if (rank) return rank;
    return String(a.label || '').localeCompare(String(b.label || ''));
  });
  const canToggle = children.length > 0;
  const open = canToggle && isTreeOpen(entry.id);
  const isNode = entry.kind === 'node';
  const isFile = entry.kind === 'file';
  const isSymbol = entry.kind === 'symbol';
  const selected = isNode
    ? S.sel === entry.nodeId && (S.selType === 'node' || S.selType === 'file')
    : isFile
      ? S.selType === 'file' && S.sel === (getFileNode(entry.nodeId, entry.file)?.id || entry.nodeId) && S.selFile === entry.file
      : false;
  const color = isNode ? ct(entry.type) : isFile ? ct('file') : ct('tool');
  const attrs = isNode
    ? `data-nid="${esc(entry.nodeId)}"`
    : isFile
      ? `data-fid="${esc(entry.nodeId)}::${esc(entry.file)}"`
      : isSymbol
        ? `data-symbol-file="${esc(entry.nodeId)}::${esc(entry.file)}"`
        : `data-folder-id="${esc(entry.id)}"`;
  const labelExtra = isNode
    ? `<span class="ti-type-lbl">${esc(entry.type)}</span>`
    : isSymbol
      ? `<span class="ti-type-lbl">${esc(entry.symbolType || 'symbol')}</span>`
      : '';
  let html = `<div class="ti ti-${esc(entry.kind)}${selected ? ' is-sel' : ''}" ${attrs} style="--ti-depth:${depth}" title="${esc(entry.title || entry.label)}">
    <button class="ti-toggle${canToggle ? '' : ' is-empty'}" data-tree-toggle="${esc(entry.id)}" aria-label="${open ? 'Collapse' : 'Expand'} ${esc(entry.label)}">${canToggle ? (open ? '▾' : '▸') : ''}</button>
    <span class="dot${isFile ? ' dot-file' : isSymbol ? ' dot-symbol' : ''}" style="${isFile || isSymbol ? '' : `background:${color.dot}`}"></span>
    <span class="ti-label">${esc(entry.label)}</span>
    ${labelExtra}
  </div>`;
  if (!open) return html;
  children.forEach((child) => {
    html += renderLibraryEntry(child, depth + 1);
  });
  return html;
}

function renderSidebarNode(node, depth, { showTypeLabel = false, includeChildren = false } = {}) {
  const color = ct(node.type);
  const selected = S.sel === node.id && (S.selType === 'node' || S.selType === 'file');
  const childNodes = includeChildren ? childNodesOfId(node.id) : [];
  const canToggle = childNodes.length > 0 || hasVisibleFiles(node);
  const open = canToggle && isTreeOpen(node.id);
  let html = `<div class="ti ti-node${selected?' is-sel':''}" data-nid="${esc(node.id)}" style="--ti-depth:${depth}" title="${esc(node.desc)}">
    <button class="ti-toggle${canToggle?'':' is-empty'}" data-tree-toggle="${esc(node.id)}" aria-label="${open?'Collapse':'Expand'} ${esc(node.label)}">${canToggle?(open?'▾':'▸'):''}</button>
    <span class="dot" style="background:${color.dot}"></span>
    <span class="ti-label">${esc(node.label)}</span>
    ${showTypeLabel?`<span class="ti-type-lbl">${esc(node.type)}</span>`:''}
  </div>`;
  if (!open) return html;

  if (hasVisibleFiles(node)) {
    node.files.forEach(file => {
      const fileSelected = S.sel === node.id && S.selType === 'file' && S.selFile === file;
      html += `<div class="ti ti-file${fileSelected?' is-sel':''}" data-fid="${esc(node.id)}::${esc(file)}" style="--ti-depth:${depth + 1}" title="${esc(node.path+'/'+file)}">
        <span class="ti-toggle is-empty" aria-hidden="true"></span>
        <span class="dot dot-file"></span>
        <span class="ti-label">${esc(file)}</span>
      </div>`;
    });
  }

  if (includeChildren) {
    childNodes.forEach(child => {
      html += renderSidebarNode(child, depth + 1, { showTypeLabel: true, includeChildren: true });
    });
  }

  return html;
}

function renderLibrarySidebar() {
  return renderLibraryEntry(buildLibraryTree(), 0);
}

function renderGraphSidebar() {
  const roots = Object.values(S.nodes)
    .filter(node => !node.parent || !S.nodes[node.parent])
    .sort((a, b) => typeRank(a.type) - typeRank(b.type) || a.label.localeCompare(b.label));
  if (!roots.length) {
    return '<div class="ti ti-grp">Graph</div><div class="ti" style="cursor:default">No graph nodes loaded.</div>';
  }
  let html = '<div class="ti ti-grp">Graph Hierarchy</div>';
  roots.forEach(node => {
    html += renderSidebarNode(node, 0, { showTypeLabel: true, includeChildren: true });
  });
  return html;
}

function editorLanguage(file) {
  const ext = String(file || '').split('.').pop()?.toLowerCase();
  if (ext === 'yaml' || ext === 'yml') return 'yaml';
  if (ext === 'md') return 'md';
  if (ext === 'py') return 'py';
  if (ext === 'json') return 'json';
  return 'js';
}

function highlightEditorLine(line, lang) {
  let html = esc(line);
  if (lang === 'yaml') {
    html = html.replace(/^([\s-]*)([A-Za-z0-9_]+:)/g, '$1<span class="key">$2</span>');
    html = html.replace(/"([^"]*)"/g, '"<span class="st">$1</span>"');
    html = html.replace(/\b(true|false|null)\b/g, '<span class="kw">$1</span>');
    return html;
  }
  if (lang === 'md') {
    html = html.replace(/^(#{1,6}\s.*)$/g, '<span class="kw">$1</span>');
    html = html.replace(/(```.*|`[^`]+`)/g, '<span class="st">$1</span>');
    html = html.replace(/(\*\*[^*]+\*\*|__[^_]+__)/g, '<span class="fn">$1</span>');
    return html;
  }
  if (lang === 'json') {
    html = html.replace(/^(\s*)"([^"]+)":/g, '$1"<span class="key">$2</span>":');
    html = html.replace(/: ("[^"]*")/g, ': <span class="st">$1</span>');
    html = html.replace(/\b(true|false|null)\b/g, '<span class="kw">$1</span>');
    return html;
  }
  if (lang === 'py') {
    html = html.replace(/#.*/g, '<span class="cm">$&</span>');
    html = html.replace(/\b(def|class|import|from|return|pass|if|elif|else|for|while|try|except|with|as)\b/g, '<span class="kw">$1</span>');
    html = html.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="st">$1</span>');
    return html;
  }
  html = html.replace(/\/\/.*$/g, '<span class="cm">$&</span>');
  html = html.replace(/\b(import|export|from|const|let|var|function|return|if|else|await|async|class|new|try|catch|throw|for|while)\b/g, '<span class="kw">$1</span>');
  html = html.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="st">$1</span>');
  return html;
}

function renderEditorHighlight(text, file) {
  const lang = editorLanguage(file);
  return String(text || '')
    .split('\n')
    .map((line, idx) => `<div class="code-line"><span class="ln">${idx + 1}</span><span>${highlightEditorLine(line, lang) || '&nbsp;'}</span></div>`)
    .join('');
}

function syncEditorHighlight(textarea, highlight, file) {
  if (!textarea || !highlight) return;
  highlight.innerHTML = renderEditorHighlight(textarea.value, file);
  highlight.scrollTop = textarea.scrollTop;
  highlight.scrollLeft = textarea.scrollLeft;
}

// ─── RENDER: SIDEBAR ──────────────────────────────────────────────────────
export function renderSidebar() {
  const tree = document.getElementById('tree');
  tree.innerHTML = _sidebarTab === 'graph' ? renderGraphSidebar() : renderLibrarySidebar();
  tree.querySelectorAll('[data-tree-toggle]').forEach(el => {
    el.addEventListener('click', ev => {
      ev.stopPropagation();
      toggleTreeNode(el.dataset.treeToggle);
    });
  });
  tree.querySelectorAll('[data-nid]').forEach(el =>
    {
      el.addEventListener('click', () => selectNode(el.dataset.nid));
      el.addEventListener('dblclick', ev => { ev.stopPropagation(); navigateToNode(el.dataset.nid); });
    });
  tree.querySelectorAll('[data-fid]').forEach(el => {
    const [nid,f] = el.dataset.fid.split('::');
    el.addEventListener('click', ev => { ev.stopPropagation(); openFile(nid,f); });
    el.addEventListener('dblclick', ev => { ev.stopPropagation(); navigateToNode(nid, { file: f }); });
  });
  tree.querySelectorAll('[data-symbol-file]').forEach(el => {
    const [nid, f] = el.dataset.symbolFile.split('::');
    el.addEventListener('click', ev => { ev.stopPropagation(); openFile(nid, f); });
    el.addEventListener('dblclick', ev => { ev.stopPropagation(); navigateToNode(nid, { file: f }); });
  });
}

// ─── CANVAS ZOOM CONTROLS ────────────────────────────────────────────────────
/**
 * Zoom the canvas by `factor` around viewport point (cx, cy).
 * When cx/cy are omitted the viewport centre is used.
 */
export function zoomCanvas(factor, cx, cy) {
  const svg = document.getElementById('g');
  const vw = (svg && svg.clientWidth) || 600;
  const vh = (svg && svg.clientHeight) || 400;
  const ox = cx !== undefined ? cx : vw / 2;
  const oy = cy !== undefined ? cy : vh / 2;
  const oldScale = _canvasZoom.scale;
  const newScale = Math.min(4, Math.max(0.15, oldScale * factor));
  // Adjust translation so the pivot point stays fixed in viewport space
  _canvasZoom.tx = ox - (ox - _canvasZoom.tx) * (newScale / oldScale);
  _canvasZoom.ty = oy - (oy - _canvasZoom.ty) * (newScale / oldScale);
  _canvasZoom.scale = newScale;
  renderCanvas();
}

export function centerCanvas() {
  const svg = document.getElementById('g');
  if (!svg) return;
  const nodes = childrenOf(S.scope);
  if (!nodes.length) { _canvasZoom = { scale: 1, tx: 0, ty: 0 }; renderCanvas(); return; }
  const vw = svg.clientWidth || 600;
  const vh = svg.clientHeight || 400;
  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const x2s = nodes.map(n => n.x + (n.w || 130));
  const y2s = nodes.map(n => n.y + (n.h || 50));
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const maxX = Math.max(...x2s), maxY = Math.max(...y2s);
  const gw = maxX - minX + 80, gh = maxY - minY + 80;
  const scale = Math.min(4, Math.max(0.15, Math.min(vw / gw, vh / gh) * 0.9));
  _canvasZoom = {
    scale,
    tx: (vw - gw * scale) / 2 - minX * scale + 40 * scale,
    ty: (vh - gh * scale) / 2 - minY * scale + 40 * scale
  };
  renderCanvas();
}

// ─── RENDER: CANVAS ───────────────────────────────────────────────────────
export function renderCanvas() {
  const svg = document.getElementById('g');
  wireCanvasInteractions(svg);
  svg.innerHTML='';
  const defs = mkSvg('defs');
  defs.innerHTML = `
    <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
      <path d="M1,1 L7,3 L1,5" stroke="#B4B2A9" stroke-width="1.2" fill="none"/>
    </marker>
    <marker id="arr-sel" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
      <path d="M1,1 L7,3 L1,5" stroke="#534AB7" stroke-width="1.2" fill="none"/>
    </marker>`;
  svg.appendChild(defs);

  // Apply zoom/pan transform to a group
  const view = mkSvg('g');
  view.setAttribute('id', 'cv');
  view.setAttribute('transform', `translate(${_canvasZoom.tx},${_canvasZoom.ty}) scale(${_canvasZoom.scale})`);
  svg.appendChild(view);

  const nodes = childrenOf(S.scope);
  const edges  = edgesInScope(S.scope);

  // Edges
  edges.forEach(e => {
    const fn=S.nodes[e.from], tn=S.nodes[e.to]; if(!fn||!tn) return;
    const isSel = S.sel===e.id;
    const x1=fn.x+(fn.w||130)/2, y1=fn.y+(fn.h||50);
    const x2=tn.x+(tn.w||130)/2, y2=tn.y;
    const my=(y1+y2)/2;
    const path=mkSvg('path');
    path.setAttribute('d',`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`);
    path.setAttribute('stroke',isSel?'#534AB7':'#B4B2A9');
    path.setAttribute('stroke-width',isSel?'2':'1.2');
    path.setAttribute('fill','none');
    path.setAttribute('marker-end',isSel?'url(#arr-sel)':'url(#arr)');
    path.style.cursor='pointer';
    path.addEventListener('click', ev => { ev.stopPropagation(); selectEdge(e.id); });
    view.appendChild(path);
    if (e.mapping) {
      const txt=mkSvg('text');
      txt.setAttribute('x',(x1+x2)/2+4); txt.setAttribute('y',my-4);
      txt.setAttribute('font-size','9'); txt.setAttribute('fill','#888780');
      txt.setAttribute('font-family','var(--mono)'); txt.textContent=e.mapping;
      view.appendChild(txt);
    }
  });

  // Nodes
  nodes.forEach(n => {
    const c = ct(n.type);
    const isSel = S.sel===n.id && S.selType==='node';
    const hasChildren = (n.children?.length || 0) > 0;
    const isComp = hasChildren;
    const NW=n.w||130, NH=n.h||50;
    const g=mkSvg('g'); g.setAttribute('transform',`translate(${n.x},${n.y})`);
    g.dataset.nid=n.id; g.style.cursor='pointer';
    const rect=mkSvg('rect');
    rect.setAttribute('width',NW); rect.setAttribute('height',NH); rect.setAttribute('rx','8');
    rect.setAttribute('fill',c.fill); rect.setAttribute('stroke',isSel?'#534AB7':c.stroke);
    rect.setAttribute('stroke-width',isSel?'2':'1.2');
    if (isComp) rect.setAttribute('stroke-dasharray','5,3');
    g.appendChild(rect);
    svgTxt(g,n.label,NW/2,14,10,c.text,'500','middle');
    svgTxt(g,n.type,NW/2,24,9,c.text2,'400','middle');
    if (n.inputs?.[0]) {
      const p=mkSvg('rect'); p.setAttribute('x','4'); p.setAttribute('y','32');
      p.setAttribute('width',NW/2-7); p.setAttribute('height','13'); p.setAttribute('rx','3');
      p.setAttribute('fill','rgba(255,255,255,0.42)'); p.setAttribute('stroke',c.stroke); p.setAttribute('stroke-width','0.5');
      g.appendChild(p); svgTxt(g,n.inputs.map(i=>i.n).slice(0,3).join(','),NW/4,41,8,c.text,'400','middle');
    }
    if (n.outputs?.[0]) {
      const p=mkSvg('rect'); p.setAttribute('x',NW/2+3); p.setAttribute('y','32');
      p.setAttribute('width',NW/2-7); p.setAttribute('height','13'); p.setAttribute('rx','3');
      p.setAttribute('fill','rgba(255,255,255,0.42)'); p.setAttribute('stroke',c.stroke); p.setAttribute('stroke-width','0.5');
      g.appendChild(p); svgTxt(g,n.outputs.map(o=>o.n).slice(0,3).join(','),NW*3/4,41,8,c.text,'400','middle');
    }
    if (isComp) svgTxt(g,c.icon,NW-6,11,11,c.text2,'400','end');
    const handle=mkSvg('rect');
    handle.setAttribute('x',Math.max(0,NW-10)); handle.setAttribute('y',Math.max(0,NH-10));
    handle.setAttribute('width','8'); handle.setAttribute('height','8'); handle.setAttribute('rx','2');
    handle.setAttribute('fill',isSel?'#534AB7':c.stroke); handle.setAttribute('opacity','0.55');
    handle.style.cursor='nwse-resize';
    handle.addEventListener('mousedown', ev => {
      ev.stopPropagation();
      const pt=svgPtInner(ev);
      _resize={nid:n.id, ow:NW, oh:NH, sx:pt.x, sy:pt.y};
    });
    g.appendChild(handle);
    g.addEventListener('mousedown', ev => {
      ev.stopPropagation();
      const pt=svgPtInner(ev);
      _drag={nid:n.id, ox:n.x, oy:n.y, sx:pt.x, sy:pt.y, moved:false};
    });
    g.addEventListener('click', ev => { ev.stopPropagation(); if(!_drag?.moved) selectNode(n.id); });
    g.addEventListener('dblclick', ev => { ev.stopPropagation(); if(hasChildren) drillIn(n.id); });
    view.appendChild(g);
  });
  renderCrumbs();
}

// ─── RENDER: CRUMBS ───────────────────────────────────────────────────────
export function renderCrumbs() {
  const el=document.getElementById('crumbs');
  el.innerHTML=S.crumbs.map((id,i) => {
    const n=S.nodes[id]; const label=n?n.label:id;
    if (i<S.crumbs.length-1) return `<span class="crumb" data-idx="${i}">${esc(label)}</span><span class="crumb-sep">/</span>`;
    return `<span class="crumb-cur">${esc(label)}</span>`;
  }).join('');
  el.querySelectorAll('.crumb').forEach(el => el.addEventListener('click', () => {
    const idx=parseInt(el.dataset.idx); S.crumbs.splice(idx+1);
    S.scope=S.crumbs[S.crumbs.length-1]; S.sel=null; renderAll();
  }));
}

// ─── RENDER: INSPECTOR ────────────────────────────────────────────────────
export function renderInspector() {
  const el=document.getElementById('inspector');
  if (!S.sel) { el.innerHTML='<p class="placeholder">Select a node or edge<br>to inspect and edit</p>'; return; }
  if (S.selType==='node') renderNodeInspector(S.nodes[S.sel]);
  else if (S.selType==='edge') renderEdgeInspector(S.edges[S.sel]);
  else if (S.selType==='file') renderFileInspector(S.sel, S.selFile);
}

export function renderNodeInspector(n) {
  if (!n) return;
  const el=document.getElementById('inspector');
  const c=ct(n.type); const hasChildren=(n.children?.length||0)>0;
  const meta=TYPE_META[n.type]||[];
  let html=`
    <div class="ifield"><div class="ilabel">id</div><input class="insp-input" data-f="id" value="${esc(n.id)}"></div>
    <div class="ifield"><div class="ilabel">type</div><span class="badge ${c.badge}">${n.type}</span></div>
    <div class="ifield"><div class="ilabel">label</div><input class="insp-input" data-f="label" value="${esc(n.label)}"></div>
    <div class="ifield"><div class="ilabel">description</div><textarea class="insp-input insp-ta" data-f="desc">${esc(n.desc)}</textarea></div>
    <div class="ifield"><div class="ilabel">path</div><input class="insp-input" data-f="path" value="${esc(n.path)}"></div>
    <div class="io-edit-row">
      <div><div class="ilabel">width</div><input class="insp-input" data-f="w" type="number" min="96" value="${esc(n.w||130)}"></div>
      <div><div class="ilabel">height</div><input class="insp-input" data-f="h" type="number" min="42" value="${esc(n.h||50)}"></div>
      <div></div>
    </div>`;
  if (meta.length) {
    html+=`<div class="insp-section">Type fields</div>`;
    meta.forEach(({f,l})=>{
      html+=`<div class="ifield"><div class="ilabel">${esc(l)}</div><input class="insp-input" data-f="meta.${f}" value="${esc(n.meta?.[f]||'')}"></div>`;
    });
  }
  html+=`<div class="insp-section">Inputs / Outputs</div>`;
  (n.inputs||[]).forEach((inp,i)=>{
    html+=`<div class="io-edit-row">
      <input class="insp-input" style="font-family:var(--mono);font-size:11px" data-port="in-${i}-n" value="${esc(inp.n)}">
      <input class="insp-input" style="font-family:var(--mono);font-size:11px;color:var(--muted)" data-port="in-${i}-t" value="${esc(inp.t)}">
      <button class="btn btn-icon btn-sm btn-danger" data-rm-port="in-${i}">×</button></div>`;
  });
  html+=`<button class="btn btn-sm" data-add-port="in" style="margin-bottom:4px">+ input</button>`;
  (n.outputs||[]).forEach((out,i)=>{
    html+=`<div class="io-edit-row">
      <input class="insp-input" style="font-family:var(--mono);font-size:11px" data-port="out-${i}-n" value="${esc(out.n)}">
      <input class="insp-input" style="font-family:var(--mono);font-size:11px;color:var(--muted)" data-port="out-${i}-t" value="${esc(out.t)}">
      <button class="btn btn-icon btn-sm btn-danger" data-rm-port="out-${i}">×</button></div>`;
  });
  html+=`<button class="btn btn-sm" data-add-port="out">+ output</button>`;
  html+=`<div class="insp-section">Files</div>`;
  (n.files||[]).forEach(f=>{ html+=`<div class="flink" data-open-file="${esc(n.id)}::${esc(f)}">${esc(f)}</div>`; });
  if (n.tests?.length) {
    html+=`<div class="insp-section">Tests</div>`;
    n.tests.forEach(t=>{ html+=`<div class="edge-pill">${esc(t)}</div>`; });
  }
  html+=`<div class="iactions">
    <button class="btn btn-sm btn-accent" data-save-node>💾 Save</button>
    ${hasChildren?`<button class="btn btn-sm" data-drill-in="${esc(n.id)}">open ⬡</button>`:''}
    <button class="btn btn-sm" data-edit-modal="${esc(n.id)}">Edit…</button>
    <button class="btn btn-sm btn-danger" data-delete-node="${esc(n.id)}">Delete</button>
  </div>`;
  el.innerHTML=html;
  el.querySelector('[data-save-node]')?.addEventListener('click', ()=>saveInspector(n.id));
  el.querySelector(`[data-drill-in="${n.id}"]`)?.addEventListener('click', ()=>drillIn(n.id));
  el.querySelectorAll('[data-rm-port]').forEach(btn=>btn.addEventListener('click', ()=>{
    const [dir,idx]=btn.dataset.rmPort.split('-');
    const list=dir==='in'?n.inputs:n.outputs; list.splice(parseInt(idx),1);
    saveState(); renderInspector(); renderCanvas();
  }));
  el.querySelectorAll('[data-add-port]').forEach(btn=>btn.addEventListener('click', ()=>{
    const list=btn.dataset.addPort==='in'?n.inputs:n.outputs;
    list.push({n:'param',t:'string'}); saveState(); renderInspector(); renderCanvas();
  }));
  el.querySelectorAll('[data-open-file]').forEach(link=>link.addEventListener('click', ()=>{
    const [nid,f]=link.dataset.openFile.split('::'); openFile(nid,f);
  }));
  // Wire edit-modal and delete after DOM is updated (avoids stale references)
  el.querySelector(`[data-edit-modal]`)?.addEventListener('click', () => {
    import('./modals.js').then(m => m.openNodeModal(n.id));
  });
  el.querySelector(`[data-delete-node]`)?.addEventListener('click', ()=>deleteNode(n.id));
}

export function renderEdgeInspector(e) {
  if (!e) return;
  const el=document.getElementById('inspector');
  const fn=S.nodes[e.from], tn=S.nodes[e.to];
  el.innerHTML=`
    <div class="ifield"><div class="ilabel">edge id</div><div class="ivalue-mono">${esc(e.id)}</div></div>
    <div class="ifield"><div class="ilabel">from</div><div class="flink" data-sel-node="${esc(e.from)}">${fn?esc(fn.label):esc(e.from)}</div></div>
    <div class="ifield"><div class="ilabel">to</div><div class="flink" data-sel-node="${esc(e.to)}">${tn?esc(tn.label):esc(e.to)}</div></div>
    <div class="ifield"><div class="ilabel">mapping</div><input class="insp-input" data-ef="mapping" value="${esc(e.mapping)}"></div>
    <div class="ifield"><div class="ilabel">transform</div><input class="insp-input" data-ef="transform" value="${esc(e.transform)}"></div>
    <div class="ifield"><div class="ilabel">condition</div><input class="insp-input" data-ef="condition" value="${esc(e.condition)}"></div>
    <div class="ifield"><div class="ilabel">edge type</div><div class="edge-pill">${esc(e.type||'data-flow')}</div></div>
    <div class="iactions">
      <button class="btn btn-sm btn-accent" data-save-edge>💾 Save</button>
      <button class="btn btn-sm btn-danger" data-del-edge="${esc(e.id)}">Delete</button>
    </div>`;
  el.querySelector('[data-save-edge]')?.addEventListener('click', ()=>{
    e.mapping=el.querySelector('[data-ef="mapping"]').value;
    e.transform=el.querySelector('[data-ef="transform"]').value;
    e.condition=el.querySelector('[data-ef="condition"]').value;
    saveState(); toast('Edge saved'); renderCanvas();
  });
  el.querySelector(`[data-del-edge="${e.id}"]`)?.addEventListener('click', ()=>deleteEdge(e.id));
  el.querySelectorAll('[data-sel-node]').forEach(link=>link.addEventListener('click', ()=>selectNode(link.dataset.selNode)));
}

export function renderFileInspector(nodeId, file) {
  const el=document.getElementById('inspector'); const n=S.nodes[nodeId]; if(!n) return;
  const fileNode = getFileNode(nodeId, file);
  const symbols = Array.isArray(fileNode?.meta?.symbols) ? fileNode.meta.symbols : [];
  const c=ct(n.type);
  el.innerHTML=`
    <div class="ifield"><div class="ilabel">file</div><div class="ivalue-mono">${esc(file)}</div></div>
    <div class="ifield"><div class="ilabel">component</div><div class="flink" data-sel-node="${esc(nodeId)}">${esc(n.label)}</div></div>
    <div class="ifield"><div class="ilabel">type</div><span class="badge ${c.badge}">${n.type}</span></div>
    <div class="ifield"><div class="ilabel">full path</div><div class="ivalue-mono">${esc(n.path+'/'+file)}</div></div>
    ${symbols.length ? `<div class="insp-section">Symbols</div>${symbols.map(symbol => `<div class="edge-pill">${esc(symbol.label || symbol.name)}</div>`).join('')}` : ''}
    <div class="iactions"><button class="btn btn-sm" data-sel-node="${esc(nodeId)}">← component</button></div>`;
  el.querySelectorAll('[data-sel-node]').forEach(link=>link.addEventListener('click', ()=>selectNode(link.dataset.selNode)));
}

export function saveInspector(nodeId) {
  const n=S.nodes[nodeId]; if(!n) return;
  const el=document.getElementById('inspector');
  el.querySelectorAll('[data-f]').forEach(inp=>{
    const key=inp.dataset.f;
    if (key.startsWith('meta.')) { if(!n.meta)n.meta={}; n.meta[key.slice(5)]=inp.value; }
    else if (key==='w' || key==='h') n[key]=Math.max(key==='w'?96:42, parseInt(inp.value,10)||0);
    else n[key]=inp.value;
  });
  el.querySelectorAll('[data-port]').forEach(inp=>{
    const [dir,idx,sub]=inp.dataset.port.split('-');
    const list=dir==='in'?n.inputs:n.outputs; if(list[idx]) list[idx][sub]=inp.value;
  });
  saveState(); toast('Component saved'); renderAll();
}

// ─── RENDER: BOTTOM PANEL ─────────────────────────────────────────────────
export function renderBottom() {
  const content=document.getElementById('bottom-content');
  if (S.btab==='tasks') { renderTasksPanel(); return; }
  if (S.btab==='tests') { renderTestsPanel(); return; }
  if (S.btab==='issues') { renderIssuesPanel(); return; }
  if (!S.sel) { content.innerHTML='<span style="color:var(--sub)">Select a node to inspect its definition.</span>'; return; }
  if ((S.btab==='json'||S.btab==='meta') && S.selType==='node') {
    renderJson(S.nodes[S.sel], S.btab==='meta');
  } else if (S.btab==='code') {
    if (S.selType==='file') {
      renderFileEditor(S.sel, S.selFile);
    } else {
      const n=S.nodes[S.sel]; if(n) renderCode(n, S.selFile);
    }
  } else if (S.btab==='edge' && S.selType==='edge') {
    renderEdgeJson(S.edges[S.sel]);
  } else {
    content.innerHTML='<span style="color:var(--sub)">Select a node or edge for this tab.</span>';
  }
}

export function renderJson(n, metaOnly = false) {
  if (!n) return;
  const payload = metaOnly
    ? {
        id: n.id,
        type: n.type,
        path: n.path,
        meta: n.meta || {},
        tests: n.tests || [],
      }
    : {
        id: n.id,
        type: n.type,
        label: n.label,
        path: n.path,
        description: n.desc || '',
        version: n.version || 1,
        inputs: n.inputs || [],
        outputs: n.outputs || [],
        files: n.files || [],
        tests: n.tests || [],
        meta: n.meta || {},
        children: n.children || [],
        parent: n.parent || null,
      };
  showText(JSON.stringify(payload, null, 2), 'json');
}

export function renderCode(n, file) {
  const tmpl=CODE_TPL[n.type];
  const resolvedFile=file || n.meta?.relative_file || n.files?.[0] || (n.type==='prompt' ? 'prompt.md' : 'schema.json');
  const text=tmpl?tmpl(n):`// ${n.id}\n// path: ${n.path}/${resolvedFile}\n// No code template for type: ${n.type}`;
  showText(text, editorLanguage(resolvedFile));
}

export function renderEdgeJson(e) {
  if (!e) return;
  showText(JSON.stringify({
    id: e.id,
    from: e.from,
    to: e.to,
    mapping: e.mapping || '',
    transform: e.transform || '',
    condition: e.condition || '',
    type: e.type || 'data-flow'
  }, null, 2), 'json');
}

export function showText(text, lang='json') {
  showLines(String(text || '').split('\n'), lang);
}

export function showLines(lines, lang) {
  const content=document.getElementById('bottom-content');
  const hdr=S.sel?`<div style="color:var(--sub);font-size:10px;margin-bottom:5px">${esc(S.sel)}${S.selFile?' / '+esc(S.selFile):''}</div>`:'';
  content.innerHTML=hdr+lines.map((l,i)=>{
    const h=highlightEditorLine(l, lang);
    return `<div class="code-line"><span class="ln">${i+1}</span><span>${h||'&nbsp;'}</span></div>`;
  }).join('');
}

function selectedRuntimeNode() {
  if (!S.sel) return null;
  if (S.selType === 'node' || S.selType === 'file') return S.nodes[S.sel] || null;
  return null;
}

function buildDefaultRuntimeInput(node) {
  const id = node?.id || '';
  const topic = 'LangGraph multi-agent patterns';
  const startedAt = new Date().toISOString();
  return {
    topic,
    prompt: topic,
    query: topic,
    text: 'Agentic IDE sample runtime payload from the browser.',
    html: '<article><h1>Agentic IDE</h1><p>Sample HTML payload for parser tests.</p></article>',
    results: [
      { title: 'Agentic IDE repo', url: 'https://example.com/repo', snippet: 'Repository overview' },
      { title: 'Component registry', url: 'https://example.com/registry', snippet: 'Registry details' }
    ],
    items: [
      { title: 'Alpha', score: 0.92, summary: 'Primary candidate' },
      { title: 'Beta', score: 0.71, summary: 'Secondary candidate' }
    ],
    componentId: id,
    benchmark_name: 'research_benchmark',
    run_label: `${id || 'node'}-${Date.now().toString(36)}`,
    started_at: startedAt,
  };
}

function reportSummary(report) {
  if (!report) return '';
  const payload = report.result ?? report.output ?? report.data ?? report;
  try {
    return JSON.stringify(payload, null, 2).slice(0, 800);
  } catch {
    return String(payload).slice(0, 800);
  }
}

async function handleRuntimeRun(nodeId) {
  const node = S.nodes[nodeId];
  if (!node) return;
  toast(`Running ${node.label}…`);
  try {
    const result = await runRuntimeNode(nodeId, buildDefaultRuntimeInput(node), { modelId: S.selectedModelId });
    addRuntimeReport({ kind: 'run', ok: result?.ok !== false, nodeId, result, steps: result?.steps || [] });
    toast(`Run completed for ${node.label}`);
  } catch (err) {
    addRuntimeReport({ kind: 'run', ok: false, nodeId, error: err.message });
    toast(`Run failed for ${node.label}`);
  }
  renderBottom();
}

async function handleRuntimeTests(nodeId) {
  const node = S.nodes[nodeId];
  if (!node) return;
  toast(`Testing ${node.label}…`);
  try {
    const result = await runRuntimeTests(nodeId, { modelId: S.selectedModelId });
    const ok = result?.ok !== false && !(Array.isArray(result?.tests) && result.tests.some(test => test.ok === false));
    addRuntimeReport({ kind: 'test', ok, nodeId, result, steps: result?.steps || [] });
    toast(`Tests finished for ${node.label}`);
  } catch (err) {
    addRuntimeReport({ kind: 'test', ok: false, nodeId, error: err.message });
    toast(`Tests failed for ${node.label}`);
  }
  renderBottom();
}

function renderStepsTable(steps) {
  if (!Array.isArray(steps) || !steps.length) return '';
  const maxMs = Math.max(...steps.map(s => s.durationMs || 0));
  const bottleneckId = steps.reduce((best, s) => (s.durationMs || 0) > (best.durationMs || 0) ? s : best, steps[0])?.nodeId;
  const rows = steps.map(s => {
    const pct = maxMs > 0 ? Math.round(((s.durationMs || 0) / maxMs) * 100) : 0;
    const isBottleneck = s.nodeId === bottleneckId && maxMs > 10;
    const statusCls = s.status === 'fail' ? 'is-fail' : 'is-pass';
    return `<tr class="step-row ${statusCls}" title="${esc(s.nodeId)}">
      <td class="step-node">${esc(s.label || s.nodeId)}</td>
      <td class="step-type">${esc(s.type || '')}</td>
      <td class="step-ms">${esc(String(s.durationMs ?? '?'))}ms
        <div class="step-bar" style="width:${pct}%;background:${isBottleneck ? 'var(--danger)' : 'var(--accent)'}"></div>
      </td>
      <td class="step-status">${isBottleneck ? '🐢 slow' : s.status === 'fail' ? '✕ error' : '✓'}</td>
      ${s.error ? `<td class="step-err" colspan="2">${esc(s.error)}</td>` : `<td class="step-in">${esc(JSON.stringify(s.inputSnippet || {}).slice(0,60))}</td><td class="step-out">${esc(JSON.stringify(s.outputSnippet || s.output || {}).slice(0,60))}</td>`}
    </tr>`;
  }).join('');
  return `<details class="steps-detail" open><summary>Execution steps (${steps.length}) — bottleneck: <strong>${esc(bottleneckId || 'n/a')}</strong></summary>
    <table class="steps-table">
      <thead><tr><th>component</th><th>type</th><th>time</th><th>status</th><th>input</th><th>output</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </details>`;
}

function renderCaseRow(tc) {
  const cls = tc.passed ? 'is-pass' : 'is-fail';
  const stepsHtml = renderStepsTable(tc.steps || []);
  return `<div class="report-card ${cls}">
    <div class="report-card-hdr">
      <strong>${esc(tc.name || 'case')}</strong>
      <span>${tc.passed ? '✓ pass' : '✕ fail'}</span>
    </div>
    ${tc.error ? `<div class="report-error">${esc(tc.error)}</div>` : ''}
    ${stepsHtml}
    ${!stepsHtml && tc.output ? `<pre class="report-snippet">${esc(JSON.stringify(tc.output, null, 2).slice(0, 600))}</pre>` : ''}
  </div>`;
}

export function renderTestsPanel() {
  const content=document.getElementById('bottom-content');
  const node = selectedRuntimeNode();
  const reports = node
    ? S.runtimeReports.filter(report => report.nodeId === node.id)
    : S.runtimeReports;
  const availableTests = node?.tests || [];
  const summary = reports.length
    ? `${reports.filter(report => report.ok !== false).length}/${reports.length} passed`
    : 'No runtime reports yet';

  const needsLlm = node?.type === 'agent' || node?.type === 'model';
  const llmNote = needsLlm && !S.bridgeStatus.llm
    ? `<div class="report-error" style="margin-bottom:6px">⚠ This component requires the LLM endpoint. Start llama-server on port 8080 to run live tests.</div>`
    : '';

  content.innerHTML=`<div class="report-panel">
    <div class="report-toolbar">
      <div>
        <div class="report-title">Tests & Runtime</div>
        <div class="report-sub">${esc(node ? node.label : 'Global runtime history')} • ${esc(summary)}</div>
      </div>
      <div class="report-actions">
        ${node ? `<button class="btn btn-sm" data-runtime-run="${esc(node.id)}">▶ Run</button>` : ''}
        ${node ? `<button class="btn btn-sm btn-accent" data-runtime-test="${esc(node.id)}">⚑ Test</button>` : ''}
        <button class="btn btn-sm" data-clear-reports>Clear</button>
      </div>
    </div>
    ${llmNote}
    <div class="report-meta-row">
      <span class="edge-pill">model: ${esc(S.selectedModelId || 'none')}</span>
      <span class="edge-pill">declared tests: ${availableTests.length}</span>
      <span class="edge-pill">reports: ${S.runtimeReports.length}</span>
      ${needsLlm ? `<span class="edge-pill" style="color:${S.bridgeStatus.llm ? 'var(--accent)' : 'var(--danger)'}">LLM: ${S.bridgeStatus.llm ? 'online' : 'offline'}</span>` : '<span class="edge-pill">tool: deterministic</span>'}
    </div>
    <div class="report-list">
      ${reports.length ? reports.map(report => {
        const testResult = report.result;
        const cases = Array.isArray(testResult?.cases) ? testResult.cases : [];
        const steps = report.steps || testResult?.steps || [];
        return `<div class="report-card ${report.ok === false ? 'is-fail' : 'is-pass'}">
          <div class="report-card-hdr">
            <strong>${esc(report.kind || 'report')}</strong>
            <span>${esc(new Date(report.createdAt).toLocaleString())}</span>
          </div>
          <div class="report-card-sub">${esc(report.nodeId || 'global')} • ${report.ok === false ? '✕ failed' : '✓ passed'}${testResult?.total ? ` • ${testResult.passed}/${testResult.total} cases` : ''}${testResult?.successRatio !== undefined ? ` • score: ${Math.round(testResult.successRatio * 100)}%` : ''}</div>
          ${report.error ? `<div class="report-error">${esc(report.error)}</div>` : ''}
          ${renderStepsTable(steps)}
          ${cases.length ? `<div class="report-list compact" style="margin-top:6px">${cases.map(renderCaseRow).join('')}</div>` : ''}
          ${!steps.length && !cases.length ? `<pre class="report-snippet">${esc(reportSummary(report))}</pre>` : ''}
        </div>`;
      }).join('') : '<div class="report-empty">Run a component or its tests to populate this panel.</div>'}
    </div>
  </div>`;

  content.querySelector('[data-clear-reports]')?.addEventListener('click', () => {
    clearRuntimeReports();
    renderTestsPanel();
  });
  content.querySelector('[data-runtime-run]')?.addEventListener('click', () => handleRuntimeRun(node.id));
  content.querySelector('[data-runtime-test]')?.addEventListener('click', () => handleRuntimeTests(node.id));
}

function collectIssues() {
  const node = selectedRuntimeNode();
  const issues = [];
  if (!S.bridgeStatus.bridge) {
    issues.push({ severity: 'error', title: 'Bridge server offline', detail: 'Start node public/agentic-ide/server/main.js to enable file IO, registry refresh, and runtime actions.' });
  } else if (!S.bridgeStatus.llm) {
    issues.push({ severity: 'warn', title: 'LLM endpoint unavailable', detail: S.bridgeStatus.ggufExists ? 'Model asset is present but the LLM endpoint did not respond.' : 'No discovered model asset is currently available.' });
  }
  (S.registryWarnings || []).forEach((warning) => {
    issues.push({ severity: 'warn', title: 'Registry warning', detail: warning });
  });
  (S.runtimeReports || [])
    .filter((report) => report.ok === false && (!node || report.nodeId === node.id))
    .forEach((report) => {
      issues.push({ severity: 'error', title: `${report.kind || 'Runtime'} failure`, detail: report.error || reportSummary(report) || 'Unknown runtime failure' });
    });
  return issues;
}

export function renderIssuesPanel() {
  const content=document.getElementById('bottom-content');
  const issues = collectIssues();
  content.innerHTML=`<div class="issues-panel">
    <div class="report-toolbar">
      <div>
        <div class="report-title">Issues</div>
        <div class="report-sub">${esc(selectedRuntimeNode()?.label || 'Workspace')} • ${issues.length} item(s)</div>
      </div>
    </div>
    <div class="issue-list">
      ${issues.length ? issues.map(issue => `
        <div class="issue-card ${issue.severity === 'error' ? 'is-error' : 'is-warn'}">
          <div class="issue-title">${esc(issue.title)}</div>
          <div class="issue-detail">${esc(issue.detail)}</div>
        </div>`).join('') : '<div class="report-empty">No active issues detected from the registry, bridge, or runtime history.</div>'}
    </div>
  </div>`;
}

/** Show file content as an editable textarea in the bottom panel. */
export async function renderFileEditor(nodeId, file) {
  const content=document.getElementById('bottom-content');
  const n=S.nodes[nodeId]; if(!n) return;
  const filePath=`${n.path}/${file}`;
  const key=`${n.path}::${file}`;
  content.innerHTML=`<div class="file-editor-wrap">
    <div class="file-editor-hdr">
      <span class="file-editor-path">${esc(filePath)}</span>
      <div style="display:flex;gap:6px">
        <button class="btn btn-sm" id="fe-download" title="Download file">⬇ Download</button>
        <button class="btn btn-sm btn-accent" id="fe-save" title="Save changes in memory">💾 Save</button>
      </div>
    </div>
    <div class="file-editor-body">
      <pre class="file-editor-hl" id="fe-highlight" aria-hidden="true"></pre>
      <textarea class="file-editor-ta" id="fe-content" spellcheck="false" placeholder="Loading…"></textarea>
    </div>
  </div>`;
  // Load content
  let text = S.fileContents[key];
  if (text === undefined) {
    text = await loadFileContent(n.path, file);
    if (text === null) {
      // Provide template placeholder
      text = `# ${filePath}\n# File content not found on server.\n# Edit here and use Download to save.\n`;
      S.fileContents[key] = text;
    }
  }
  const ta=document.getElementById('fe-content');
  const hl=document.getElementById('fe-highlight');
  if (ta) {
    ta.value=text;
    syncEditorHighlight(ta, hl, file);
    ta.addEventListener('input', () => syncEditorHighlight(ta, hl, file));
    ta.addEventListener('scroll', () => {
      if (!hl) return;
      hl.scrollTop = ta.scrollTop;
      hl.scrollLeft = ta.scrollLeft;
    });
  }
  document.getElementById('fe-save')?.addEventListener('click', async ()=>{
    S.fileContents[key] = ta.value;
    // Try to persist via bridge (writes to disk under public/agentic-ide/)
    import('./bridge.js').then(m => m.writeFile(n.path, file, ta.value)).then(ok => {
      toast(ok ? '\u2714 Saved to disk' : 'Saved in memory (bridge unavailable — run node public/agentic-ide/server/main.js)');
    }).catch(() => toast('Saved in memory (bridge unavailable)'));
  });
  document.getElementById('fe-download')?.addEventListener('click', ()=>{
    const blob=new Blob([ta.value],{type:'text/plain'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=file; a.click();
    URL.revokeObjectURL(a.href);
  });
}

/** Render the Tasks integration panel in the bottom panel. */
export async function renderTasksPanel() {
  const content=document.getElementById('bottom-content');
  const config = getTasksIntegrationConfig();
  if (!config.enabled) {
    content.innerHTML=`<div class="tasks-panel">
      <div class="tasks-panel-hdr">
        <strong style="font-size:10.5px">Project Tasks</strong>
      </div>
      <div class="tasks-list" id="tp-list">
        <div class="report-empty">Task-project integration is not configured for Agentic IDE yet.</div>
        <div class="report-sub" style="padding:0 4px 8px">Enable <code>window.AGENTIC_IDE_TASKS_INTEGRATION</code> with explicit registry and base URLs when this panel is ready.</div>
      </div>
    </div>`;
    return;
  }
  content.innerHTML=`<div class="tasks-panel">
    <div class="tasks-panel-hdr">
      <strong style="font-size:10.5px">Project Tasks</strong>
      <select id="tp-project"><option value="">Loading…</option></select>
      <button class="btn btn-sm" id="tp-load">Load</button>
    </div>
    <div class="tasks-list" id="tp-list"><span style="color:var(--sub);font-size:11px">Select a project and click Load.</span></div>
  </div>`;
  // Load registry
  try {
    const registryUrl = resolveTasksUrl(window.location.href, config.registryUrl || '../tasksDB/registry.json');
    const reg=await fetch(registryUrl).then(async (response)=>{
      if (!response.ok) throw new Error(`registry ${response.status}`);
      return response.json();
    });
    const entries=Array.isArray(reg)?reg:Object.values(reg||{});
    const sel=document.getElementById('tp-project');
    sel.innerHTML='<option value="">— choose project —</option>'+entries.map(p=>{
      const id=p.id||p.path||JSON.stringify(p); const label=p.name||p.id||id;
      return `<option value="${esc(id)}">${esc(label)}</option>`;
    }).join('');
    document.getElementById('tp-load')?.addEventListener('click', ()=>loadTasksForPanel(entries, sel.value, config));
  } catch {
    content.querySelector('#tp-project').innerHTML='<option>Registry not configured</option>';
  }
}

async function loadTasksForPanel(entries, projectId, config = {}) {
  const list=document.getElementById('tp-list'); if(!list) return;
  list.innerHTML='<span style="color:var(--sub);font-size:11px">Loading…</span>';
  const entry=entries.find(p=>(p.id||p.path||JSON.stringify(p))===projectId);
  if (!entry) { list.innerHTML='<span style="color:var(--sub)">Unknown project</span>'; return; }
  try {
    const path=entry.dataPath||entry.path||entry.id;
    const projectBase = config.projectBaseUrl || '../tasksDB/';
    const data=await fetch(resolveTasksUrl(window.location.href, `${projectBase.replace(/\/?$/, '/')}${path}/node.tasks.json`)).then(async (response)=>{
      if (!response.ok) throw new Error(`tasks ${response.status}`);
      return response.json();
    });
    const tasks=Array.isArray(data)?data:(data.tasks||[]);
    if(!tasks.length){list.innerHTML='<span style="color:var(--sub)">No tasks found</span>'; return;}
    list.innerHTML=tasks.slice(0,50).map(t=>`
      <div class="task-pill" data-task-id="${esc(t.task_id||t.id)}">
        <span class="task-pill-name" title="${esc(t.description||'')}">
          <strong>${esc(t.task_id||t.id)}</strong> ${esc(t.task_name||t.name||'')}
        </span>
        <span class="task-pill-status">${esc(t.status||'')}</span>
        <button class="btn btn-sm task-pill-add" data-task-node='${JSON.stringify({id:t.task_id||t.id,name:t.task_name||t.name||'',desc:t.description||'',status:t.status||''})}'>+ node</button>
      </div>`).join('');
    list.querySelectorAll('[data-task-node]').forEach(btn=>btn.addEventListener('click', e=>{
      e.stopPropagation();
      try {
        const td=JSON.parse(btn.dataset.taskNode);
        addTaskNode(td);
      } catch {}
    }));
  } catch(err) {
    list.innerHTML=`<span style="color:var(--sub)">Failed to load tasks</span>`;
  }
}

function addTaskNode(td) {
  const id=`task_${String(td.id).replace(/[^a-z0-9_]/gi,'_')}`;
  if(S.nodes[id]){toast('Task node already exists'); return;}
  const node={id,type:'task',label:String(td.name||td.id).slice(0,28),
    path:`tasks/${id}`,desc:td.desc||'',version:1,
    inputs:[{n:'context',t:'object'}],outputs:[{n:'result',t:'object'}],
    files:['task.json'],tests:[],children:[],edgeIds:[],
    meta:{agent_ref:'',success:'result != null',task_ref:String(td.id)},
    parent:S.scope,x:40+Math.random()*200,y:60+Math.random()*120,w:130,h:50};
  S.nodes[id]=node;
  const par=S.nodes[S.scope];
  if(par&&!par.children.includes(id)) par.children.push(id);
  saveState(); renderAll(); renderInspector(); toast(`Added task node "${id}"`);
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────
export function selectNode(id) {
  window.agenticIdeCloseMobilePanels?.();
  const node = S.nodes[id];
  if (node?.meta?.relative_file) {
    openFile(id, node.meta.relative_file);
    return;
  }
  ensureTreePathVisible(id);
  S.sel=id; S.selType='node'; S.selFile=null; renderAll();
}

export function selectEdge(id) {
  window.agenticIdeCloseMobilePanels?.();
  S.sel=id; S.selType='edge'; S.selFile=null;
  document.querySelectorAll('.btab').forEach(t=>t.classList.toggle('active',t.dataset.tab==='edge'));
  S.btab='edge';
  renderSidebar(); renderCanvas(); renderEdgeInspector(S.edges[id]); renderEdgeJson(S.edges[id]);
}

export function navigateToNode(id, options = {}) {
  const node = S.nodes[id];
  if (!node) return;
  const targetFile = options.file || node.meta?.relative_file || null;
  if (targetFile) {
    const ownerId = node.meta?.relative_file && node.parent && S.nodes[node.parent] ? node.parent : id;
    const ownerNode = S.nodes[ownerId] || node;
    const scopeId = ownerNode.parent && S.nodes[ownerNode.parent] ? ownerNode.parent : S.scope;
    setScope(scopeId);
    ensureTreePathVisible(ownerId);
    openFile(ownerId, targetFile);
    return;
  }
  const scopeId = (node.children?.length || 0) > 0
    ? node.id
    : (node.parent && S.nodes[node.parent] ? node.parent : S.scope);
  setScope(scopeId);
  ensureTreePathVisible(id);
  selectNode(id);
}

export function openFile(nodeId, file) {
  window.agenticIdeCloseMobilePanels?.();
  const fileNode = getFileNode(nodeId, file);
  const selectedNodeId = fileNode?.id || nodeId;
  ensureTreePathVisible(selectedNodeId);
  S.sel=selectedNodeId; S.selType='file'; S.selFile=file;
  document.querySelectorAll('.btab').forEach(t=>t.classList.toggle('active',t.dataset.tab==='code'));
  S.btab='code';
  renderSidebar(); renderCanvas(); renderFileInspector(selectedNodeId,file); renderFileEditor(selectedNodeId,file);
}

export function drillIn(id) {
  window.agenticIdeCloseMobilePanels?.();
  S.crumbs.push(id); S.scope=id; S.sel=null; renderAll();
}

export function renderAll() { renderSidebar(); renderCanvas(); renderInspector(); renderBottom(); }

// ─── CRUD ─────────────────────────────────────────────────────────────────
export function deleteNode(id) {
  if (!confirm(`Delete "${id}"?`)) return;
  const n=S.nodes[id];
  if (n?.parent) { const p=S.nodes[n.parent]; if(p) p.children=(p.children||[]).filter(c=>c!==id); }
  Object.keys(S.edges).forEach(eid=>{ if(S.edges[eid].from===id||S.edges[eid].to===id) delete S.edges[eid]; });
  delete S.nodes[id]; S.sel=null; S.selType=null;
  saveState(); renderAll(); toast(`Deleted ${id}`);
}

export function deleteEdge(id) {
  delete S.edges[id]; S.sel=null; S.selType=null; saveState(); renderAll(); toast('Edge deleted');
}
