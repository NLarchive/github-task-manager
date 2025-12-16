/**
 * Generates HTML for a classic CV view based on graph data.
 * Uses CSS classes for color styling based on node properties.
 */

// --- Configuration ---
const defaultCvConfig = {
    profileNodeLayer: 0,
    sections: [
        // Keys must match parentNodeId(s) or categoryNodeIds for styling
        { key: 'experience', title: 'Professional Experience', parentNodeId: 'experience', relationship: 'HAS_SUBCATEGORY', listClass: 'cv-list cv-list-no-bullets', itemClass: 'cv-item cv-experience-item', sort: 'chrono-reverse' },
        { key: 'education', title: 'Education & Certifications', parentNodeId: 'education', relationship: 'HAS_SUBCATEGORY', listClass: 'cv-list cv-list-no-bullets', itemClass: 'cv-item cv-education-item', sort: 'alpha' },
        { key: 'skills', title: 'Core Expertise & Skills', categoryNodeIds: ['core-expertise', 'tech-skills', 'leadership-mgmt'], relationship: 'HAS_SUBCATEGORY', containerClass: 'skills-container', categoryClass: 'cv-skill-category', categoryListClass: 'cv-list cv-skill-list', itemClass: 'cv-item cv-skill-item', sort: 'alpha' }, // Note: categoryListClass added
        { key: 'accomplishments', title: 'Key Accomplishments / Impact', parentNodeIds: ['business-impact', 'process-impact', 'people-impact'], relationship: 'HAS_SUBCATEGORY', listClass: 'cv-list cv-accomplishments-list', itemClass: 'cv-item cv-accomplishment-item', sort: 'alpha' },
        { key: 'community', title: 'Community & Teaching', parentNodeId: 'community-impact', relationship: 'HAS_SUBCATEGORY', listClass: 'cv-list cv-list-no-bullets', itemClass: 'cv-item cv-community-item', sort: 'alpha' }
    ]
    // Removed fallback colors, rely on CSS
};

// --- Helper Functions ---
function findChildNodes(parentNodeId, relationshipType, allLinks, nodeMap) {
    if (!parentNodeId || !relationshipType || !allLinks || !nodeMap) {
        console.warn("CV findChildNodes: Missing required arguments.");
        return [];
    }
    const children = [];
    for (const link of allLinks) {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;

        if (sourceId === parentNodeId && link.type === relationshipType) {
            const targetNode = nodeMap.get(targetId);
            if (targetNode) {
                children.push(targetNode);
            } else {
                console.warn(`CV findChildNodes: Target node ${targetId} not found in nodeMap for link from ${parentNodeId}.`);
            }
        }
    }
    return children;
}

function sortNodes(nodesToSort, method, details) {
     if (!Array.isArray(nodesToSort)) return [];
     const getNodeTitle = (node) => details[node?.id]?.title || node?.label || node?.id || '';

     if (method === 'alpha') {
         nodesToSort.sort((a, b) => getNodeTitle(a).localeCompare(getNodeTitle(b)));
     } else if (method === 'chrono-reverse') {
         nodesToSort.sort((a, b) => {
             const titleA = getNodeTitle(a);
             const titleB = getNodeTitle(b);
             const yearRegex = /\((\d{2,4})(?:-(\d{2,4}|Pres(?:ent)?))?\)/; // Match Pres or Present
             const yearMatchA = titleA.match(yearRegex);
             const yearMatchB = titleB.match(yearRegex);
             const presentA = /\(.*\b(?:Pres|Present)\b.*\)/i.test(titleA); // Check for Pres/Present case-insensitively
             const presentB = /\(.*\b(?:Pres|Present)\b.*\)/i.test(titleB);

             if (!yearMatchA && !yearMatchB) return titleA.localeCompare(titleB); // Fallback to alpha if no years
             if (!yearMatchA) return 1; // No year A goes last
             if (!yearMatchB) return -1; // No year B goes last

             const getFullYear = (yearStr) => {
                 if (!yearStr) return 0;
                 const year = parseInt(yearStr);
                 if (isNaN(year)) return 0;
                 if (yearStr.length === 2) {
                     return year > 50 ? 1900 + year : 2000 + year; // Simple 2-digit year logic
                 }
                 return year;
             };

             // Determine end year (present = Infinity)
             const endYearA = presentA ? Infinity : getFullYear(yearMatchA?.[2] || yearMatchA?.[1]);
             const endYearB = presentB ? Infinity : getFullYear(yearMatchB?.[2] || yearMatchB?.[1]);

             if (endYearA !== endYearB) return endYearB - endYearA; // Sort by end year descending

             // If end years are the same, sort by start year descending
             const startYearA = getFullYear(yearMatchA?.[1]);
             const startYearB = getFullYear(yearMatchB?.[1]);

             if (startYearA !== startYearB) return startYearB - startYearA;

             // If all years are the same, fallback to alpha sort
             return titleA.localeCompare(titleB);
         });
     } else if (Array.isArray(method)) { // Sort by a predefined order array
         nodesToSort.sort((a, b) => {
             const indexA = method.indexOf(a.id);
             const indexB = method.indexOf(b.id);
             if (indexA !== -1 && indexB !== -1) return indexA - indexB; // Both found, sort by index
             if (indexA !== -1) return -1; // Only A found, A comes first
             if (indexB !== -1) return 1; // Only B found, B comes first
             return getNodeTitle(a).localeCompare(getNodeTitle(b)); // Neither found, fallback alpha
         });
     }
     // If method is unknown, default to alpha sort
     else if (method !== 'alpha' && method !== 'chrono-reverse' && !Array.isArray(method)) {
          console.warn(`[CV Sort] Unknown sort method "${method}". Defaulting to alpha.`);
          nodesToSort.sort((a, b) => getNodeTitle(a).localeCompare(getNodeTitle(b)));
     }
 }

// --- Section Generation Functions ---

/**
 * Generates HTML list items for a generic section.
 * Applies CSS classes for styling based on node properties.
 * @param {object} sectionConfig - Configuration for the section.
 * @param {Array} allLinks - All graph links.
 * @param {Map<string, object>} nodeMap - Map of node ID to node object.
 * @param {object} details - All node details data.
 * @returns {string} HTML string for list items.
 */
function generateGenericSectionItems(sectionConfig, allLinks, nodeMap, details) {
    const parentIds = Array.isArray(sectionConfig.parentNodeIds) ? sectionConfig.parentNodeIds : [sectionConfig.parentNodeId];
    if (!parentIds.some(id => id)) {
        console.warn(`[CV] No parentNodeId(s) for section: ${sectionConfig.key}`);
        return `<li>Config error</li>`;
    }

    let childNodes = [];
    parentIds.forEach(pid => {
        if (pid) childNodes = childNodes.concat(findChildNodes(pid, sectionConfig.relationship, allLinks, nodeMap));
    });

    if (!childNodes.length) return ''; // Omit empty sections

    sortNodes(childNodes, sectionConfig.sort || 'alpha', details);

    return childNodes.map(node => {
        const nodeId = node.id;
        const nodeDetails = details[nodeId];
        const title = nodeDetails?.title || node.label || nodeId;
        let itemsHtml = '';

        if (nodeDetails?.items?.length > 0) {
            itemsHtml = sectionConfig.key === 'accomplishments'
                ? `<ul class="cv-item-details">${nodeDetails.items.map(i => `<li>${i}</li>`).join('')}</ul>`
                : `<div class="cv-item-details">${nodeDetails.items.map(i => `<div>• ${i}</div>`).join('')}</div>`;
        } else if (!nodeDetails) {
            itemsHtml = `<div class="cv-item-details">(Details missing)</div>`;
        }

        // --- Determine Item Title (Strong Tag) Classes ---
        const titleClasses = [
            'item-title',
            `title-layer-${node.layer ?? 0}`, // Add layer class
            `color-variant-${node.colorVariantIndex ?? 0}`, // Add variant class
            node.textColorClass || 'text-dark' // Add text color class (default to dark)
        ].join(' ');
         // --- End Class Logic ---

        return `<li class="${sectionConfig.itemClass || 'cv-item'}">
                    <strong class="${titleClasses}">${title}</strong>
                    ${itemsHtml}
                </li>`;
    }).join('');
}

/**
 * Generates HTML for the skills section.
 * Applies CSS classes for styling based on node properties.
 * @param {object} sectionConfig - Configuration for the section.
 * @param {Array} allLinks - All graph links.
 * @param {Map<string, object>} nodeMap - Map of node ID to node object.
 * @param {object} details - All node details data.
 * @returns {string} HTML string for the skills section content.
 */
function generateSkillsSectionInternal(sectionConfig, allLinks, nodeMap, details) {
    const categoryIds = sectionConfig.categoryNodeIds;
    if (!Array.isArray(categoryIds) || !categoryIds.length) {
        console.warn(`[CV] No categoryNodeIds for skills.`);
        return '<p>Skills config error.</p>';
    }

    let skillsHtml = '';
    categoryIds.forEach(catId => {
        const catNode = nodeMap.get(catId);
        const catDetails = details[catId];
        if (!catNode || !catDetails) {
            console.warn(`[CV] Skill category missing: ${catId}`);
            return;
        }

        const skillNodes = findChildNodes(catId, sectionConfig.relationship, allLinks, nodeMap);
        if (!skillNodes.length) return; // Skip empty categories

        sortNodes(skillNodes, sectionConfig.sort || 'alpha', details);

        const listHtml = skillNodes.map(node => {
            const nodeDetails = details[node.id];
            const title = nodeDetails?.title || node.label || node.id;
            return `<li class="${sectionConfig.itemClass || 'cv-skill-item'}">${title}</li>`;
        }).join('');

        // --- Determine Category Title (H4 Tag) Classes ---
        const categoryTitleClasses = [
            `title-layer-${catNode.layer ?? 0}`,
            `color-variant-${catNode.colorVariantIndex ?? 0}`,
            catNode.textColorClass || 'text-dark'
        ].join(' ');
         // --- End Class Logic ---

        skillsHtml += `<div class="${sectionConfig.categoryClass || 'cv-skill-category'}">
                           <h4 class="${categoryTitleClasses}">${catDetails.title || catNode.label}</h4>
                           <ul class="${sectionConfig.categoryListClass || 'cv-skill-list'}">${listHtml}</ul>
                       </div>`;
    });
    return skillsHtml || '<p>No skills details found.</p>'; // Fallback message
}

/**
 * Main function to generate and display the Classic CV in the popup.
 * Relies on nodes having layer, colorVariantIndex, and textColorClass properties.
 * @param {Array<object>} nodes - Processed graph nodes.
 * @param {Array<object>} links - Processed graph links.
 * @param {object} details - Node details data.
 * @param {object} [userConfig] - User configuration overrides (currently unused for styling).
 */
export function generateClassicCV(nodes, links, details, userConfig) {
    console.log("[CV DEBUG] --- generateClassicCV called (w/ CSS Classes) ---");
    const popupContent = document.getElementById("popup-content");
    const popup = document.getElementById("popup");
    if (!popupContent || !popup || !nodes || !links || !details) {
        console.error("[CV DEBUG] Cannot generate CV: Missing elements or data.", { nodes, links, details });
        if (popupContent) popupContent.innerHTML = "<p class='cv-error'>Error generating CV data.</p>";
        if (popup) {
            popup.style.display = "flex";
            requestAnimationFrame(() => popup.classList.add("visible"));
        }
        return;
    }

    const config = { ...defaultCvConfig, ...(userConfig || {}) };
    config.sections = config.sections || [];

    const profileNode = nodes.find(n => n.layer === config.profileNodeLayer);
    if (!profileNode?.id || !details[profileNode.id]) {
         console.error("[CV DEBUG] Profile node/details missing.");
         popupContent.innerHTML = `<p class='cv-error'>Error: Profile data missing.</p>`;
         popup.style.display = "flex";
         requestAnimationFrame(() => popup.classList.add("visible"));
         return;
    }
    const profileDetails = details[profileNode.id];

    // --- Determine Profile Classes ---
    const profileTitleClasses = [
        `title-layer-${profileNode.layer ?? 0}`,
        `color-variant-${profileNode.colorVariantIndex ?? 0}`,
        profileNode.textColorClass || 'text-dark'
    ].join(' ');
    const profilePhotoBorderClass = `border-layer-${profileNode.layer ?? 0}-variant-${profileNode.colorVariantIndex ?? 0}`;

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // --- Generate Sections HTML ---
    const sectionsHTML = config.sections.map(sectionConfig => {
        let sectionContentHtml = '';

        // --- Determine Main Section Title (H3) Classes ---
        let sectionTitleClasses = 'cv-section-title'; // Base class
        // Find the primary parent node for styling the section title
        const primaryParentId = Array.isArray(sectionConfig.parentNodeIds) ? sectionConfig.parentNodeIds[0] : sectionConfig.parentNodeId;
        const primaryParentNode = primaryParentId ? nodeMap.get(primaryParentId) : null;

        if (primaryParentNode) {
             sectionTitleClasses += ` title-layer-${primaryParentNode.layer ?? 0} color-variant-${primaryParentNode.colorVariantIndex ?? 0} ${primaryParentNode.textColorClass || 'text-dark'}`;
        } else {
            // Fallback if primary parent not found (e.g., skills section uses category IDs)
            // Or use a generic section title style
            console.warn(`[CV] Could not find primary parent node for styling section title: ${sectionConfig.key}`);
            // Optionally add a default style class here
             sectionTitleClasses += ` text-dark`; // Default to dark text
        }
        // --- End H3 Class Logic ---

        if (sectionConfig.key === 'skills') {
            sectionContentHtml = generateSkillsSectionInternal(sectionConfig, links, nodeMap, details); // No styling map needed
            sectionContentHtml = `<div class="${sectionConfig.containerClass || 'skills-container'}">${sectionContentHtml}</div>`;
        } else {
            const itemsHtml = generateGenericSectionItems(sectionConfig, links, nodeMap, details); // No styling map needed
            if (itemsHtml) {
                 sectionContentHtml = `<ul class="${sectionConfig.listClass || 'cv-list'}">${itemsHtml}</ul>`;
            } else {
                 sectionContentHtml = ''; // Ensure empty if no items
            }
        }

        if (!sectionContentHtml) return ''; // Skip rendering empty section entirely

        return `<section class="cv-section cv-section-${sectionConfig.key}">
                    <h3 class="${sectionTitleClasses}">${sectionConfig.title}</h3>
                    ${sectionContentHtml}
                </section>`;
    }).join('');

    // --- Assemble Final CV HTML ---
    const summaryHtml = profileDetails.items?.length ? profileDetails.items.join('<br>') : 'Summary unavailable.';
    const photoHtml = profileDetails.photoUrl ? `<img src="${profileDetails.photoUrl}" alt="${profileDetails.title || 'Profile'}" class="profile-photo ${profilePhotoBorderClass}">` : '';

    const cvHTML = `
        <div class="cv-profile-header">
             <h2 class="${profileTitleClasses}">${profileDetails.title || 'Profile'}</h2>
             <div class="cv-profile-body">
                 ${photoHtml}
                 <div class="cv-profile-summary">${summaryHtml}</div>
             </div>
        </div>
        ${sectionsHTML}`;

    // --- Display Popup ---
    popupContent.innerHTML = cvHTML;
    popup.style.display = "flex";
    requestAnimationFrame(() => {
        popup.classList.add("visible");
        const contentEl = popup.querySelector(".content");
        if (contentEl) contentEl.scrollTop = 0;
        popup.querySelector(".close-button")?.focus();
    });
    console.log("[CV DEBUG] --- CV Popup Displayed (w/ CSS Classes) ---");
}