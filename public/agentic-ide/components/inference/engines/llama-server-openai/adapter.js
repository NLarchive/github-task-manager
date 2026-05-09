'use strict';

function normalizeBaseUrl(input) {
  return String(input || 'http://127.0.0.1:8080').replace(/\/$/, '');
}

function toMessages(payload) {
  if (Array.isArray(payload.messages) && payload.messages.length) {
    return payload.messages;
  }
  return [
    {
      role: 'user',
      content: String(payload.prompt || ''),
    },
  ];
}

function ensureSystemMessage(messages, systemPrompt) {
  const safeMessages = Array.isArray(messages) ? messages : [];
  if (safeMessages.some((entry) => entry && entry.role === 'system')) {
    return safeMessages;
  }
  const content = String(systemPrompt || 'You are a concise, helpful assistant.').trim();
  return [{ role: 'system', content }, ...safeMessages];
}

function resolveSlotId(context) {
  return Number.isFinite(Number(context.idSlot))
    ? Number(context.idSlot)
    : -1;
}

function buildChatPayload(payload, context, maxTokensFallback = 1024) {
  const messages = ensureSystemMessage(toMessages(payload), context.systemPrompt);
  const slotId = resolveSlotId(context);
  return {
    model: context.openAiModel || 'gemma-4',
    messages,
    temperature: typeof payload.temperature === 'number' ? payload.temperature : 1.0,
    top_p: typeof payload.top_p === 'number' ? payload.top_p : 0.95,
    top_k: typeof payload.top_k === 'number' ? payload.top_k : 64,
    max_tokens: payload.max_tokens || maxTokensFallback,
    chat_template_kwargs: { enable_thinking: false },
    reasoning_format: 'none',
    reasoning_in_content: false,
    // Avoid stale KV/context bleed between separate chat turns.
    cache_prompt: false,
    id_slot: slotId,
    stream: false,
  };
}

function sanitizeText(text) {
  return String(text || '')
    .replace(/<\|channel\>thought\s*/gi, '')
    .replace(/<channel\|>\s*/gi, '')
    .replace(/<think>[\s\S]*?<\/think>\s*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function postJson(url, payload, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const bodyText = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${bodyText}`);
    }
    return JSON.parse(bodyText);
  } finally {
    clearTimeout(timer);
  }
}

async function eraseSlot(endpoint, slotId) {
  if (!Number.isFinite(slotId) || slotId < 0) return;
  // Try both known llama.cpp slot erase API shapes for compatibility across builds.
  try {
    await postJson(`${endpoint}/slots/${slotId}`, { action: 'erase' }, 3000);
    return;
  } catch {
    // no-op
  }
  try {
    await postJson(`${endpoint}/slots/${slotId}?action=erase`, {}, 3000);
  } catch {
    // non-fatal — server may not support slots endpoint
  }
}

function createLlamaServerOpenAiEngine() {
  return {
    getDescriptor() {
      return {
        id: 'llama-server-openai',
        label: 'llama-server OpenAI API',
        environment: 'node',
        canInfer: true,
        supportsGguf: true,
      };
    },

    async probe(context) {
      const endpoint = normalizeBaseUrl(context.llmEndpoint);
      try {
        await postJson(
          `${endpoint}/v1/chat/completions`,
          buildChatPayload(
            { messages: [{ role: 'user', content: 'ping' }], max_tokens: 1, temperature: 0, top_p: 1.0 },
            context,
            1
          ),
          7000
        );
        return {
          available: true,
          canInfer: true,
          reason: null,
          details: { endpoint: `${endpoint}/v1/chat/completions` },
        };
      } catch (error) {
        return {
          available: false,
          canInfer: true,
          reason: error && error.message ? error.message : String(error),
          details: { endpoint: `${endpoint}/v1/chat/completions` },
        };
      }
    },

    async complete(payload, context) {
      const endpoint = normalizeBaseUrl(context.llmEndpoint);
      const slotId = resolveSlotId(context);
      await eraseSlot(endpoint, slotId);

      const data = await postJson(
        `${endpoint}/v1/chat/completions`,
        buildChatPayload(payload, context, 1024)
      );

      const message = data && data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message
        : null;

      const content = message
        ? (message.content || message.reasoning_content || '')
        : '';

      return {
        text: sanitizeText(content),
        content: sanitizeText(content),
        finish_reason: data && data.choices && data.choices[0] ? data.choices[0].finish_reason : 'stop',
        usage: data ? data.usage || null : null,
      };
    },
  };
}

module.exports = {
  createLlamaServerOpenAiEngine,
};
