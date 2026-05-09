/** Export helper and JSON preview wiring for Agentic IDE. */
import { S } from './state.js';
import { toast } from './utils.js';
import { renderAll } from './render.js';

/** Trigger a browser download for a JSON document. */
export function downloadJSON(json, filename) {
  const a=document.createElement('a'); a.href='data:application/json;charset=utf-8,'+encodeURIComponent(json);
  a.download=filename; a.click();
}

/** Wire export buttons for JSON preview, Graph Display conversion, and import. */
export function wireExport() {
  // Export JSON → schema preview (review before saving/copying)
  document.getElementById('btn-export').addEventListener('click', async ()=>{
    const jsonStr = JSON.stringify({nodes:S.nodes, edges:S.edges}, null, 2);
    const { openSchemaPreview } = await import('./schema-preview.js');
    openSchemaPreview('agentic-graph.json', jsonStr);
  });

  // → Graph Display: convert to node.tasks.json and preview
  document.getElementById('btn-export-gd').addEventListener('click', async ()=>{
    const today = new Date().toISOString().slice(0,10);
    const tasks = Object.values(S.nodes).map((n,i)=>({
      task_id: i+1, task_name: n.label||n.id, description: n.desc||'',
      status: 'Not Started', priority: 'Medium', category_name: n.type,
      start_date: today,
      end_date: new Date(Date.now()+7*86400000).toISOString().slice(0,10),
      estimated_hours: 8, tags: [n.type],
      dependencies: [], assigned_workers: [], parent_task_id: null,
      subtasks: [], attachments: [], links: [], comments: []
    }));
    const payload = {
      project: { name:'Agentic Workflow', start_date:today,
        end_date:new Date(Date.now()+90*86400000).toISOString().slice(0,10), status:'In Progress' },
      tasks
    };
    const { openSchemaPreview } = await import('./schema-preview.js');
    openSchemaPreview('node.tasks.json', JSON.stringify(payload, null, 2));
  });

  document.getElementById('btn-import').addEventListener('click', ()=>{
    document.getElementById('import-ta').value=''; document.getElementById('import-modal').hidden=false;
  });
  document.getElementById('im-cancel').addEventListener('click', ()=>{ document.getElementById('import-modal').hidden=true; });
  document.getElementById('im-confirm').addEventListener('click', ()=>{
    try {
      const parsed=JSON.parse(document.getElementById('import-ta').value);
      if (parsed.nodes && typeof parsed.nodes==='object') {
        S.nodes=parsed.nodes; S.edges=parsed.edges||{};
        S.scope='root'; S.crumbs=['root']; S.sel=null;
        // Save to persistence
        localStorage.setItem('agentic-graph-v1', JSON.stringify({nodes:S.nodes,edges:S.edges}));
        renderAll(); toast('Graph imported');
      } else toast('Invalid JSON — expected {nodes,edges}');
    } catch { toast('JSON parse error'); }
    document.getElementById('import-modal').hidden=true;
  });
}
