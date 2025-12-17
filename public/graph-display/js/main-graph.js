/**
 * Main script for initializing and managing the Curriculum Graph.
 * Imports data, CV generator, walkthrough, utilities.
 * Uses CSS classes for color and manages accessibility.
 * UPDATED: Touch interaction mirrors desktop click behavior (persistent highlighting/state).
 */

// Assuming graph-data.js, cv-generator.js, walkthrough.js are in the same 'js' directory
import { initTemplates, getAvailableTemplates, getDefaultTemplateId, loadTemplate } from './graph-data.js';
import { generateClassicCV } from './cv-generator.js';
import Walkthrough from './walkthrough.js';
import { resolveStepsForTemplate } from './shared/tours.js';
// Assuming utils.js is in the same 'js' directory
import { debounce, generateColorTones, getContrastingTextColorClass } from './utils.js';
import { getForceLinkDistance, getForceLinkStrength } from './shared/link-types.js';

// --- CONFIGURATION ---
const config = {
    nodeSizes: { main: 30, sub: 18 },
    // Template modes
    colorMode: 'layer', // 'layer' | 'priority'
    sizeMode: 'fixed',  // 'fixed' | 'hours'
    priorityColorsHex: {
        Critical: '#d62728',
        High: '#ff7f0e',
        Medium: '#1f77b4',
        Low: '#2ca02c'
    },
    taskSizing: {
        minHours: 2,
        maxHours: 40,
        minRadius: 16,
        maxRadius: 44
    },
    forces: {
        linkDistance: 80,
        linkDistanceSubcategory: 60,
        linkDistanceLayer: 120,
        charge: -700,
        chargeMobileMultiplier: 1.2, // Adjusted multiplier for mobile
        collidePadding: 12,
        layerStrengthY: 0.95, // Strong vertical layering force
        layoutStrengthX: 0.2, // Weaker horizontal positioning force
    },
    animation: {
        duration: 600, // Standard animation duration
        focusDelay: 100, // Delay before focus highlight animation
        focusScale: 1.5, // Zoom scale when focusing on a node
        highlightDuration: 2500, // How long focus/search highlight lasts
    },
    layout: {
        horizontalPadding: 80, // Padding on left/right edges
        verticalPadding: 50, // Padding on top/bottom edges
        boundaryPadding: 10, // Padding for node collision with boundaries
    },
    tooltip: {
        offsetX: 15,
        offsetY: -20,
        fadeInDuration: 150,
        fadeOutDuration: 100,
    },
    popup: {
        closeDelay: 300, // Delay matching CSS transition for hiding popups
    },
    simulation: {
        alphaThreshold: 0.01, // Alpha below which simulation is considered stable
    },
    mobileBreakpoint: 768, // Switches to mobile layout adjustments
    // Define BASE layer colors as HEX strings (needed for JS contrast calcs)
    // MUST match the --layerX-base variables in styles.css
    baseLayerColorsHex: {
        0: '#b07aa1', // Profile Purple
        1: '#4e79a7', // Foundations Blue
        2: '#f28e2c', // Skills Orange
        3: '#59a14f', // Impact Green
        4: '#9c65ab'  // Outcome Purple (different from profile)
    },
    // Fallback color if anything goes wrong (MUST match --fallback-color in styles.css)
    fallbackColorHex: '#aabbc8',
    // Configuration for JS tone generation (used for contrast calcs)
    toneGeneration: {
        step: 0.7, // How much brighter each step is
        direction: 'brighter' // 'brighter' or 'darker'
    },
    // Text colors (MUST match --color-text-light/dark in styles.css for contrast checking)
    textColorsHex: {
        light: '#f0f0f0',
        dark: '#333333'
    },
    // Max number of color variants per layer supported by the CSS
    // (e.g., if CSS has .color-variant-0 to .color-variant-4, this should be 5)
    maxColorVariants: 5
    // REMOVED touchHoverDuration
};

const TEMPLATE_STORAGE_KEY = 'careerGraphTemplateId';

function isEmbeddedMode() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('embed') === '1';
    } catch {
        return false;
    }
}

function getInitialTemplateId() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get('template');
    if (fromUrl) return fromUrl;

    const fromStorage = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (fromStorage) return fromStorage;

    return getDefaultTemplateId();
}

function setSelectedTemplateId(templateId) {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, templateId);
}


// --- MAIN GRAPH CLASS ---
class CurriculumGraph {
    constructor(elId, graphData, detailsData, cfg, templateContext = {}) {
        this.container = document.getElementById(elId);
        if (!this.container) throw new Error(`Graph container #${elId} not found.`);
        if (!graphData?.nodes?.length || !graphData.links) throw new Error("Invalid graph data provided.");
        if (!detailsData || typeof detailsData !== 'object') throw new Error("Node details data missing or invalid.");

        // Deep merge user config with defaults
        this.config = this.deepMerge(config, cfg || {});

        // Store data and create node map
        this.data = graphData;
        this.details = detailsData;
        this.nodeMap = new Map(this.data.nodes.map(n => [n.id, n]));

        // Template context (controls focus buttons, legend, etc.)
        this.template = templateContext.template || null;
        this.profileNodeId = templateContext.profileNodeId || 'profile';
        this.coreNodeId = templateContext.coreNodeId || 'core-expertise';
        this.legendMode = templateContext.legendMode || 'career';

        // Initial dimensions and state
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isMobile = this.width < this.config.mobileBreakpoint;
        this.maxLayer = 0; // Calculated in preprocessData
        this.numBands = 0; // Calculated in preprocessData
        this.parentTargetX = {};
        this.isStable = false;
        this.onStableCallbacks = [];
        this.menuOpenedManually = false; // Track if user explicitly opened menu

        // D3 selections and simulation placeholder
        this.svg = null; this.g = null; this.link = null; this.node = null;
        this.tooltip = null; this.zoom = null; this.simulation = null;
        this.linkedByIndex = {}; // For hover highlighting

        // Interaction state tracking
        this.currentlyInteractedNodeId = null; // Tracks node under *temporary* hover/focus
        // REMOVED touchInteractionActive and touchNodeId
        this.stepActionTimeout = null; // For walkthrough delayed actions
        this.lastFocusedElementBeforePopup = null; // For accessibility focus management

        // Pre-process data (crucial: assigns color variant indices, text classes)
        this.preprocessData();

        // Initialize graph on next animation frame
        requestAnimationFrame(() => this.init());
    }

    // Helper for deep merging configuration objects recursively
    deepMerge(target, source) {
        const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);
        let output = { ...target };
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

     /**
      * Pre-processes nodes and links:
      * 1. Builds connection index (`linkedByIndex`).
      * 2. Validates nodes, calculates max layer, num bands.
      * 3. Assigns color variant index (`colorVariantIndex`), calculated hex (`calculatedHex`),
      *    and contrast-based text class (`textColorClass`) to each node.
      * 4. Sets up parent references (`parentRef`).
      */
     preprocessData() {
        console.log("Preprocessing data, assigning color variants/classes...");

        // --- 1. Build linkedByIndex for hover interactions ---
        this.linkedByIndex = {};
        this.data.links.forEach(d => {
            const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
            const targetId = typeof d.target === 'object' ? d.target.id : d.target;
            if (sourceId && targetId) {
                 this.linkedByIndex[`${sourceId},${targetId}`] = true;
                 this.linkedByIndex[`${targetId},${sourceId}`] = true; // Undirected check
            }
        });

        // --- 2. Initial Node Enrichment & Validation ---
        let currentMaxLayer = 0;
        this.data.nodes.forEach(n => {
            if (!n || !n.id) { console.warn("Skipping invalid node:", n); return; }
            n.layer = typeof n.layer === 'number' ? n.layer : 0;
            currentMaxLayer = Math.max(currentMaxLayer, n.layer);
            n.colorVariantIndex = 0;
            n.calculatedHex = this.config.fallbackColorHex;
            n.textColorClass = 'text-dark';
            n.fillHex = null;
            n.nodeRadius = null;
            n.parentRef = null;
            if (!this.details[n.id]) {
                console.warn(`Details missing for node ID: ${n.id}. Using label.`);
                this.details[n.id] = { title: n.label || n.id || 'Unknown', items: ['No details.'] };
            }
        });
        this.maxLayer = currentMaxLayer;
        this.numBands = (this.maxLayer + 1) * 2;

        // --- 3. Assign colors (layer mode or priority mode) ---
        const computeHoursRadius = (estimatedHours) => {
            const h = Number(estimatedHours);
            if (!Number.isFinite(h) || h <= 0) return null;
            const minH = Number(this.config.taskSizing?.minHours ?? 2);
            const maxH = Number(this.config.taskSizing?.maxHours ?? 40);
            const minR = Number(this.config.taskSizing?.minRadius ?? 16);
            const maxR = Number(this.config.taskSizing?.maxRadius ?? 44);
            const clamped = Math.max(minH, Math.min(maxH, h));
            const t = (clamped - minH) / Math.max(1e-6, (maxH - minH));
            const eased = Math.sqrt(t);
            return minR + (maxR - minR) * eased;
        };

        if (this.config.colorMode === 'layer') {
            for (let layer = 0; layer <= this.maxLayer; layer++) {
                const parentNodesInLayer = this.data.nodes
                    .filter(n => n.layer === layer && n.type === 'parent')
                    .sort((a, b) => (a.id || '').localeCompare(b.id || ''));
                const baseHex = this.config.baseLayerColorsHex[layer] || this.config.fallbackColorHex;
                const numParents = parentNodesInLayer.length;

                if (numParents > 0) {
                    const tonesNeeded = Math.min(numParents, this.config.maxColorVariants);
                    const tones = generateColorTones(baseHex, tonesNeeded, this.config.toneGeneration.step, this.config.toneGeneration.direction, this.config.fallbackColorHex);
                    parentNodesInLayer.forEach((parentNode, index) => {
                        const variantIndex = index % this.config.maxColorVariants;
                        parentNode.colorVariantIndex = variantIndex;
                        parentNode.calculatedHex = tones[variantIndex] || tones[tones.length - 1] || this.config.fallbackColorHex;
                        parentNode.textColorClass = getContrastingTextColorClass(parentNode.calculatedHex, this.config.textColorsHex.light, this.config.textColorsHex.dark);
                    });
                }
            }
        } else if (this.config.colorMode === 'priority') {
            this.data.nodes.forEach(node => {
                const priority = String(node.priority || '').trim();
                const color = this.config.priorityColorsHex?.[priority] || this.config.fallbackColorHex;
                node.fillHex = color;
                node.calculatedHex = color;
                node.colorVariantIndex = 0;
                node.textColorClass = getContrastingTextColorClass(color, this.config.textColorsHex.light, this.config.textColorsHex.dark);

                if (this.config.sizeMode === 'hours') {
                    const r = computeHoursRadius(node.estimatedHours);
                    if (typeof r === 'number' && Number.isFinite(r)) node.nodeRadius = r;
                }
            });
        }

        // --- 4. Set Parent Refs & Inherit Properties for CHILD nodes ---
        this.data.nodes.forEach(node => {
            if (node.type === 'child' && node.parentId && !node.parentRef) {
                node.parentRef = this.nodeMap.get(node.parentId);
                 if (!node.parentRef) console.warn(`Parent node ID '${node.parentId}' not found for child node '${node.id}'.`);
            }
            if (node.type === 'child') {
                if (node.parentRef) {
                    node.colorVariantIndex = node.parentRef.colorVariantIndex; // Inherit EXACT variant index
                    node.calculatedHex = node.parentRef.calculatedHex;       // Inherit EXACT hex color
                    node.textColorClass = getContrastingTextColorClass(node.calculatedHex, this.config.textColorsHex.light, this.config.textColorsHex.dark);

                    // In priority mode, children inherit the parent's rendered color/size
                    if (this.config.colorMode === 'priority' && node.parentRef.fillHex) {
                        node.fillHex = node.parentRef.fillHex;
                        node.calculatedHex = node.parentRef.fillHex;
                        node.textColorClass = getContrastingTextColorClass(node.calculatedHex, this.config.textColorsHex.light, this.config.textColorsHex.dark);
                    }
                    if (this.config.sizeMode === 'hours' && node.parentRef.nodeRadius) {
                        node.nodeRadius = node.parentRef.nodeRadius;
                    }
                } else {
                    console.warn(`Child node ${node.id} missing parentRef. Using fallback color/class.`);
                    node.colorVariantIndex = 0;
                    node.calculatedHex = this.config.fallbackColorHex;
                    node.textColorClass = 'text-dark';
                }
            } else if (node.type === 'parent' && node.calculatedHex === this.config.fallbackColorHex) {
                 if (!this.config.baseLayerColorsHex[node.layer]) {
                     console.warn(`Parent node ${node.id} (Layer ${node.layer}) missed color processing AND base color missing. Using global fallback.`);
                 } else {
                     console.warn(`Parent node ${node.id} (Layer ${node.layer}) missed color processing. Using base color/fallback.`);
                     node.colorVariantIndex = 0;
                     node.calculatedHex = this.config.baseLayerColorsHex[node.layer];
                     node.textColorClass = getContrastingTextColorClass(node.calculatedHex, this.config.textColorsHex.light, this.config.textColorsHex.dark);
                 }
            }
        });

        console.log("Data preprocessing with color variants/classes complete.");
    }


    /** Initialize the graph visualization */
    init() {
        try {
            console.log("Graph Initializing...");
            this.setProfileButtonImage();
            this.calculateParentTargetX();
            this.createSvg();
            this.initializeForces();
            this.createVisualElements(); // Creates elements, CSS handles initial text visibility
            this.setupZoom();
            this.setupTooltip();
            this.setupMenuAndLegend();
            this.bindGlobalEvents();

            if (this.simulation) {
                this.simulation.alpha(1).restart();
            } else {
                console.error("Simulation failed to initialize.");
                this.renderError("Simulation failed.");
            }
            console.log("Graph Initialization Complete.");

        } catch (err) {
            console.error("Critical error during init():", err);
            this.renderError(`Error initializing graph: ${err.message}`);
        }
    }

    /** Renders an error message in the container */
    renderError(message) {
        if (this.container) {
             this.container.innerHTML = `<p style='color: red; padding: 20px; text-align: center;'>${message}</p>`;
        }
    }

    /** Add callback function to execute when simulation becomes stable */
    onStable(callback) {
        if (typeof callback !== 'function') return;
        if (this.isStable) {
            try { callback(); } catch (e) { console.error("Error in immediate onStable callback:", e); }
        } else {
            this.onStableCallbacks.push(callback);
        }
    }

    /** Checks simulation alpha and triggers stability callbacks if below threshold */
    checkAndNotifyStable() {
        if (this.isStable || !this.simulation) return;
        if (this.simulation.alpha() < this.config.simulation.alphaThreshold) {
            console.log(`Simulation stable (alpha: ${this.simulation.alpha().toFixed(4)})`);
            this.isStable = true;
            // Text visibility handled by CSS, no JS call needed here
            this.onStableCallbacks.forEach(cb => { try { cb(); } catch (e) { console.error("Error in onStable callback:", e); } });
            this.onStableCallbacks = []; // Clear callbacks after execution
        }
    }

    /** Set profile button image and ARIA attributes */
    setProfileButtonImage() {
        const imgEl = document.getElementById('profile-button-img');
        const profileBtn = document.getElementById('profile-legend-button');
        const profileDetails = this.details[this.profileNodeId];

        if (profileBtn) {
            profileBtn.setAttribute('aria-label', 'Open Menu');
            profileBtn.setAttribute('aria-haspopup', 'true');
            profileBtn.setAttribute('aria-controls', 'menu-panel');
            profileBtn.setAttribute('aria-expanded', 'false');
        }
        if (imgEl && profileDetails?.photoUrl) {
            imgEl.src = profileDetails.photoUrl;
            imgEl.alt = "Profile - Open Menu";
        } else if (imgEl) {
            console.warn(`Profile details or photoUrl missing for ID '${this.profileNodeId}'. Using placeholder styling.`);
            imgEl.alt = "Profile - Open Menu";
            // Optionally add a background or style the button itself as a fallback
            // imgEl.style.display = 'none';
            // profileBtn.style.backgroundColor = '#ccc'; // Example fallback
        }
    }

    /** Calculate target X positions for parent nodes in each layer */
    calculateParentTargetX() {
        const layers = Array.from({ length: this.maxLayer + 1 }, (_, i) => i);
        const hPad = this.config.layout.horizontalPadding;
        const availableWidth = this.width - 2 * hPad;
        this.parentTargetX = {};

        layers.forEach(layerIdx => {
            const parentsInLayer = this.data.nodes.filter(n => n.layer === layerIdx && n.type === 'parent')
                                          .sort((a, b) => (a.id || '').localeCompare(b.id || ''));
            const numParents = parentsInLayer.length;
            if (numParents === 0) return;

            if (layerIdx === 0 && numParents === 1 && parentsInLayer[0]?.id) {
                // Center the single Layer 0 node
                this.parentTargetX[parentsInLayer[0].id] = this.width / 2;
            } else {
                // Distribute other parent nodes horizontally
                const spacing = availableWidth / Math.max(1, numParents);
                parentsInLayer.forEach((node, idx) => {
                    if (node?.id) {
                        // Position in the middle of the allocated space
                        this.parentTargetX[node.id] = hPad + (idx * spacing) + (spacing / 2);
                    }
                });
            }
        });
    }

    /** Calculate target Y position based on layer and node type */
    getBandY(d) {
        if (typeof d?.layer !== 'number') return this.height / 2; // Default if layer invalid
        const vPad = this.config.layout.verticalPadding;
        const usableHeight = this.height - 2 * vPad;
        if (this.numBands <= 0 || usableHeight <= 0) return this.height / 2; // Avoid division by zero

        const bandHeight = usableHeight / this.numBands;
        // Position parents slightly above center of their double-band, children slightly below
        let bandIndex = (d.type === 'parent') ? (d.layer * 2) + 0.8 : (d.layer * 2) + 1.2;
        // Clamp index to prevent going out of bounds (important for usableHeight calculations)
        bandIndex = Math.max(0.5, Math.min(bandIndex, this.numBands - 0.5));

        return vPad + (bandIndex * bandHeight);
    }

    /** Calculate target X position (parent X or inherited parent X) */
    getNodeTargetX(d) {
        // Use pre-calculated target X for parents
        if (d.type === 'parent' && d.id && this.parentTargetX[d.id] !== undefined) {
            return this.parentTargetX[d.id];
        }
        // Use parent's target X for children
        if (d.type === 'child' && d.parentRef?.id && this.parentTargetX[d.parentRef.id] !== undefined) {
            return this.parentTargetX[d.parentRef.id];
        }
        // Default to center if no parent/target found (fallback)
        return this.width / 2;
    }

    /** Create SVG container and main group element */
    createSvg() {
        if (!this.container) return;
        d3.select(this.container).select("svg").remove(); // Clear previous SVG if any
        this.svg = d3.select(this.container).append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", `0 0 ${this.width} ${this.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("role", "img")
            .attr("aria-label", "Interactive curriculum graph");

        // Add defs section (e.g., for markers, gradients - not used currently)
        this.svg.append("defs");

        // Main group for zoom/pan
        this.g = this.svg.append("g");
        if (!this.svg || !this.g) throw new Error("Failed to create SVG elements.");
    }

    /** Check if two nodes are connected by a link */
    isConnected(a, b) {
        if (!a?.id || !b?.id) return false;
        const aId = typeof a === 'object' ? a.id : a;
        const bId = typeof b === 'object' ? b.id : b;
        // Check connection using the pre-built index
        return this.linkedByIndex[`${aId},${bId}`] || this.linkedByIndex[`${bId},${aId}`] || aId === bId;
    }

    /** Initialize D3 force simulation */
    initializeForces() {
        if (!this.data?.nodes) { console.error("No nodes data for forces."); return; }

        this.simulation = d3.forceSimulation(this.data.nodes)
            // Link force: Pulls connected nodes together
            .force("link", d3.forceLink(this.data.links)
                .id(d => d.id) // Identify nodes by ID
                .distance(d => getForceLinkDistance(d?.type, this.config.forces))
                .strength(d => getForceLinkStrength(d?.type))
            )
            // Charge force: Repels nodes from each other
            .force("charge", d3.forceManyBody()
                .strength(d => // Adjust repulsion (parents slightly more, mobile effect)
                    (d.type === "parent" ? this.config.forces.charge * 1.1 : this.config.forces.charge)
                    * (this.isMobile ? this.config.forces.chargeMobileMultiplier : 1))
            )
            // Y positioning force: Pulls nodes towards their target vertical band
            .force("y", d3.forceY()
                .strength(this.config.forces.layerStrengthY) // Strong vertical pull
                .y(d => this.getBandY(d)) // Target Y based on layer/type
            )
            // X positioning force: Pulls nodes towards their target horizontal position
            .force("x", d3.forceX()
                .strength(this.config.forces.layoutStrengthX) // Weaker horizontal pull
                .x(d => this.getNodeTargetX(d)) // Target X based on parent position
            )
            // Collision force: Prevents nodes from overlapping
            .force("collision", d3.forceCollide()
                .radius(d => this.getNodeRadius(d) + this.config.forces.collidePadding) // Radius based on node size + padding
                .strength(0.8) // Strength of collision avoidance
            )
            // Tick event: Update positions on each simulation step
            .on("tick", () => this.ticked())
            // End event: Triggered when simulation cools down
            .on("end", () => {
                console.log("Simulation ended (cooled down).");
                this.checkAndNotifyStable(); // Check stability and run callbacks
            });
    }

    /** Get node radius based on type */
    getNodeRadius(d) {
        if (typeof d?.nodeRadius === 'number' && Number.isFinite(d.nodeRadius)) {
            return d.nodeRadius;
        }
        return d.type === "parent" ? this.config.nodeSizes.main : this.config.nodeSizes.sub;
    }

    /** Create SVG elements (links, nodes, circles, text) using CSS classes for color */
    createVisualElements() {
        if (!this.g || !this.data?.links || !this.data?.nodes) { console.error("Cannot create visuals: G or data missing."); return; }

        // Create links first (rendered below nodes)
        this.link = this.g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(this.data.links, d => {
                // D3 mutates link.source/target from IDs -> node objects.
                // During initial render they can still be string/ID values.
                const sourceId = (d && typeof d.source === 'object') ? d.source.id : d?.source;
                const targetId = (d && typeof d.target === 'object') ? d.target.id : d?.target;
                return `${sourceId}-${targetId}`;
            }) // Key function for object constancy
            .join("line")
            .attr("class", "link") // Base link class
            .attr("data-type", d => d.type); // Store link type for styling

        // Create node groups (g elements)
        this.node = this.g.append("g")
            .attr("class", "nodes")
            .selectAll(".node")
            .data(this.data.nodes, d => d.id) // Key function for object constancy
            .join("g")
             // Apply multiple classes for styling: base, type, layer, color variant
            .attr("class", d => `node node-type-${d.type} node-layer-${d.layer} layer-${d.layer} color-variant-${d.colorVariantIndex}`)
            .attr("data-id", d => d.id) // Store ID for selection
            .attr("tabindex", "0") // Make focusable
            .attr("role", "button") // Semantics for accessibility
            .attr("aria-label", d => `${d.label || d.id}. Press Enter or Tap for details.`) // Accessibility label (updated)
            // Drag handler attached later in setupNodeInteractions after rebinding start event

        // Append circles to node groups
        this.node.append("circle")
            .attr("r", d => this.getNodeRadius(d))
            .attr("fill", d => d.fillHex || null);
            // Fill color is handled by CSS rules unless fillHex is provided

        // Append text labels to node groups
        this.node.append("text")
            .attr("class", d => d.textColorClass) // Apply text-light or text-dark based on preprocessed data
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .text(d => d.label || d.id || ''); // Use label, fallback to ID
            // Display (visibility) is handled by CSS rules (defaults + interaction classes)

        // Append title elements for native browser tooltips (optional, simple fallback)
        this.node.append("title")
            .text(d => d.label || d.id || '');

        // Setup interaction listeners AFTER elements are created
        this.setupNodeInteractions();
    }


    /**
     * [REMOVED/SIMPLIFIED] Apply text visibility rules.
     * Now primarily handled by CSS defaults and interaction classes.
     */
     applyTextVisibilityRules() {
         // console.log("applyTextVisibilityRules - Now mostly handled by CSS");
         // CSS handles default visibility (parents shown, children hidden)
         // and interaction visibility (.is-interacted, .is-neighbor, :focus, etc.).
         // No dynamic JS adjustments needed here anymore based on zoom/size.
     }

    // --- Helper to get node and neighbors ---
    getNodeAndNeighbors = (nodeData) => {
        if (!nodeData) return { targetNode: null, neighborsSelection: null, neighborIds: new Set(), connectedLinks: new Set() };
        const targetNode = this.node?.filter(n => n.id === nodeData.id); // D3 selection of the target node
        const neighborIds = new Set(); // Set to store IDs of neighbors
        const connectedLinks = new Set(); // Set to store link objects connected to the node
        this.data.links.forEach(l => {
            const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
            const targetId = typeof l.target === 'object' ? l.target.id : l.target;
            let isLinked = false;
            if (sourceId === nodeData.id && targetId) { neighborIds.add(targetId); isLinked = true; }
            if (targetId === nodeData.id && sourceId) { neighborIds.add(sourceId); isLinked = true; }
            if (isLinked) connectedLinks.add(l);
        });
        const neighborsSelection = this.node?.filter(n => neighborIds.has(n.id));
        return { targetNode, neighborsSelection, neighborIds, connectedLinks };
    };

    // --- Helper to remove *temporary* interaction classes ---
    removeInteractionClasses = (nodeData) => {
         if (!nodeData || !this.node) return;
        const { targetNode, neighborsSelection } = this.getNodeAndNeighbors(nodeData);

        // Only remove temporary hover/focus class if details are NOT shown for this node
        if (targetNode && !targetNode.classed('details-shown-for')) {
            targetNode.classed("is-interacted", false);
        }
        // Only remove temporary neighbor class if the neighbor isn't also hovered/focused
        // AND if details are not shown for the neighbor.
        neighborsSelection?.each(function(neighborData) {
            const neighborElement = d3.select(this);
            if (!neighborElement.classed('is-interacted') && !neighborElement.classed('details-shown-for')) {
                neighborElement.classed("is-neighbor", false);
            }
        });
    };

    /** Setup node interaction handlers (mouseover, mouseout, click, focus, blur, touch) */
    setupNodeInteractions() {
        if (!this.node || !this.link) return;

        // --- Interaction Helper Functions ---
        // Helper to add *temporary* interaction classes (for hover/focus)
        const addInteractionClasses = (nodeData, includeNeighbors = true) => {
             if (!nodeData || !this.node) return;
             const { targetNode, neighborsSelection } = this.getNodeAndNeighbors(nodeData);
             // Only add hover/focus class if details are NOT shown for this node
             if (targetNode && !targetNode.classed('details-shown-for')) {
                 targetNode.classed("is-interacted", true).raise();
             }
             // Add neighbor class to neighbors, respecting their own details-shown state
             if (includeNeighbors) {
                neighborsSelection?.each(function(neighborData) {
                    const neighborElement = d3.select(this);
                    // Only add temporary neighbor class if neighbor doesn't have details shown
                    if (!neighborElement.classed('details-shown-for')) {
                        neighborElement.classed("is-neighbor", true);
                    }
                });
             }
        };
        // --- End Helper Functions ---

        // --- UNIFIED Click / Keydown / Touch -> Show Details & Set Persistent State ---
        const handleShowDetails = (event, d) => {
             if (!d || !d.id) return; // Exit if node data is invalid

             // 0. Prevent default browser action
             if (event?.preventDefault) event.preventDefault();

             console.log(`handleShowDetails triggered for: ${d.id} via ${event?.type}`);

             // 1. CLEAR PREVIOUS STATE:
             this.node?.filter('.details-shown-for').each((oldData, i, nodes) => {
                if (oldData.id !== d.id) { // Don't clear self if re-clicking
                    const oldElement = d3.select(nodes[i]);
                    oldElement.classed("details-shown-for", false);
                    if (this.currentlyInteractedNodeId === oldData.id) {
                        oldElement.classed("is-interacted", false);
                    }
                    const { neighborsSelection: oldNeighbors } = this.getNodeAndNeighbors(oldData);
                    oldNeighbors?.classed("is-neighbor", false);
                }
             });
             this.node?.classed("faded", false);
             this.link?.classed("highlighted faded", false);
             this.node?.classed("is-interacted is-neighbor", false); // Clear temporary classes globally
             this.currentlyInteractedNodeId = null;

             // 2. APPLY PERSISTENT STATE to the current node and neighbors:
             const targetElement = this.node?.filter(n => n.id === d.id);
             if (!targetElement || targetElement.empty()) {
                 console.error("Target node element not found for handleShowDetails", d.id);
                 return;
             }
             targetElement.classed("details-shown-for", true);
             const { neighborsSelection, neighborIds, connectedLinks } = this.getNodeAndNeighbors(d);
             neighborsSelection?.classed("is-neighbor", true); // Persistent neighbor visibility

             // 3. APPLY PERSISTENT highlighting/fading:
             const nodeIdsToShow = new Set([...neighborIds, d.id]);
             this.node?.classed("faded", n => !nodeIdsToShow.has(n.id));
             this.link?.classed("highlighted", l => connectedLinks.has(l))
                       .classed("faded", l => !connectedLinks.has(l));
             targetElement.raise();

             // 4. SHOW POPUP:
             this.showNodeDetails(d);

             // 5. HIDE TOOLTIP:
             this.hideTooltip();
        }

        // --- MOUSE HOVER (Temporary State) ---
        this.node.on("mouseover", (event, d) => {
            const targetElement = d3.select(event.currentTarget);
            // *** Guard: Don't apply temporary hover if dragging or details shown ***
            if (targetElement.classed('dragging') || this.g?.select('.node.details-shown-for').node()) return;

            // Clear previous *temporary hover* state
            if (this.currentlyInteractedNodeId && this.currentlyInteractedNodeId !== d.id) {
                 const oldNodeData = this.nodeMap.get(this.currentlyInteractedNodeId);
                 if(oldNodeData) this.removeInteractionClasses(oldNodeData);
            }

            // Apply temporary hover state
            this.currentlyInteractedNodeId = d.id;
            addInteractionClasses(d, true); // Add .is-interacted, .is-neighbor
            this.showTooltip(event, d);

            // Apply temporary highlighting/fading for hover
            const { neighborIds, connectedLinks } = this.getNodeAndNeighbors(d);
            const connectedNodeIds = new Set([...neighborIds, d.id]);
            this.node?.classed("faded", n => !connectedNodeIds.has(n.id));
            this.link?.classed("highlighted", l => connectedLinks.has(l))
                      .classed("faded", l => !connectedLinks.has(l));
            targetElement?.raise();
        });

        // --- MOUSE MOVE (Temporary State) ---
        this.node.on("mousemove", (event) => {
            // *** Guard: Only move tooltip if not dragging and no details shown ***
            if (!d3.select(event.currentTarget).classed('dragging') && !this.g?.select('.node.details-shown-for').node()) {
                 this.moveTooltip(event);
            } else {
                this.hideTooltip();
            }
        });

        // --- MOUSE OUT (Temporary State) ---
        this.node.on("mouseout", (event, d) => {
            const targetElement = d3.select(event.currentTarget);
            // *** Guard: Don't remove temporary hover if dragging or details shown ***
            if (targetElement.classed('dragging') || this.g?.select('.node.details-shown-for').node()) return;

            // Only remove *temporary hover* state if mouse truly left this node
             if (this.currentlyInteractedNodeId === d.id) {
                 this.removeInteractionClasses(d);
                 this.currentlyInteractedNodeId = null;
             }
            this.hideTooltip();

            // Remove temporary highlighting/fading from hover
            this.node?.classed("faded", false);
            this.link?.classed("highlighted faded", false);
        });

        // --- FOCUS (Keyboard - Temporary State) ---
        this.node.on("focus", (event, d) => {
            // *** Guard: Don't apply temporary focus if details shown ***
             if (this.g?.select('.node.details-shown-for').node()) return;

             addInteractionClasses(d, true); // Add .is-interacted, .is-neighbor
             this.hideTooltip();

             // Apply temporary highlighting/fading on focus
             const { neighborIds, connectedLinks } = this.getNodeAndNeighbors(d);
             const connectedNodeIds = new Set([...neighborIds, d.id]);
             this.node?.classed("faded", n => !connectedNodeIds.has(n.id));
             this.link?.classed("highlighted", l => connectedLinks.has(l))
                       .classed("faded", l => !connectedLinks.has(l));
        });

        // --- BLUR (Keyboard - Cleanup Temporary State) ---
        this.node.on("blur", (event, d) => {
             // Only cleanup temporary state if details are not shown for this node
             if (!d3.select(event.currentTarget).classed('details-shown-for')) {
                 this.removeInteractionClasses(d);
             }
             this.hideTooltip();

             // Remove temporary highlighting/fading *only if* no details are shown anywhere
             if (!this.g?.select('.node.details-shown-for').node()) {
                 this.node?.classed("faded", false);
                 this.link?.classed("highlighted faded", false);
             }
        });

        // --- CLICK (Mouse / Synthesized Tap - Persistent State) ---
        this.node.on("click", (event, d) => {
            // Ignore clicks that are part of a drag gesture
            if (event.defaultPrevented) {
                console.log(`Click event ignored on ${d.id} due to defaultPrevented (likely drag).`);
                return;
            }
            // Ignore if a drag just ended (helps prevent double triggers on some devices)
            const timeSinceDragEnd = Date.now() - (d._lastDragEndTime || 0);
            if (timeSinceDragEnd < 100) { // Small threshold
                console.log(`Click event ignored on ${d.id} due to recent drag end.`);
                delete d._lastDragEndTime; // Clean up flag
                return;
            }

            console.log(`Click/Tap detected on ${d.id}, showing details.`);
            handleShowDetails(event, d); // Call unified handler
        });

        // --- KEYDOWN (Enter/Space - Persistent State) ---
        this.node.on("keydown", (event, d) => {
            if (event.key === "Enter" || event.key === " ") {
                handleShowDetails(event, d); // Call unified handler
            }
        });

        // --- TOUCHSTART (REMOVED) ---
        // Remove the dedicated touchstart listener.
        // D3's drag behavior and the click listener (which handles synthesized taps)
        // will manage touch interactions. event.preventDefault() is implicitly handled
        // by d3.drag starting.
        this.node.on("touchstart", (event, d) => {
            if (!d || !event) return;
            if (event.touches?.length > 1) {
                return;
            }
            this.currentlyInteractedNodeId = d.id;
            addInteractionClasses(d, true);
        });

        this.node.on("touchend", (event, d) => {
            if (!d || !event) return;
            if (event.changedTouches?.length > 1) {
                return;
            }
            handleShowDetails(event, d);
        });

        // --- DRAG HANDLER ---
        const dragBehavior = this.dragHandler();

        // Re-bind the start listener: Add popup closing and temporary highlight logic
        dragBehavior.on("start", (event, d) => {
            // Close popup if open when drag starts
            const detailsNode = this.g?.select('.node.details-shown-for');
            if (!detailsNode?.empty()) {
                console.log("Drag started, closing details popup.");
                this.hideNodeDetails(); // Close popup and cleanup persistent state
            }

            // Standard drag start logic
            if (!event.active && this.simulation) this.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
            this.isStable = false;
            const targetElement = d3.select(event.sourceEvent.target.closest('.node'));
            targetElement?.classed('dragging', true).raise();

            // --- Add temporary highlighting for drag (like hover) ---
            this.currentlyInteractedNodeId = d.id; // Track interaction
            addInteractionClasses(d, true); // Use the temporary state helper
            const { neighborIds, connectedLinks } = this.getNodeAndNeighbors(d);
            const connectedNodeIds = new Set([...neighborIds, d.id]);
            this.node?.classed("faded", n => !connectedNodeIds.has(n.id));
            this.link?.classed("highlighted", l => connectedLinks.has(l))
                        .classed("faded", l => !connectedLinks.has(l));
            // --- End temporary highlighting ---

            // Show tooltip at start position
            const sourceEvent = event.sourceEvent;
            let pageX = sourceEvent.pageX ?? sourceEvent.touches?.[0]?.pageX;
            let pageY = sourceEvent.pageY ?? sourceEvent.touches?.[0]?.pageY;
            if (pageX !== undefined && pageY !== undefined) {
                this.showTooltip({ pageX, pageY }, d); // Pass coordinates directly
            } else {
                 this.hideTooltip();
            }

            // --- Store start info for tap vs drag detection in drag.end ---
            d._dragStartX = event.x;
            d._dragStartY = event.y;
            d._dragStartTime = Date.now();
            // --- End store start info ---
        });

        // Update drag listener to move tooltip
        dragBehavior.on("drag", (event, d) => {
            // ... (existing drag logic: update fx/fy, move tooltip) ...
            d.fx = event.x;
            d.fy = event.y;

            // Move tooltip with touch/mouse
            const sourceEvent = event.sourceEvent;
            let pageX = sourceEvent.pageX ?? sourceEvent.touches?.[0]?.pageX;
            let pageY = sourceEvent.pageY ?? sourceEvent.touches?.[0]?.pageY;
             if (pageX !== undefined && pageY !== undefined && this.tooltip.style("display") === "block") {
                 this.tooltip.style("left", `${pageX + this.config.tooltip.offsetX}px`)
                             .style("top", `${pageY + this.config.tooltip.offsetY}px`);
             } else if (this.tooltip.style("display") === "block") {
                 this.hideTooltip();
             }
        });

        // Update end listener: Remove temporary state, conditionally set flag for click handler
        dragBehavior.on("end", (event, d) => {
            if (!event.active && this.simulation) this.simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
            const targetElement = d3.select(event.sourceEvent.target.closest('.node'));
            targetElement?.classed('dragging', false);

            // --- Remove temporary highlighting from drag ---
            if (this.currentlyInteractedNodeId === d.id) {
                 this.removeInteractionClasses(d); // Use the temporary state helper
                 this.currentlyInteractedNodeId = null;
            }
            this.node?.classed("faded", false);
            this.link?.classed("highlighted faded", false);
            this.hideTooltip();
            // --- End remove temporary highlighting ---

            // --- Tap vs Drag Detection (for click handler flag) ---
            const dx = event.x - (d._dragStartX ?? event.x);
            const dy = event.y - (d._dragStartY ?? event.y);
            const dist = Math.sqrt(dx*dx + dy*dy);
            const duration = Date.now() - (d._dragStartTime ?? Date.now());
            const isTap = dist < 5 && duration < 300; // Use same thresholds as before
            // --- End Tap vs Drag Detection ---

            // --- Conditionally set flag for click handler ---
            if (!isTap) {
                // It was a drag, set the flag to prevent the upcoming click event
                d._lastDragEndTime = Date.now();
                console.log(`Drag ended on ${d.id} (dist: ${dist.toFixed(1)}, duration: ${duration}ms). Setting flag to block click.`);
                // Clean up the flag after a short delay
                setTimeout(() => { delete d._lastDragEndTime; }, 150);
            } else {
                // It was a tap, do NOT set the flag. Let the click handler proceed.
                console.log(`Tap ended on ${d.id} (dist: ${dist.toFixed(1)}, duration: ${duration}ms). NOT setting click block flag.`);
            }
            // --- End Conditionally set flag ---

            // Clean up drag start info
            delete d._dragStartX;
            delete d._dragStartY;
            delete d._dragStartTime;
        });

        // Apply the drag handler with the modified listeners
        this.node.call(dragBehavior);

    } // End setupNodeInteractions
 
    /** Setup tooltip element selection */
    setupTooltip() {
        this.tooltip = d3.select("#tooltip");
        if (this.tooltip.empty()) {
            console.warn("#tooltip element not found in HTML. Tooltips disabled.");
            // Provide a stub object to prevent errors
            this.tooltip = {
                empty: true,
                html: () => this.tooltip, style: () => this.tooltip,
                transition: () => ({ duration: () => ({ style: () => ({ end: () => Promise.resolve(), catch: () => {} }) }) })
            };
        }
    }


    /** Show tooltip, applying CSS classes for indicator color */
    showTooltip(event, d) {
        // *** Guard: Do not show tooltip if details are shown for any node ***
        if (this.tooltip.empty || !d || !event || this.g?.select('.node.details-shown-for').node()) {
            this.hideTooltip(); // Ensure hidden
            return;
        }

        const pageX = event.pageX ?? event.clientX;
        const pageY = event.pageY ?? event.clientY;
        if (pageX === undefined || pageY === undefined) return;

        const details = this.details[d.id];
        const indicatorClasses = `tooltip-layer-indicator layer-${d.layer} color-variant-${d.colorVariantIndex}`;
        let html = `<span class="${indicatorClasses}"></span><strong>${d.label || d.id || ''}</strong><br><span class="tooltip-type">${d.type === 'parent' ? (d.layer === 0 ? 'Profile' : 'Category') : 'Detail'}</span>`;
        const hasDetails = details?.items?.length > 0 && !(details.items.length === 1 && /unavailable|placeholder|no details/i.test(details.items[0]));
        if (hasDetails) {
            html += `<br><em style="font-size:0.9em;opacity:0.8;">Click/Tap for details</em>`;
        }

        this.tooltip.html(html)
            .style("left", `${pageX + this.config.tooltip.offsetX}px`)
            .style("top", `${pageY + this.config.tooltip.offsetY}px`)
            .style("display", "block")
            .transition().duration(this.config.tooltip.fadeInDuration)
            .style("opacity", 1);
    }

    /** Move tooltip with mouse */
    moveTooltip(event) {
        // *** Guard: Do not move tooltip if dragging or details shown ***
        if (this.tooltip.empty || d3.select(event?.currentTarget).classed('dragging') || this.g?.select('.node.details-shown-for').node()) {
             this.hideTooltip();
             return;
        }
        if (this.tooltip.style("display") === "block") {
            const pageX = event.pageX ?? event.clientX;
            const pageY = event.pageY ?? event.clientY;
             if (pageX !== undefined && pageY !== undefined) {
                this.tooltip.style("left", `${pageX + this.config.tooltip.offsetX}px`)
                            .style("top", `${pageY + this.config.tooltip.offsetY}px`);
            }
        }
    }

    /** Hide tooltip with fade out */
    hideTooltip() {
        if (this.tooltip.empty || this.tooltip.style("opacity") === "0") return;

        this.tooltip.transition().duration(this.config.tooltip.fadeOutDuration)
            .style("opacity", 0)
            .end()
            .then(() => {
                if (!this.tooltip.empty && this.tooltip.style("opacity") === "0") {
                    this.tooltip.style("display", "none");
                }
            }).catch(() => {
                 if (!this.tooltip.empty) {
                    this.tooltip.style("opacity", 0);
                    this.tooltip.style("display", "none");
                 }
            });
    }


    /** Setup menu panel, legend popup, and their interactions */
     setupMenuAndLegend() {
        // Get references to UI elements
    const profileBtn = document.getElementById("profile-legend-button");
    const menuPanel = document.getElementById("menu-panel");
    const menuAside = document.getElementById("menu-aside");
        const legendPopup = document.getElementById("legend-popup");
        const legendCloseBtn = legendPopup?.querySelector(".close-button");
        const legendBtnInside = document.getElementById("legend-button-inside");
        const nodePopup = document.getElementById("popup");
        const nodePopupCloseBtn = nodePopup?.querySelector(".close-button");

        if (!profileBtn || !menuPanel || !legendPopup || !legendCloseBtn || !legendBtnInside || !nodePopup || !nodePopupCloseBtn) {
             console.error("UI control elements missing (Menu/Popups/Buttons). Check HTML IDs."); return;
        }

        let lastOpenedBy = null; // Store reference for focus return

        // --- Helper Functions for UI Toggling ---
        const togglePopup = (el, show, opener = null) => {
             const closeBtn = el.querySelector(".close-button");
             const shouldShow = show !== undefined ? show : !el.classList.contains("visible");

             if (shouldShow) {
                 lastOpenedBy = opener || document.activeElement;
                 el.style.display = "flex";
                 requestAnimationFrame(() => {
                     el.classList.add("visible");
                     setTimeout(() => closeBtn?.focus(), this.config.animation.duration + 100);
                     const content = el.querySelector(".content"); if (content) content.scrollTop = 0;
                 });
             } else {
                 el.classList.remove("visible");
                 setTimeout(() => {
                     el.style.display = "none";
                     if (lastOpenedBy && typeof lastOpenedBy.focus === 'function' && (document.activeElement === closeBtn || el.contains(document.activeElement))) {
                         lastOpenedBy.focus();
                     }
                     lastOpenedBy = null;
                 }, this.config.popup.closeDelay);
             }
        };

        const toggleMenu = (open) => {
            const isOpen = open !== undefined ? open : !menuAside.classList.contains('menu-open');
            menuAside.classList.toggle('menu-open', isOpen);
            profileBtn.setAttribute('aria-expanded', isOpen.toString());

            // Toggle backdrop
            const menuBackdrop = document.querySelector('.menu-backdrop');
            if (menuBackdrop) {
                menuBackdrop.classList.toggle('active', isOpen);
            }

            if (isOpen) {
                this.menuOpenedManually = true;
                lastOpenedBy = profileBtn;
            } else {
                if (menuPanel.contains(document.activeElement)) {
                    profileBtn.focus();
                }
                lastOpenedBy = null;
            }
        };
        // --- End Helper Functions ---

        // --- Bind Event Listeners ---
        this.updateLegendPopup();

        legendBtnInside.addEventListener("click", () => { togglePopup(legendPopup, true, legendBtnInside); toggleMenu(false); });
        legendCloseBtn.addEventListener("click", () => togglePopup(legendPopup, false));
        legendPopup.addEventListener("click", (e) => { if (e.target === legendPopup) togglePopup(legendPopup, false); });

        nodePopupCloseBtn.addEventListener("click", () => this.hideNodeDetails()); // Use dedicated hide function
        nodePopup.addEventListener("click", (e) => { if (e.target === nodePopup) this.hideNodeDetails(); });

        profileBtn.addEventListener("click", () => toggleMenu());

        // Menu close button handler
        const menuCloseBtn = menuPanel.querySelector('.menu-close-button');
        if (menuCloseBtn) {
            menuCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Menu close button clicked');
                toggleMenu(false);
            });
        } else {
            console.warn('Menu close button not found in DOM');
        }

        // Backdrop handler
        const menuBackdrop = document.querySelector('.menu-backdrop');
        if (menuBackdrop) {
            menuBackdrop.addEventListener('click', () => toggleMenu(false));
        }

        document.addEventListener('click', (e) => {
            if (menuPanel.classList.contains('menu-open') && !menuPanel.contains(e.target) && e.target !== profileBtn && !profileBtn.contains(e.target)) {
                 toggleMenu(false);
            }
        });

        menuPanel.addEventListener('click', (e) => {
            const btn = e.target.closest('button.control-button');
            if (btn && btn.id !== 'legend-button-inside' && btn.id !== 'graph-guide-button') {
                setTimeout(() => toggleMenu(false), 150);
            }
        });

        this.setupControlButtons(menuPanel);
        this.setupSearch("search-input");
    } // End setupMenuAndLegend


     /** Update legend popup content dynamically using CSS classes */
     updateLegendPopup() {
        const legendContent = document.querySelector("#legend-popup .legend-content");
        if (!legendContent) return;

        // Task-management template: color encodes priority, vertical position encodes dependency depth
        if (this.legendMode === 'task-management' || this.config.colorMode === 'priority') {
            const maxLayer = this.maxLayer;
            const priorityEntries = Object.entries(this.config.priorityColorsHex || {});
            const priorityHtml = priorityEntries.map(([p, hex]) => {
                const swatch = `<div class="legend-color" style="background:${hex};"></div>`;
                return `<div class="legend-item">${swatch}<span>${p}</span></div>`;
            }).join('');

            legendContent.innerHTML = `
                <h3>Task Priority (Node Color)</h3>
                ${priorityHtml}
                <h3 style="margin-top: 20px;">Dependency Layers (Vertical)</h3>
                <div class="legend-item" style="opacity: 0.85;">
                    <span>Layer 1 = tasks with no dependencies. Layer N depends on earlier layers. Current max layer: ${maxLayer}</span>
                </div>
                <h3 style="margin-top: 20px;">Connection Types</h3>
                <div class="legend-item"><div class="legend-color line rel-has-foundation"></div><span>Project anchors first-layer tasks</span></div>
                <div class="legend-item"><div class="legend-color line rel-develops"></div><span>Dependency (FS/SS/FF/SF)</span></div>
                <div class="legend-item" style="margin-top: 20px;">
                    <span style="font-style: italic;">Tip: Click a task to see hours, priority, and dependencies.</span>
                </div>
            `;
            return;
        }

        // Dynamically generate Node layer info based on config
        const layersHtml = Object.entries(this.config.baseLayerColorsHex)
            .sort(([lA], [lB]) => parseInt(lA) - parseInt(lB))
            .map(([layer, baseHex]) => {
                const layerNum = parseInt(layer);
                const layerName = ["Profile", "Foundations", "Skills", "Impact", "Outcome"][layerNum] || `Layer ${layerNum}`;
                // Use variant 0 for the main swatch
                const swatchClasses = `legend-color layer-${layerNum} color-variant-0`;
                // Add note about variations for layers > 0 with multiple parents
                const parentsInLayer = this.data.nodes.filter(n => n.layer === layerNum && n.type === 'parent').length;
                const variationText = layerNum > 0 && parentsInLayer > 1 ? ` (Colors vary by category)` : "";
                return `<div class="legend-item">
                           <div class="${swatchClasses}"></div>
                           <span>Layer ${layerNum}: ${layerName}${variationText}</span>
                       </div>`;
            }).join("");

         const relationshipsHtml = `
            <div class="legend-item"><div class="legend-color line rel-has-foundation"></div><span>Profile builds Foundation</span></div>
            <div class="legend-item"><div class="legend-color line rel-has-subcategory"></div><span>Category has Detail</span></div>
            <div class="legend-item"><div class="legend-color line rel-develops"></div><span>Foundation develops Skills</span></div>
            <div class="legend-item"><div class="legend-color line rel-creates"></div><span>Skills create Impact</span></div>
            <div class="legend-item"><div class="legend-color line rel-leads-to"></div><span>Impact leads to Outcome</span></div>`;

        // Example detail node swatch (using a common layer/variant like Layer 1, Variant 0)
        const detailNodeSwatchClasses = `legend-color layer-1 color-variant-0`;

        legendContent.innerHTML = `
            <h3>Nodes by Layer</h3>
            ${layersHtml}
            <div class="legend-item" style="opacity: 0.8;">
                <div class="${detailNodeSwatchClasses}" style="transform: scale(0.7); border-width: 1px;"></div>
                <span>Detail Node (inherits category color)</span>
            </div>
            <h3 style="margin-top: 20px;">Connection Types</h3>
            ${relationshipsHtml}
            <div class="legend-item" style="margin-top: 20px;">
                <span style="font-style: italic;">Tip: Hover nodes for names, Click/Tap for details & connections.</span>
            </div>`;
    }

    /** Show node details popup using CSS classes for styling */
    showNodeDetails(d) {
        const contentDiv = document.getElementById("popup-content");
        const popup = document.getElementById("popup");
        if (!contentDiv || !popup || !d?.id) {
             console.error("Cannot show details - missing elements or node ID.", d); return;
        }

        this.lastFocusedElementBeforePopup = document.activeElement; // Store focus

        const details = this.details[d.id];
        const node = this.nodeMap.get(d.id);

        if (!node) {
             console.error(`Node data not found in map for ID: ${d.id}`);
             contentDiv.innerHTML = `<h2 class="text-dark">Error</h2><p>Node data unavailable.</p>`;
             this.displayPopup(popup);
             return;
        }

        const titleClasses = [ `title-layer-${node.layer}`, `color-variant-${node.colorVariantIndex}`, node.textColorClass ].join(' ');
        const titleStyle = node.fillHex ? ` style="background:${node.fillHex};"` : '';
        let contentHtml;

        if (!details) {
              contentHtml = `<h2 class="${titleClasses}"${titleStyle}>${node.label || node.id}</h2><p>Details unavailable.</p>`;
        } else {
            let photoHtml = '';
            if (node.layer === 0 && details.photoUrl) {
                 const photoBorderClass = `border-layer-${node.layer}-variant-${node.colorVariantIndex}`;
                 photoHtml = `<img src="${details.photoUrl}" alt="${details.title || 'profile'}" class="profile-photo ${photoBorderClass}">`;
            }
            let itemsHtml = '<p>No specific details provided.</p>';
            if (details.items?.length > 0) {
                 itemsHtml = `<ul>${details.items.map(item => `<li>${item}</li>`).join("")}</ul>`;
            }
              contentHtml = `<h2 class="${titleClasses}"${titleStyle}>${details.title || node.label || node.id}</h2>${photoHtml}${itemsHtml}`;
        }

        contentDiv.innerHTML = contentHtml;
        this.displayPopup(popup);
    }

    /** Helper function to display a popup and manage focus */
    displayPopup(popupElement) {
         if (!popupElement) return;
         popupElement.style.display = "flex";
         requestAnimationFrame(() => {
             popupElement.classList.add("visible");
             setTimeout(() => popupElement.querySelector(".close-button")?.focus(), this.config.animation.duration + 100);
             const contentEl = popupElement.querySelector(".content"); if (contentEl) contentEl.scrollTop = 0;
         });
    }


    /** Hide node details popup, cleanup persistent state, and manage focus return */
    hideNodeDetails() {
        const popup = document.getElementById("popup");
        if (!popup || !popup.classList.contains('visible')) return;

        console.log("hideNodeDetails triggered.");

        const closeBtn = popup.querySelector(".close-button");
        const elementToFocusAfter = this.lastFocusedElementBeforePopup;

        // --- CLEANUP PERSISTENT GRAPH STATE ---
        this.node?.classed("faded", false);
        this.link?.classed("highlighted faded", false);
        this.node?.filter('.details-shown-for')
            .classed('details-shown-for', false)
            .each(d => {
                 // Clear temp state if it was somehow left on this node
                 if (this.currentlyInteractedNodeId === d.id) {
                      d3.select(this.node.filter(n => n.id === d.id).node()).classed('is-interacted', false);
                      this.currentlyInteractedNodeId = null;
                 }
                 // Force remove neighbor state from its neighbors
                 const { neighborsSelection } = this.getNodeAndNeighbors(d);
                 neighborsSelection?.classed('is-neighbor', false);
            });
        // --- END GRAPH STATE CLEANUP ---

        popup.classList.remove("visible");

        setTimeout(() => {
             popup.style.display = "none";
             if (elementToFocusAfter && typeof elementToFocusAfter.focus === 'function' && (document.activeElement === closeBtn || popup.contains(document.activeElement))) {
                 elementToFocusAfter.focus();
             }
             this.lastFocusedElementBeforePopup = null;
        }, this.config.popup.closeDelay);
    }


    /** Setup zoom behavior */
    setupZoom() {
        if (!this.svg) return;
        this.zoom = d3.zoom()
            .scaleExtent([0.15, 4])
            .on("zoom", (e) => {
                if (this.g) this.g.attr("transform", e.transform);
                // Text visibility handled by CSS
            })
            .filter((event) => {
                // Allow all zoom/pan gestures including touch
                return !event.ctrlKey && !event.button;
            });
        this.svg.call(this.zoom);
        this.svg.on("dblclick.zoom", null); // Disable double-click zoom
        
        // Ensure touch events work properly
        this.svg.style("touch-action", "none");
    }

    /** Setup control button actions in the menu panel */
    setupControlButtons(panelEl) {
        const getBtn = (id) => panelEl.querySelector(`#${id}`);
        const resetBtn = getBtn("reset-view");
        const coreBtn = getBtn("focus-core");
        const tourBtn = getBtn("reset-tour");
        const profileBtn = getBtn("focus-profile");
        const cvBtn = getBtn("classic-cv-button");
        const guideBtn = getBtn("graph-guide-button");

        if (resetBtn) resetBtn.addEventListener("click", () => this.resetViewAndSearch());
        if (coreBtn) coreBtn.addEventListener("click", () => this.coreNodeId && this.focusOnNode(this.coreNodeId));
        if (profileBtn) profileBtn.addEventListener("click", () => this.profileNodeId && this.focusOnNode(this.profileNodeId));

        if (cvBtn) {
             cvBtn.addEventListener("click", () => {
                 console.log("Classic CV Button Clicked...");
                 if (typeof generateClassicCV === 'function' && this.data?.nodes && this.data?.links && this.details) {
                     generateClassicCV(this.data.nodes, this.data.links, this.details, {}); // Pass preprocessed nodes
                 } else {
                     console.error("Cannot generate CV. Function or data missing.");
                     const pCont = document.getElementById("popup-content"); const p = document.getElementById("popup");
                     if(pCont && p) {
                         pCont.innerHTML = "<h2 class='text-dark cv-error'>Error</h2><p class='cv-error'>Could not generate the CV data.</p>";
                         this.displayPopup(p);
                     }
                 }
             });
        } else console.warn("Classic CV button (#classic-cv-button) not found.");

        if (tourBtn) {
             tourBtn.addEventListener("click", () => {
                 console.log("Reset Tour clicked.");
                 this.menuOpenedManually = true;
                 localStorage.removeItem('walkthroughCompleted');
                 if (window.walkthroughInstance) {
                     window.walkthroughInstance.end();
                     setTimeout(() => window.walkthroughInstance.start(), 350);
                 } else { console.error("Walkthrough instance not found."); }
             });
        } else console.warn("Reset Tour button (#reset-tour) not found.");

        if (guideBtn) {
             guideBtn.addEventListener("click", () => {
                 console.log("Graph Guide button clicked.");
                 this.toggleGraphGuide();
             });
        } else console.warn("Graph Guide button (#graph-guide-button) not found.");

        // Setup guide panel close button
        const guideCloseBtn = document.querySelector(".guide-close-button");
        if (guideCloseBtn) {
             guideCloseBtn.addEventListener("click", () => this.toggleGraphGuide());
        }
    }

    /** Reset graph view, zoom, clear search, and close popups */
    resetViewAndSearch() {
        console.log("Resetting view and search...");

        // --- Close UI Elements First ---
        this.hideNodeDetails(); // Closes node popup and cleans graph state
        const legendPopup = document.getElementById("legend-popup");
        if (legendPopup?.classList.contains("visible")) {
             legendPopup.querySelector(".close-button")?.click(); // Consistent focus return
        }
        const menuPanel = document.getElementById("menu-panel");
         if (menuPanel?.classList.contains("menu-open")) {
             menuPanel.classList.remove("menu-open");
             document.getElementById('profile-legend-button')?.setAttribute('aria-expanded', 'false');
         }
        // --- End Close UI ---

        // --- Clear Graph State ---
        this.node?.classed("faded search-match search-non-match focus-highlight details-shown-for is-interacted is-neighbor", false);
        this.link?.classed("highlighted faded", false);
        this.currentlyInteractedNodeId = null;
        // --- End Clear Graph State ---

        // --- Reset Search UI ---
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        const feedback = document.getElementById('search-feedback');
        if (feedback) feedback.style.display = 'none';
        // --- End Reset Search UI ---

        // --- Reset Zoom/Pan ---
        if (this.svg && this.zoom) {
            this.svg.transition().duration(this.config.animation.duration)
                .call(this.zoom.transform, d3.zoomIdentity);
        }
        // --- End Reset Zoom ---

        if(this.simulation && this.simulation.alpha() < 0.05) {
            this.simulation.alpha(0.1).restart();
        }
    }

    /** Toggle the graph types guide panel */
    toggleGraphGuide() {
        const guidePanel = document.getElementById("guide-panel");
        if (!guidePanel) return;

        const isVisible = guidePanel.classList.contains("visible");
        if (isVisible) {
            guidePanel.classList.remove("visible");
        } else {
            this.populateGuidePanel();
            guidePanel.classList.add("visible");
        }
    }

    /** Populate the guide panel with graph structure information */
    populateGuidePanel() {
        const structuresContainer = document.getElementById("guide-structures");
        if (!structuresContainer) return;

        // Extract unique graph structure nodes from details
        const structureGuides = {};

        // Define structure patterns to identify
        const structurePatterns = {
            'structure-tree': {
                title: '🌳 Tree (Hierarchy)',
                description: 'A connected structure with no cycles. Great for categories and organizational charts.',
                characteristics: ['Root node at top', 'Branches and sub-branches', 'Terminal leaf nodes', 'No circular paths'],
                useCases: ['Org charts', 'File systems', 'Categories', 'Taxonomies']
            },
            'structure-star': {
                title: '⭐ Star (Hub & Spokes)',
                description: 'One central node connected to many others. Common in routing, platforms, and popularity graphs.',
                characteristics: ['Central hub node', 'Multiple spokes radiating out', 'All communication through hub', 'Star-shaped layout'],
                useCases: ['Routing networks', 'Platform ecosystems', 'Social influencers', 'Central services']
            },
            'structure-dag': {
                title: '📊 DAG (Dependency Graph)',
                description: 'A directed acyclic graph: edges point forward with no cycles. Used for dependencies and pipelines.',
                characteristics: ['Directed edges', 'No circular paths', 'Multiple paths possible', 'Topological ordering'],
                useCases: ['Build pipelines', 'Task scheduling', 'Prerequisites', 'Project dependencies']
            },
            'structure-cycle': {
                title: '🔄 Cycle (Feedback Loop)',
                description: 'Cycles mean you can return to where you started. Sometimes desired, sometimes a problem.',
                characteristics: ['Circular paths', 'Feedback loops', 'State transitions', 'Returns to start'],
                useCases: ['Control systems', 'Iteration cycles', 'Reinforcing effects', 'Circular dependencies']
            }
        };

        let html = '';

        Object.entries(structurePatterns).forEach(([key, structure]) => {
            html += `
                <div class="guide-structure">
                    <h3>${structure.title}</h3>
                    <p>${structure.description}</p>
                    
                    <strong>Key Characteristics:</strong>
                    <ul>
                        ${structure.characteristics.map(char => `<li>${char}</li>`).join('')}
                    </ul>
                    
                    <strong>Real-World Use Cases:</strong>
                    <ul>
                        ${structure.useCases.map(usecase => `<li>${usecase}</li>`).join('')}
                    </ul>
                </div>
            `;
        });

        // Add interaction guide
        html += `
            <div class="guide-structure" style="margin-top: 32px; padding-top: 24px; border-top: 2px solid rgba(0,0,0,0.1);">
                <h3>🎮 How to Interact</h3>
                <ul>
                    <li><strong>Hover:</strong> Highlight connected nodes</li>
                    <li><strong>Click:</strong> View detailed information</li>
                    <li><strong>Search:</strong> Find nodes by name or details</li>
                    <li><strong>Zoom:</strong> Use scroll or pinch to zoom in/out</li>
                    <li><strong>Pan:</strong> Drag to move around the graph</li>
                    <li><strong>Reset:</strong> Return to default view</li>
                </ul>
            </div>
        `;

        structuresContainer.innerHTML = html;
    }    /** Zoom and pan the graph to focus on a specific node */
    focusOnNode(nodeId) {
        if (!nodeId) return;
        const nodeData = this.nodeMap.get(nodeId);
        if (!nodeData) { console.warn(`Node to focus not found: ${nodeId}`); return; }

        this.onStable(() => {
            if (nodeData.x === undefined || nodeData.y === undefined || isNaN(nodeData.x) || isNaN(nodeData.y)) {
                console.warn(`Node position invalid after stabilization: ${nodeId}. Cannot focus.`);
                return;
            }

            const scale = this.config.animation.focusScale;
            const x = this.width / 2 - nodeData.x * scale;
            const y = this.height / 2 - nodeData.y * scale;
            const transform = d3.zoomIdentity.translate(x, y).scale(scale);

            const targetNodeSelection = this.node?.filter(d => d.id === nodeId);

            if (targetNodeSelection && !targetNodeSelection.empty() && this.svg && this.zoom) {
                targetNodeSelection.raise();

                this.svg.transition().duration(this.config.animation.duration)
                    .call(this.zoom.transform, transform)
                    .on("end", () => {
                         targetNodeSelection.classed("focus-highlight", true); // CSS handles style
                         requestAnimationFrame(() => {
                            setTimeout(() => {
                                const currentHighlight = this.node?.filter('.focus-highlight').datum();
                                if (currentHighlight && currentHighlight.id === nodeId) {
                                    targetNodeSelection.classed("focus-highlight", false);
                                }
                            }, this.config.animation.highlightDuration);
                         });
                     });
            } else {
                console.warn(`Could not apply focus: Missing target node, SVG, or zoom.`);
            }
        }); // End onStable
    }

    /** Simulation tick function: Update node and link positions */
    ticked() {
        if (!this.node || !this.link) return;

        const nodeRadius = (d) => this.getNodeRadius(d);
        const boundaryPad = this.config.layout.boundaryPadding;
        const graphWidth = this.width;
        const graphHeight = this.height;

        this.node.each(function(d) {
            const r = nodeRadius(d);
            if (d.x !== undefined && !isNaN(d.x)) {
                d.x = Math.max(r + boundaryPad, Math.min(graphWidth - r - boundaryPad, d.x));
            } else { d.x = graphWidth / 2 }
            if (d.y !== undefined && !isNaN(d.y)) {
                d.y = Math.max(r + boundaryPad, Math.min(graphHeight - r - boundaryPad, d.y));
            } else { d.y = graphHeight / 2 }
        });

        this.link
            .attr("x1", d => d.source.x ?? graphWidth / 2)
            .attr("y1", d => d.source.y ?? graphHeight / 2)
            .attr("x2", d => d.target.x ?? graphWidth / 2)
            .attr("y2", d => d.target.y ?? graphHeight / 2);

        this.node.attr("transform", d => `translate(${d.x ?? graphWidth / 2},${d.y ?? graphHeight / 2})`);

        this.checkAndNotifyStable();
    }

    /** Drag handler definition for nodes */
    dragHandler() {
        // Basic drag logic - specific start/drag/end logic is now rebound in setupNodeInteractions
        const dragStarted = (event, d) => { /* Basic fallback if needed */ };
        const dragged = (event, d) => { /* Basic fallback if needed */ };
        const dragEnded = (event, d) => { /* Basic fallback if needed */ };

        return d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded);
    } // End dragHandler

    /** Bind global event listeners (resize, escape key) */
     bindGlobalEvents() {
         window.addEventListener("resize", debounce(() => this.handleResize(), 250));

         document.addEventListener("keydown", (e) => {
             if (e.key === "Escape") {
                 const nodeP = document.getElementById("popup");
                 const legendP = document.getElementById("legend-popup");
                 const menuP = document.getElementById("menu-panel");

                 // Closing order: Walkthrough > Node Popup > Legend Popup > Menu
                 if (window.walkthroughInstance?.isActive) {
                     window.walkthroughInstance.end();
                 } else if (nodeP?.classList.contains("visible")) {
                     this.hideNodeDetails(); // Handles focus return
                 } else if (legendP?.classList.contains("visible")) {
                     legendP.querySelector(".close-button")?.click(); // Consistent focus return
                 } else if (menuP?.classList.contains("menu-open")) {
                     const pBtn = document.getElementById('profile-legend-button');
                     menuP.classList.remove('menu-open');
                     if (pBtn) {
                        pBtn.setAttribute('aria-expanded', 'false');
                        if (menuP.contains(document.activeElement)) pBtn.focus();
                     }
                     this.menuOpenedManually = true;
                 }
             }
         });
     } // End bindGlobalEvents

    /** Handle window resize event */
    handleResize() {
        console.log("Handling resize...");
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isMobile = this.width < this.config.mobileBreakpoint;

        this.svg?.attr("width", this.width).attr("height", this.height)
                 .attr("viewBox", `0 0 ${this.width} ${this.height}`);

        this.calculateParentTargetX();

        if (this.simulation) {
            this.simulation.force("y").y(d => this.getBandY(d));
            this.simulation.force("x").x(d => this.getNodeTargetX(d));
            this.simulation.force("charge").strength(d =>
                 (d.type === "parent" ? this.config.forces.charge * 1.1 : this.config.forces.charge)
                 * (this.isMobile ? this.config.forces.chargeMobileMultiplier : 1)
            );
            this.simulation.alpha(0.3).restart();
        }

        const menuP = document.getElementById('menu-panel');
        if (menuP?.classList.contains('menu-open')) {
            const pBtn = document.getElementById('profile-legend-button');
            menuP.classList.remove('menu-open');
            if (pBtn) pBtn.setAttribute('aria-expanded', 'false');
        }

        this.isStable = false;
    } // End handleResize

    /** Create search feedback element if it doesn't exist */
    createFeedbackElement(inputContainerElement) {
        let feedbackElement = document.getElementById('search-feedback');
        if (!feedbackElement && inputContainerElement) {
            const menuPanel = inputContainerElement.closest('#menu-panel');
            if (menuPanel) {
                feedbackElement = document.createElement('div');
                feedbackElement.id = 'search-feedback';
                feedbackElement.className = 'search-feedback';
                feedbackElement.style.display = 'none';
                feedbackElement.setAttribute('aria-live', 'polite');
                inputContainerElement.parentNode.insertBefore(feedbackElement, inputContainerElement.nextSibling);
            }
        }
        if (!feedbackElement) console.error("Could not create or find search feedback element.");
        return feedbackElement;
    } // End createFeedbackElement

    /** Setup search input functionality */
    setupSearch(inputId) {
        const inputEl = document.getElementById(inputId);
        if (!inputEl) { console.error(`Search input #${inputId} not found.`); return; }

        const searchBox = inputEl.closest('.search-box');
        const feedbackEl = this.createFeedbackElement(searchBox);
        if (!feedbackEl) return;

        const performSearch = debounce(() => {
            const searchTerm = inputEl.value.toLowerCase().trim();
            let matches = [];

            // --- Clear Previous Search/Hover/Details State ---
            this.hideNodeDetails(); // Close popup if open
            this.node?.classed("search-match search-non-match is-interacted is-neighbor faded focus-highlight details-shown-for", false);
            this.link?.classed("highlighted faded", false);
            this.currentlyInteractedNodeId = null;
            // --- End Clear State ---

            if (searchTerm && this.node) {
                this.node.each((d, i, nodes) => {
                    // Defensive checks to avoid calling d3.select on null/undefined nodes
                    const el = nodes && nodes[i] ? nodes[i] : null;
                    if (!el) {
                        console.warn(`[search] Skipping node at index ${i} because DOM element is missing.`);
                        return;
                    }

                    // If datum is missing, skip and warn (prevents d3.datum errors in certain timing cases)
                    if (!d) {
                        // Try to recover datum from element if possible
                        const attemptedDatum = d3.select(el).datum();
                        if (!attemptedDatum) {
                            console.warn(`[search] Skipping element because datum is missing for element:`, el);
                            return;
                        }
                    }

                    const nodeElement = d3.select(el);
                    const label = (d && (d.label || d.id) ? (d.label || d.id) : '').toLowerCase();
                    const detailsItems = (d && this.details[d.id] ? (this.details[d.id].items || []).join(' ') : '').toLowerCase();
                    const isMatch = label.includes(searchTerm) || detailsItems.includes(searchTerm);

                    nodeElement.classed("search-match", isMatch)
                               .classed("search-non-match", !isMatch); // CSS fades non-matches

                    if (isMatch) {
                        matches.push(d);
                        nodeElement.raise(); // Bring matches forward
                        // CSS handles text visibility for .search-match
                    }
                });
            }

            const message = (searchTerm && matches.length === 0) ? "No results found." : '';
            feedbackEl.textContent = message;
            feedbackEl.style.display = message ? 'block' : 'none';

            // --- Adjust View Based on Search Results ---
            if (searchTerm) {
                if (matches.length === 1 && matches[0]?.id) {
                    this.focusOnNode(matches[0].id);
                } else {
                    const currentScale = this.svg ? (d3.zoomTransform(this.svg.node() || this.container)?.k || 1) : 1;
                    if (currentScale > 1.2) {
                        if (this.svg && this.zoom) {
                            const targetTransform = d3.zoomIdentity.scale(1);
                            this.svg.transition().duration(this.config.animation.duration / 2)
                                .call(this.zoom.transform, targetTransform);
                        }
                    }
                }
                this.menuOpenedManually = true;
            }
        }, 300); // Debounce delay

        inputEl.addEventListener("input", performSearch);

        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch.flush?.() || performSearch(); // Trigger immediately

                const menuP = document.getElementById('menu-panel');
                if (menuP?.classList.contains('menu-open')) {
                    const pBtn = document.getElementById('profile-legend-button');
                    menuP.classList.remove('menu-open');
                    if (pBtn) {
                        pBtn.setAttribute('aria-expanded', 'false');
                        inputEl.blur();
                    }
                    this.menuOpenedManually = true;
                }
            }
        });
    } // End setupSearch

} // End CurriculumGraph class


// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM Ready. Initializing Graph...");

    if (isEmbeddedMode()) {
        document.body.classList.add('embed');
        const home = document.getElementById('home-button');
        if (home) home.style.display = 'none';
    }
    
    // Load external templates (if available)
    try {
        await initTemplates();
    } catch (e) {
        console.warn('initTemplates failed:', e && e.message);
    }

    // --- Register Service Worker for PWA ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.warn('Service Worker registration failed:', error);
            });
    }
    // --- End Service Worker Registration ---
    
    const containerId = "graph-container";
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Graph container element #${containerId} not found in the HTML.`);
        document.body.innerHTML = `<p style='color:red; text-align:center; padding: 50px;'>Error: Graph container missing.</p>`;
        return;
    }

    try {
        const templateSelect = document.getElementById('template-select');
        const availableTemplates = getAvailableTemplates();
        const requestedTemplateId = getInitialTemplateId();

        if (templateSelect) {
            // If parent exposes a PROJECTS_CONFIG (centralized projects list), inject project options at the top
            let projectOptionsHtml = '';
            try {
                const parentProjects = (window.parent && window.parent.PROJECTS_CONFIG) ? window.parent.PROJECTS_CONFIG : (window.PROJECTS_CONFIG || []);
                if (Array.isArray(parentProjects) && parentProjects.length) {
                    projectOptionsHtml += `<optgroup label="Projects">`;
                    parentProjects.forEach(p => {
                        const label = (p && p.label) ? p.label : p.id;
                        projectOptionsHtml += `<option value="project:${p.id}">Project: ${label}</option>`;
                    });
                    projectOptionsHtml += `</optgroup>`;
                }
            } catch (e) {
                console.warn('Could not read parent PROJECTS_CONFIG:', e);
            }

            templateSelect.innerHTML = projectOptionsHtml + availableTemplates
                .map(t => `<option value="${t.id}">${t.name}</option>`)
                .join('');
            templateSelect.value = requestedTemplateId;

            templateSelect.addEventListener('change', () => {
                const val = templateSelect.value || '';
                if (val.startsWith('project:')) {
                    // User selected a project — notify parent to switch project
                    const projectId = val.split(':')[1];
                    try {
                        window.parent.postMessage({ type: 'setActiveProject', projectId }, '*');
                    } catch (e) {
                        console.warn('Unable to post setActiveProject to parent', e);
                    }
                } else {
                    // Regular template selection
                    setSelectedTemplateId(val);
                    window.location.reload();
                }
            });

            // Listen for project changes signalled from parent
            window.addEventListener('message', (e) => {
                try {
                    if (!e || !e.data) return;
                    if (e.data.type === 'projectChanged') {
                        const pid = e.data.projectId;
                        const projVal = `project:${pid}`;
                        const opt = Array.from(templateSelect.options).find(o => o.value === projVal);
                        if (opt) {
                            templateSelect.value = projVal;
                        }
                    }
                } catch (err) {/* noop */}
            });
        }

        const { template, nodes, links, details, configOverrides } = loadTemplate(requestedTemplateId);
        setSelectedTemplateId(template.id);
        if (templateSelect) templateSelect.value = template.id;

        // --- Apply template-specific UI behavior ---
        const applyMenu = (meta) => {
            const profileBtn = document.getElementById('focus-profile');
            const coreBtn = document.getElementById('focus-core');
            const cvBtn = document.getElementById('classic-cv-button');
            const tourBtn = document.getElementById('reset-tour');

            if (profileBtn) {
                profileBtn.style.display = meta?.showProfileButton === false ? 'none' : '';
                if (meta?.menuLabels?.profile) profileBtn.textContent = meta.menuLabels.profile;
            }
            if (coreBtn) {
                coreBtn.style.display = meta?.showCoreButton === false ? 'none' : '';
                if (meta?.menuLabels?.core && meta.menuLabels.core.length > 2) coreBtn.textContent = meta.menuLabels.core;
            }
            if (cvBtn) {
                cvBtn.style.display = meta?.showCvButton === false ? 'none' : '';
                if (meta?.menuLabels?.cv && meta.menuLabels.cv.length > 2) cvBtn.textContent = meta.menuLabels.cv;
            }
            if (tourBtn) {
                tourBtn.style.display = meta?.walkthroughEnabled === false ? 'none' : '';
                if (meta?.menuLabels?.tour && meta.menuLabels.tour.length > 2) tourBtn.textContent = meta.menuLabels.tour;
            }
        };
        applyMenu(template?.meta);
        // --- End template UI behavior ---

        // --- Data Validation ---
        if (!Array.isArray(nodes) || !Array.isArray(links) || typeof details !== 'object') throw new Error('Template graph data has incorrect format.');
        if (!nodes.length) throw new Error('Template graph contains zero nodes.');
        // --- End Data Validation ---

        console.log("Initializing CurriculumGraph instance...");
        const graphInstance = new CurriculumGraph(
            containerId,
            { nodes, links },
            details,
            configOverrides || {},
            {
                template,
                profileNodeId: template?.meta?.profileNodeId,
                coreNodeId: template?.meta?.coreNodeId,
                legendMode: template?.meta?.legendMode
            }
        );
        window.graphInstance = graphInstance; // Make global if needed

        // If an exit button exists in the graph menu, notify parent when clicked so the parent can exit fullscreen
        (function wireExitToParent(){
            try {
                const exitBtn = document.getElementById('exitGraphViewBtn');
                if (exitBtn && !exitBtn._wiredToParent) {
                    exitBtn.addEventListener('click', () => {
                        try { window.parent.postMessage({ type: 'exitGraphView' }, '*'); }
                        catch (e) { console.warn('Unable to postMessage to parent for exitGraphView', e); }
                    });
                    exitBtn._wiredToParent = true;
                }

                // Also forward Escape key presses inside the iframe to the parent
                if (!window._exitForwarderInstalled) {
                    document.addEventListener('keydown', (ev) => {
                        if (ev.key === 'Escape') {
                            try { window.parent.postMessage({ type: 'exitGraphView' }, '*'); }
                            catch (e) { /* noop */ }
                        }
                    });
                    window._exitForwarderInstalled = true;
                }
            } catch (err) {
                // Non-fatal
                console.warn('Failed to wire exit button to parent:', err);
            }
        })();

         // --- Initialize Walkthrough (template-controlled) ---
        const walkthroughEnabled = template?.meta?.walkthroughEnabled !== false;
        if (walkthroughEnabled && typeof Walkthrough === 'function') {
            let walkthroughInstance = null;
            try {
                walkthroughInstance = new Walkthrough();
                walkthroughInstance.setGraph(graphInstance);

                // Generate template-specific steps and set them on the walkthrough
                try {
                    const basePath = (window.location && window.location.pathname)
                        ? window.location.pathname.replace(/\/[^\/]*$/, '/')
                        : './';
                    const steps = await resolveStepsForTemplate(template.id, nodes, details, template.meta || {}, basePath);
                    walkthroughInstance.setSteps(steps);
                } catch (e) {
                    console.warn('Failed to generate walkthrough steps for template:', template.id, e && e.message);
                }

                window.walkthroughInstance = walkthroughInstance;
            } catch (err) {
                console.error("Error creating Walkthrough instance:", err);
            }

            if (walkthroughInstance) {
                graphInstance.onStable(() => {
                    console.log("Graph stable, attempting to start walkthrough...");
                    const urlParams = new URLSearchParams(window.location.search);
                    const skipTourParam = urlParams.get('skipTour') === 'true';
                    const completedBefore = localStorage.getItem("walkthroughCompleted") === "true";

                    if (skipTourParam) {
                        console.log("Walkthrough skipped via URL parameter.");
                        localStorage.setItem("walkthroughCompleted", "true");
                    } else if (!completedBefore) {
                        // Only start if we have at least one meaningful step
                        if (Array.isArray(walkthroughInstance.steps) && walkthroughInstance.steps.length > 0) {
                            walkthroughInstance.start();
                        }
                    } else {
                        console.log("Walkthrough previously completed, skipping auto-start.");
                    }
                });
            }
        }
         // --- End Walkthrough Init ---

    } catch (error) {
         console.error("Critical error during graph initialization:", error);
         if (container && !container.innerHTML.includes('Error')) {
             container.innerHTML = `<p style='color:red; text-align:center; padding: 50px;'>Error initializing graph: ${error.message}. Check console.</p>`;
         }
    }
}); // End DOMContentLoaded listener