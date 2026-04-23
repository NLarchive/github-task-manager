/**
 * Validate Cloudflare worker GitHub tokens against the target repository.
 *
 * Usage:
 *   GH_TOKEN_AI_CAREER_ROADMAP=... node validate-secrets.js
 *   GITHUB_TOKEN_AI_CAREER_ROADMAP=... node validate-secrets.js
 */

const fetch = global.fetch || (typeof require !== 'undefined' ? require('node-fetch') : null);

/**
 * Return the first configured environment variable from a list of candidate names.
 *
 * @param {string[]} keys
 * @returns {string|null}
 */
function getEnvVar(keys) {
  for (const k of keys) {
    if (process.env[k] && String(process.env[k]).trim()) return process.env[k].trim();
  }
  return null;
}

/**
 * Check whether a token can read a known repository path via the GitHub contents API.
 *
 * @param {{ owner: string, repo: string, branch: string, path: string }} repoInfo
 * @param {string} token
 * @returns {Promise<object>}
 */
async function checkRepoToken({ owner, repo, branch, path }, token) {
  if (!token) return { ok: false, reason: 'no token provided' };
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const res = await fetch(url, { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'TaskManager-LocalValidate' } });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body: body.substring(0, 200) };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

(async () => {
  const owner = 'nlarchive';
  const repo = 'github-task-manager';
  const branch = 'main';
  const path = 'public/tasksDB/external/ai-career-roadmap/node.tasks.json';

  const perKeys = ['GITHUB_TOKEN_AI_CAREER_ROADMAP', 'GH_TOKEN_AI_CAREER_ROADMAP'];
  const sharedKeys = ['GITHUB_TOKEN', 'GH_TOKEN'];

  const perToken = getEnvVar(perKeys);
  const sharedToken = getEnvVar(sharedKeys);

  console.log('Per-project token var(s):', perKeys.join(', '));
  console.log('Shared token var(s):', sharedKeys.join(', '));

  if (perToken) {
    console.log('Testing per-project token...');
    const r = await checkRepoToken({ owner, repo, branch, path }, perToken);
    console.log('Per-token result:', r);
  } else {
    console.log('No per-project token found in environment.');
  }

  if (sharedToken) {
    console.log('Testing shared token...');
    const r = await checkRepoToken({ owner, repo, branch, path }, sharedToken);
    console.log('Shared-token result:', r);
  } else {
    console.log('No shared token found in environment.');
  }

  if (!perToken && !sharedToken) {
    console.log('No tokens configured locally. Use wrangler secret put to set GH_TOKEN_AI_CAREER_ROADMAP or GITHUB_TOKEN_AI_CAREER_ROADMAP');
    console.log('Example:');
    console.log(`  GH_TOKEN_AI_CAREER_ROADMAP=... node validate-secrets.js`);
  }
})();