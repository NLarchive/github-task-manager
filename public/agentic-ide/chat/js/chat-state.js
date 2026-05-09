export const STORE_KEY = 'agentic-chat-lab-v2';

export function createDefaultState() {
  return {
    config: {
      endpoint: 'http://127.0.0.1:3131',
      backend: 'llama-server-openai',
      temperature: 0.2,
      top_p: 0.95,
      top_k: 40,
      max_tokens: 1024,
      response_format: 'text',
      include_history: false,
      history_window: 8,
      include_runtime: false,
      rag_enabled: false,
      rag_k: 5,
      prompt_profile_id: 'clean-base',
      agent_profile_id: 'none',
      tool_profile_id: 'none',
      test_profile_id: 'none',
      parameter_profile_id: 'balanced',
      system_prompt_override: '',
      edit_resets: true,
      auto_scroll: true,
      memory_eval_name: '',
      memory_keypoints: '',
      memory_deductions: ''
    },
    modelId: '',
    models: [],
    history: [],
    files: [],
    logs: [],
    testResults: [],
    catalog: { prompts: [], agents: [], tools: [], tests: [], parameterProfiles: [] }
  };
}

export function loadState() {
  const state = createDefaultState();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return state;
    const parsed = JSON.parse(raw);
    return {
      ...state,
      ...parsed,
      config: { ...state.config, ...(parsed.config || {}) },
      history: Array.isArray(parsed.history) ? parsed.history : [],
      files: Array.isArray(parsed.files) ? parsed.files : [],
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      testResults: Array.isArray(parsed.testResults) ? parsed.testResults : []
    };
  } catch {
    return state;
  }
}

export function saveState(state) {
  const payload = {
    config: state.config,
    modelId: state.modelId,
    history: state.history.slice(-80),
    files: state.files.slice(0, 20),
    logs: state.logs.slice(-400),
    testResults: state.testResults.slice(-200)
  };
  localStorage.setItem(STORE_KEY, JSON.stringify(payload));
}
