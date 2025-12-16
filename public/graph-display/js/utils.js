 
/**
 * Utility functions for color manipulation, contrast checking, and debouncing.
 */

/**
 * Debounce function delays execution until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @returns {Function} The debounced function.
 */
export function debounce(func, wait) {
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

/**
 * Calculates the relative luminance of a color.
 * @param {string} hexColor - Color in hex format (e.g., "#RRGGBB").
 * @returns {number} Relative luminance (0-1).
 */
function getLuminance(hexColor) {
    if (!hexColor || !/^#[0-9A-F]{6}$/i.test(hexColor)) {
        // console.warn(`Invalid hex color for luminance: ${hexColor}. Returning 0.`);
        return 0; // Treat invalid colors as black for safety
    }
    const rgb = parseInt(hexColor.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;

    const srgb = [r, g, b].map(val => {
        const s = val / 255.0;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Calculates the contrast ratio between two colors.
 * @param {string} hexColor1 - First color in hex format.
 * @param {string} hexColor2 - Second color in hex format.
 * @returns {number} Contrast ratio.
 */
function getContrast(hexColor1, hexColor2) {
    const lum1 = getLuminance(hexColor1);
    const lum2 = getLuminance(hexColor2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Determines whether light or dark text provides better contrast against a background color.
 * Targets WCAG AA (4.5:1) for normal text.
 * @param {string} backgroundHex - Background color in hex format.
 * @param {string} lightTextHex - Hex code for light text (e.g., '#FFFFFF').
 * @param {string} darkTextHex - Hex code for dark text (e.g., '#000000').
 * @returns {'text-light' | 'text-dark'} The CSS class name for the text color with better contrast.
 */
export function getContrastingTextColorClass(backgroundHex, lightTextHex = '#f0f0f0', darkTextHex = '#333333') {
    if (!backgroundHex) {
        // console.warn("Background hex missing for contrast check. Defaulting to dark text.");
        return 'text-dark';
    }
    const contrastWithLight = getContrast(backgroundHex, lightTextHex);
    const contrastWithDark = getContrast(backgroundHex, darkTextHex);

    // WCAG AA threshold for normal text
    const threshold = 4.5;

    // Prefer dark text if both meet the threshold and dark has sufficient contrast
    if (contrastWithDark >= threshold && contrastWithLight >= threshold) {
        // If dark text is significantly more contrasting, use it. Otherwise, might prefer light on dark backgrounds.
        // This is subjective, let's favor the one with higher contrast.
        return contrastWithDark >= contrastWithLight ? 'text-dark' : 'text-light';
    }
    // If only dark text meets threshold
    else if (contrastWithDark >= threshold) {
        return 'text-dark';
    }
    // If only light text meets threshold
    else if (contrastWithLight >= threshold) {
        return 'text-light';
    }
    // If NEITHER meets threshold, return the one with HIGHER contrast (best effort)
    else {
        // console.warn(`Insufficient contrast for ${backgroundHex} with both ${lightTextHex} (${contrastWithLight.toFixed(2)}) and ${darkTextHex} (${contrastWithDark.toFixed(2)}). Choosing higher.`);
        return contrastWithDark >= contrastWithLight ? 'text-dark' : 'text-light';
    }
}


/**
 * Generates an array of color tones (hex strings) starting from a base color.
 * Uses d3.color for manipulation. Ensures valid hex output.
 * @param {string} baseHex - The starting color in hex format (e.g., "#ff0000").
 * @param {number} count - The number of variations needed.
 * @param {number} [step=0.7] - The factor for d3.brighter/darker.
 * @param {'brighter'|'darker'} [direction='brighter'] - Direction of toning.
 * @param {string} fallbackHex - Fallback color if generation fails.
 * @returns {string[]} An array of hex color strings.
 */
export function generateColorTones(baseHex, count, step = 0.7, direction = 'brighter', fallbackHex = '#aabbc8') {
    if (count <= 0) return [];

    const tones = [];
    let baseColor;
    try {
        baseColor = d3.color(baseHex);
        if (!baseColor) throw new Error("Invalid base color object");
        tones.push(baseColor.formatHex()); // Add valid base color first
    } catch (e) {
        console.error(`Invalid baseHex color: ${baseHex}. Using fallback ${fallbackHex}.`, e);
        // Fill the array with fallbacks if base is invalid
        return Array(count).fill(fallbackHex);
    }

    if (count === 1) return tones; // Only base color needed

    const method = direction === 'darker' ? 'darker' : 'brighter';

    for (let i = 1; i < count; i++) {
        try {
            // Apply brightening/darkening progressively based on the *original* base
            const tonedColor = baseColor[method](step * i);
            if (!tonedColor) throw new Error("Toning resulted in invalid color");
            tones.push(tonedColor.formatHex());
        } catch (e) {
             console.warn(`Error generating tone ${i} for base ${baseHex}. Using fallback ${fallbackHex}.`, e);
             tones.push(fallbackHex); // Add fallback if toning fails
        }
    }
    return tones;
}