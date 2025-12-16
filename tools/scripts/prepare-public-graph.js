const fs = require('fs');
const path = require('path');

function copyGraphDisplayIntoPublic() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const src = path.join(repoRoot, 'graph-display');
  const dest = path.join(repoRoot, 'public', 'graph-display');

  if (!fs.existsSync(src)) {
    throw new Error(`Source folder not found: ${src}`);
  }

  // Clean destination to avoid stale assets
  fs.rmSync(dest, { recursive: true, force: true });

  // Node 16+ supports fs.cpSync
  fs.cpSync(src, dest, {
    recursive: true,
    // Preserve symlinks as-is if any (should be rare here)
    dereference: false
  });
}

try {
  copyGraphDisplayIntoPublic();
  console.log('✓ Prepared public/graph-display (copied from graph-display/)');
} catch (err) {
  console.error('✗ Failed to prepare public/graph-display:', err && err.message ? err.message : err);
  process.exit(1);
}
