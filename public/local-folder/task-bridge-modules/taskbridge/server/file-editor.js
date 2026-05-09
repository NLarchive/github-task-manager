/**
 * file-editor.js — Server-side atomic file read/write module
 * Zero dependencies. Uses only Node.js built-ins.
 *
 * Responsibilities:
 *  - Atomic writes (write→tmp→rename, never corrupts on crash)
 *  - ETag generation from mtime (fast, no content hashing needed)
 *  - Batch writes (update many files in one call)
 *  - Backup before overwrite (optional)
 *  - Safe path resolution (prevents path traversal attacks)
 */

import fs   from 'fs/promises';
import path from 'path';
import os   from 'os';

// ─── ETag ────────────────────────────────────────────────────────────────────

/**
 * Returns a quoted ETag string based on the file's last-modified timestamp.
 * Returns '"0"' if the file does not exist yet.
 */
export async function getETag(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return `"${Math.floor(stat.mtimeMs)}"`;
  } catch {
    return '"0"';
  }
}

/**
 * Returns true if the ETag the client sent matches the file's current ETag.
 * Use this to short-circuit GET and send 304 Not Modified.
 */
export async function etagMatches(filePath, clientEtag) {
  if (!clientEtag) return false;
  const serverEtag = await getETag(filePath);
  return serverEtag === clientEtag;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Read a JSON file. Returns parsed object, or `fallback` if the file
 * doesn't exist. Throws on malformed JSON so bugs surface immediately.
 */
export async function readJSON(filePath, fallback = null) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err; // re-throw parse errors — caller should know
  }
}

/**
 * Read a raw text file. Returns string, or `fallback` if not found.
 */
export async function readText(filePath, fallback = '') {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Atomically write content to filePath.
 *
 * Strategy:
 *  1. Write to a temp file in the OS temp dir (same filesystem preferred)
 *  2. fsync the temp file to flush OS buffers to disk
 *  3. rename() over the target — atomic on POSIX and NTFS
 *  4. Clean up temp file if anything fails
 *
 * Options:
 *  - backup: boolean — copy existing file to filePath.bak before overwrite
 *  - ensureDir: boolean — create parent directories if they don't exist
 */
export async function writeAtomic(filePath, content, options = {}) {
  const { backup = false, ensureDir = true } = options;
  const dir     = path.dirname(filePath);
  const tmpPath = path.join(os.tmpdir(), `bridge-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);

  if (ensureDir) {
    await fs.mkdir(dir, { recursive: true });
  }

  if (backup) {
    await fs.copyFile(filePath, filePath + '.bak').catch(() => {}); // ok if src missing
  }

  try {
    await fs.writeFile(tmpPath, content, 'utf-8');

    // fsync: flush kernel buffers → guarantees data survives a power cut
    const fh = await fs.open(tmpPath, 'r+');
    await fh.sync();
    await fh.close();

    await fs.rename(tmpPath, filePath);
  } catch (err) {
    await fs.unlink(tmpPath).catch(() => {}); // clean up temp on failure
    throw err;
  }
}

/**
 * Atomically write a JS value as pretty-printed JSON.
 */
export async function writeJSON(filePath, data, options = {}) {
  await writeAtomic(filePath, JSON.stringify(data, null, 2), options);
}

// ─── Batch Write ─────────────────────────────────────────────────────────────

/**
 * Write multiple files in parallel, all atomically.
 * Each entry: { path: string, content: string | object }
 * If content is an object it is serialized as JSON.
 *
 * Returns an array of { path, ok, error } — does NOT throw on partial failure,
 * so the caller can decide how to handle individual file errors.
 *
 * Example:
 *   await writeBatch([
 *     { path: './node.tasks.json',   content: tasksArray },
 *     { path: './state/meta.json',   content: metaObject },
 *     { path: './exports/tasks.csv', content: csvString  },
 *   ]);
 */
export async function writeBatch(entries, options = {}) {
  const results = await Promise.allSettled(
    entries.map(({ path: filePath, content }) => {
      const payload = typeof content === 'string'
        ? content
        : JSON.stringify(content, null, 2);
      return writeAtomic(filePath, payload, options).then(() => filePath);
    })
  );

  return results.map((result, i) => ({
    path: entries[i].path,
    ok:    result.status === 'fulfilled',
    error: result.status === 'rejected' ? result.reason?.message : null,
  }));
}

// ─── Safe Path Resolution ─────────────────────────────────────────────────────

/**
 * Resolve `userPath` relative to `rootDir` and verify the result stays
 * inside `rootDir`. Returns the absolute path or throws if traversal detected.
 *
 * Use this before ANY file read/write that takes a path from user input or
 * query parameters — prevents ../../etc/passwd attacks.
 */
export function safePath(rootDir, userPath) {
  const abs = path.resolve(rootDir, userPath);
  if (!abs.startsWith(path.resolve(rootDir) + path.sep) &&
       abs !== path.resolve(rootDir)) {
    throw new Error(`Path traversal attempt blocked: "${userPath}"`);
  }
  return abs;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Returns true if a file exists and is readable.
 */
export async function fileExists(filePath) {
  return fs.access(filePath).then(() => true).catch(() => false);
}

/**
 * List all files in a directory (non-recursive, sorted).
 * Returns [] if directory doesn't exist.
 */
export async function listFiles(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter(e => e.isFile())
      .map(e => e.name)
      .sort();
  } catch {
    return [];
  }
}
