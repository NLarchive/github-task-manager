function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderThread(state, root, handlers) {
  if (!state.history.length) {
    root.innerHTML = '<div class="msg assistant"><div class="msg-meta">Assistant</div><div class="msg-body">Clean chat ready. Send a prompt or choose profiles from the database selectors.</div></div>';
    return;
  }

  root.innerHTML = state.history.map((entry, index) => {
    const canRerun = entry.role === 'user';
    return `
      <article class="msg ${entry.role}">
        <div class="msg-meta">${entry.role === 'user' ? 'You' : 'Assistant'} • ${new Date(entry.createdAt).toLocaleTimeString()}${entry.durationMs ? ` • ${entry.durationMs}ms` : ''}</div>
        <div class="msg-body">${esc(entry.content)}</div>
        <div class="msg-actions">
          <button data-action="copy-msg" data-index="${index}">Copy</button>
          <button data-action="edit-msg" data-index="${index}">Edit</button>
          ${canRerun ? `<button data-action="rerun-msg" data-index="${index}">Rerun From Here</button>` : ''}
          <button data-action="delete-msg" data-index="${index}">Delete</button>
        </div>
        <div class="msg-edit" id="edit-${index}">
          <textarea rows="4">${esc(entry.content)}</textarea>
          <div class="action-row">
            <button data-action="confirm-edit" data-index="${index}">Confirm</button>
            <button data-action="cancel-edit" data-index="${index}">Cancel</button>
          </div>
        </div>
      </article>`;
  }).join('');

  root.querySelectorAll('button[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const index = Number(button.dataset.index);
      handlers[action]?.(index, button);
    });
  });
}

export function fillSelect(select, items, labelField = 'name') {
  select.innerHTML = (items || []).map((item) => `<option value="${esc(item.id)}">${esc(item[labelField] || item.id)}</option>`).join('');
}
