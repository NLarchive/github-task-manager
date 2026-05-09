import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function getETag(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return `"${Math.floor(stat.mtimeMs)}"`;
  } catch {
    return '"0"';
  }
}

export async function etagMatches(filePath, clientEtag) {
  if (!clientEtag) return false;
  const serverEtag = await getETag(filePath);
  return serverEtag === clientEtag;
}

export async function readJSON(filePath, fallback = null) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

export async function readText(filePath, fallback = '') {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

export async function writeAtomic(filePath, content, options = {}) {
  const { backup = false, ensureDir = true } = options;
  const dir = path.dirname(filePath);
  const tmpPath = path.join(os.tmpdir(), `bridge-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);

  if (ensureDir) {
    await fs.mkdir(dir, { recursive: true });
  }

  if (backup) {
    await fs.copyFile(filePath, `${filePath}.bak`).catch(() => {});
  }

  try {
    await fs.writeFile(tmpPath, content, 'utf-8');
    const fh = await fs.open(tmpPath, 'r+');
    await fh.sync();
    await fh.close();
    await fs.rename(tmpPath, filePath);
  } catch (err) {
    await fs.unlink(tmpPath).catch(() => {});
    throw err;
  }
}

export async function writeJSON(filePath, data, options = {}) {
  await writeAtomic(filePath, JSON.stringify(data, null, 2), options);
}

export async function writeBatch(entries, options = {}) {
  const results = await Promise.allSettled(
    entries.map(({ path: filePath, content }) => {
      const payload = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
      return writeAtomic(filePath, payload, options).then(() => filePath);
    })
  );

  return results.map((result, i) => ({
    path: entries[i].path,
    ok: result.status === 'fulfilled',
    error: result.status === 'rejected' ? result.reason?.message : null
  }));
}

export function safePath(rootDir, userPath) {
  const abs = path.resolve(rootDir, userPath);
  const root = path.resolve(rootDir);
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    throw new Error(`Path traversal attempt blocked: "${userPath}"`);
  }
  return abs;
}

export async function fileExists(filePath) {
  return fs.access(filePath).then(() => true).catch(() => false);
}

export async function listFiles(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}
