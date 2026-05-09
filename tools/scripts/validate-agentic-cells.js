#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const repoRoot = path.resolve(__dirname, '..', '..');
const ideRoot = path.join(repoRoot, 'public', 'agentic-ide');

const SUPPORTED_CELL_TYPES = new Set(['tool', 'agent', 'subgraph', 'workflow', 'model']);
const SUPPORTED_MANIFEST_RELATION_KINDS = new Set(['unit', 'file', 'registry']);

function toPosix(p) {
  return String(p || '').replace(/\\/g, '/');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listFilesRecursive(rootDir) {
  const out = [];
  if (!fs.existsSync(rootDir)) return out;
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(abs);
      } else {
        out.push(abs);
      }
    }
  }
  return out;
}

function parseArgs(argv) {
  return {
    writeRegistry: argv.includes('--write-registry'),
    strictSchemas: argv.includes('--strict-schemas'),
  };
}

function expectedKindFromPath(relPath) {
  const p = `/${toPosix(relPath).replace(/^\/+/, '')}`;
  if (p.includes('/components/tools/')) return 'tool';
  if (p.includes('/components/agents/')) return 'agent';
  if (p.includes('/components/models/')) return 'model';
  if (p.includes('/components/subgraphs/')) return 'subgraph';
  if (p.includes('/workflows/')) return 'workflow';
  return null;
}

function normalizeType(rawType, relPath, warnings, where) {
  const t = String(rawType || '').trim().toLowerCase();
  if (SUPPORTED_CELL_TYPES.has(t)) return t;
  if (t === 'inspector' || t === 'component') {
    warnings.push(`${where}.type is '${t}', normalized to 'tool' for cell validation`);
    return 'tool';
  }
  const implied = expectedKindFromPath(relPath);
  if (implied) {
    warnings.push(`${where}.type is '${t || 'missing'}', inferred '${implied}' from folder`);
    return implied;
  }
  return t || 'tool';
}

function normalizePortArray(raw, fallbackName) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    return [{ name: fallbackName || 'output', type: String(raw.type || 'object') }];
  }
  return [];
}

function getDocInputs(doc) {
  if (Array.isArray(doc.inputs)) return doc.inputs;
  if (doc.manifest && Array.isArray(doc.manifest.inputs)) return doc.manifest.inputs;
  return [];
}

function getDocOutputs(doc) {
  if (Array.isArray(doc.outputs)) return doc.outputs;
  if (doc.manifest && doc.manifest.outputs) return normalizePortArray(doc.manifest.outputs, 'output');
  return [];
}

function getDocFiles(doc) {
  if (Array.isArray(doc.files)) return doc.files;
  const files = [];
  if (typeof doc.entryPoint === 'string' && doc.entryPoint.trim()) files.push(doc.entryPoint.trim());
  return files;
}

function getDocTests(doc) {
  if (Array.isArray(doc.tests)) return doc.tests;
  const tests = [];
  if (typeof doc.testEntry === 'string' && doc.testEntry.trim()) tests.push(doc.testEntry.trim());
  return tests;
}

function validatePortArray(kind, ports, where, errors) {
  if (!Array.isArray(ports)) return;
  ports.forEach((p, index) => {
    if (!p || typeof p !== 'object') {
      errors.push(`${where}.${kind}[${index}] must be an object`);
      return;
    }
    if (!p.name || typeof p.name !== 'string') {
      errors.push(`${where}.${kind}[${index}].name is required`);
    }
    if (!p.type || typeof p.type !== 'string') {
      errors.push(`${where}.${kind}[${index}].type is required`);
    }
  });
}

function validateContractFile(schemaPath, strictSchemas, warnings, errors) {
  if (!fs.existsSync(schemaPath)) {
    if (strictSchemas) errors.push(`${toPosix(path.relative(repoRoot, schemaPath))} is missing`);
    else warnings.push(`${toPosix(path.relative(repoRoot, schemaPath))} is missing`);
    return;
  }

  let payload;
  try {
    payload = readJson(schemaPath);
  } catch (error) {
    errors.push(`${toPosix(path.relative(repoRoot, schemaPath))} is invalid JSON: ${error.message}`);
    return;
  }

  const hasPortArrays = Array.isArray(payload.inputs) && Array.isArray(payload.outputs);
  const hasJsonSchemaDefs = Boolean(payload.definitions && payload.definitions.input && payload.definitions.output);
  const hasJsonSchemaTop = Boolean(payload.input && payload.output);

  if (!hasPortArrays && !hasJsonSchemaDefs && !hasJsonSchemaTop) {
    errors.push(`${toPosix(path.relative(repoRoot, schemaPath))} must define either inputs/outputs arrays or JSON-Schema input/output definitions`);
  }
}

function resolveModelAssetPath(doc, dir) {
  const explicitPath = typeof doc.model_asset_path === 'string' ? doc.model_asset_path.trim() : '';
  if (explicitPath) {
    return path.isAbsolute(explicitPath)
      ? explicitPath
      : path.resolve(dir, explicitPath);
  }

  if (typeof doc.model_name === 'string' && doc.model_name.trim()) {
    return path.join(dir, doc.model_name.trim());
  }

  return '';
}

function describeModelAssetPath(doc, resolvedPath, relDir) {
  if (!resolvedPath) return '';
  const explicitPath = typeof doc.model_asset_path === 'string' ? doc.model_asset_path.trim() : '';
  if (explicitPath) return explicitPath;
  return toPosix(path.join(relDir, String(doc.model_name || '').trim()));
}

function validateManifestFile(manifestPath, context, warnings, errors) {
  if (!fs.existsSync(manifestPath)) return null;

  const rel = toPosix(path.relative(ideRoot, manifestPath));
  let manifest;
  try {
    manifest = readJson(manifestPath);
  } catch (error) {
    errors.push(`${rel} invalid JSON: ${error.message}`);
    return null;
  }

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    errors.push(`${rel} must be a JSON object`);
    return null;
  }

  if (typeof manifest.$schema !== 'string' || !manifest.$schema.trim()) {
    warnings.push(`${rel}.$schema is missing`);
  }

  if (!manifest.id || typeof manifest.id !== 'string') {
    errors.push(`${rel}.id is required`);
  } else if (manifest.id !== context.id) {
    warnings.push(`${rel}.id is '${manifest.id}' but definition id is '${context.id}'`);
  }

  if (!manifest.type || typeof manifest.type !== 'string') {
    errors.push(`${rel}.type is required`);
  } else if (!SUPPORTED_CELL_TYPES.has(String(manifest.type).trim().toLowerCase())) {
    errors.push(`${rel}.type must be one of: ${[...SUPPORTED_CELL_TYPES].join(', ')}`);
  } else if (String(manifest.type).trim().toLowerCase() !== context.type) {
    warnings.push(`${rel}.type is '${manifest.type}' but definition type is '${context.type}'`);
  }

  if (!manifest.label || typeof manifest.label !== 'string') {
    errors.push(`${rel}.label is required`);
  }

  if (!manifest.path || typeof manifest.path !== 'string') {
    errors.push(`${rel}.path is required`);
  } else {
    const normalizedManifestPath = toPosix(manifest.path).replace(/^\.?\//, '');
    if (normalizedManifestPath !== context.relDir) {
      warnings.push(`${rel}.path is '${normalizedManifestPath}' but actual folder is '${context.relDir}'`);
    }
  }

  if (!manifest.description || typeof manifest.description !== 'string') {
    errors.push(`${rel}.description is required`);
  }

  if (!manifest.entry || typeof manifest.entry !== 'object' || Array.isArray(manifest.entry)) {
    errors.push(`${rel}.entry must be an object`);
  } else {
    if (!manifest.entry.file || typeof manifest.entry.file !== 'string') {
      errors.push(`${rel}.entry.file is required`);
    } else {
      const entryPath = path.join(context.dir, manifest.entry.file);
      if (!fs.existsSync(entryPath)) {
        errors.push(`${rel}.entry.file references missing file: ${toPosix(path.join(context.relDir, manifest.entry.file))}`);
      }
    }

    if (typeof manifest.entry.exports !== 'undefined') {
      if (!Array.isArray(manifest.entry.exports) || manifest.entry.exports.some((item) => typeof item !== 'string' || !item.trim())) {
        errors.push(`${rel}.entry.exports must be an array of non-empty strings`);
      }
    }
  }

  if (!manifest.api || typeof manifest.api !== 'object' || Array.isArray(manifest.api)) {
    errors.push(`${rel}.api must be an object`);
  } else {
    if (!manifest.api.contract || typeof manifest.api.contract !== 'string') {
      errors.push(`${rel}.api.contract is required`);
    } else {
      const contractPath = path.join(context.dir, manifest.api.contract);
      if (!fs.existsSync(contractPath)) {
        errors.push(`${rel}.api.contract references missing file: ${toPosix(path.join(context.relDir, manifest.api.contract))}`);
      }
    }

    if (typeof manifest.api.inputs_ref !== 'undefined' && typeof manifest.api.inputs_ref !== 'string') {
      errors.push(`${rel}.api.inputs_ref must be a string when provided`);
    }
    if (typeof manifest.api.outputs_ref !== 'undefined' && typeof manifest.api.outputs_ref !== 'string') {
      errors.push(`${rel}.api.outputs_ref must be a string when provided`);
    }
  }

  if (typeof manifest.files !== 'undefined') {
    if (!Array.isArray(manifest.files)) {
      errors.push(`${rel}.files must be an array when provided`);
    } else {
      manifest.files.forEach((fileRef, index) => {
        if (!fileRef || typeof fileRef !== 'object' || Array.isArray(fileRef)) {
          errors.push(`${rel}.files[${index}] must be an object`);
          return;
        }
        if (!fileRef.path || typeof fileRef.path !== 'string') {
          errors.push(`${rel}.files[${index}].path is required`);
          return;
        }
        if (!fileRef.role || typeof fileRef.role !== 'string') {
          errors.push(`${rel}.files[${index}].role is required`);
        }
        const filePath = path.join(context.dir, fileRef.path);
        if (!fs.existsSync(filePath)) {
          errors.push(`${rel}.files[${index}] references missing file: ${toPosix(path.join(context.relDir, fileRef.path))}`);
        }
      });
    }
  }

  if (typeof manifest.tests !== 'undefined') {
    if (!Array.isArray(manifest.tests)) {
      errors.push(`${rel}.tests must be an array when provided`);
    } else {
      manifest.tests.forEach((testRef, index) => {
        if (!testRef || typeof testRef !== 'object' || Array.isArray(testRef)) {
          errors.push(`${rel}.tests[${index}] must be an object`);
          return;
        }
        if (!testRef.file || typeof testRef.file !== 'string') {
          errors.push(`${rel}.tests[${index}].file is required`);
          return;
        }
        if (typeof testRef.kind !== 'undefined' && typeof testRef.kind !== 'string') {
          errors.push(`${rel}.tests[${index}].kind must be a string when provided`);
        }
        const testPath = path.join(context.dir, testRef.file);
        if (!fs.existsSync(testPath)) {
          errors.push(`${rel}.tests[${index}] references missing file: ${toPosix(path.join(context.relDir, testRef.file))}`);
        }
      });
    }
  }

  if (typeof manifest.relations !== 'undefined') {
    if (!Array.isArray(manifest.relations)) {
      errors.push(`${rel}.relations must be an array when provided`);
    } else {
      manifest.relations.forEach((relation, index) => {
        if (!relation || typeof relation !== 'object' || Array.isArray(relation)) {
          errors.push(`${rel}.relations[${index}] must be an object`);
          return;
        }
        if (!relation.kind || typeof relation.kind !== 'string') {
          errors.push(`${rel}.relations[${index}].kind is required`);
          return;
        }
        if (!SUPPORTED_MANIFEST_RELATION_KINDS.has(relation.kind)) {
          errors.push(`${rel}.relations[${index}].kind must be one of: ${[...SUPPORTED_MANIFEST_RELATION_KINDS].join(', ')}`);
        }
        if (!relation.path || typeof relation.path !== 'string') {
          errors.push(`${rel}.relations[${index}].path is required`);
          return;
        }
        const relationPath = path.join(ideRoot, relation.path);
        if (!fs.existsSync(relationPath)) {
          errors.push(`${rel}.relations[${index}] references missing workspace path: ${toPosix(relation.path)}`);
        }
      });
    }
  }

  return {
    file: 'manifest.json',
    entry: manifest.entry && typeof manifest.entry.file === 'string' ? manifest.entry.file : null,
    contract: manifest.api && typeof manifest.api.contract === 'string' ? manifest.api.contract : null,
    relations: Array.isArray(manifest.relations) ? manifest.relations.length : 0,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const errors = [];
  const warnings = [];

  console.log(`${colors.blue}🔬 Agentic Cell Contract Validation${colors.reset}`);
  console.log('='.repeat(64));

  const componentSchemaPath = path.join(ideRoot, 'schema', 'component.schema.json');
  const unitSchemaPath = path.join(ideRoot, 'schema', 'unit-case.schema.json');
  const manifestSchemaPath = path.join(ideRoot, 'schema', 'manifest.schema.json');
  if (!fs.existsSync(componentSchemaPath)) {
    errors.push('public/agentic-ide/schema/component.schema.json is missing');
  }
  if (!fs.existsSync(unitSchemaPath)) {
    errors.push('public/agentic-ide/schema/unit-case.schema.json is missing');
  }
  if (!fs.existsSync(manifestSchemaPath)) {
    errors.push('public/agentic-ide/schema/manifest.schema.json is missing');
  }

  const allFiles = listFilesRecursive(ideRoot);
  const defFiles = allFiles.filter((abs) => {
    const base = path.basename(abs);
    if (!(base === 'schema.json' || base === 'graph.json' || base === 'workflow.json')) return false;
    const rel = toPosix(path.relative(ideRoot, abs));
    if (rel.startsWith('components/')) {
      return rel.split('/').length >= 4;
    }
    if (rel.startsWith('workflows/')) {
      return rel.split('/').length >= 3;
    }
    return false;
  });

  const registry = {
    version: 1,
    generated_at: new Date().toISOString(),
    component_schema: 'schema/component.schema.json',
    unit_case_schema: 'schema/unit-case.schema.json',
    manifest_schema: 'schema/manifest.schema.json',
    components: {
      tools: [],
      agents: [],
      models: [],
      subgraphs: [],
      workflows: [],
    },
    units: [],
    edges: [],
  };

  const idToMeta = new Map();

  for (const defPath of defFiles) {
    const rel = toPosix(path.relative(ideRoot, defPath));
    const dir = path.dirname(defPath);
    const relDir = toPosix(path.relative(ideRoot, dir));

    let doc;
    try {
      doc = readJson(defPath);
    } catch (error) {
      errors.push(`${rel} invalid JSON: ${error.message}`);
      continue;
    }

    const where = rel;
    const expectedKind = expectedKindFromPath(rel);

    if (!doc.id || typeof doc.id !== 'string') errors.push(`${where}.id is required`);
    const normalizedType = normalizeType(doc.type, rel, warnings, where);
    if (!doc.description || typeof doc.description !== 'string') errors.push(`${where}.description is required`);

    const docInputs = getDocInputs(doc);
    const docOutputs = getDocOutputs(doc);
    const docFiles = getDocFiles(doc);
    const docTests = getDocTests(doc);
    const manifestPath = path.join(dir, 'manifest.json');

    if (docInputs.length === 0) warnings.push(`${where} has no explicit inputs[] contract`);
    if (docOutputs.length === 0) warnings.push(`${where} has no explicit outputs[] contract`);

    validatePortArray('inputs', docInputs, where, errors);
    validatePortArray('outputs', docOutputs, where, errors);

    if (expectedKind && normalizedType && normalizedType !== expectedKind) {
      warnings.push(`${where}.type is '${normalizedType}' but folder implies '${expectedKind}'`);
    }

    if (typeof doc.path === 'string') {
      const normalizedDocPath = toPosix(doc.path).replace(/^\.?\//, '');
      if (normalizedDocPath !== relDir) {
        warnings.push(`${where}.path is '${normalizedDocPath}' but actual folder is '${relDir}'`);
      }
    } else {
      warnings.push(`${where}.path is missing`);
    }

    for (const f of docFiles) {
      const abs = path.join(dir, f);
      if (!fs.existsSync(abs)) {
        warnings.push(`${where}.files references missing file: ${toPosix(path.join(relDir, f))}`);
      }
    }

    for (const t of docTests) {
      const abs = path.join(dir, t);
      if (!fs.existsSync(abs)) {
        warnings.push(`${where}.tests references missing file: ${toPosix(path.join(relDir, t))}`);
        continue;
      }
      if (!String(t).toLowerCase().endsWith('.json')) {
        continue;
      }
      try {
        const testDoc = readJson(abs);
        if (!Array.isArray(testDoc.cases) || testDoc.cases.length === 0) {
          warnings.push(`${toPosix(path.relative(ideRoot, abs))} has no cases[]`);
        }
      } catch (error) {
        errors.push(`${toPosix(path.relative(ideRoot, abs))} invalid JSON: ${error.message}`);
      }
    }

    if (normalizedType === 'model') {
      const modelAssetAbs = resolveModelAssetPath(doc, dir);
      if (!modelAssetAbs) {
        warnings.push(`${where} does not declare model_asset_path or model_name`);
      } else if (!fs.existsSync(modelAssetAbs)) {
        warnings.push(`${where} model asset missing: ${describeModelAssetPath(doc, modelAssetAbs, relDir)}`);
      }
    }

    // When the definition file IS schema.json, the port contract is already validated above.
    // For graph.json / workflow.json definitions, check for a sibling schema.json.
    const schemaPath = path.join(dir, 'schema.json');
    if (path.basename(defPath) !== 'schema.json') {
      validateContractFile(schemaPath, args.strictSchemas, warnings, errors);
    }

    const manifestMeta = validateManifestFile(manifestPath, {
      id: String(doc.id || ''),
      type: String(normalizedType || ''),
      dir,
      relDir,
    }, warnings, errors);

    const bucket = normalizedType === 'tool'
      ? 'tools'
      : normalizedType === 'agent'
        ? 'agents'
        : normalizedType === 'model'
          ? 'models'
          : normalizedType === 'subgraph'
            ? 'subgraphs'
            : normalizedType === 'workflow'
              ? 'workflows'
              : null;

    const summary = {
      id: String(doc.id || ''),
      type: String(normalizedType || ''),
      path: relDir,
      definition: path.basename(defPath),
      manifest: manifestMeta ? manifestMeta.file : null,
      entry: manifestMeta && manifestMeta.entry ? manifestMeta.entry : (typeof doc.impl === 'string' ? doc.impl : path.basename(defPath)),
      contract: manifestMeta && manifestMeta.contract ? manifestMeta.contract : (fs.existsSync(schemaPath) ? 'schema.json' : path.basename(defPath)),
      tests: docTests,
      relations: manifestMeta ? manifestMeta.relations : 0,
      schema: fs.existsSync(schemaPath) ? 'schema.json' : null,
      lifecycle: doc.lifecycle || 'draft',
      version: doc.version || 1,
    };

    if (bucket && summary.id) {
      registry.components[bucket].push(summary.id);
      idToMeta.set(summary.id, summary);
    }
    registry.units.push(summary);

    if (Array.isArray(doc.edges)) {
      for (const edge of doc.edges) {
        if (!edge || typeof edge !== 'object') continue;
        registry.edges.push({
          scope: String(doc.id || relDir),
          from: edge.from || null,
          to: edge.to || null,
          type: edge.type || 'data-flow',
          mapping: edge.mapping || null,
        });
      }
    }
  }

  Object.keys(registry.components).forEach((key) => {
    registry.components[key] = [...new Set(registry.components[key])].sort((a, b) => a.localeCompare(b));
  });
  registry.units.sort((a, b) => String(a.path || '').localeCompare(String(b.path || '')));

  if (args.writeRegistry) {
    const outPath = path.join(ideRoot, 'registry.json');
    fs.writeFileSync(outPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
    console.log(`${colors.green}✓${colors.reset} Wrote ${toPosix(path.relative(repoRoot, outPath))}`);
  }

  if (warnings.length) {
    console.log(`\n${colors.yellow}⚠ Warnings (${warnings.length})${colors.reset}`);
    warnings.forEach((w) => console.log(`  ${colors.yellow}•${colors.reset} ${w}`));
  }

  if (errors.length) {
    console.log(`\n${colors.red}❌ Errors (${errors.length})${colors.reset}`);
    errors.forEach((e) => console.log(`  ${colors.red}•${colors.reset} ${e}`));
    process.exit(1);
  }

  console.log(`\n${colors.green}✅ Cell contract validation passed${colors.reset}`);
  console.log(`  Definitions: ${defFiles.length}`);
  console.log(`  Edge contracts discovered: ${registry.edges.length}`);
}

main();
