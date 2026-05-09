/**
 * schema-preview.js — JSON schema preview modal.
 *
 * Shows generated JSON (export / graph-display) in a scrollable preview
 * so the user can review, copy, or save before committing — no blind downloads.
 */
import { writeFile } from './bridge.js';

let _previewFilename = 'output.json';

// ── Open ──────────────────────────────────────────────────────────────────
export function openSchemaPreview(title, jsonStr) {
  _previewFilename = title || 'output.json';
  const modal   = document.getElementById('schema-preview-modal');
  const titleEl = document.getElementById('sp-title');
  const pre     = document.getElementById('sp-content');
  if (!modal || !titleEl || !pre) return;
  titleEl.textContent = title;
  pre.textContent     = jsonStr;          // plain text — no XSS risk in <pre>
  modal.hidden = false;
}

// ── Wire events (call once from main.js) ──────────────────────────────────
export function wireSchemaPreview() {
  const close = () => {
    const m = document.getElementById('schema-preview-modal');
    if (m) m.hidden = true;
  };

  document.getElementById('sp-close')?.addEventListener('click',  close);
  document.getElementById('sp-close2')?.addEventListener('click', close);

  document.getElementById('schema-preview-modal')?.addEventListener('click', e => {
    if (e.target.id === 'schema-preview-modal') close();
  });

  // Copy to clipboard
  document.getElementById('sp-copy')?.addEventListener('click', async () => {
    const text = document.getElementById('sp-content')?.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      _toast('📋 Copied to clipboard');
    } catch {
      _toast('Clipboard unavailable — use Ctrl+A / Ctrl+C in the preview');
    }
  });

  // Save via bridge (writes to disk under public/agentic-ide/)
  document.getElementById('sp-save')?.addEventListener('click', async () => {
    const text  = document.getElementById('sp-content')?.textContent || '';
    const fname = _previewFilename;
    const ok = await writeFile('', fname, text);
    if (ok) {
      _toast('✔ Saved: ' + fname);
    } else {
      _downloadText(text, fname);
      _toast('Bridge unavailable — downloaded instead');
    }
  });

  // Download directly
  document.getElementById('sp-download')?.addEventListener('click', () => {
    const text = document.getElementById('sp-content')?.textContent || '';
    _downloadText(text, _previewFilename);
  });
}

// ── Private helpers ───────────────────────────────────────────────────────
function _downloadText(text, filename) {
  const a  = document.createElement('a');
  a.href   = 'data:application/json;charset=utf-8,' + encodeURIComponent(text);
  a.download = filename;
  a.click();
}

function _toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}
