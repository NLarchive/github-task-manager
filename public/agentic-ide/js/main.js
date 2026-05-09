import { loadState, clearState, saveState, applyRegistryGraph, setBridgeStatus, addChatMessage, clearChatHistory, addRuntimeReport } from './state.js';
import { S } from './state.js';
import { renderAll, renderBottom, setupDragEvents, setSidebarTab, zoomCanvas, centerCanvas } from './render.js';
import { openNodeModal, openEdgeModal, wireModals } from './modals.js';
import { wireExport } from './export.js';
import { wireSchemaPreview } from './schema-preview.js';
import { toast, esc } from './utils.js';
import { checkBridge, getRegistry, RegistryWatchdog, llmComplete, writeFile, runRuntimeTests } from './bridge.js';
import { runInspection } from '../components/agents/chat-quality-inspector/main.js';

const CHAT_PRESETS = {
  clean: 'You are a helpful assistant.',
  component: 'You are designing or refining a local Agentic IDE component. Use the selected component specs, tools, prompts, and runtime evidence to propose concrete changes, tests, and save-ready outputs.',
  debug: 'You are debugging a local Agentic IDE component or workflow. Prioritize root cause analysis, performance bottlenecks, failed steps, and the smallest testable fix based on the provided runtime data.',
  benchmark: 'You are benchmarking the local Agentic IDE runtime. Compare speed, output quality, and component bottlenecks from the included live reports and recommend the next optimization target.'
};

setupDragEvents(saveState);

document.getElementById('btn-node').addEventListener('click', () => openNodeModal());
document.getElementById('btn-add-here').addEventListener('click', () => openNodeModal());
document.getElementById('btn-edge').addEventListener('click', openEdgeModal);
document.getElementById('btn-new').addEventListener('click', () => {
  if (confirm('Create a blank canvas for a new graph?')) {
    clearState(renderAll, true);
    renderGlobalControls();
    toast('New blank graph created. Your work will be cached until you save.');
  }
});

document.querySelectorAll('.btab').forEach((t) => t.addEventListener('click', () => {
  S.btab = t.dataset.tab;
  document.querySelectorAll('.btab').forEach((x) => x.classList.toggle('active', x === t));
  saveState();
  renderBottom();
}));

document.querySelectorAll('.stab').forEach((t) => t.addEventListener('click', () => {
  document.querySelectorAll('.stab').forEach((x) => x.classList.toggle('active', x === t));
  setSidebarTab(t.dataset.stab);
}));

wireModals();
wireExport();
wireSchemaPreview();
wireChatModal();
setupLayoutSplitters();
wireMobilePanels();

// Zoom + center controls
document.getElementById('btn-zoom-in')?.addEventListener('click', () => zoomCanvas(1.25));
document.getElementById('btn-zoom-out')?.addEventListener('click', () => zoomCanvas(0.8));
document.getElementById('btn-center')?.addEventListener('click', () => centerCanvas());

const modelSelect = document.getElementById('global-model-select');
modelSelect?.addEventListener('change', () => {
  S.selectedModelId = modelSelect.value || null;
  saveState();
  renderBottom();
});

function renderGlobalControls() {
  if (modelSelect) {
    const models = S.availableModels || [];
    if (!models.length) {
      modelSelect.innerHTML = '<option value="">No models discovered</option>';
      modelSelect.value = '';
      modelSelect.disabled = true;
    } else {
      modelSelect.disabled = false;
      modelSelect.innerHTML = models.map((model) => `<option value="${model.id}">${model.label}</option>`).join('');
      modelSelect.value = S.selectedModelId || models[0].id;
    }
  }

  const badge = document.getElementById('bridge-status-badge');
  if (!badge) return;
  badge.classList.remove('is-online', 'is-offline', 'is-pending');
  if (!S.bridgeStatus.bridge) {
    badge.textContent = 'Bridge offline';
    badge.classList.add('is-offline');
    return;
  }
  if (!S.bridgeStatus.llm) {
    badge.textContent = S.bridgeStatus.ggufExists ? 'LLM offline' : 'Model asset missing';
    badge.classList.add('is-pending');
    return;
  }
  badge.textContent = 'Bridge + LLM online';
  badge.classList.add('is-online');
}

function applyLayoutStyles() {
  document.documentElement.style.setProperty('--sidebar-w', `${S.layout.sidebarWidth}px`);
  document.documentElement.style.setProperty('--inspector-w', `${S.layout.inspectorWidth}px`);
  document.documentElement.style.setProperty('--bottom-h', `${S.layout.bottomHeight}px`);
}

function setupSplitter(handleId, onMove) {
  const handle = document.getElementById(handleId);
  if (!handle) return;
  handle.addEventListener('pointerdown', (event) => {
    if (window.matchMedia('(max-width: 860px)').matches && handleId !== 'bottom-splitter') return;
    event.preventDefault();
    handle.classList.add('is-active');
    const startX = event.clientX;
    const startY = event.clientY;
    const startState = { ...S.layout };
    const stop = () => {
      handle.classList.remove('is-active');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      saveState();
    };
    const move = (moveEvent) => onMove({
      dx: moveEvent.clientX - startX,
      dy: moveEvent.clientY - startY,
      startState,
    });
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  });
}

function setupLayoutSplitters() {
  applyLayoutStyles();
  setupSplitter('sidebar-splitter', ({ dx, startState }) => {
    S.layout.sidebarWidth = Math.max(180, Math.min(420, startState.sidebarWidth + dx));
    applyLayoutStyles();
  });
  setupSplitter('inspector-splitter', ({ dx, startState }) => {
    S.layout.inspectorWidth = Math.max(220, Math.min(420, startState.inspectorWidth - dx));
    applyLayoutStyles();
  });
  setupSplitter('bottom-splitter', ({ dy, startState }) => {
    S.layout.bottomHeight = Math.max(160, Math.min(window.innerHeight * 0.6, startState.bottomHeight - dy));
    applyLayoutStyles();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMobilePanels();
    applyLayoutStyles();
  });
}

function syncMobileScrim() {
  const scrim = document.getElementById('mobile-scrim');
  const sidebar = document.getElementById('sidebar');
  const inspector = document.getElementById('right-panel');
  const visible = sidebar?.classList.contains('is-mobile-open') || inspector?.classList.contains('is-mobile-open');
  if (scrim) scrim.hidden = !visible;
}

function closeMobilePanels() {
  document.getElementById('sidebar')?.classList.remove('is-mobile-open');
  document.getElementById('right-panel')?.classList.remove('is-mobile-open');
  syncMobileScrim();
}

function toggleMobilePanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  const open = !panel.classList.contains('is-mobile-open');
  closeMobilePanels();
  if (open) panel.classList.add('is-mobile-open');
  syncMobileScrim();
}

function wireMobilePanels() {
  document.getElementById('btn-mobile-library')?.addEventListener('click', () => toggleMobilePanel('sidebar'));
  document.getElementById('btn-mobile-inspector')?.addEventListener('click', () => toggleMobilePanel('right-panel'));
  document.getElementById('btn-sidebar-close')?.addEventListener('click', closeMobilePanels);
  document.getElementById('btn-inspector-close')?.addEventListener('click', closeMobilePanels);
  document.getElementById('mobile-scrim')?.addEventListener('click', closeMobilePanels);
  window.agenticIdeCloseMobilePanels = closeMobilePanels;
}

function chatPresetText(preset) {
  return CHAT_PRESETS[preset] || CHAT_PRESETS.clean;
}

function selectedChatOwnerNodeId() {
  if (!S.sel) return null;
  const selected = S.nodes[S.sel];
  if (!selected) return null;
  if (selected.meta?.relative_file && selected.parent && S.nodes[selected.parent]) return selected.parent;
  return selected.id === 'root' ? null : selected.id;
}

function chatEligibleNodes() {
  return Object.values(S.nodes)
    .filter((node) => node.id !== 'root' && !node.meta?.relative_file)
    .sort((a, b) => String(a.path || '').localeCompare(String(b.path || '')) || String(a.label || '').localeCompare(String(b.label || '')));
}

function defaultChatContextIds(nodeId) {
  const node = S.nodes[nodeId];
  if (!node) return [];
  const childIds = (node.children || [])
    .filter((childId) => S.nodes[childId] && !S.nodes[childId].meta?.relative_file)
    .slice(0, 8);
  return [...new Set([nodeId, ...childIds])];
}

function syncChatStateFromControls({ persist = true } = {}) {
  const preset = document.getElementById('chat-preset');
  const systemPrompt = document.getElementById('chat-system-prompt');
  const includeHistory = document.getElementById('chat-include-history');
  const includeRuntime = document.getElementById('chat-include-runtime');
  const contextNodes = document.getElementById('chat-context-nodes');
  const target = document.getElementById('chat-target');
  const saveFile = document.getElementById('chat-save-file');
  if (preset) S.chat.preset = preset.value || 'clean';
  if (systemPrompt) S.chat.systemPrompt = systemPrompt.value.trim();
  if (includeHistory) S.chat.includeHistory = !!includeHistory.checked;
  if (includeRuntime) S.chat.includeRuntime = !!includeRuntime.checked;
  if (contextNodes) S.chat.selectedNodeIds = [...contextNodes.selectedOptions].map((option) => option.value).filter(Boolean);
  if (target) S.chat.targetNodeId = target.value || null;
  if (saveFile) S.chat.saveFilename = saveFile.value.trim() || 'chat-output.md';
  if (persist) saveState();
}

function renderChatConfigurator() {
  const preset = document.getElementById('chat-preset');
  const systemPrompt = document.getElementById('chat-system-prompt');
  const includeHistory = document.getElementById('chat-include-history');
  const includeRuntime = document.getElementById('chat-include-runtime');
  const contextNodes = document.getElementById('chat-context-nodes');
  const target = document.getElementById('chat-target');
  const saveFile = document.getElementById('chat-save-file');
  if (!preset || !systemPrompt || !includeHistory || !includeRuntime || !contextNodes || !target || !saveFile) return;

  const nodes = chatEligibleNodes();
  const preferredId = selectedChatOwnerNodeId();
  const validNodeIds = new Set(nodes.map((node) => node.id));
  const selectedIds = (S.chat.selectedNodeIds || []).filter((id) => validNodeIds.has(id));
  const fallbackIds = preferredId ? defaultChatContextIds(preferredId) : nodes[0] ? [nodes[0].id] : [];
  S.chat.selectedNodeIds = selectedIds.length ? selectedIds : fallbackIds;
  if (!S.chat.targetNodeId || !validNodeIds.has(S.chat.targetNodeId)) {
    S.chat.targetNodeId = preferredId && validNodeIds.has(preferredId)
      ? preferredId
      : (S.chat.selectedNodeIds[0] || nodes[0]?.id || null);
  }
  if (!S.chat.systemPrompt) S.chat.systemPrompt = chatPresetText(S.chat.preset);
  if (!S.chat.saveFilename) S.chat.saveFilename = 'chat-output.md';

  preset.innerHTML = Object.keys(CHAT_PRESETS).map((key) => `<option value="${key}">${key}</option>`).join('');
  preset.value = S.chat.preset;
  systemPrompt.value = S.chat.systemPrompt;
  includeHistory.checked = !!S.chat.includeHistory;
  includeRuntime.checked = !!S.chat.includeRuntime;
  saveFile.value = S.chat.saveFilename;

  const options = nodes.map((node) => `<option value="${node.id}">${node.label} • ${node.type}</option>`).join('');
  contextNodes.innerHTML = options || '<option value="">No components discovered</option>';
  [...contextNodes.options].forEach((option) => {
    option.selected = S.chat.selectedNodeIds.includes(option.value);
  });
  target.innerHTML = options || '<option value="">No components discovered</option>';
  target.value = S.chat.targetNodeId || '';
}

function latestRuntimeReportFor(nodeIds) {
  const ids = new Set((nodeIds || []).filter(Boolean));
  if (!ids.size) return S.runtimeReports[0] || null;
  return S.runtimeReports.find((report) => ids.has(report.nodeId)) || null;
}

function summarizeNodeForChat(node) {
  if (!node) return '';
  return JSON.stringify({
    id: node.id,
    type: node.type,
    label: node.label,
    path: node.path,
    description: node.desc || '',
    inputs: (node.inputs || []).map((port) => `${port.n}:${port.t}`),
    outputs: (node.outputs || []).map((port) => `${port.n}:${port.t}`),
    files: node.files || [],
    tests: node.tests || [],
    meta: node.meta || {}
  }, null, 2);
}

function summarizeRuntimeReport(report) {
  if (!report) return '';
  return JSON.stringify({
    kind: report.kind || 'runtime',
    ok: report.ok !== false,
    nodeId: report.nodeId || null,
    createdAt: report.createdAt || null,
    error: report.error || null,
    steps: report.steps || report.result?.steps || [],
    result: report.result || null,
  }, null, 2).slice(0, 2400);
}

function sanitizeChatFilename(value) {
  const cleaned = String(value || 'chat-output.md')
    .replace(/[<>:"\\|?*\x00-\x1F]/g, '-')
    .replace(/^\.+$/, 'chat-output.md')
    .trim();
  return cleaned || 'chat-output.md';
}

async function saveLatestChatReply() {
  syncChatStateFromControls();
  const targetId = S.chat.targetNodeId || S.chat.selectedNodeIds[0];
  const target = targetId ? S.nodes[targetId] : null;
  if (!target) {
    toast('Select a target component before saving');
    return;
  }
  const latestAssistant = [...S.chatHistory].reverse().find((entry) => entry.role === 'assistant' && !String(entry.content || '').startsWith('⚠'));
  const latestUser = [...S.chatHistory].reverse().find((entry) => entry.role === 'user');
  if (!latestAssistant) {
    toast('No assistant reply is available to save');
    return;
  }
  const filename = sanitizeChatFilename(S.chat.saveFilename);
  const doc = [
    '# Agentic IDE Chat Result',
    '',
    `- saved_at: ${new Date().toISOString()}`,
    `- model_id: ${S.selectedModelId || 'none'}`,
    `- preset: ${S.chat.preset}`,
    `- target_component: ${target.id}`,
    `- included_components: ${(S.chat.selectedNodeIds || []).join(', ') || 'none'}`,
    '',
    '## System Prompt',
    '',
    S.chat.systemPrompt || chatPresetText(S.chat.preset),
    '',
    '## User Prompt',
    '',
    latestUser?.content || '',
    '',
    '## Assistant Reply',
    '',
    latestAssistant.content || ''
  ].join('\n');
  const ok = await writeFile(target.path, filename, doc);
  toast(ok ? `Saved reply to ${target.path}/${filename}` : 'Save failed. Start node public/agentic-ide/server/main.js to write to disk.');
}

async function runChatTargetTests() {
  syncChatStateFromControls();
  const targetId = S.chat.targetNodeId || S.chat.selectedNodeIds[0];
  const target = targetId ? S.nodes[targetId] : null;
  if (!target) {
    toast('Select a component to test');
    return;
  }
  toast(`Testing ${target.label}…`);
  try {
    const result = await runRuntimeTests(target.id, { modelId: S.selectedModelId });
    const ok = result?.ok !== false && !(Array.isArray(result?.cases) && result.cases.some((testCase) => testCase.passed === false));
    addRuntimeReport({ kind: 'test', ok, nodeId: target.id, result, steps: result?.steps || [] });
    toast(`Tests finished for ${target.label}`);
  } catch (err) {
    addRuntimeReport({ kind: 'test', ok: false, nodeId: target.id, error: err.message });
    toast(`Tests failed for ${target.label}`);
  }
  renderBottom();
}

function renderChatThread() {
  const thread = document.getElementById('chat-thread');
  if (!thread) return;
  if (!S.chatHistory.length) {
    thread.innerHTML = '<div class="chat-empty">Select a model, start the bridge, and send a prompt to chat with the local LLM.</div>';
    return;
  }
  thread.innerHTML = S.chatHistory.map((entry) => `
    <div class="chat-msg is-${entry.role === 'assistant' ? 'assistant' : 'user'}">
      <div class="chat-msg-meta">
        <span>${entry.role === 'assistant' ? 'Assistant' : 'You'}${entry.preset ? ` • ${esc(entry.preset)}` : ''}</span>
        <span>${new Date(entry.createdAt).toLocaleTimeString()}${entry.durationMs ? ` • ${entry.durationMs}ms` : ''}</span>
      </div>
      <div class="chat-msg-body">${esc(entry.content)}</div>
    </div>`).join('');
  thread.scrollTop = thread.scrollHeight;
}

function openChatModal() {
  const modal = document.getElementById('chat-modal');
  if (!modal) return;
  modal.hidden = false;
  renderGlobalControls();
  renderChatConfigurator();
  renderChatThread();
  document.getElementById('chat-input')?.focus();
}

function closeChatModal() {
  const modal = document.getElementById('chat-modal');
  if (modal) modal.hidden = true;
}

function buildChatPrompt(nextPrompt) {
  syncChatStateFromControls({ persist: false });
  const prompt = [S.chat.systemPrompt || chatPresetText(S.chat.preset)];
  const selectedNodes = (S.chat.selectedNodeIds || []).map((id) => S.nodes[id]).filter(Boolean);
  if (selectedNodes.length) {
    prompt.push(`Selected components and tools:\n${selectedNodes.map((node) => summarizeNodeForChat(node)).join('\n\n')}`);
  }
  if (S.chat.includeRuntime) {
    const latestReport = latestRuntimeReportFor(S.chat.selectedNodeIds);
    if (latestReport) prompt.push(`Latest live runtime or test report:\n${summarizeRuntimeReport(latestReport)}`);
  }
  if (S.chat.includeHistory && S.chatHistory.length) {
    const history = S.chatHistory.slice(-8).map((entry) => `${entry.role === 'assistant' ? 'Assistant' : 'User'}: ${entry.content}`);
    prompt.push(`Conversation history:\n${history.join('\n\n')}`);
  }
  prompt.push(`User request:\n${nextPrompt}`);
  return prompt.join('\n\n');
}

function buildConstrainedPrompt(originalPrompt, qualityIssues = []) {
  const issues = Array.isArray(qualityIssues) && qualityIssues.length
    ? `\nPrevious answer issues:\n- ${qualityIssues.join('\n- ')}`
    : '';
  return `${originalPrompt}\n\nResponse contract:\n1. Use plain UTF-8 text only.\n2. Be concise and concrete (max 120 words).\n3. Avoid repeated tokens/phrases.\n4. If uncertain, state what is missing instead of inventing.${issues}`;
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const prompt = input?.value.trim();
  if (!prompt) return;
  if (!S.selectedModelId) {
    toast('Select a model before starting chat');
    return;
  }
  // Inform user immediately if LLM is known to be offline
  if (!S.bridgeStatus.bridge) {
    addChatMessage({ role: 'assistant', content: '⚠ Bridge server is offline. Run: node public/agentic-ide/server/main.js', modelId: S.selectedModelId });
    renderChatThread();
    return;
  }
  if (!S.bridgeStatus.llm) {
    const gguf = S.bridgeStatus.ggufExists;
    const hint = gguf
      ? 'Run: ./llama-server -m "components/models/gemma/gemma4-26b-a4b-q4kxl/gemma-4-26B-A4B-it-UD-Q4_K_XL.gguf" --port 8080'
      : 'No GGUF model asset found. See components/models/ for the expected path.';
    addChatMessage({ role: 'assistant', content: `⚠ LLM endpoint is offline. ${hint}`, modelId: S.selectedModelId });
    renderChatThread();
    return;
  }
  addChatMessage({ role: 'user', content: prompt, modelId: S.selectedModelId });
  if (input) input.value = '';
  renderChatThread();
  try {
    const startedAt = performance.now();
    let reply = await llmComplete(buildChatPrompt(prompt), { modelId: S.selectedModelId, max_tokens: 420, temperature: 0.2 });
    let quality = await runInspection({ content: reply || '' }, {
      strictMode: false,
      minContentLength: 12,
      maxCorruptionThreshold: 0.2,
    });

    // One constrained retry when output quality is poor (garbling/repetition/noise).
    if (!quality?.quality?.isValid) {
      const constrainedPrompt = buildConstrainedPrompt(prompt, quality?.quality?.issues || []);
      const repaired = await llmComplete(buildChatPrompt(constrainedPrompt), {
        modelId: S.selectedModelId,
        max_tokens: 220,
        temperature: 0.1,
      });
      const repairedQuality = await runInspection({ content: repaired || '' }, {
        strictMode: false,
        minContentLength: 12,
        maxCorruptionThreshold: 0.2,
      });
      if (repairedQuality?.quality?.score >= (quality?.quality?.score || 0)) {
        reply = repaired;
        quality = repairedQuality;
      }
    }

    const suffix = quality?.quality?.isValid
      ? ''
      : `\n\n[quality-warning] ${((quality && quality.quality && quality.quality.issues) || []).join('; ')}`;
    addChatMessage({
      role: 'assistant',
      content: (reply || 'No response returned by the model.') + suffix,
      modelId: S.selectedModelId,
      durationMs: Math.round(performance.now() - startedAt),
      preset: S.chat.preset,
    });
  } catch (err) {
    addChatMessage({ role: 'assistant', content: `⚠ ${err.message || 'Chat request failed.'}`, modelId: S.selectedModelId });
  }
  renderChatThread();
  await refreshBridgeStatus();
}

function wireChatModal() {
  document.getElementById('btn-chat')?.addEventListener('click', () => {
    closeMobilePanels();
    openChatModal();
  });
  document.getElementById('chat-close')?.addEventListener('click', closeChatModal);
  document.getElementById('chat-close-top')?.addEventListener('click', closeChatModal);
  document.getElementById('chat-clear')?.addEventListener('click', () => {
    clearChatHistory();
    renderChatThread();
  });
  document.getElementById('chat-preset')?.addEventListener('change', (event) => {
    S.chat.preset = event.target.value || 'clean';
    S.chat.systemPrompt = chatPresetText(S.chat.preset);
    renderChatConfigurator();
    saveState();
  });
  document.getElementById('chat-system-prompt')?.addEventListener('input', () => syncChatStateFromControls());
  document.getElementById('chat-include-history')?.addEventListener('change', () => syncChatStateFromControls());
  document.getElementById('chat-include-runtime')?.addEventListener('change', () => syncChatStateFromControls());
  document.getElementById('chat-context-nodes')?.addEventListener('change', () => syncChatStateFromControls());
  document.getElementById('chat-target')?.addEventListener('change', () => syncChatStateFromControls());
  document.getElementById('chat-save-file')?.addEventListener('input', () => syncChatStateFromControls());
  document.getElementById('chat-run-tests')?.addEventListener('click', runChatTargetTests);
  document.getElementById('chat-save-reply')?.addEventListener('click', saveLatestChatReply);
  document.getElementById('chat-send')?.addEventListener('click', sendChatMessage);
  document.getElementById('chat-input')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  });
  document.getElementById('chat-modal')?.addEventListener('click', (event) => {
    if (event.target.id === 'chat-modal') closeChatModal();
  });
}

async function refreshBridgeStatus() {
  const status = await checkBridge();
  setBridgeStatus(status);
  renderGlobalControls();
  return status;
}

async function applyRegistry(registry, { showToast = false, trigger = 'init' } = {}) {
  applyRegistryGraph(registry);
  renderGlobalControls();
  renderAll();
  if (showToast && trigger !== 'init') toast(`Workspace registry refreshed (${trigger})`);
}

async function initializeWorkspace() {
  loadState();
  renderGlobalControls();
  renderAll();

  try {
    await refreshBridgeStatus();
  } catch {}

  try {
    const watchdog = new RegistryWatchdog({
      onRefresh: async (registry, meta = {}) => {
        await applyRegistry(registry, { showToast: true, trigger: meta.trigger || 'refresh' });
        await refreshBridgeStatus();
      },
      onOffline: () => {
        setBridgeStatus({ bridge: false, llm: false, ggufExists: false, models: S.bridgeStatus.models || [] });
        renderGlobalControls();
      },
      onOnline: async () => {
        await refreshBridgeStatus();
      }
    });

    const registry = await watchdog.initialize();
    window.agenticIdeRegistryWatchdog = watchdog;
    await applyRegistry(registry, { trigger: 'init' });
  } catch (err) {
    try {
      const registry = await getRegistry({ force: true, ttlMs: 0 });
      await applyRegistry(registry, { trigger: 'fallback' });
    } catch {
      toast('Start node public/agentic-ide/server/main.js for live registry and runtime support');
    }
  }
}

initializeWorkspace();
