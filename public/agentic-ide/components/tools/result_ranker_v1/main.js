/**
 * main.js — result_ranker_v1
 *
 * Ranks and filters a list of search results by heuristic relevance score.
 *
 * Inputs:  results {Array<{title?, url?, snippet?}>}
 * Outputs: ranked  {Array}  sorted by score descending, errors removed
 */

/**
 * @param {{title?:string, url?:string, snippet?:string}} item
 * @returns {number}  0–1
 */
function score(item) {
  const snippet = String(item.snippet ?? '');
  const title   = String(item.title   ?? '');
  let s = 0;
  s += Math.min(snippet.length / 200, 1) * 0.4;  // content richness
  s += (item.url ? 0.3 : 0);                      // has URL
  s += Math.min(title.length   /  60, 1) * 0.3;   // title quality
  return s;
}

/**
 * @param {Array} results
 * @returns {Array}
 */
export function run(results) {
  if (!Array.isArray(results) || !results.length) return [];
  return results
    .filter(r => !r.error)
    .map(r    => ({ _s: score(r), ...r }))
    .sort((a, b) => b._s - a._s)
    .map(({ _s, ...r }) => r);  // strip internal score
}
