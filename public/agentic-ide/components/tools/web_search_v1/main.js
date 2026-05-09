/**
 * main.js — web_search_v1
 *
 * Calls a search API and returns a ranked results list.
 *
 * Inputs:
 *   query  {string}  Search query string.
 *   top_k  {number}  Max results to return. Default: 5.
 *
 * Outputs:
 *   results {Array<{title, url, snippet}>}
 */

const API_BASE = globalThis.process?.env?.SEARCH_API_BASE ?? 'https://api.search.io/v1';
const API_KEY  = globalThis.process?.env?.SEARCH_API_KEY  ?? '';

/**
 * Fetch search results for query, returning at most top_k items.
 * @param {string} query
 * @param {number} [top_k=5]
 * @returns {Promise<Array>}
 */
export async function run(query, top_k = 5) {
  if (!query) return [];

  const params = new URLSearchParams({ q: query, limit: top_k });
  const url    = `${API_BASE}/search?${params}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept:        'application/json',
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.results ?? []).slice(0, top_k);
  } catch (err) {
    return [{ error: err.message }];
  }
}
