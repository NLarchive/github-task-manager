const ROOT_COLOR = '#183a60';
const FOLDER_COLOR = '#c48a32';

const FILE_TYPE_COLORS = Object.freeze({
    '.js': '#d7a11d',
    '.ts': '#1d5fa7',
    '.json': '#0f766e',
    '.md': '#9a3412',
    '.html': '#b91c1c',
    '.css': '#0369a1',
    image: '#6b8e23',
    text: '#475569',
    default: '#64748b'
});

const IMAGE_EXTENSIONS = new Set(['.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);
const TEXT_LIKE_EXTENSIONS = new Set([
    '.agent',
    '.bat',
    '.cjs',
    '.cmd',
    '.css',
    '.csv',
    '.env',
    '.gitignore',
    '.html',
    '.instructions',
    '.java',
    '.js',
    '.json',
    '.jsonl',
    '.jsx',
    '.less',
    '.log',
    '.md',
    '.mjs',
    '.ps1',
    '.prompt',
    '.py',
    '.scss',
    '.sh',
    '.skill',
    '.sql',
    '.svg',
    '.toml',
    '.ts',
    '.tsx',
    '.txt',
    '.xml',
    '.yaml',
    '.yml'
]);

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function formatBytes(bytes) {
    const numericValue = Number(bytes || 0);
    if (!Number.isFinite(numericValue) || numericValue <= 0) return '0 B';
    if (numericValue < 1024) return `${numericValue} B`;
    if (numericValue < 1024 * 1024) return `${(numericValue / 1024).toFixed(1)} KB`;
    return `${(numericValue / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileExtension(name) {
    const match = String(name || '').toLowerCase().match(/(\.[^./\\]+)$/);
    return match ? match[1] : '';
}

export function isTextLikeFileName(name) {
    const extension = getFileExtension(name);
    return !extension || TEXT_LIKE_EXTENSIONS.has(extension);
}

export function getFileTypeKey(entryOrName) {
    if (entryOrName && typeof entryOrName === 'object') {
        if (entryOrName.kind === 'root') return 'root';
        if (entryOrName.kind === 'directory') return 'folder';
        const extension = getFileExtension(entryOrName.name || entryOrName.relativePath || '');
        if (IMAGE_EXTENSIONS.has(extension)) return 'image';
        if (extension && FILE_TYPE_COLORS[extension]) return extension;
        return extension || 'text';
    }

    const extension = getFileExtension(entryOrName);
    if (IMAGE_EXTENSIONS.has(extension)) return 'image';
    if (extension && FILE_TYPE_COLORS[extension]) return extension;
    return extension || 'text';
}

export function getLegendLabel(typeKey) {
    if (typeKey === 'root') return 'Current Folder';
    if (typeKey === 'folder') return 'Folders';
    if (typeKey === 'image') return 'Images';
    if (typeKey === 'text') return 'Plain Text';
    if (!typeKey) return 'Other Files';
    return `${typeKey} files`;
}

export function getNodeColor(entry) {
    const typeKey = getFileTypeKey(entry);
    if (typeKey === 'root') return ROOT_COLOR;
    if (typeKey === 'folder') return FOLDER_COLOR;
    return FILE_TYPE_COLORS[typeKey] || FILE_TYPE_COLORS.default;
}

export function getNodeRadius(entry) {
    if (!entry) return 18;
    if (entry.kind === 'root') {
        return clamp(32 + Math.sqrt(Math.max(entry.totalNodeCount || 1, 1)) * 2.4, 34, 54);
    }
    if (entry.kind === 'directory') {
        return clamp(16 + Math.sqrt(Math.max(entry.totalNodeCount || 1, 1)) * 3.6, 18, 52);
    }
    const sizeBytes = Number(entry.sizeBytes || 0);
    return clamp(12 + Math.log10(Math.max(sizeBytes, 1) + 1) * 4, 12, 26);
}

export function truncateLabel(value, maxLength = 18) {
    const text = String(value || '');
    if (text.length <= maxLength) return text;
    return `${text.slice(0, Math.max(maxLength - 1, 1))}…`;
}

export function buildLegendEntries(entries = []) {
    const counts = new Map();
    entries.forEach((entry) => {
        const key = getFileTypeKey(entry);
        const nextCount = counts.get(key) || 0;
        counts.set(key, nextCount + 1);
    });

    const orderedKeys = ['folder', '.js', '.ts', '.json', '.md', '.html', '.css', 'image', 'text'];
    const seen = new Set();
    const result = [];

    orderedKeys.forEach((key) => {
        if (!counts.has(key)) return;
        seen.add(key);
        result.push({
            key,
            label: getLegendLabel(key),
            color: key === 'folder' ? FOLDER_COLOR : (key === 'root' ? ROOT_COLOR : (FILE_TYPE_COLORS[key] || FILE_TYPE_COLORS.default)),
            count: counts.get(key)
        });
    });

    Array.from(counts.keys())
        .filter((key) => !seen.has(key))
        .sort((left, right) => left.localeCompare(right))
        .forEach((key) => {
            result.push({
                key,
                label: getLegendLabel(key),
                color: FILE_TYPE_COLORS[key] || FILE_TYPE_COLORS.default,
                count: counts.get(key)
            });
        });

    return result;
}