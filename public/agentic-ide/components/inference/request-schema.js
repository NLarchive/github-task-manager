'use strict';

const DEFAULTS = {
  temperature: 0.2,
  top_p: 0.95,
  top_k: 64,
  max_tokens: 512,
  repeat_penalty: 1.0,
  response_format: 'text',
  rag_enabled: false,
  rag_k: 5,
};

function toFiniteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function extractTextFromMessageContent(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((part) => {
      if (typeof part === 'string') return part;
      if (!part || typeof part !== 'object') return '';
      if (typeof part.text === 'string') return part.text;
      if (typeof part.content === 'string') return part.content;
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

function normalizeRole(role) {
  const normalized = String(role || '').toLowerCase();
  if (normalized === 'assistant' || normalized === 'system' || normalized === 'user') {
    return normalized;
  }
  return 'user';
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages) || !messages.length) return [];
  return messages
    .map((entry) => ({
      role: normalizeRole(entry && entry.role),
      content: extractTextFromMessageContent(entry && entry.content),
    }))
    .filter((entry) => entry.content.trim().length > 0);
}

function buildPromptFromMessages(messages) {
  if (!Array.isArray(messages) || !messages.length) return '';
  return messages
    .map((entry) => {
      const roleLabel = entry.role === 'system'
        ? 'System'
        : (entry.role === 'assistant' ? 'Assistant' : 'User');
      return `${roleLabel}:\n${entry.content}`;
    })
    .join('\n\n')
    .trim();
}

function normalizeStop(stop) {
  if (!Array.isArray(stop)) return [];
  return stop
    .map((entry) => String(entry || '').trim())
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeInferenceRequest(payload = {}) {
  const messages = normalizeMessages(payload.messages);
  const explicitPrompt = typeof payload.prompt === 'string' ? payload.prompt.trim() : '';
  const prompt = explicitPrompt || buildPromptFromMessages(messages);
  const responseFormatRaw = String(payload.response_format || DEFAULTS.response_format).toLowerCase();
  const response_format = ['text', 'markdown', 'json'].includes(responseFormatRaw)
    ? responseFormatRaw
    : DEFAULTS.response_format;

  return {
    engineId: String(payload.engineId || payload.backend || payload.inference_engine || '').trim(),
    model: typeof payload.model === 'string' ? payload.model.trim() : '',
    messages,
    prompt,
    temperature: clamp(toFiniteNumber(payload.temperature, DEFAULTS.temperature), 0, 2),
    top_p: clamp(toFiniteNumber(payload.top_p, DEFAULTS.top_p), 0, 1),
    top_k: Math.max(1, toInteger(payload.top_k, DEFAULTS.top_k)),
    max_tokens: Math.max(1, toInteger(payload.max_tokens, DEFAULTS.max_tokens)),
    repeat_penalty: Math.max(0, toFiniteNumber(payload.repeat_penalty, DEFAULTS.repeat_penalty)),
    response_format,
    rag_enabled: Boolean(payload.rag_enabled),
    rag_k: Math.max(1, toInteger(payload.rag_k, DEFAULTS.rag_k)),
    stop: normalizeStop(payload.stop),
    stream: false,
  };
}

module.exports = {
  DEFAULTS,
  normalizeInferenceRequest,
  normalizeMessages,
  buildPromptFromMessages,
};
