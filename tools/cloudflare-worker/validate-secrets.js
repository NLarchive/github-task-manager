#!/usr/bin/env node
/*
  Validate Cloudflare Worker tokens locally against GitHub API.
  Usage:
    GH_TOKEN_AI_CAREER_ROADMAP=... node validate-secrets.js
    GITHUB_TOKEN_AI_CAREER_ROADMAP=... node validate-secrets.js
*/

const fetch = global.fetch || (typeof require !== 'undefined' ? require('node-fetch') : null);

function getEnvVar(keys) {
  for (const k of keys) {
    if (process.env[k] && String(process.env[k]).trim()) return process.env[k].trim();
  }
  return null;
}

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
  const owner = 'NLarchive';
  const repo = 'ai-career-roadmap';
  const branch = 'main';
  const path = 'tasksDB/ai-career-roadmap/tasks.json';

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