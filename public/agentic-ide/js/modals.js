import { CT, TYPE_META, DEF_FILES } from './types.js';
import { S, saveState } from './state.js';
import { esc, ct, uid, parsePorts, childrenOf, toast } from './utils.js';
import { renderAll, renderInspector } from './render.js';

// ─── NODE MODAL ───────────────────────────────────────────────────────────
export function openNodeModal(editId=null) {
  S.editNodeId=editId;
  const n=editId?S.nodes[editId]:null;
  document.getElementById('nm-title').textContent=editId?'Edit Component':'Add Component';
  document.getElementById('nm-type').value=n?.type||'tool';
  document.getElementById('nm-id').value=n?.id||'';
  document.getElementById('nm-ver').value=n?.version||1;
  document.getElementById('nm-label').value=n?.label||'';
  document.getElementById('nm-desc').value=n?.desc||'';
  document.getElementById('nm-inputs').value=n?(n.inputs||[]).map(i=>i.n+':'+i.t).join(', '):'';
  document.getElementById('nm-outputs').value=n?(n.outputs||[]).map(o=>o.n+':'+o.t).join(', '):'';
  document.getElementById('nm-confirm').textContent=editId?'Save':'Create';
  updateNodeModalExtra(); document.getElementById('node-modal').hidden=false;
}

export function updateNodeModalExtra() {
  const type=document.getElementById('nm-type').value;
  const meta=TYPE_META[type]||[]; const editNode=S.editNodeId?S.nodes[S.editNodeId]:null;
  const wrap=document.getElementById('nm-extra-wrap'); const grid=document.getElementById('nm-extra');
  if (!meta.length) { wrap.hidden=true; return; }
  wrap.hidden=false; document.getElementById('nm-extra-title').textContent=`${type} fields`;
  grid.innerHTML=meta.map(({f,l,ph})=>`<div class="fl"><label>${esc(l)}</label>
    <input id="nmx-${f}" placeholder="${esc(ph||'')}" value="${esc(editNode?.meta?.[f]||'')}"></div>`).join('');
}

export function openEdgeModal() {
  const ch=childrenOf(S.scope);
  ['em-from','em-to'].forEach(sid=>{
    document.getElementById(sid).innerHTML=ch.map(n=>`<option value="${esc(n.id)}">${esc(n.label)}</option>`).join('');
  });
  document.getElementById('em-map').value=''; document.getElementById('em-tf').value=''; document.getElementById('em-cond').value='';
  document.getElementById('edge-modal').hidden=false;
}

// ─── MODAL EVENT WIRING (called once from main.js) ───────────────────────
export function wireModals() {
  document.getElementById('nm-type').addEventListener('change', updateNodeModalExtra);
  document.getElementById('nm-cancel').addEventListener('click', ()=>{ document.getElementById('node-modal').hidden=true; });
  document.getElementById('nm-confirm').addEventListener('click', ()=>{
    const type=document.getElementById('nm-type').value;
    const rawId=document.getElementById('nm-id').value.trim(); const id=(rawId||uid(type)).replace(/\s+/g,'_');
    const meta={}; (TYPE_META[type]||[]).forEach(({f})=>{ const el=document.getElementById(`nmx-${f}`); if(el) meta[f]=el.value; });
    const cx=40+Math.random()*240, cy=80+Math.random()*160;
    const prev=S.editNodeId?S.nodes[S.editNodeId]:null;
    const node={id,type,label:document.getElementById('nm-label').value.trim()||id,
      path:`components/${type}s/${id}`,desc:document.getElementById('nm-desc').value.trim(),
      version:parseInt(document.getElementById('nm-ver').value)||1,
      inputs:parsePorts(document.getElementById('nm-inputs').value),
      outputs:parsePorts(document.getElementById('nm-outputs').value),
      files:DEF_FILES[type]||['component.yaml'],tests:[DEF_FILES[type]?.find(f=>f.includes('test'))||'tests/unit.yaml'],
      children:prev?.children||[], edgeIds:prev?.edgeIds||[], meta,
      parent:prev?.parent||S.scope, x:prev?.x||cx, y:prev?.y||cy, w:130, h:50};
    if (S.editNodeId && S.editNodeId!==id) {
      const par=S.nodes[node.parent];
      if(par) par.children=par.children.map(c=>c===S.editNodeId?id:c);
      delete S.nodes[S.editNodeId];
    }
    S.nodes[id]=node;
    if (!S.editNodeId) { const par=S.nodes[S.scope]; if(par&&!par.children.includes(id)) par.children.push(id); }
    S.sel=id; S.selType='node'; S.editNodeId=null;
    saveState(); document.getElementById('node-modal').hidden=true; renderAll(); renderInspector(); toast((prev?'Updated':'Created')+` "${id}"`);
  });

  document.getElementById('em-cancel').addEventListener('click', ()=>{ document.getElementById('edge-modal').hidden=true; });
  document.getElementById('em-confirm').addEventListener('click', ()=>{
    const id='e_'+Date.now().toString(36);
    S.edges[id]={id, from:document.getElementById('em-from').value, to:document.getElementById('em-to').value,
      mapping:document.getElementById('em-map').value, transform:document.getElementById('em-tf').value,
      condition:document.getElementById('em-cond').value, type:document.getElementById('em-etype').value};
    saveState(); document.getElementById('edge-modal').hidden=true; renderAll(); toast('Edge added');
  });

  ['node-modal','edge-modal','import-modal'].forEach(id=>{
    document.getElementById(id).addEventListener('click', e=>{ if(e.target.id===id) e.target.hidden=true; });
  });
}
