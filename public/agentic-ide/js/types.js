// ─── COMPONENT TYPE REGISTRY ──────────────────────────────────────────────
export const CT = {
  workflow:  {fill:'#E6F1FB',stroke:'#378ADD',text:'#0C447C',text2:'#185FA5',icon:'⬡',badge:'b-workflow',dot:'#378ADD',composite:true},
  agent:     {fill:'#EEEDFE',stroke:'#7F77DD',text:'#3C3489',text2:'#534AB7',icon:'◎',badge:'b-agent',   dot:'#7F77DD'},
  subgraph:  {fill:'#FAEEDA',stroke:'#BA7517',text:'#633806',text2:'#854F0B',icon:'◈',badge:'b-sub',     dot:'#BA7517',composite:true},
  tool:      {fill:'#E1F5EE',stroke:'#1D9E75',text:'#085041',text2:'#0F6E56',icon:'◻',badge:'b-tool',    dot:'#1D9E75'},
  model:     {fill:'#FBEAF0',stroke:'#D4537E',text:'#72243E',text2:'#993556',icon:'◆',badge:'b-model',   dot:'#D4537E'},
  file:      {fill:'#EEF2F7',stroke:'#6B7280',text:'#1F2937',text2:'#4B5563',icon:'▤',badge:'b-file',    dot:'#6B7280'},
  prompt:    {fill:'#F0FAF7',stroke:'#0F766E',text:'#134E4A',text2:'#0F6E56',icon:'✎',badge:'b-prompt',  dot:'#0F766E'},
  skill:     {fill:'#F0FDF4',stroke:'#15803D',text:'#14532D',text2:'#166534',icon:'★',badge:'b-skill',   dot:'#15803D'},
  task:      {fill:'#F3F0FE',stroke:'#7C3AED',text:'#3B0764',text2:'#6D28D9',icon:'◷',badge:'b-task',    dot:'#7C3AED'},
  test:      {fill:'#FEF3C7',stroke:'#92400E',text:'#451A03',text2:'#78350F',icon:'✓',badge:'b-test',    dot:'#92400E'},
  benchmark: {fill:'#E0E7FF',stroke:'#1E40AF',text:'#1E3A5F',text2:'#1E40AF',icon:'⊕',badge:'b-bench',  dot:'#1E40AF'}
};

export const TYPE_META = {
  model:    [{f:'provider',l:'Provider',ph:'openai'},{f:'model_name',l:'Model name',ph:'gpt-4'},{f:'temperature',l:'Temperature',ph:'0.2'},{f:'max_tokens',l:'Max tokens',ph:'4096'},{f:'capabilities',l:'Capabilities',ph:'chat, tools'}],
  prompt:   [{f:'template',l:'Template file',ph:'prompts/my_v1.md'},{f:'variables',l:'Variables',ph:'text, context'},{f:'model_ref',l:'Model ref',ph:'gemma_model'},{f:'format',l:'Output format',ph:'json | text'}],
  tool:     [{f:'impl',l:'Implementation',ph:'tools/my_tool/main.py'},{f:'api_endpoint',l:'API endpoint',ph:'https://...'},{f:'auth',l:'Auth type',ph:'bearer | api_key | none'}],
  skill:    [{f:'domain',l:'Domain',ph:'reasoning | retrieval'},{f:'capability',l:'Capability level',ph:'basic | advanced'}],
  agent:    [{f:'model_ref',l:'Model ref',ph:'gemma_model'},{f:'memory',l:'Memory type',ph:'buffer | summary | vector'},{f:'planning',l:'Planning type',ph:'react | plan-act | none'},{f:'tool_refs',l:'Tool refs',ph:'web_search_tool,result_ranker'}],
  workflow: [{f:'entry',l:'Entry node',ph:'start_node_id'},{f:'state_schema',l:'State schema',ph:'state.py | state.ts'}],
  subgraph: [{f:'entry',l:'Entry node',ph:'start_node_id'}],
  task:     [{f:'agent_ref',l:'Agent ref',ph:'my_agent_v1'},{f:'success',l:'Success criteria',ph:'output != null'}],
  test:     [{f:'target',l:'Tests component',ph:'my_tool_v1'},{f:'test_type',l:'Test type',ph:'unit | smoke | contract'},{f:'assertions',l:'Assertions',ph:'output_not_empty'}],
  benchmark:[{f:'metrics',l:'Metrics',ph:'latency_p50, accuracy'},{f:'baseline',l:'Baseline',ph:'200ms, 0.85'}]
};

export const DEF_FILES = {
  workflow: ['workflow.json','state.js','tests/e2e.json'],
  agent:    ['schema.json','prompt.md','tests/behavior.json'],
  subgraph: ['graph.json','state.js','tests/snapshot.json'],
  tool:     ['main.js','schema.json','tests/unit.json'],
  model:    ['schema.json','.env.example','tests/health.json'],
  prompt:   ['prompt.md','schema.json'],
  file:     ['schema.json'],
  skill:    ['schema.json','main.js'],
  task:     ['task.json'],
  test:     ['test.json','fixtures.json'],
  benchmark:['benchmark.json','metrics.json']
};

export const CODE_TPL = {
  tool:  n=>JSON.stringify({ id:n.id, type:'tool', path:n.path, impl:n.meta?.impl||'main.js', inputs:n.inputs||[], outputs:n.outputs||[] }, null, 2),
  agent: n=>JSON.stringify({ id:n.id, type:'agent', path:n.path, model_ref:n.meta?.model_ref||'', memory_type:n.meta?.memory||'buffer', planning:n.meta?.planning||'react' }, null, 2),
  model: n=>JSON.stringify({ id:n.id, type:'model', path:n.path, provider:n.meta?.provider||'', model_name:n.meta?.model_name||'' }, null, 2),
  prompt:n=>`You are a helpful assistant.\n# Variables: ${n.meta?.variables||''}\n\n{{context}}\n\nTask: {{input}}\n\nRespond concisely.`
};
