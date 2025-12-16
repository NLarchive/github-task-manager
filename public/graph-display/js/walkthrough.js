/**
 * Manages the interactive walkthrough/tour of the graph interface.
 * Relies on CurriculumGraph instance for interactions.
 */

// Included from original - requires debounce from utils.js if not globally available
// If utils.js is used, import debounce:
import { debounce } from './utils.js';
// Otherwise, include the debounce function definition here:
/*
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
*/

class Walkthrough {
    constructor() {
        this.currentStep = 0;
        // Default steps can be replaced by calling `setSteps()`.
        this.steps = [
            { title: "Welcome!", content: "This interactive graph is a template for showing <em>your</em> career journey. Let’s explore how it works.", position: "center-bottom" }
        ];

        this.overlay = document.getElementById("walkthrough-overlay");
        this.tooltip = this.overlay?.querySelector(".walkthrough-tooltip");
        this.graph = null; // Reference to the CurriculumGraph instance
        this.debouncedPositionTooltip = debounce(() => this.positionTooltip(), 100);
        this.isActive = false;
        this.clickSimulationTimeout = null; // To manage popup closing
        this.searchSimulationTimeout = null; // To manage search clearing

        this.init();
    }

    /**
     * Replace current walkthrough steps. Steps should be an array of step objects.
     * Example step: { title, content, nodeId, target, position, focus, hoverNode, clickNode }
     */
    setSteps(steps) {
        if (!Array.isArray(steps)) {
            console.warn('Walkthrough.setSteps called with non-array value. Ignoring.');
            return;
        }
        this.steps = steps.length ? steps.slice() : [{ title: 'Empty Tour', content: 'No steps available.' }];
        this.currentStep = 0; // Reset to start
        this.updateTooltipContent();
    }

    init() {
        if (this.overlay && this.tooltip) {
            this.updateTooltipContent(); // Set initial content
            this.bindEvents();
        } else {
            console.warn("Walkthrough elements missing (#walkthrough-overlay or .walkthrough-tooltip)");
        }
    }

    setGraph(graphInstance) {
        this.graph = graphInstance;
        if (!this.graph) {
            console.error("Walkthrough: Invalid graph instance provided.");
        }
    }

    bindEvents() {
        if (!this.overlay) return;

        // Use event delegation on the overlay
        this.overlay.addEventListener("click", (event) => {
            if (event.target.classList.contains("walkthrough-skip")) {
                this.end();
            } else if (event.target.classList.contains("walkthrough-next")) {
                this.handleNext();
            }
            // Clicking the overlay backdrop does nothing now
        });

        // Close on Escape key
        document.addEventListener("keydown", this.handleEscape);

        // Reposition tooltip on window resize
        window.addEventListener("resize", this.debouncedPositionTooltip);
    }

    // Use bound function for event listener removal
    handleEscape = (event) => {
        if ((event.key === "Escape" || event.key === "Esc") && this.isActive) {
            this.end();
        }
    };

    handleNext() {
        // Clear any pending simulation timeouts from the previous step
        clearTimeout(this.clickSimulationTimeout);
        clearTimeout(this.searchSimulationTimeout);
        this._removeCursor();

        if (this.currentStep === 0) {
            this.startTour(); // Special action for the first "Start Tour" button
        } else {
            this.nextStep();
        }
    }

    start() {
        if (!this.overlay || this.isActive) {
            console.log("Walkthrough overlay not found or tour already active.");
            return;
        }

        // Check if tour should be skipped
        const urlParams = new URLSearchParams(window.location.search);
        const skipTourParam = urlParams.get('skipTour') === 'true';
        const completedBefore = localStorage.getItem("walkthroughCompleted") === "true";

        if (completedBefore && !skipTourParam) {
            console.log("Walkthrough previously completed. Skipping.");
            return;
        }
        if (skipTourParam) {
            console.log("Walkthrough skipped via URL parameter.");
            localStorage.setItem("walkthroughCompleted", "true");
            return;
        }

        this.isActive = true;
        this.currentStep = 0;
        console.log("Starting walkthrough...");

        // Ensure any open popups/menu are closed before starting
        this.graph?.hideNodeDetails();
        const legendPopup = document.getElementById("legend-popup");
        if (legendPopup?.classList.contains("visible")) legendPopup.querySelector('.close-button')?.click();
        const menuPanel = document.getElementById("menu-panel");
        if (menuPanel?.classList.contains("menu-open")) {
            menuPanel.classList.remove("menu-open");
            document.getElementById('profile-legend-button')?.setAttribute('aria-expanded', 'false');
        }
        // Reset graph view
        this.graph?.resetViewAndSearch();


        this.updateTooltipContent();
        this.overlay.style.display = "block";
        requestAnimationFrame(() => {
            this.overlay.style.opacity = "1";
            this.positionTooltip();
        });
    }

    startTour() {
        // Move from step 0 (Welcome) to step 1 (Profile node)
        if (this.currentStep === 0) {
            this.currentStep = 1;
            this.updateTooltipContent();
            this.executeStepActions();
        }
    }

    nextStep() {
        // Clear previous target styling and simulations
        d3.selectAll(".node").classed("walkthrough-target", false);
        d3.selectAll(".walkthrough-element-highlight").classed("walkthrough-element-highlight", false);
        this._removeCursor();

        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateTooltipContent();
            this.executeStepActions();
        } else {
            this.end(); // Reached the end
        }
    }

    executeStepActions() {
        const step = this.steps[this.currentStep];
        let targetElement = null; // To store the DOM element being targeted

        if (!this.graph && (step.nodeId || step.focus)) {
            console.error("Graph not available for walkthrough step actions requiring graph interaction.");
            this.positionTooltip();
            return;
        }

        let focusDelay = 50; // Base delay

        // --- Focus on Node or Reset Zoom ---
        if (step.focus && this.graph) {
            if (step.nodeId) {
                // Attempt to get the node element immediately for visibility check
                 targetElement = document.querySelector(`.node[data-id="${step.nodeId}"]`);
                 if(targetElement) this.ensureNodeTextVisibility(targetElement);

                this.graph.focusOnNode(step.nodeId);
                focusDelay = (this.graph.config?.animation?.duration || 600) + 150;
            } else {
                this.graph.resetZoom();
                focusDelay = (this.graph.config?.animation?.duration || 600) + 100;
            }
        }

        // --- Highlight Specific HTML Element Targets ---
        d3.selectAll(".walkthrough-element-highlight").classed("walkthrough-element-highlight", false); // Clear previous
        if (step.target) {
             targetElement = document.querySelector(step.target);
             if (targetElement) {
                 d3.select(targetElement).classed("walkthrough-element-highlight", true);
                 // If targeting menu panel for search, ensure it's open
                 if (step.target === "#menu-panel" && step.searchDemo) {
                     const menuPanel = document.getElementById("menu-panel");
                     if (menuPanel && !menuPanel.classList.contains("menu-open")) {
                         menuPanel.classList.add("menu-open");
                         document.getElementById('profile-legend-button')?.setAttribute('aria-expanded', 'true');
                         focusDelay = Math.max(focusDelay, 350); // Add delay for menu animation
                     }
                 }
             } else {
                  console.warn(`Walkthrough target element not found: ${step.target}`);
             }
         }


        // --- Delayed Actions (after focus/zoom/menu animation) ---
        // Use a single timeout for all delayed actions
        clearTimeout(this.stepActionTimeout); // Clear any previous pending actions
        this.stepActionTimeout = setTimeout(() => {
            if (!this.isActive) return; // Don't run if tour ended

            // Reposition tooltip after potential zoom/pan and target highlight
            this.positionTooltip();

            // Find node element again if needed, after focus possibly moved it
            const finalNodeElement = step.nodeId ? document.querySelector(`.node[data-id="${step.nodeId}"]`) : null;

            // Simulate hover effect
            if (step.hoverNode && finalNodeElement) {
                this.simulateNodeHover(finalNodeElement);
            }
            // Simulate click effect (opens popup briefly)
            if (step.clickNode && finalNodeElement) {
                 this.simulateNodeClick(finalNodeElement); // Pass element directly
            }
            // Simulate search typing
             if (step.searchDemo) {
                 this.simulateSearch(step.searchDemo);
             }

        }, focusDelay);
    }


    updateTooltipContent() {
        const step = this.steps[this.currentStep];
        if (!this.tooltip) return;

        const isFirstStep = this.currentStep === 0;
        const isLastStep = this.currentStep === this.steps.length - 1;

        const nextButtonText = isFirstStep ? "Start Tour" : (isLastStep ? "Finish & Explore" : "Next");
        // Change this line to always include the skip button
        const skipButtonHtml = '<button class="walkthrough-button walkthrough-skip">Skip Tour</button>'; 


        this.tooltip.innerHTML = `
            <h3>${step.title}</h3>
            <p>${step.content}</p>
            <div class="walkthrough-buttons">
                ${skipButtonHtml}
                <span style="flex-grow: 1;"></span> <!-- Spacer -->
                <button class="walkthrough-button walkthrough-next">${nextButtonText}</button>
            </div>
        `;

        // Reposition immediately if overlay is already visible
        if (this.overlay?.style.display === 'block') {
             requestAnimationFrame(() => this.positionTooltip());
        }
    }


    positionTooltip() {
        if (!this.tooltip || !this.isActive) return;

        // On mobile, reset inline styles and let CSS handle positioning for consistent modal look
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            const tooltipEl = this.tooltip;
            tooltipEl.style.left = '';
            tooltipEl.style.top = '';
            tooltipEl.style.bottom = '';
            tooltipEl.style.transform = '';
            tooltipEl.style.opacity = '1';
            return; // Skip JS positioning on mobile
        }

        const step = this.steps[this.currentStep];
        let targetElement = null;

        // --- Find Target Element ---
        d3.selectAll(".node").classed("walkthrough-target", false); // Clear previous node target

        if (step.nodeId) {
            targetElement = document.querySelector(`.node[data-id="${step.nodeId}"]`);
            if (targetElement) {
                d3.select(targetElement).classed("walkthrough-target", true); // Apply highlight class
            } else {
                console.warn(`Walkthrough target node not found: ${step.nodeId}`);
            }
        } else if (step.target) {
             // Target element found during executeStepActions and possibly highlighted
             targetElement = document.querySelector(step.target);
             if (!targetElement) {
                  console.warn(`Walkthrough target element not found: ${step.target}`);
             }
        }

        // --- Calculate Position ---
        const tooltipEl = this.tooltip; // Use the actual tooltip DOM element
        tooltipEl.style.opacity = "0"; // Hide briefly while calculating

        requestAnimationFrame(() => { // Calculate after potential rendering updates
            if (!this.isActive) return; // Check again inside rAF

            const tooltipRect = tooltipEl.getBoundingClientRect();
            let left, top;
            const spacing = 15;
            const viewportMargin = 10;

            if (targetElement) {
                const targetRect = targetElement.getBoundingClientRect();
                const position = step.position || "bottom";

                switch (position) {
                    case "top":
                        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                        top = targetRect.top - tooltipRect.height - spacing;
                        break;
                    case "right":
                        left = targetRect.right + spacing;
                        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                        break;
                    case "left":
                        left = targetRect.left - tooltipRect.width - spacing;
                        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                        break;
                     case "center":
                        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
                        break;
                    case "bottom-left": // Position based on target bottom-left
                         left = targetRect.left;
                         top = targetRect.bottom + spacing;
                         break;
                    case "bottom":
                    default:
                        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
                        top = targetRect.bottom + spacing;
                        break;
                }

                // Adjust to keep within viewport
                left = Math.max(viewportMargin, Math.min(left, window.innerWidth - tooltipRect.width - viewportMargin));
                top = Math.max(viewportMargin, Math.min(top, window.innerHeight - tooltipRect.height - viewportMargin));

                tooltipEl.style.left = `${left}px`;
                tooltipEl.style.top = `${top}px`;
                tooltipEl.style.bottom = "auto";
                tooltipEl.style.transform = "none";

            } else {
                // Default center bottom position if no target
                tooltipEl.style.left = "50%";
                tooltipEl.style.top = "auto";
                tooltipEl.style.bottom = "20px";
                tooltipEl.style.transform = "translateX(-50%)";
            }

            // Fade tooltip back in at its new position
             tooltipEl.style.opacity = "1";
        });
    }

     // --- Simulation Helpers ---

     simulateNodeHover(nodeElement) {
        if (!nodeElement || !this.isActive) return;
        const nodeId = d3.select(nodeElement).attr('data-id'); // Get ID for logging
        console.log(`Simulating hover on: ${nodeId}`);

        // Dispatch mouseover event
        nodeElement.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));

        // Schedule mouseout unless the tour ends or moves to the next step
        this.hoverTimeout = setTimeout(() => {
            if (!this.isActive) return; // Check if tour still active
             try {
                  nodeElement.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true, view: window }));
                  console.log(`Clearing hover simulation on: ${nodeId}`);
             } catch (e) {
                 console.warn("Error during simulated mouseout", e);
             }
        }, 2500); // Keep hover effect for 2.5 seconds
    }

    _createCursor(targetElement) {
        this._removeCursor(); // Remove any existing cursor
        if (!targetElement || !this.isActive) return;

        const cursor = document.createElement("div");
        cursor.className = "walkthrough-cursor";
        cursor.innerHTML = "👆"; // Pointing finger emoji
        cursor.setAttribute('aria-hidden', 'true'); // Hide from screen readers
        document.body.appendChild(cursor);

        const targetRect = targetElement.getBoundingClientRect();
        cursor.style.position = 'fixed'; // Use fixed to position relative to viewport
        cursor.style.left = `${targetRect.left + targetRect.width / 2 - 12}px`;
        cursor.style.top = `${targetRect.top + targetRect.height / 2 - 12}px`;
        cursor.style.zIndex = '2500';

        return cursor;
    }

    _removeCursor() {
        document.querySelector(".walkthrough-cursor")?.remove();
    }

    simulateNodeClick(nodeElement) {
        if (!this.graph || !nodeElement || !this.isActive) return;

        const nodeData = d3.select(nodeElement).datum();
        if (!nodeData) {
            console.error(`No data found for node click simulation: ${nodeElement}`);
            return;
        }
        const nodeId = nodeData.id;
        console.log(`Simulating click on: ${nodeId}`);

        // Clear any previous simulation timeout
        clearTimeout(this.clickSimulationTimeout);

        // Create cursor first
        const cursor = this._createCursor(nodeElement);

        // Short delay, then show details
        this.clickSimulationTimeout = setTimeout(() => {
             if (!this.isActive) return; // Check active state
             this.graph.showNodeDetails(nodeData);

             // Short delay, remove cursor
             this.clickSimulationTimeout = setTimeout(() => {
                 this._removeCursor();

                 // Longer delay, then auto-close popup
                 this.clickSimulationTimeout = setTimeout(() => {
                     if (!this.isActive) return; // Check active state
                     const popup = document.getElementById("popup");
                     // Only close if it's still visible (user might have closed it)
                     if (popup?.classList.contains("visible")) {
                         this.graph.hideNodeDetails();
                         console.log(`Auto-closing details for: ${nodeId}`);
                     }
                 }, 3500); // Keep popup open

             }, 500); // Cursor visible duration

         }, 300); // Delay before showing popup
    }

     simulateSearch(searchTerm) {
         const searchInput = document.getElementById("search-input");
         if (!searchInput || !this.isActive) return;

         const menuPanel = document.getElementById("menu-panel");
        const ensureMenuOpen = () => {
            if (!menuPanel) return Promise.resolve();
            if (menuPanel.classList.contains("menu-open")) return Promise.resolve();
            return new Promise((resolve) => {
                // Open menu and allow animation time
                menuPanel.classList.add("menu-open");
                document.getElementById('profile-legend-button')?.setAttribute('aria-expanded', 'true');
                // Wait a short time for CSS/open animation before resolving
                setTimeout(resolve, 300);
            });
        };

        // Ensure menu is open before typing
        ensureMenuOpen().then(() => {
            // Re-query searchInput in case DOM focus changed
            const input = document.getElementById("search-input");
            if (!input) {
                console.warn("Search input not found after opening menu.");
                return;
            }

            console.log(`Simulating search for: ${searchTerm}`);
            input.focus();
            input.value = ""; // Clear existing value
            input.dispatchEvent(new Event('input', { bubbles: true })); // Trigger search clear

            clearTimeout(this.searchSimulationTimeout); // Clear previous simulation

            if (searchTerm) {
                let i = 0;
                const typeChar = () => {
                    if (!this.isActive) return; // Stop if tour ended

                    if (i < searchTerm.length) {
                        input.value += searchTerm[i];
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        i++;
                        this.searchSimulationTimeout = setTimeout(typeChar, 150); // Next char
                    } else {
                        // Finished typing, schedule auto-clear
                        this.searchSimulationTimeout = setTimeout(() => {
                            if (!this.isActive) return; // Check again before clearing
                            input.value = "";
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                            console.log("Clearing search simulation");
                            input.blur(); // Optionally blur input
                        }, 2500); // Clear after delay
                    }
                };
                this.searchSimulationTimeout = setTimeout(typeChar, 150); // Start typing
            }
        });
     }

     ensureNodeTextVisibility(nodeElement) {
         if (!nodeElement) return;
         requestAnimationFrame(() => { // Ensure styles applied after render updates
             const textElement = nodeElement.querySelector("text");
             if (textElement) {
                 textElement.style.display = "block";
                 // Bring the node group to the front visually
                 d3.select(nodeElement).raise();
                 // console.log(`Ensured text visibility for: ${nodeElement.dataset.id}`);
             }
         });
     }


    end() {
        if (!this.isActive) return; // Prevent ending if not active

        this.isActive = false;
        console.log("Ending walkthrough.");

        // Clear any pending timeouts
        clearTimeout(this.stepActionTimeout);
        clearTimeout(this.hoverTimeout);
        clearTimeout(this.clickSimulationTimeout);
        clearTimeout(this.searchSimulationTimeout);

        if (this.overlay) {
            this.overlay.style.opacity = "0"; // Fade out overlay
        }
        d3.selectAll(".node").classed("walkthrough-target", false); // Remove node highlight
        d3.selectAll(".walkthrough-element-highlight").classed("walkthrough-element-highlight", false); // Remove element highlight
        this._removeCursor(); // Remove cursor

        // Close menu only if it was potentially opened by the walkthrough (check last step)
         const lastStep = this.steps[this.currentStep];
         const menuPanel = document.getElementById("menu-panel");
         if (menuPanel?.classList.contains("menu-open") && lastStep?.target === '#menu-panel') {
             menuPanel.classList.remove("menu-open");
             const profileBtn = document.getElementById('profile-legend-button');
             if(profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
             // Return focus?
             if(menuPanel.contains(document.activeElement)) profileBtn?.focus();
         }

        // Hide overlay after transition and mark as completed
        setTimeout(() => {
            if (this.overlay) {
                 this.overlay.style.display = "none";
            }
            localStorage.setItem("walkthroughCompleted", "true");
        }, 300); // Match CSS transition duration

        // Clean up event listeners
        window.removeEventListener("resize", this.debouncedPositionTooltip);
        document.removeEventListener("keydown", this.handleEscape);

        // Re-apply normal text visibility rules if graph exists
        this.graph?.applyTextVisibilityRules();
    }
}

// Export the class
export default Walkthrough;