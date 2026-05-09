'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/** Reserved component metadata keys excluded from extracted node meta. */
const RESERVED_NODE_KEYS = new Set([
	'id',
	'type',
	'version',
	'name',
	'label',
	'path',
	'description',
	'inputs',
	'outputs',
	'files',
	'tests',
	'nodes',
	'edges'
]);

/** Default canvas size presets for each node kind. */
const NODE_DIMENSIONS = {
	workflow: { w: 156, h: 42 },
	subgraph: { w: 142, h: 56 },
	agent: { w: 136, h: 54 },
	tool: { w: 130, h: 52 },
	model: { w: 168, h: 58 },
	file: { w: 158, h: 44 },
	default: { w: 132, h: 52 }
};

/** Binary or non-text file extensions excluded from editor file discovery. */
const TEXT_FILE_DENYLIST = new Set([
	'.gguf',
	'.png',
	'.jpg',
	'.jpeg',
	'.gif',
	'.webp',
	'.ico',
	'.woff',
	'.woff2',
	'.ttf',
	'.eot',
	'.pdf',
	'.zip'
]);

/** Identifier for the workspace root node. */
const ROOT_NODE_ID = 'root';

/** Normalize a path value to POSIX separators. */
function toPosix(value) {
	return String(value || '').replace(/\\/g, '/');
}

/** Check whether the given absolute path exists on disk. */
function exists(absPath) {
	return fs.existsSync(absPath);
}

/** Read a UTF-8 text file from disk. */
function readText(absPath) {
	return fs.readFileSync(absPath, 'utf8');
}

/** Compute a SHA-1 fingerprint for a string. */
function sha1(value) {
	return crypto.createHash('sha1').update(String(value || '')).digest('hex');
}

/** Parse JSON from a file path, returning an empty object if missing. */
function parseJson(absPath) {
	if (!exists(absPath)) return {};
	return JSON.parse(readText(absPath));
}

/** Convert metadata values into a normalized string form. */
function stringifyMeta(value) {
	if (value === null || value === undefined) return '';
	if (Array.isArray(value)) return value.join(', ');
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}

/** Normalize port definitions into {n,t} objects. */
function normalizePorts(items) {
	if (!Array.isArray(items)) return [];
	return items
		.map((item) => {
			if (!item || typeof item !== 'object') return null;
			return {
				n: String(item.name || item.n || '').trim(),
				t: String(item.type || item.t || 'string').trim() || 'string'
			};
		})
		.filter((item) => item && item.n);
}

/** Normalize a list of values into a cleaned string array. */
function normalizeStringList(items) {
	if (!Array.isArray(items)) return [];
	return items.map((item) => String(item || '').trim()).filter(Boolean);
}

/** Normalize a list of file or component references to POSIX paths. */
function normalizeRefList(items) {
	if (!Array.isArray(items)) return [];
	return items
		.map((item) => {
			if (typeof item === 'string') return toPosix(item.replace(/^\.\//, ''));
			if (item && typeof item === 'object' && (item.ref || item.path)) {
				return toPosix(String(item.ref || item.path).replace(/^\.\//, ''));
			}
			return '';
		})
		.filter(Boolean);
}

/** Infer the component kind from the definition filename or folder. */
function inferType(definitionName, relDir, explicitType) {
	if (explicitType) return String(explicitType);
	if (definitionName === 'workflow.json') return 'workflow';
	if (definitionName === 'graph.json') return 'subgraph';
	if (/\/models\//.test(relDir)) return 'model';
	if (/\/agents\//.test(relDir)) return 'agent';
	if (/\/tools\//.test(relDir)) return 'tool';
	return 'tool';
}

/** Determine whether a relative file path is safe to edit and display as text. */
function isEditableFile(relPath) {
	const rel = toPosix(relPath);
	const ext = path.extname(rel).toLowerCase();
	if (TEXT_FILE_DENYLIST.has(ext)) return false;
	const base = path.basename(rel).toLowerCase();
	if (base === '.ds_store') return false;
	if (ext === '.yaml' || ext === '.yml') return false;
	return true;
}

/** Recursively collect relative file paths from a directory tree. */
function walkFiles(absDir, baseDir = absDir, acc = []) {
	if (!exists(absDir)) return acc;
	const entries = fs.readdirSync(absDir, { withFileTypes: true });
	entries.forEach((entry) => {
		const absPath = path.join(absDir, entry.name);
		if (entry.isDirectory()) {
			walkFiles(absPath, baseDir, acc);
			return;
		}
		acc.push(toPosix(path.relative(baseDir, absPath)));
	});
	return acc;
}

/** List editable files for a component or workflow folder. */
function collectEditableFiles(rootDir, relDir) {
	const absDir = path.join(rootDir, relDir);
	return walkFiles(absDir)
		.filter(isEditableFile)
		.sort((a, b) => a.localeCompare(b));
}

/** Merge declared and discovered test file references for a component. */
function collectTests(doc, files) {
	const declared = normalizeStringList(doc.tests);
	const discovered = files.filter((file) => file.startsWith('tests/') && file.endsWith('.json'));
	return [...new Set([...declared, ...discovered])];
}

/** Derive a human-friendly label for a node from metadata or fallback ID. */
function inferLabel(doc, fallbackId) {
	return String(doc.label || doc.name || doc.model_name || fallbackId || '').trim() || fallbackId;
}

/** Return the default dimensions for a node type. */
function getNodeSize(type) {
	return NODE_DIMENSIONS[type] || NODE_DIMENSIONS.default;
}

/** Extract non-reserved metadata from a component definition. */
function extractMeta(doc, type) {
	const meta = {};
	Object.entries(doc || {}).forEach(([key, value]) => {
		if (RESERVED_NODE_KEYS.has(key)) return;
		meta[key] = stringifyMeta(value);
	});
	if (!meta.lifecycle) meta.lifecycle = 'draft';
	if (!meta.success_threshold) meta.success_threshold = '0.80';
	if (type === 'agent' && !meta.model_ref) meta.model_ref = '';
	return meta;
}

/** Build a workspace node object from a component or workflow definition. */
function createNode({ doc, type, relDir, files, tests }) {
	const id = String(doc.id || path.basename(relDir) || 'component').trim();
	const size = getNodeSize(type);
	return {
		id,
		type,
		label: inferLabel(doc, id),
		path: relDir,
		desc: String(doc.description || ''),
		version: Number(doc.version || 1) || 1,
		inputs: normalizePorts(doc.inputs),
		outputs: normalizePorts(doc.outputs),
		files,
		tests,
		children: [],
		edgeIds: [],
		meta: extractMeta(doc, type),
		parent: ROOT_NODE_ID,
		x: 0,
		y: 0,
		w: size.w,
		h: size.h
	};
}

/** Sort workspace nodes by type precedence and label. */
function sortByTypeAndLabel(a, b) {
	const order = ['workflow', 'subgraph', 'agent', 'tool', 'model', 'file', 'prompt', 'skill', 'task', 'test', 'benchmark'];
	const rankA = order.indexOf(a.type);
	const rankB = order.indexOf(b.type);
	if (rankA !== rankB) return (rankA === -1 ? order.length : rankA) - (rankB === -1 ? order.length : rankB);
	return String(a.label || a.id).localeCompare(String(b.label || b.id));
}

/** Discover component and workflow definition files under the workspace root. */
function walkDefinitions(rootDir) {
	const targets = ['components', 'workflows'];
	const definitionNames = new Set(['schema.json', 'graph.json', 'workflow.json']);
	const files = [];

	const visit = (absDir) => {
		if (!exists(absDir)) return;
		const entries = fs.readdirSync(absDir, { withFileTypes: true });
		entries.forEach((entry) => {
			const absPath = path.join(absDir, entry.name);
			if (entry.isDirectory()) {
				visit(absPath);
				return;
			}
			if (definitionNames.has(entry.name)) files.push(absPath);
		});
	};

	targets.forEach((target) => visit(path.join(rootDir, target)));
	return files.sort((a, b) => toPosix(path.relative(rootDir, a)).localeCompare(toPosix(path.relative(rootDir, b))));
}

/** Determine a user-facing file role for workspace browsing and editing. */
function roleForFile(file) {
	if (file === 'schema.json' || file === 'graph.json' || file === 'workflow.json') return 'spec';
	if (file === 'prompt.md') return 'prompt';
	if (file === 'main.js') return 'runtime';
	if (file === 'state.js' || file === 'state.py') return 'state';
	if (file === 'template.html') return 'template';
	if (file === 'schema.json') return 'schema';
	if (file.startsWith('tests/')) return 'test';
	if (file === '.env.example') return 'env';
	return 'file';
}

/** Infer a simplified file type from a filename. */
function inferFileType(file) {
	const role = roleForFile(file);
	if (role === 'prompt') return 'prompt';
	if (role === 'test') return 'test';
	return 'file';
}

/** Create a normalized slug from an arbitrary filename. */
function slugForFile(file) {
	return file.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
}

/** Register a source code symbol in a file node if not already present. */
function pushSymbol(target, type, name) {
	const cleaned = String(name || '').trim();
	if (!cleaned) return;
	if (target.some((symbol) => symbol.type === type && symbol.name === cleaned)) return;
	target.push({
		type,
		name: cleaned,
		label: `${cleaned} (${type})`
	});
}

/** Extract top-level symbols from a file for quick navigation. */
/** Extract top-level symbols from a file for quick navigation. */
function extractSymbolsForFile(absPath, file) {
	if (!exists(absPath)) return [];
	const ext = path.extname(file).toLowerCase();
	if (!['.js', '.mjs', '.cjs', '.json', '.md'].includes(ext)) return [];
	const text = readText(absPath);
	const symbols = [];
	if (ext === '.json') {
		try {
			const payload = JSON.parse(text);
			if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
				Object.keys(payload).slice(0, 24).forEach((key) => pushSymbol(symbols, 'key', key));
			}
		} catch {}
		return symbols;
	}
	if (ext === '.md') {
		const headingMatches = text.matchAll(/^#{1,6}\s+(.+)$/gm);
		for (const match of headingMatches) pushSymbol(symbols, 'heading', match[1]);
		return symbols;
	}
	const patterns = [
		{ type: 'function', regex: /^\s*export\s+async\s+function\s+([A-Za-z_$][\w$]*)/gm },
		{ type: 'function', regex: /^\s*export\s+function\s+([A-Za-z_$][\w$]*)/gm },
		{ type: 'function', regex: /^\s*async\s+function\s+([A-Za-z_$][\w$]*)/gm },
		{ type: 'function', regex: /^\s*function\s+([A-Za-z_$][\w$]*)/gm },
		{ type: 'class', regex: /^\s*export\s+class\s+([A-Za-z_$][\w$]*)/gm },
		{ type: 'class', regex: /^\s*class\s+([A-Za-z_$][\w$]*)/gm },
		{ type: 'variable', regex: /^\s*export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/gm },
		{ type: 'variable', regex: /^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/gm }
	];
	patterns.forEach(({ type, regex }) => {
		for (const match of text.matchAll(regex)) pushSymbol(symbols, type, match[1]);
	});
	return symbols.slice(0, 24);
}

/** Create a file node object for a component file inside the workspace graph. */
/** Create a file node object for a component file inside the workspace graph. */
function createFileNode(rootDir, parentNode, file) {
	const size = getNodeSize('file');
	const absPath = path.join(rootDir, parentNode.path, file);
	const symbols = extractSymbolsForFile(absPath, file);
	return {
		id: `${parentNode.id}__${slugForFile(file)}`,
		type: inferFileType(file),
		label: file,
		path: parentNode.path,
		desc: `${parentNode.label} / ${file}`,
		version: parentNode.version || 1,
		inputs: [],
		outputs: [],
		files: [file],
		tests: [],
		children: [],
		edgeIds: [],
		meta: {
			lifecycle: 'draft',
			owner_component: parentNode.id,
			file_role: roleForFile(file),
			relative_file: file,
			symbols,
			success_threshold: parentNode.meta?.success_threshold || '0.80'
		},
		parent: parentNode.id,
		x: 0,
		y: 0,
		w: size.w,
		h: size.h
	};
}

/** Build cached execution metadata for a component node. */
/** Build cached execution metadata for a component node. */
function buildNodeExecutionMeta(ctx, nodeId) {
	ctx._nodeMetaCache = ctx._nodeMetaCache || new Map();
	if (ctx._nodeMetaCache.has(nodeId)) return ctx._nodeMetaCache.get(nodeId);
	const def = ctx.definitionsById.get(nodeId);
	if (!def) return null;
	const fileHashes = (def.node.files || []).slice().sort((a, b) => a.localeCompare(b)).map((file) => {
		const absPath = path.join(ctx.graphRoot, def.node.path, file);
		const role = roleForFile(file);
		const contentHash = exists(absPath) && isEditableFile(file) ? sha1(readText(absPath)) : null;
		return {
			file,
			role,
			exists: exists(absPath),
			sha1: contentHash
		};
	});
	const runtimeFiles = fileHashes.filter((entry) => entry.role !== 'test');
	const runtimeSignatureSource = runtimeFiles.length
		? runtimeFiles.map((entry) => `${entry.file}:${entry.sha1 || 'missing'}`).join('\n')
		: 'no-runtime-files';
	const componentSignatureSource = fileHashes.length
		? fileHashes.map((entry) => `${entry.file}:${entry.sha1 || 'missing'}`).join('\n')
		: 'no-component-files';
	const meta = {
		nodeId: def.node.id,
		label: def.node.label,
		type: def.node.type,
		path: def.node.path,
		version: def.node.version || 1,
		success_threshold: Number.parseFloat(def.node.meta?.success_threshold || '0.80') || 0.8,
		runtime_signature: sha1(runtimeSignatureSource),
		component_signature: sha1(componentSignatureSource),
		file_hashes: fileHashes
	};
	ctx._nodeMetaCache.set(nodeId, meta);
	return meta;
}

/** Aggregate execution metadata from runtime steps into node summaries. */
/** Aggregate execution metadata from runtime steps into node summaries. */
function collectExecutedNodeMetadata(ctx, steps = []) {
	const order = [];
	const aggregates = new Map();
	steps.forEach((step) => {
		if (!step?.nodeId) return;
		if (!aggregates.has(step.nodeId)) {
			aggregates.set(step.nodeId, {
				call_count: 0,
				total_duration_ms: 0,
				max_duration_ms: 0,
				failure_count: 0,
				status: 'pass',
				sample_inputs: [],
				sample_outputs: []
			});
			order.push(step.nodeId);
		}
		const current = aggregates.get(step.nodeId);
		current.call_count += 1;
		current.total_duration_ms += Number(step.durationMs || 0);
		current.max_duration_ms = Math.max(current.max_duration_ms, Number(step.durationMs || 0));
		if (step.status === 'fail') {
			current.failure_count += 1;
			current.status = 'fail';
		}
		if (step.inputSnippet && current.sample_inputs.length < 2) current.sample_inputs.push(step.inputSnippet);
		if ((step.outputSnippet || step.output) && current.sample_outputs.length < 2) current.sample_outputs.push(step.outputSnippet || step.output);
	});
	return order.map((nodeId) => {
		const meta = buildNodeExecutionMeta(ctx, nodeId);
		const current = aggregates.get(nodeId);
		return {
			...meta,
			call_count: current.call_count,
			total_duration_ms: current.total_duration_ms,
			avg_duration_ms: current.call_count ? Number((current.total_duration_ms / current.call_count).toFixed(2)) : 0,
			max_duration_ms: current.max_duration_ms,
			failure_count: current.failure_count,
			status: current.status,
			sample_inputs: current.sample_inputs,
			sample_outputs: current.sample_outputs
		};
	}).filter(Boolean);
}

/** Build a stable fingerprint for a run from executed node metadata. */
function buildRunFingerprint(executedNodes = []) {
	if (!executedNodes.length) return null;
	return sha1(executedNodes.map((node) => [
		node.nodeId,
		node.runtime_signature,
		node.status,
		node.call_count,
		node.total_duration_ms
	].join(':')).join('|'));
}

/** Ensure edge references are stored on source and destination nodes. */
/** Ensure edge references are stored on source and destination nodes. */
function ensureEdgeRefs(nodes, edge) {
	if (nodes[edge.from] && !nodes[edge.from].edgeIds.includes(edge.id)) nodes[edge.from].edgeIds.push(edge.id);
	if (nodes[edge.to] && !nodes[edge.to].edgeIds.includes(edge.id)) nodes[edge.to].edgeIds.push(edge.id);
}

/** Create edges between file nodes and their owning component. */
/** Create edges between file nodes and their owning component. */
function addFileEdges(nodes, edges, parentNode, fileNodeIds, nextIndexRef) {
	const idsByRole = {};
	fileNodeIds.forEach((nodeId) => {
		const node = nodes[nodeId];
		const role = node?.meta?.file_role || 'file';
		if (!idsByRole[role]) idsByRole[role] = [];
		idsByRole[role].push(nodeId);
	});

	const specIds = idsByRole.spec || [];
	const runtimeIds = [...(idsByRole.runtime || []), ...(idsByRole.prompt || []), ...(idsByRole.state || []), ...(idsByRole.template || []), ...(idsByRole.schema || []), ...(idsByRole.env || [])];
	const testIds = idsByRole.test || [];

	const connect = (from, to, mapping, type = 'code-flow') => {
		const edgeId = `${parentNode.id}__file_edge_${nextIndexRef.value++}`;
		edges[edgeId] = { id: edgeId, from, to, mapping, transform: '', condition: '', type };
		ensureEdgeRefs(nodes, edges[edgeId]);
	};

	specIds.forEach((specId) => {
		runtimeIds.forEach((runtimeId) => connect(specId, runtimeId, 'defines'));
		testIds.forEach((testId) => connect(specId, testId, 'validated by', 'test-flow'));
	});

	runtimeIds.forEach((runtimeId) => {
		testIds.forEach((testId) => connect(runtimeId, testId, 'covered by', 'test-flow'));
	});

	const schemaId = (idsByRole.schema || [])[0];
	const runtimeId = (idsByRole.runtime || [])[0];
	if (schemaId && runtimeId) connect(schemaId, runtimeId, 'input contract');

	const promptId = (idsByRole.prompt || [])[0];
	if (promptId && runtimeId) connect(promptId, runtimeId, 'guides execution');
}

/** Build the full Agentic IDE workspace graph from filesystem definitions. */
/** Build the full Agentic IDE workspace graph from filesystem definitions. */
function buildWorkspace(rootDir, runtimeOptions = {}) {
	const definitionsById = new Map();
	const definitionsByPath = new Map();
	const warnings = [];

	walkDefinitions(rootDir).forEach((definitionPath) => {
		let doc;
		try {
			doc = parseJson(definitionPath);
		} catch (error) {
			warnings.push(`Skipped invalid definition JSON: ${toPosix(path.relative(rootDir, definitionPath))} (${error.message})`);
			return;
		}
		const relDir = toPosix(path.relative(rootDir, path.dirname(definitionPath)));
		const definitionName = path.basename(definitionPath);
		const type = inferType(definitionName, relDir, doc.type);
		const files = collectEditableFiles(rootDir, relDir);
		const tests = collectTests(doc, files);
		const node = createNode({ doc, type, relDir, files, tests });
		definitionsById.set(node.id, { node, doc, definitionPath });
		definitionsByPath.set(relDir, node.id);
	});

	const nodes = {
		[ROOT_NODE_ID]: {
			id: ROOT_NODE_ID,
			type: 'workflow',
			label: 'agentic_ide_workspace',
			path: '',
			desc: 'Workspace root for discovered agentic components',
			version: 1,
			inputs: [],
			outputs: [],
			files: [],
			tests: [],
			children: [],
			edgeIds: [],
			meta: { lifecycle: 'draft', success_threshold: '1.00' },
			parent: null,
			x: 0,
			y: 0,
			w: 180,
			h: 44
		}
	};

	definitionsById.forEach(({ node }, nodeId) => {
		nodes[nodeId] = JSON.parse(JSON.stringify(node));
		nodes[ROOT_NODE_ID].children.push(nodeId);
	});

	definitionsById.forEach(({ node, doc }) => {
		if (node.type !== 'workflow' && node.type !== 'benchmark' && node.type !== 'subgraph') return;
		normalizeRefList(doc.nodes).forEach((refPath) => {
			const childId = definitionsByPath.get(refPath);
			if (!childId) {
				warnings.push(`Unresolved node reference in ${node.id}: ${refPath}`);
				return;
			}
			nodes[childId].parent = node.id;
			if (!nodes[node.id].children.includes(childId)) nodes[node.id].children.push(childId);
			nodes[ROOT_NODE_ID].children = nodes[ROOT_NODE_ID].children.filter((id) => id !== childId);
		});
	});

	const edges = {};
	definitionsById.forEach(({ node, doc }) => {
		const rawEdges = Array.isArray(doc.edges) ? doc.edges : [];
		rawEdges.forEach((edge, index) => {
			const edgeId = String(edge.id || `${node.id}_e${index + 1}`);
			edges[edgeId] = {
				id: edgeId,
				from: String(edge.from || ''),
				to: String(edge.to || ''),
				mapping: String(edge.mapping || ''),
				transform: String(edge.transform || ''),
				condition: String(edge.condition || ''),
				type: String(edge.type || 'data-flow')
			};
			ensureEdgeRefs(nodes, edges[edgeId]);
		});
	});

	const fileEdgeIndex = { value: 1 };
	definitionsById.forEach(({ node }) => {
		const actualNode = nodes[node.id];
		const fileNodeIds = [];
		actualNode.files.forEach((file) => {
				const fileNode = createFileNode(rootDir, actualNode, file);
			nodes[fileNode.id] = fileNode;
			actualNode.children.push(fileNode.id);
			fileNodeIds.push(fileNode.id);
		});
		addFileEdges(nodes, edges, actualNode, fileNodeIds, fileEdgeIndex);
	});

	assignLayout(nodes);

	const graph = {
		nodes,
		edges,
		models: Object.values(nodes)
			.filter((node) => node.type === 'model')
			.sort(sortByTypeAndLabel)
			.map((node) => ({
				id: node.id,
				label: node.label,
				path: node.path,
				desc: node.desc,
				files: node.files,
				tests: node.tests,
				meta: node.meta
			})),
		warnings,
		rootId: ROOT_NODE_ID
	};

	return {
		graph,
		graphRoot: rootDir,
		definitionsById,
		definitionsByPath,
		defaultModelId: graph.models[0]?.id || null,
		callLlm: runtimeOptions.callLlm,
		fetch: runtimeOptions.fetch || globalThis.fetch
	};
}

/** Assign default canvas positions for nodes in the workspace graph. */
/** Assign default canvas positions for nodes in the workspace graph. */
function assignLayout(nodes) {
	const roots = (nodes[ROOT_NODE_ID]?.children || []).map((id) => nodes[id]).filter(Boolean).sort(sortByTypeAndLabel);
	roots.forEach((node, index) => {
		node.x = 48 + index * 210;
		node.y = node.type === 'model' ? 48 : 128;
		layoutChildren(nodes, node, 1);
	});
}

/** Recursively position child nodes beneath their parent on the canvas. */
/** Recursively position child nodes beneath their parent on the canvas. */
function layoutChildren(nodes, parentNode, depth) {
	const children = (parentNode.children || []).map((childId) => nodes[childId]).filter(Boolean).sort(sortByTypeAndLabel);
	if (!children.length) return;
	const isFileLayer = children.every((child) => child.type === 'file' || child.type === 'prompt' || child.type === 'test');
	const spacing = isFileLayer ? 176 : 188;
	const startX = Math.max(24, parentNode.x - ((children.length - 1) * spacing) / 2);
	children.forEach((child, index) => {
		child.x = startX + index * spacing;
		child.y = parentNode.y + (isFileLayer ? 94 : 110);
		layoutChildren(nodes, child, depth + 1);
	});
}

/** Escape a prompt variable value for safe injection into templates. */
/** Escape a prompt variable value for safe injection into templates. */
function escapeTemplateValue(value) {
	if (typeof value === 'string') return value;
	return JSON.stringify(value ?? '', null, 2);
}

/** Render a prompt template by replacing {{variables}} with provided values. */
/** Render a prompt template by replacing {{variables}} with provided values. */
function renderPromptTemplate(template, variables) {
	return String(template || '').replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (_, key) => {
		if (!Object.prototype.hasOwnProperty.call(variables, key)) return '';
		return escapeTemplateValue(variables[key]);
	});
}

/** Return the default output port name for a node when only one output exists. */
/** Return the default output port name for a node when only one output exists. */
function primaryOutputName(node) {
	return node.outputs?.[0]?.n || 'result';
}

/** Normalize a component return value into an output object keyed by port name. */
/** Normalize a component return value into an output object keyed by port name. */
function normalizeExecutionOutput(node, value) {
	if (value && typeof value === 'object' && !Array.isArray(value) && (node.outputs?.length || 0) !== 1) {
		return value;
	}
	return { [primaryOutputName(node)]: value };
}

/** Parse simple edge mapping strings like source->target or source→target. */
/** Parse simple edge mapping strings like source->target or source→target. */
function parseEdgeMapping(mapping) {
	const parts = String(mapping || '').split(/→|->/).map((part) => part.trim()).filter(Boolean);
	if (parts.length !== 2) return null;
	return { from: parts[0], to: parts[1] };
}

/** Create a mock fetch implementation for unit test runtime execution. */
/** Create a mock fetch implementation for unit test runtime execution. */
function createMockFetch(mockSpec) {
	return async () => ({
		ok: mockSpec.ok ?? true,
		status: mockSpec.status ?? 200,
		json: async () => mockSpec.json ?? mockSpec.response ?? {},
		text: async () => {
			if (typeof mockSpec.text === 'string') return mockSpec.text;
			return JSON.stringify(mockSpec.json ?? mockSpec.response ?? {});
		}
	});
}

/** Temporarily set environment variables for a test execution block. */
/** Temporarily set environment variables for a test execution block. */
function withMockEnv(mockEnv, work) {
	if (!mockEnv || typeof mockEnv !== 'object') return work();
	const previous = {};
	Object.entries(mockEnv).forEach(([key, value]) => {
		previous[key] = process.env[key];
		process.env[key] = String(value);
	});
	return Promise.resolve()
		.then(work)
		.finally(() => {
			Object.keys(mockEnv).forEach((key) => {
				if (previous[key] === undefined) delete process.env[key];
				else process.env[key] = previous[key];
			});
		});
}

/** Load and compile a component's main JS module for runtime execution. */
/** Load and compile a component's main JS module for runtime execution. */
function loadRunFunction(absPath, runtimeOptions = {}) {
	let source = readText(absPath);
	source = source.replace(/^import\s.+$/mg, '');
	source = source.replace(/^export\s+/mg, '');
	const buildRun = new Function(
		'fetch',
		'AbortSignal',
		'console',
		'process',
		`${source}\nreturn typeof run === 'function' ? run : null;`
	);
	return buildRun(
		runtimeOptions.fetch || globalThis.fetch,
		runtimeOptions.AbortSignal || globalThis.AbortSignal,
		console,
		process
	);
}

/** Build a node input object from provided values matching declared ports. */
function buildNodeInput(node, inputState) {
	if (!node.inputs?.length) return { ...inputState };
	const payload = {};
	node.inputs.forEach((port) => {
		if (Object.prototype.hasOwnProperty.call(inputState, port.n)) payload[port.n] = inputState[port.n];
	});
	return payload;
}

/** Extract a single value from a single-key object, or return the object unchanged. */
/** Extract a single value from a single-key object, or return the object unchanged. */
function extractSingleValue(obj) {
	if (!obj || typeof obj !== 'object') return obj;
	const keys = Object.keys(obj);
	if (keys.length !== 1) return obj;
	return obj[keys[0]];
}

/** Extract the most likely text field from a model response payload. */
/** Extract the most likely text field from a model response payload. */
function extractLlmText(payload) {
	if (payload === null || payload === undefined) return '';
	if (typeof payload === 'string') return payload;
	return payload.content || payload.text || payload.generated_text || payload.response || payload.completion || '';
}

/** Invoke the configured model bridge and normalize the returned text. */
/** Invoke the configured model bridge and normalize the returned text. */
async function invokeModel(ctx, modelId, prompt, runtimeOptions, logs) {
	const selectedModelId = modelId || ctx.defaultModelId;
	if (!selectedModelId) throw new Error('No discovered model is available.');
	if (typeof runtimeOptions.callLlm !== 'function' && typeof ctx.callLlm !== 'function') {
		throw new Error('LLM bridge is unavailable.');
	}
	const callLlm = runtimeOptions.callLlm || ctx.callLlm;
	const response = await callLlm({
		modelId: selectedModelId,
		prompt,
		max_tokens: Number(runtimeOptions.max_tokens || runtimeOptions.maxTokens || 512) || 512,
		temperature: Number(runtimeOptions.temperature || 0.2) || 0.2
	});
	const text = extractLlmText(response);
	logs.push(`Model ${selectedModelId} returned ${text.length} characters.`);
	return { modelId: selectedModelId, text };
}

/** Execute a tool component by loading its main.js entrypoint. */
/** Execute a tool component by loading its main.js entrypoint. */
async function runToolComponent(ctx, def, input, runtimeOptions, logs) {
	const mainFile = def.node.files.find((file) => /^main\.(js|mjs|cjs)$/i.test(file));
	if (!mainFile) throw new Error(`No runnable JS file found for ${def.node.id}.`);
	const run = loadRunFunction(path.join(ctx.graphRoot, def.node.path, mainFile), runtimeOptions);
	if (typeof run !== 'function') throw new Error(`Component ${def.node.id} does not export run().`);
	const args = (def.node.inputs || []).map((port) => input[port.n]);
	logs.push(`Running tool ${def.node.id} with inputs ${JSON.stringify(input)}.`);
	const value = await run(...args);
	return { output: normalizeExecutionOutput(def.node, value) };
}

/** Execute an agent component by rendering its prompt and calling the LLM. */
/** Execute an agent component by rendering its prompt and calling the LLM. */
async function runAgentComponent(ctx, def, input, runtimeOptions, logs, stack) {
	const promptPath = path.join(ctx.graphRoot, def.node.path, 'prompt.md');
	const template = exists(promptPath)
		? readText(promptPath)
		: 'You are a component agent.\n\nInput:\n{{input}}\n\nContext:\n{{context}}';

	const intermediate = {};
	const toolRefs = Array.isArray(def.doc.tool_refs) ? def.doc.tool_refs : [];
	for (const toolRef of toolRefs) {
		const toolId = String(toolRef || '').trim();
		if (!toolId) continue;
		const toolResult = await executeNode(ctx, toolId, { ...input, ...intermediate }, runtimeOptions, logs, stack);
		Object.assign(intermediate, toolResult.output);
	}

	const rendered = renderPromptTemplate(template, {
		...input,
		input,
		...intermediate,
		context: input.context || (Object.keys(intermediate).length ? JSON.stringify(intermediate, null, 2) : ''),
		raw: input.raw ?? intermediate.raw ?? ''
	});
	const llm = await invokeModel(ctx, runtimeOptions.modelId || def.doc.model_ref || def.node.meta.model_ref, rendered, runtimeOptions, logs);
	return {
		modelId: llm.modelId,
		output: normalizeExecutionOutput(def.node, llm.text)
	};
}

/** Construct child node input from upstream state and edge mappings. */
/** Construct child node input from upstream state and edge mappings. */
function buildCompositeInput(childNode, initialInput, state, resultsByNode, incomingEdges) {
	const payload = buildNodeInput(childNode, { ...state, ...initialInput });
	incomingEdges.forEach((edge) => {
		const mapping = parseEdgeMapping(edge.mapping);
		if (!mapping) return;
		const source = resultsByNode[edge.from] || state;
		const value = source?.[mapping.from];
		if (value !== undefined) payload[mapping.to] = value;
	});
	return payload;
}

/** Execute a composite workflow/subgraph node by running its children. */
/** Execute a composite workflow/subgraph node by running its children. */
async function runCompositeComponent(ctx, def, input, runtimeOptions, logs, stack) {
	const runtimeNode = ctx.graph.nodes[def.node.id] || def.node;
	const childIds = [...(runtimeNode.children || [])].filter((childId) => ctx.definitionsById.has(childId));
	const state = { ...input };
	const resultsByNode = {};
	let lastResult = null;
	let selectedModelId = null;
	const incomingMap = {};
	Object.values(ctx.graph.edges).forEach((edge) => {
		if (!childIds.includes(edge.to) || !childIds.includes(edge.from)) return;
		if (!incomingMap[edge.to]) incomingMap[edge.to] = [];
		incomingMap[edge.to].push(edge);
	});

	const pending = [...childIds];
	let guard = 0;
	while (pending.length && guard < 100) {
		guard += 1;
		let progressed = false;
		for (let index = 0; index < pending.length; index += 1) {
			const childId = pending[index];
			const childNode = ctx.graph.nodes[childId];
			if (!childNode) {
				pending.splice(index, 1);
				index -= 1;
				continue;
			}
			const incomingEdges = incomingMap[childId] || [];
			const hasPendingDependency = incomingEdges.some((edge) => !resultsByNode[edge.from]);
			if (hasPendingDependency) continue;
			const childInput = buildCompositeInput(childNode, input, state, resultsByNode, incomingEdges);
			const childResult = await executeNode(ctx, childId, childInput, runtimeOptions, logs, stack);
			resultsByNode[childId] = childResult.output;
			Object.assign(state, childResult.output);
			lastResult = childResult.output;
			if (childResult.modelId) selectedModelId = childResult.modelId;
			pending.splice(index, 1);
			index -= 1;
			progressed = true;
		}
		if (!progressed) throw new Error(`Unable to resolve execution order for ${def.node.id}.`);
	}

	const output = {};
	if (def.node.outputs?.length) {
		def.node.outputs.forEach((port) => {
			if (state[port.n] !== undefined) {
				output[port.n] = state[port.n];
				return;
			}
			output[port.n] = extractSingleValue(lastResult);
		});
	} else {
		Object.assign(output, state);
	}
	return { output, modelId: selectedModelId };
}

/** Execute a workspace node with runtime arguments, logging, and cycle detection. */
async function executeNode(ctx, nodeId, input = {}, runtimeOptions = {}, logs = [], stack = []) {
	if (stack.includes(nodeId)) {
		throw new Error(`Execution cycle detected: ${[...stack, nodeId].join(' -> ')}`);
	}
	const def = ctx.definitionsById.get(nodeId);
	if (!def) throw new Error(`Unknown component: ${nodeId}`);
	const nextStack = [...stack, nodeId];
	logs.push(`▶ ${nodeId}`);
	const startMs = Date.now();
	const inputSnippet = Object.fromEntries(
		Object.entries(input).map(([k, v]) => [k, String(v ?? '').slice(0, 80)])
	);
	let result;
	try {
		switch (def.node.type) {
			case 'tool':
				result = await runToolComponent(ctx, def, input, runtimeOptions, logs);
				break;
			case 'agent':
				result = await runAgentComponent(ctx, def, input, runtimeOptions, logs, nextStack);
				break;
			case 'model': {
				const prompt = String(input.prompt || input.query || input.topic || 'Health check');
				const llm = await invokeModel(ctx, runtimeOptions.modelId || def.node.id, prompt, runtimeOptions, logs);
				result = { modelId: llm.modelId, output: { response: llm.text } };
				break;
			}
			case 'workflow':
			case 'benchmark':
			case 'subgraph':
				result = await runCompositeComponent(ctx, def, input, runtimeOptions, logs, nextStack);
				break;
			default:
				result = { output: { ...input } };
		}
		const durationMs = Date.now() - startMs;
		const outputSnippet = Object.fromEntries(
			Object.entries(result.output || {}).map(([k, v]) => [k, String(v ?? '').slice(0, 80)])
		);
		(ctx._steps = ctx._steps || []).push({
			nodeId,
			type: def.node.type,
			label: def.node.label,
			durationMs,
			inputSnippet,
			outputSnippet,
			status: 'pass'
		});
		return result;
	} catch (err) {
		const durationMs = Date.now() - startMs;
		(ctx._steps = ctx._steps || []).push({
			nodeId,
			type: def.node.type,
			label: def.node.label,
			durationMs,
			inputSnippet,
			error: err.message,
			status: 'fail'
		});
		throw err;
	}
}

/** Assert that a runtime value matches an expected type, throwing on mismatch. */
function assertType(actual, expectedType, label) {
	switch (expectedType) {
		case 'list':
		case 'array':
			if (!Array.isArray(actual)) throw new Error(`${label} expected an array.`);
			break;
		case 'object':
			if (!actual || typeof actual !== 'object' || Array.isArray(actual)) throw new Error(`${label} expected an object.`);
			break;
		case 'string':
			if (typeof actual !== 'string') throw new Error(`${label} expected a string.`);
			break;
		case 'number':
			if (typeof actual !== 'number') throw new Error(`${label} expected a number.`);
			break;
		default:
			break;
	}
}

/** Assert that a runtime output satisfies an expected condition or schema. */
function assertExpectation(actual, expected, label) {
	if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
		if (Object.prototype.hasOwnProperty.call(expected, 'not_null')) {
			const isEmpty = actual === null || actual === undefined || actual === '';
			if (expected.not_null && isEmpty) throw new Error(`${label} should not be null.`);
			if (!expected.not_null && !isEmpty) throw new Error(`${label} should be null.`);
		}
		if (Object.prototype.hasOwnProperty.call(expected, 'contains')) {
			if (!String(actual || '').includes(String(expected.contains))) {
				throw new Error(`${label} should contain ${expected.contains}.`);
			}
		}
		if (Object.prototype.hasOwnProperty.call(expected, 'type')) {
			assertType(actual, String(expected.type).toLowerCase(), label);
		}
		if (Object.prototype.hasOwnProperty.call(expected, 'max_length')) {
			if (!actual || actual.length > Number(expected.max_length)) {
				throw new Error(`${label} length should be <= ${expected.max_length}.`);
			}
		}
		if (Object.prototype.hasOwnProperty.call(expected, 'min_length')) {
			if (!actual || actual.length < Number(expected.min_length)) {
				throw new Error(`${label} length should be >= ${expected.min_length}.`);
			}
		}
		if (Object.prototype.hasOwnProperty.call(expected, 'equals')) {
			const actualJson = JSON.stringify(actual);
			const expectedJson = JSON.stringify(expected.equals);
			if (actualJson !== expectedJson) throw new Error(`${label} should equal ${expectedJson}.`);
		}
		const nestedKeys = Object.keys(expected).filter((key) => !['not_null', 'contains', 'type', 'max_length', 'min_length', 'equals'].includes(key));
		nestedKeys.forEach((key) => {
			assertExpectation(actual ? actual[key] : undefined, expected[key], `${label}.${key}`);
		});
		return;
	}

	const actualJson = JSON.stringify(actual);
	const expectedJson = JSON.stringify(expected);
	if (actualJson !== expectedJson) {
		throw new Error(`${label} expected ${expectedJson} but got ${actualJson}.`);
	}
}

/** Create a mock LLM responder for test cases with fixed or sequenced values. */
function createMockLlmResponder(mockSpec, sequenceSpec) {
	if (Array.isArray(sequenceSpec) && sequenceSpec.length) {
		const queue = sequenceSpec.slice();
		return async () => (queue.length > 1 ? queue.shift() : queue[0]);
	}
	if (mockSpec !== undefined) return async () => mockSpec;
	return null;
}

/** Build execution runtime options from base settings and a test case override. */
function createRuntimeOptions(baseOptions, testCase) {
	const runtimeOptions = { ...baseOptions };
	if (testCase.mock_fetch) runtimeOptions.fetch = createMockFetch(testCase.mock_fetch);
	const mockLlm = createMockLlmResponder(testCase.mock_llm, testCase.mock_llm_sequence);
	if (mockLlm) runtimeOptions.callLlm = mockLlm;
	return runtimeOptions;
}

/** Discover workspace metadata and graph structure from a root directory. */
async function discoverWorkspace(rootDir) {
	return buildWorkspace(rootDir).graph;
}

/** Run a single component node in the workspace and return runtime results. */
async function runComponent(rootDir, nodeId, input = {}, runtimeOptions = {}) {
	const ctx = buildWorkspace(rootDir, runtimeOptions);
	ctx._steps = [];
	const logs = [];
	const result = await executeNode(ctx, nodeId, input, runtimeOptions, logs, []);
	const executedNodes = collectExecutedNodeMetadata(ctx, ctx._steps);
	return {
		ok: true,
		nodeId,
		modelId: result.modelId || runtimeOptions.modelId || ctx.defaultModelId || null,
		output: result.output,
		steps: ctx._steps,
		executedNodes,
		runFingerprint: buildRunFingerprint(executedNodes),
		logs,
		availableModels: ctx.graph.models,
		warnings: ctx.graph.warnings
	};
}

/** Execute paired tests for a workspace component node and report pass/fail results. */
async function runComponentTests(rootDir, nodeId, runtimeOptions = {}) {
	const ctx = buildWorkspace(rootDir, runtimeOptions);
	const def = ctx.definitionsById.get(nodeId);
	if (!def) throw new Error(`Unknown component: ${nodeId}`);

	const threshold = Number.parseFloat(def.node.meta.success_threshold || '0.80') || 0.8;
	if (!def.node.tests.length) {
		return {
			ok: false,
			total: 0,
			passed: 0,
			successRatio: 0,
			threshold,
			cases: [],
			logs: [`No paired tests found for ${nodeId}.`]
		};
	}

	const cases = [];
	const logs = [];
	let passed = 0;
	let total = 0;

	for (const testRel of def.node.tests) {
		const absPath = path.join(rootDir, def.node.path, testRel);
		if (!exists(absPath)) {
			logs.push(`Missing test file: ${def.node.path}/${testRel}`);
			continue;
		}
		const spec = parseJson(absPath);
		const scenarios = Array.isArray(spec.cases) ? spec.cases : Array.isArray(spec.steps) ? spec.steps : [];
		for (const scenario of scenarios) {
			total += 1;
			const runtime = createRuntimeOptions(runtimeOptions, scenario);
			const caseLogs = [];
			const caseCtx = { ...ctx, _steps: [] };
			try {
				const input = scenario.input && typeof scenario.input === 'object' ? scenario.input : {};
				const result = await withMockEnv(scenario.mock_env, () => executeNode(caseCtx, nodeId, input, runtime, caseLogs, []));
				const expected = scenario.expect && typeof scenario.expect === 'object' ? scenario.expect : {};
				Object.entries(expected).forEach(([key, value]) => {
					assertExpectation(result.output[key], value, key);
				});
				passed += 1;
				cases.push({
					name: String(scenario.name || `${path.basename(testRel)}:${total}`),
					passed: true,
					output: result.output,
					steps: caseCtx._steps,
					logs: caseLogs
				});
			} catch (error) {
				cases.push({
					name: String(scenario.name || `${path.basename(testRel)}:${total}`),
					passed: false,
					error: error.message,
					steps: caseCtx._steps,
					logs: caseLogs
				});
			}
		}
	}

	const successRatio = total ? passed / total : 0;
	return {
		ok: total > 0 && successRatio >= threshold,
		total,
		passed,
		successRatio,
		threshold,
		cases,
		logs
	};
}

module.exports = {
	discoverWorkspace,
	runComponent,
	runComponentTests
};
