function analyzeAssistantTextQuality(text) {
  const raw = String(text || '').trim();
  if (!raw) return { passed: false, reason: 'empty response' };
  if (raw.length < 24) return { passed: false, reason: 'response too short' };

  const words = raw.toLowerCase().split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words);
  const uniqueRatio = words.length ? uniqueWords.size / words.length : 0;
  const alphaNumCount = (raw.match(/[A-Za-z0-9]/g) || []).length;
  const punctuationCount = (raw.match(/[!?.,;:_\-]/g) || []).length;
  const repeatedCharRun = /(.)\1{6,}/.test(raw);
  const repeatedWordRun = /\b(\w+)\b(?:\s+\1){4,}/i.test(raw);

  if (alphaNumCount < 8) return { passed: false, reason: 'insufficient alphanumeric content' };
  if (repeatedCharRun || repeatedWordRun) return { passed: false, reason: 'repetitive pattern detected' };
  if (words.length >= 12 && uniqueRatio < 0.35) return { passed: false, reason: 'low lexical diversity' };
  if (raw.length >= 40 && punctuationCount / raw.length > 0.4) return { passed: false, reason: 'punctuation-heavy output' };

  return {
    passed: true,
    metrics: {
      length: raw.length,
      words: words.length,
      uniqueRatio: Number(uniqueRatio.toFixed(2))
    }
  };
}

export function runChatSurfaceChecks(ui, state) {
  const checks = [];
  const push = (name, passed, details = {}) => checks.push({ name, passed: !!passed, details });

  push('chat input exists', !!ui.chatInput);
  push('send button exists', !!ui.btnSend);
  push('thread exists', !!ui.thread);
  push('memory evaluation section exists', !!document.body.textContent.includes('Memory Evaluation'));
  push('clean default has no history', state.config.include_history === false);
  push('clean default has no forced system prompt', !state.config.system_prompt_override);
  push('catalog prompts loaded', Array.isArray(state.catalog.prompts) && state.catalog.prompts.length > 0);
  push('catalog agents loaded', Array.isArray(state.catalog.agents) && state.catalog.agents.length > 0);
  push('catalog tools loaded', Array.isArray(state.catalog.tools) && state.catalog.tools.length > 0);

  const backendOptions = Array.from(ui.cfg?.backend?.options || []).map((option) => option.value);
  const selectedBackend = String(state.config.backend || '');
  push('selected backend exists in selector options', !!selectedBackend && backendOptions.includes(selectedBackend), {
    selectedBackend,
    backendOptions,
  });
  push('backend selector has at least one engine option', backendOptions.length > 0, { backendOptions });
  push('backend options are unique', new Set(backendOptions).size === backendOptions.length, { backendOptions });

  const schemaFields = ['temperature', 'top_p', 'top_k', 'max_tokens', 'response_format'];
  const schemaFieldChecks = schemaFields.map((field) => {
    const value = state.config[field];
    const present = typeof value !== 'undefined' && value !== null && value !== '';
    return { field, present, value };
  });
  const missingSchemaFields = schemaFieldChecks.filter((entry) => !entry.present).map((entry) => entry.field);
  push('inference schema fields are present in chat config', missingSchemaFields.length === 0, {
    missingSchemaFields,
    schemaFieldChecks,
  });

  const assistantEntries = (state.history || []).filter((entry) => entry?.role === 'assistant' && String(entry.content || '').trim());
  if (assistantEntries.length) {
    const lastAssistant = assistantEntries[assistantEntries.length - 1];
    const analysis = analyzeAssistantTextQuality(lastAssistant.content);
    push('last assistant response looks meaningful', analysis.passed, analysis);
  } else {
    push('assistant response quality check skipped (no assistant messages yet)', true, { skipped: true });
  }

  return checks;
}
