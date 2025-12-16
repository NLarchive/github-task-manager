/**
 * TaskDB Commit Format Validator
 *
 * Validates TaskDB commits in the current git repository.
 * Only checks commits that:
 * - have subject starting with "TaskDB|", OR
 * - contain a TASKDB_CHANGE_V1 block in the commit body.
 *
 * For TaskDB single-event subjects, schema is:
 *   TaskDB|<action>|<id>|<task_name>|<summary>
 *
 * Usage:
 *   node tools/scripts/validate-commit-format.js
 *   node tools/scripts/validate-commit-format.js --range origin/main..HEAD
 */

const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function parseArgs(argv) {
  const out = { range: null, max: 200 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--range' && argv[i + 1]) {
      out.range = argv[i + 1];
      i++;
    } else if (a === '--max' && argv[i + 1]) {
      out.max = parseInt(argv[i + 1], 10);
      i++;
    }
  }
  return out;
}

function git(cmd) {
  return execSync(`git ${cmd}`, { stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8');
}

function extractTaskDbPayload(commitBody) {
  const start = '---TASKDB_CHANGE_V1---';
  const end = '---/TASKDB_CHANGE_V1---';
  const i = commitBody.indexOf(start);
  const j = commitBody.indexOf(end);
  if (i < 0 || j < 0 || j <= i) return null;
  const jsonText = commitBody.slice(i + start.length, j).trim();
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

function validateSubject(subject) {
  const raw = String(subject || '').trim();
  if (!raw.startsWith('TaskDB|')) {
    return { valid: false, error: 'Subject does not start with TaskDB|', raw };
  }
  const parts = raw.split('|');
  if (parts.length < 5) {
    return { valid: false, error: `Expected at least 5 pipe-separated fields, got ${parts.length}`, raw };
  }
  const prefix = parts[0].trim();
  const action = parts[1].trim();
  const idStr = parts[2].trim();
  const name = parts[3].trim();
  const summary = parts.slice(4).join('|').trim();

  if (prefix !== 'TaskDB') return { valid: false, error: `Prefix is "${prefix}" (expected "TaskDB")`, raw };
  if (!['create', 'update', 'delete'].includes(action)) return { valid: false, error: `Action "${action}" not in create,update,delete`, raw };

  const id = parseInt(idStr, 10);
  if (!Number.isInteger(id) || id <= 0) return { valid: false, error: `ID "${idStr}" is not a positive integer`, raw };
  if (!name) return { valid: false, error: 'Task name is empty', raw };
  if (!summary) return { valid: false, error: 'Summary is empty', raw };

  return { valid: true, raw, action, id, name, summary };
}

function determineRange(args) {
  if (args.range) return args.range;

  // PRs: validate only commits on the PR branch compared to base.
  if (process.env.GITHUB_EVENT_NAME === 'pull_request' && process.env.GITHUB_BASE_REF) {
    const base = `origin/${process.env.GITHUB_BASE_REF}`;
    try {
      // ensure base exists locally
      git(`fetch --no-tags --depth=200 origin ${process.env.GITHUB_BASE_REF}`);
    } catch {
      // ignore
    }
    return `${base}..HEAD`;
  }

  // Default: validate last N commits on current branch
  return null;
}

function listCommits(range, max) {
  const format = '%H%x00%s%x00%b%x00';
  const rangeArg = range ? `${range} ` : '';
  const out = git(`log ${rangeArg}--max-count=${max} --pretty=format:${format}`);
  const records = out.split('\x00');
  // records are: sha, subject, body, sha, subject, body...
  const commits = [];
  for (let i = 0; i + 2 < records.length; i += 3) {
    const sha = records[i];
    const subject = records[i + 1] || '';
    const body = records[i + 2] || '';
    if (!sha) continue;
    commits.push({ sha, subject, body });
  }
  return commits;
}

function main() {
  const args = parseArgs(process.argv);
  const range = determineRange(args);

  console.log(`${colors.blue}🧾 TaskDB Commit Format Validation${colors.reset}`);
  console.log('='.repeat(60));
  if (range) console.log(`${colors.cyan}Range:${colors.reset} ${range}`);

  let errors = 0;
  let checked = 0;

  const commits = listCommits(range, args.max);
  for (const c of commits) {
    const hasTaskDbSubject = String(c.subject || '').trim().startsWith('TaskDB|');
    const hasPayloadMarkers = String(c.body || '').includes('---TASKDB_CHANGE_V1---') && String(c.body || '').includes('---/TASKDB_CHANGE_V1---');

    if (!hasTaskDbSubject && !hasPayloadMarkers) continue;

    checked++;

    const subjectResult = hasTaskDbSubject ? validateSubject(c.subject) : { valid: true };
    if (!subjectResult.valid) {
      errors++;
      console.log(`${colors.red}❌ ${c.sha.slice(0, 10)}${colors.reset} ${subjectResult.error}`);
      console.log(`   subject: ${subjectResult.raw}`);
      continue;
    }

    // If it has payload markers, require parseable payload
    if (hasPayloadMarkers) {
      const payload = extractTaskDbPayload(c.body);
      if (!payload) {
        errors++;
        console.log(`${colors.red}❌ ${c.sha.slice(0, 10)}${colors.reset} Payload block present but JSON invalid`);
        continue;
      }
      if (payload.spec !== 'taskdb.commit.v1') {
        errors++;
        console.log(`${colors.red}❌ ${c.sha.slice(0, 10)}${colors.reset} payload.spec is "${payload.spec}" (expected taskdb.commit.v1)`);
        continue;
      }
      if (!Array.isArray(payload.events) || payload.events.length === 0) {
        errors++;
        console.log(`${colors.red}❌ ${c.sha.slice(0, 10)}${colors.reset} payload.events missing/empty`);
        continue;
      }

      // If subject is TaskDB|... and payload is single event, cross-check.
      if (hasTaskDbSubject && payload.events.length === 1) {
        const ev = payload.events[0];
        const action = subjectResult.action;
        const id = subjectResult.id;
        if (ev && ev.action && String(ev.action) !== String(action)) {
          errors++;
          console.log(`${colors.red}❌ ${c.sha.slice(0, 10)}${colors.reset} action mismatch: subject=${action} payload=${ev.action}`);
          continue;
        }
        if (ev && ev.taskId && String(ev.taskId) !== String(id)) {
          errors++;
          console.log(`${colors.red}❌ ${c.sha.slice(0, 10)}${colors.reset} id mismatch: subject=${id} payload=${ev.taskId}`);
          continue;
        }
      }
    } else if (hasTaskDbSubject) {
      // If it looks like a TaskDB subject, require payload markers too.
      // errors++;
      // console.log(`${colors.red}❌ ${c.sha.slice(0, 10)}${colors.reset} TaskDB subject present but missing TASKDB_CHANGE_V1 payload block`);
    }
  }

  console.log(`\n${'-'.repeat(60)}`);
  console.log(`Checked TaskDB commits: ${checked}`);

  if (errors > 0) {
    console.log(`${colors.red}FAILED${colors.reset} (${errors} errors)`);
    process.exit(1);
  }

  console.log(`${colors.green}PASSED${colors.reset}`);
  process.exit(0);
}

main();
