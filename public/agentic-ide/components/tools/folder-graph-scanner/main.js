/**
 * Folder Graph Scanner
 * Scans a folder structure and extracts relations to build a code.graph.json
 * 
 * Features:
 * - Maps folder hierarchy to layer nodes with README.md descriptions
 * - Extracts task nodes from node.tasks.json files
 * - Analyzes import/dependency chains to infer data flow edges
 * - Identifies input/output/process patterns for isolated components
 * - Handles recursive subfolder discovery
 */

import fs from 'fs';
import path from 'path';

/**
 * Configuration for scanner behavior
 */
const SCANNER_CONFIG = {
  maxDepth: 5,
  includePatterns: ['.js', '.ts', '.json', '.md', '.csv'],
  excludePatterns: ['node_modules', '.git', '.next', 'dist', 'build', '.venv'],
  readmeFilenames: ['README.md', 'readme.md', 'README.txt'],
  taskFilenames: ['node.tasks.json', 'tasks.json'],
  importRegex: /(?:import|require)\s+(?:{[^}]*}|"[^"]*"|'[^']*'|`[^`]*`)/g
};

/**
 * Represents a folder layer in the graph
 */
class FolderNode {
  constructor(folderPath, parentId = null) {
    this.id = this.generateId(folderPath);
    this.type = 'layer';
    this.label = path.basename(folderPath) || 'root';
    this.path = folderPath;
    this.parent = parentId;
    this.description = '';
    this.children = [];
    this.inputs = [];
    this.outputs = [];
    this.meta = {
      lifecycle: 'discovered',
      nodeCount: 0,
      taskCount: 0,
      dependencies: []
    };
  }

  generateId(folderPath) {
    return `layer_${path.basename(folderPath).replace(/[^a-z0-9]/gi, '_')}`.toLowerCase();
  }
}

/**
 * Represents a file/component node in the graph
 */
class FileNode {
  constructor(filePath, parentLayerId) {
    this.id = this.generateId(filePath);
    this.type = this.detectType(filePath);
    this.label = path.basename(filePath);
    this.path = filePath;
    this.parent = parentLayerId;
    this.description = '';
    this.inputs = [];
    this.outputs = [];
    this.dependencies = [];
    this.exports = [];
  }

  generateId(filePath) {
    const base = path.basename(filePath, path.extname(filePath));
    const ext = path.extname(filePath).replace('.', '');
    return `file_${base}_${ext}`.toLowerCase();
  }

  detectType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath).toLowerCase();

    if (basename.includes('readme')) return 'documentation';
    if (basename.includes('task') || basename.includes('json')) return 'data';
    if (ext === '.js' || ext === '.ts') return 'code';
    if (ext === '.json') return 'config';
    if (ext === '.md') return 'documentation';
    if (ext === '.csv') return 'data';
    
    return 'file';
  }
}

/**
 * Represents an edge/relation between nodes
 */
class GraphEdge {
  constructor(sourceId, targetId, type = 'depends_on', metadata = {}) {
    this.id = `edge_${sourceId}_to_${targetId}_${Date.now()}`;
    this.source = sourceId;
    this.target = targetId;
    this.type = type;
    this.direction = 'forward'; // forward (input→process→output) or backward
    this.metadata = metadata;
  }
}

/**
 * Main scanner class
 */
export class FolderGraphScanner {
  constructor(rootPath, options = {}) {
    this.rootPath = rootPath;
    this.options = { ...SCANNER_CONFIG, ...options };
    this.nodes = {};
    this.edges = {};
    this.warnings = [];
    this.depth = 0;
  }

  /**
   * Main scanning entry point
   */
  async scan() {
    console.log(`[FolderGraphScanner] Starting scan of: ${this.rootPath}`);
    
    try {
      // Create root layer node
      const rootNode = new FolderNode(this.rootPath, null);
      this.nodes[rootNode.id] = rootNode;

      // Recursively scan folders
      await this.scanFolder(this.rootPath, rootNode.id, 0);

      // Analyze dependencies and build edges
      await this.analyzeDependencies();

      console.log(`[FolderGraphScanner] Scan complete: ${Object.keys(this.nodes).length} nodes, ${Object.keys(this.edges).length} edges`);

      return {
        nodes: this.nodes,
        edges: this.edges,
        warnings: this.warnings,
        metadata: {
          scanDate: new Date().toISOString(),
          rootPath: this.rootPath,
          nodeCount: Object.keys(this.nodes).length,
          edgeCount: Object.keys(this.edges).length
        }
      };
    } catch (error) {
      console.error('[FolderGraphScanner] Error during scan:', error);
      this.warnings.push(`Scan error: ${error.message}`);
      return null;
    }
  }

  /**
   * Recursively scan a folder and its contents
   */
  async scanFolder(folderPath, parentLayerId, currentDepth) {
    if (currentDepth > this.options.maxDepth) {
      this.warnings.push(`Max depth reached at: ${folderPath}`);
      return;
    }

    try {
      const entries = fs.readdirSync(folderPath, { withFileTypes: true });

      for (const entry of entries) {
        // Check if should exclude
        if (this.options.excludePatterns.some(p => entry.name.includes(p))) {
          continue;
        }

        const fullPath = path.join(folderPath, entry.name);

        if (entry.isDirectory()) {
          // Create layer node for subfolder
          const layerNode = new FolderNode(fullPath, parentLayerId);
          this.nodes[layerNode.id] = layerNode;

          // Create edge from parent to this layer
          const edge = new GraphEdge(parentLayerId, layerNode.id, 'contains', {
            relationship: 'layer_hierarchy',
            description: `${path.basename(folderPath)} contains ${entry.name}`
          });
          this.edges[edge.id] = edge;

          // Recursively scan subfolder
          await this.scanFolder(fullPath, layerNode.id, currentDepth + 1);
        } else {
          // Process file
          await this.scanFile(fullPath, parentLayerId);
        }
      }
    } catch (error) {
      this.warnings.push(`Error scanning folder ${folderPath}: ${error.message}`);
    }
  }

  /**
   * Process a single file
   */
  async scanFile(filePath, parentLayerId) {
    try {
      const basename = path.basename(filePath).toLowerCase();

      // Extract README as layer description
      if (this.options.readmeFilenames.some(name => basename === name.toLowerCase())) {
        await this.processReadme(filePath, parentLayerId);
        return;
      }

      // Extract tasks from node.tasks.json
      if (this.options.taskFilenames.some(name => basename === name.toLowerCase())) {
        await this.processTasks(filePath, parentLayerId);
        return;
      }

      // Process general code files
      if (this.options.includePatterns.some(ext => filePath.endsWith(ext))) {
        const fileNode = new FileNode(filePath, parentLayerId);
        this.nodes[fileNode.id] = fileNode;

        // If it's a code file, analyze dependencies
        if (fileNode.type === 'code') {
          await this.analyzeFile(filePath, fileNode.id);
        }

        // Create edge from layer to file
        const edge = new GraphEdge(parentLayerId, fileNode.id, 'contains', {
          relationship: 'file_in_layer',
          fileType: fileNode.type
        });
        this.edges[edge.id] = edge;
      }
    } catch (error) {
      this.warnings.push(`Error processing file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Extract README as layer description
   */
  async processReadme(filePath, parentLayerId) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const layer = this.nodes[parentLayerId];
      if (layer) {
        // Extract first paragraph as description
        const match = content.match(/^[^\n]+\n(.*?)(?:\n#|\n\n|$)/s);
        layer.description = match ? match[1].trim() : content.substring(0, 200);
        layer.meta.hasReadme = true;
      }
    } catch (error) {
      this.warnings.push(`Error reading README ${filePath}: ${error.message}`);
    }
  }

  /**
   * Extract tasks from node.tasks.json
   */
  async processTasks(filePath, parentLayerId) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const tasksData = JSON.parse(content);
      const layer = this.nodes[parentLayerId];

      if (layer && tasksData.tasks) {
        tasksData.tasks.forEach(task => {
          const taskNode = {
            id: `task_${task.task_id || task.id || 'unknown'}`,
            type: 'task',
            label: task.task_name || task.name || 'unknown',
            parent: parentLayerId,
            description: task.description || '',
            status: task.status || 'pending'
          };
          this.nodes[taskNode.id] = taskNode;

          // Create edge from layer to task
          const edge = new GraphEdge(parentLayerId, taskNode.id, 'contains', {
            relationship: 'task_in_layer',
            taskId: task.task_id || task.id
          });
          this.edges[edge.id] = edge;
        });
        layer.meta.taskCount = (tasksData.tasks || []).length;
        layer.meta.hasTasks = true;
      }
    } catch (error) {
      this.warnings.push(`Error processing tasks ${filePath}: ${error.message}`);
    }
  }

  /**
   * Analyze imports and dependencies in a code file
   */
  async analyzeFile(filePath, fileNodeId) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileNode = this.nodes[fileNodeId];

      if (!fileNode) return;

      // Extract imports/requires
      const matches = content.match(SCANNER_CONFIG.importRegex) || [];
      const dependencies = [];

      for (const match of matches) {
        // Extract module name/path
        const moduleMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (moduleMatch) {
          dependencies.push(moduleMatch[1]);
        }
      }

      fileNode.dependencies = [...new Set(dependencies)]; // deduplicate

      // Identify exports
      const exportMatches = content.match(/export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g) || [];
      fileNode.exports = exportMatches.map(match => match.replace(/export\s+default\s+|export\s+(?:function|class|const|let|var)\s+/g, ''));

      // Infer inputs/outputs
      this.inferIOPatterns(fileNode);
    } catch (error) {
      this.warnings.push(`Error analyzing file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Infer input/output patterns from file structure
   */
  inferIOPatterns(fileNode) {
    const hasParams = /function|class/.test(fileNode.label);
    const isUtility = fileNode.label.includes('util') || fileNode.label.includes('helper');
    const isConfig = fileNode.label.includes('config') || fileNode.type === 'config';

    if (isConfig) {
      fileNode.type = 'process_config';
      fileNode.inputs = ['configuration'];
      fileNode.outputs = ['settings'];
    } else if (isUtility) {
      fileNode.type = 'process_function';
      fileNode.inputs = ['data', 'parameters'];
      fileNode.outputs = ['result', 'processed_data'];
    } else if (hasParams) {
      fileNode.type = 'process_module';
      fileNode.inputs = ['input_data', 'context'];
      fileNode.outputs = ['output_data', 'state'];
    }
  }

  /**
   * Analyze dependencies between files and create edges
   */
  async analyzeDependencies() {
    for (const [nodeId, node] of Object.entries(this.nodes)) {
      if (node.type !== 'code' && node.type !== 'process_function' && node.type !== 'process_module') {
        continue;
      }

      // Find dependencies within our scanned nodes
      for (const dep of node.dependencies) {
        // Try to find a matching node
        for (const [targetId, targetNode] of Object.entries(this.nodes)) {
          if (targetNode.type === 'code' || targetNode.type === 'process_function' || targetNode.type === 'process_module') {
            if (dep.includes(path.basename(targetNode.path, path.extname(targetNode.path)))) {
              const edge = new GraphEdge(nodeId, targetId, 'depends_on', {
                relationship: 'import_dependency',
                dependencyPath: dep,
                direction: 'input'
              });
              this.edges[edge.id] = edge;
              break;
            }
          }
        }
      }
    }
  }

  /**
   * Export as code.graph.json format
   */
  toCodeGraph() {
    const edges = {};
    for (const [id, edge] of Object.entries(this.edges)) {
      edges[id] = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        direction: edge.metadata?.direction || 'forward',
        metadata: edge.metadata
      };
    }

    return {
      rootId: Object.values(this.nodes).find(n => n.type === 'layer' && !n.parent)?.id || 'root',
      nodes: Object.fromEntries(
        Object.entries(this.nodes).map(([id, node]) => [
          id,
          {
            id: node.id,
            type: node.type,
            label: node.label,
            path: node.path,
            parent: node.parent,
            description: node.description,
            inputs: node.inputs || [],
            outputs: node.outputs || [],
            children: node.children || [],
            edgeIds: Object.values(edges)
              .filter(e => e.source === node.id || e.target === node.id)
              .map(e => e.id),
            meta: node.meta || {}
          }
        ])
      ),
      edges: edges,
      metadata: {
        scanDate: new Date().toISOString(),
        scannerVersion: '1.0',
        warnings: this.warnings
      }
    };
  }
}

/**
 * Helper function to scan a folder and return code.graph.json
 */
export async function scanFolderToGraph(folderPath, options = {}) {
  const scanner = new FolderGraphScanner(folderPath, options);
  await scanner.scan();
  return scanner.toCodeGraph();
}

// CLI support for Node.js
if (typeof process !== 'undefined' && process.argv) {
  const folderPath = process.argv[2] || process.cwd();
  const scanner = new FolderGraphScanner(folderPath);
  scanner.scan().then(() => {
    const codeGraph = scanner.toCodeGraph();
    console.log(JSON.stringify(codeGraph, null, 2));
  });
}
