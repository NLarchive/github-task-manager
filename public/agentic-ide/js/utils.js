import { CT } from './types.js';
import { S } from './state.js';

// ─── UTILITIES ────────────────────────────────────────────────────────────
export const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export const ct  = t => CT[t] || CT.tool;
export const uid = p => `${p}_${Date.now().toString(36)}`;
export const childrenOf  = scope => Object.values(S.nodes).filter(n => n.parent === scope);
export const structuredCloneSafe = value => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};
export const edgesInScope = scope => {
  const ids = new Set(childrenOf(scope).map(n => n.id));
  return Object.values(S.edges).filter(e => ids.has(e.from) || ids.has(e.to));
};

export function parsePorts(str) {
  return (str||'').split(',').map(s => {
    const [n,t] = (s.trim()||'input:string').split(':');
    return {n:(n||'').trim(), t:(t||'string').trim()};
  }).filter(p => p.n);
}

export function toast(msg, dur=2200) {
  const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), dur);
}

export function mkSvg(tag) { return document.createElementNS('http://www.w3.org/2000/svg',tag); }

export function svgTxt(p,text,x,y,sz,fill,w,anchor) {
  const t=mkSvg('text'); t.setAttribute('x',x); t.setAttribute('y',y); t.setAttribute('font-size',sz);
  t.setAttribute('fill',fill); t.setAttribute('font-weight',w); t.setAttribute('text-anchor',anchor);
  t.setAttribute('font-family','var(--sans)'); t.textContent=String(text||'').slice(0,22); p.appendChild(t);
}

export function svgPt(e) {
  const svg=document.getElementById('g'); const pt=svg.createSVGPoint();
  pt.x=e.clientX; pt.y=e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse());
}

const BRIDGE_BASE = 'http://localhost:3131';

/**
 * Fetch file content — tries bridge first (supports write-back),
 * falls back to main dev server static serving.
 * Returns the file content string, or null on error.
 */
export async function loadFileContent(nodePath, filename) {
  const key = `${nodePath}::${filename}`;
  if (S.fileContents[key] !== undefined) return S.fileContents[key];
  const rel = `${nodePath}/${filename}`;
  const staticUrl = new URL(rel, window.location.href).toString();
  const candidates = [
    `${BRIDGE_BASE}/api/file?path=${encodeURIComponent(rel)}`,
    staticUrl,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const text = await res.text();
      S.fileContents[key] = text;
      return text;
    } catch {}
  }
  return null;
}
