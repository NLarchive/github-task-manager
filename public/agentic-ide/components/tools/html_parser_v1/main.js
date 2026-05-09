/**
 * main.js — html_parser_v1
 *
 * Parses an HTML string into a structured document object.
 *
 * Inputs:  html {string}
 * Outputs: doc  {title, headings, paragraphs, links}
 */

const STRIP = /<[^>]+>/g;
const strip = s => s.replace(STRIP, '').trim();

/**
 * @param {string} html
 * @returns {{title:string, headings:string[], paragraphs:string[], links:Array<{text,href}>}}
 */
export function run(html = '') {
  if (!html) return { title: '', headings: [], paragraphs: [], links: [] };

  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title      = titleMatch ? strip(titleMatch[1]) : '';

  const headings = [...html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)]
    .map(m => strip(m[1]))
    .slice(0, 10);

  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => strip(m[1]))
    .filter(Boolean)
    .slice(0, 20);

  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map(m => ({ href: m[1], text: strip(m[2]) }))
    .slice(0, 30);

  return { title, headings, paragraphs, links };
}
