/**
 * main.js — ui_renderer_v1
 *
 * Renders a structured document object as a self-contained HTML snippet.
 *
 * Inputs:  doc {title, headings, paragraphs, links}
 * Outputs: html {string}
 */

const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/**
 * @param {{title?:string, headings?:string[], paragraphs?:string[], links?:Array}} doc
 * @returns {string}
 */
export function run(doc) {
  if (!doc) return '<p>No data to display.</p>';

  const { title = '', headings = [], paragraphs = [], links = [] } = doc;
  const parts = [`<h2>${esc(title)}</h2>`];

  if (headings.length) {
    parts.push('<h3>Sections</h3><ul>');
    headings.slice(0, 5).forEach(h => parts.push(`  <li>${esc(h)}</li>`));
    parts.push('</ul>');
  }

  paragraphs.slice(0, 5).forEach(p => parts.push(`<p>${esc(p)}</p>`));

  if (links.length) {
    parts.push('<h3>References</h3><ul>');
    links.slice(0, 5).forEach(l => {
      const href = esc(l.href ?? '#');
      const text = esc(l.text ?? href);
      parts.push(`  <li><a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a></li>`);
    });
    parts.push('</ul>');
  }

  return parts.join('\n');
}
