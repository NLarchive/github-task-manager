export async function fetchCatalog() {
  const response = await fetch('./js/chat-catalog.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Could not load chat catalog');
  return response.json();
}

export async function fetchRegistry(endpointBase) {
  const response = await fetch(`${endpointBase.replace(/\/$/, '')}/api/registry`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`Registry ${response.status}`);
  return response.json();
}

export async function fetchModelInfo(endpointBase) {
  const response = await fetch(`${endpointBase.replace(/\/$/, '')}/api/model`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`Model ${response.status}`);
  return response.json();
}

export async function llmComplete(endpointBase, payload) {
  const response = await fetch(`${endpointBase.replace(/\/$/, '')}/api/llm/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60000)
  });
  if (!response.ok) {
    throw new Error(`Completion ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

export async function saveArtifact(endpointBase, path, filename, content) {
  const response = await fetch(`${endpointBase.replace(/\/$/, '')}/api/file`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, filename, content })
  });
  return response.ok;
}
