/**
 * app-integration-example.js
 * ──────────────────────────
 * Shows exactly how to wire CacheWatchdog + TaskStorageSync into your
 * existing TaskManagerApp / list-display-controller.js
 *
 * This is a REFERENCE FILE — copy the relevant parts into your actual app.
 * Do not import this file directly.
 */

import { TaskStorageSync } from './task-storage-sync.js';
import { CacheWatchdog }   from './cache-watchdog.js';

// ─── 1. Create the sync + watchdog instances ──────────────────────────────────

const sync = new TaskStorageSync({
  baseUrl: 'http://localhost:7700',
  timeout: 8000,
});

const watchdog = new CacheWatchdog({
  apiUrl:    sync.tasksUrl,
  cooldownMs: 3000,   // minimum ms between automatic checks
  graceMs:    4000,   // ms to suppress checks after our own save

  // Called when new data arrives from the bridge
  onRefresh: async (freshTasks) => {
    app.tasks = freshTasks;
    app.renderTasks();
    app.updateStats();
    ui.showToast('Tasks updated from local files', 'info');
  },

  // Called when bridge goes offline
  onOffline: () => {
    ui.setBridgeStatus(false);
    console.warn('[app] Bridge offline — changes will not be saved to disk');
  },

  // Called when bridge comes back online
  onOnline: () => {
    ui.setBridgeStatus(true);
    console.info('[app] Bridge reconnected');
  },
});

// Wire watchdog into sync so saves call acknowledge() automatically
sync.setWatchdog(watchdog);

// ─── 2. Initialize on app startup ────────────────────────────────────────────

async function initApp() {
  // Check if bridge is even running before trying to load
  const online = await sync.isOnline();
  ui.setBridgeStatus(online);

  if (!online) {
    ui.showBridgePrompt(); // show "Please run: node server.js"
    return;
  }

  // Load tasks (first load — no cached ETag yet)
  await watchdog.initialize();
}

// ─── 3. Save all tasks ───────────────────────────────────────────────────────

async function saveTasks() {
  try {
    const result = await sync.saveAll(app.tasks);
    console.debug(`[app] Saved ${result.count} tasks, ETag: ${result.etag}`);
  } catch (err) {
    ui.showToast(`Save failed: ${err.message}`, 'error');
  }
}

// ─── 4. Edit a single task ───────────────────────────────────────────────────

async function editTask(id, changes) {
  try {
    const { task, etag } = await sync.updateOne(id, changes);
    // Update the local copy in memory too
    const idx = app.tasks.findIndex(t => t.id === id);
    if (idx !== -1) app.tasks[idx] = task;
    app.renderTasks();
    console.debug(`[app] Updated task ${id}, ETag: ${etag}`);
  } catch (err) {
    ui.showToast(`Update failed: ${err.message}`, 'error');
  }
}

// ─── 5. Delete a task ────────────────────────────────────────────────────────

async function deleteTask(id) {
  try {
    await sync.deleteOne(id);
    app.tasks = app.tasks.filter(t => t.id !== id);
    app.renderTasks();
    app.updateStats();
  } catch (err) {
    ui.showToast(`Delete failed: ${err.message}`, 'error');
  }
}

// ─── 6. Bridge status UI helper ───────────────────────────────────────────────

const ui = {
  showToast(message, type = 'info') {
    // Wire to your existing toast/notification system
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type } }));
  },

  setBridgeStatus(online) {
    const el = document.querySelector('#bridge-status');
    if (!el) return;
    el.dataset.online   = online;
    el.textContent      = online ? '● Bridge connected' : '● Run: node server.js';
    el.style.color      = online ? 'var(--color-success)' : 'var(--color-error)';
    el.title            = online
      ? 'Local server is running — changes save to disk automatically'
      : 'Local server offline — start it with: node server.js';
  },

  showBridgePrompt() {
    const el = document.querySelector('#bridge-offline-prompt');
    if (el) el.hidden = false;
  },
};

// ─── 7. Minimal HTML snippet for bridge status indicator ─────────────────────
/*
  Add this anywhere in your index.html header/toolbar:

  <span id="bridge-status" title="Bridge server status"></span>

  <div id="bridge-offline-prompt" hidden style="padding:1rem;background:var(--color-warning-highlight)">
    <strong>Local bridge not running.</strong>
    Start it with: <code>node server.js</code> — then refresh this page.
  </div>
*/

export { initApp, saveTasks, editTask, deleteTask };
