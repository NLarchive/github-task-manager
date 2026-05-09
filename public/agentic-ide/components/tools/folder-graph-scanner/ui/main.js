/**
 * Folder Graph Scanner UI Integration
 * Provides UI components to integrate the folder scanner into the graph designer
 */

/**
 * Initialize folder scanner UI
 */
export function initFolderScannerUI() {
  // Create scanner panel in the sidebar or as a modal
  const scannerPanel = document.createElement('div');
  scannerPanel.id = 'folder-scanner-panel';
  scannerPanel.className = 'scanner-panel hidden';
  scannerPanel.innerHTML = `
    <div class="scanner-header">
      <h3>Folder Graph Scanner</h3>
      <button class="btn btn-icon" id="scanner-close">×</button>
    </div>
    <div class="scanner-body">
      <div class="scanner-section">
        <label for="scanner-path">Folder Path</label>
        <input type="text" id="scanner-path" placeholder="Enter folder path or paste from explorer" />
        <small>Leave empty to scan current workspace</small>
      </div>
      
      <div class="scanner-section">
        <label>Options</label>
        <label class="checkbox">
          <input type="checkbox" id="scanner-recursive" checked />
          Recursive scan
        </label>
        <label class="checkbox">
          <input type="checkbox" id="scanner-extract-imports" checked />
          Extract imports/dependencies
        </label>
        <label class="checkbox">
          <input type="checkbox" id="scanner-analyze-readme" checked />
          Use README.md descriptions
        </label>
      </div>
      
      <div class="scanner-section">
        <label>Scan Depth</label>
        <input type="number" id="scanner-depth" min="1" max="10" value="5" />
      </div>
      
      <div class="scanner-actions">
        <button id="scanner-start" class="btn btn-primary">Start Scan</button>
        <button id="scanner-cancel" class="btn">Cancel</button>
      </div>
      
      <div id="scanner-progress" class="scanner-progress hidden">
        <div class="progress-bar">
          <div class="progress-fill" id="scanner-progress-fill"></div>
        </div>
        <span id="scanner-progress-text">Scanning...</span>
      </div>
      
      <div id="scanner-results" class="scanner-results hidden">
        <h4>Scan Results</h4>
        <div id="scanner-results-content"></div>
        <div class="scanner-results-actions">
          <button id="scanner-apply" class="btn btn-accent">Apply to Graph</button>
          <button id="scanner-export" class="btn">Export JSON</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(scannerPanel);
  
  // Wire up UI events
  wireScanner();
}

/**
 * Wire up scanner UI events
 */
function wireScanner() {
  const panel = document.getElementById('folder-scanner-panel');
  const closeBtn = document.getElementById('scanner-close');
  const startBtn = document.getElementById('scanner-start');
  const cancelBtn = document.getElementById('scanner-cancel');
  const applyBtn = document.getElementById('scanner-apply');
  const exportBtn = document.getElementById('scanner-export');
  
  let currentGraph = null;
  
  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden');
  });
  
  startBtn.addEventListener('click', async () => {
    await performScan();
  });
  
  cancelBtn.addEventListener('click', () => {
    panel.classList.add('hidden');
  });
  
  applyBtn.addEventListener('click', () => {
    if (currentGraph) {
      applyGraphToEditor(currentGraph);
    }
  });
  
  exportBtn.addEventListener('click', () => {
    if (currentGraph) {
      const blob = new Blob([JSON.stringify(currentGraph, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'discovered-graph.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  });
  
  async function performScan() {
    const pathInput = document.getElementById('scanner-path');
    const depthInput = document.getElementById('scanner-depth');
    const progressDiv = document.getElementById('scanner-progress');
    const resultsDiv = document.getElementById('scanner-results');
    const resultsContent = document.getElementById('scanner-results-content');
    
    const folderPath = pathInput.value.trim() || './';
    const maxDepth = parseInt(depthInput.value) || 5;
    
    progressDiv.classList.remove('hidden');
    resultsDiv.classList.add('hidden');
    startBtn.disabled = true;
    
    try {
      // Call scanner API (browser-side or server-side via fetch)
      const response = await fetch('/api/scanner/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath, maxDepth })
      });
      
      if (!response.ok) {
        throw new Error(`Scanner API error: ${response.status}`);
      }
      
      currentGraph = await response.json();
      
      // Display results
      progressDiv.classList.add('hidden');
      resultsDiv.classList.remove('hidden');
      
      resultsContent.innerHTML = `
        <div class="results-summary">
          <p><strong>Nodes:</strong> ${Object.keys(currentGraph.nodes || {}).length}</p>
          <p><strong>Edges:</strong> ${Object.keys(currentGraph.edges || {}).length}</p>
          <p><strong>Warnings:</strong> ${(currentGraph.metadata?.warnings || []).length}</p>
        </div>
        <div class="results-preview">
          <h5>Node Types</h5>
          <ul>
            ${getNodeTypeSummary(currentGraph).map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `;
    } catch (error) {
      progressDiv.classList.add('hidden');
      resultsDiv.classList.remove('hidden');
      resultsContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    } finally {
      startBtn.disabled = false;
    }
  }
}

/**
 * Get summary of node types in the graph
 */
function getNodeTypeSummary(graph) {
  const typeCounts = {};
  for (const node of Object.values(graph.nodes || {})) {
    typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
  }
  return Object.entries(typeCounts).map(([type, count]) => `${type}: ${count}`);
}

/**
 * Apply discovered graph to the editor state
 */
function applyGraphToEditor(codeGraph) {
  // This would integrate with the main graph editor state
  // Implementation depends on the state management system (S object)
  console.log('[scanner-ui] Applying graph to editor:', codeGraph);
  
  // Dispatch event for the editor to listen to
  const event = new CustomEvent('graph:discovered', { detail: codeGraph });
  document.dispatchEvent(event);
}

/**
 * Show the scanner panel
 */
export function showFolderScannerUI() {
  const panel = document.getElementById('folder-scanner-panel');
  if (panel) {
    panel.classList.remove('hidden');
  }
}

// Auto-init on module load if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initFolderScannerUI();
  });
} else {
  initFolderScannerUI();
}
