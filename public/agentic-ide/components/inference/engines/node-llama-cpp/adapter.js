'use strict';

function normalizeBaseUrl(input) {
  return String(input || 'http://127.0.0.1:8080').replace(/\/$/, '');
}

function sanitizeLlmText(text) {
  let out = String(text || '');
  out = out.replace(/<\|channel\>thought\s*/gi, '');
  out = out.replace(/<channel\|>\s*/gi, '');
  out = out.replace(/<think>[\s\S]*?<\/think>\s*/gi, '');
  out = out.replace(/^\s*\.\s*$/gm, '');
  out = out.replace(/\n{3,}/g, '\n\n').trim();
  return out;
}

function sanitizeCompletionPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const cloned = { ...payload };
  const keys = ['content', 'text', 'generated_text', 'response', 'completion'];
  keys.forEach((key) => {
    if (typeof cloned[key] === 'string') {
      cloned[key] = sanitizeLlmText(cloned[key]);
    }
  });
  return cloned;
}

function sanitizeText(text) {
  return String(text || '')
    .replace(/<\|channel\>thought\s*/gi, '')
    .replace(/<channel\|>\s*/gi, '')
    .replace(/<think>[\s\S]*?<\/think>\s*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractMessageText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((part) => {
      if (typeof part === 'string') return part;
      if (part && typeof part.text === 'string') return part.text;
      if (part && typeof part.content === 'string') return part.content;
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

function toMessages(payload) {
  if (Array.isArray(payload && payload.messages) && payload.messages.length) {
    return payload.messages
      .map((entry) => {
        const roleRaw = String((entry && entry.role) || '').toLowerCase();
        const role = roleRaw === 'system' || roleRaw === 'assistant' ? roleRaw : 'user';
        return {
          role,
          content: extractMessageText(entry && entry.content).trim(),
        };
      })
      .filter((entry) => entry.content.length > 0);
  }

  const prompt = String((payload && payload.prompt) || '').trim();
  return prompt ? [{ role: 'user', content: prompt }] : [];
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

function toPrompt(messages, context) {
  const isQwen = context && context.openAiModel && String(context.openAiModel).toLowerCase().includes('qwen');
  let out = '';

  if (isQwen) {
    for (const m of messages) {
      out += `<|im_start|>${m.role}\n${m.content}<|im_end|>\n`;
    }
    out += `<|im_start|>assistant\n`;
    return out;
  }

  for (const m of messages) {
    const role = m.role === 'assistant' ? 'model' : m.role;
    out += `<start_of_turn>${role}\n${m.content}<end_of_turn>\n`;
  }
  out += `<start_of_turn>model\n`;
  return out;
}

function buildChatPayload(payload, context, maxTokensFallback = 256) {
  const slotId = resolveSlotId(context);
  const messages = ensureSystemMessage(toMessages(payload), context.systemPrompt);
  return {
    model: context.openAiModel || 'gemma-4',
    prompt: toPrompt(messages, context),
    max_tokens: payload.max_tokens || maxTokensFallback,
    temperature: typeof payload.temperature === 'number' ? payload.temperature : 1.0,
    top_p: typeof payload.top_p === 'number' ? payload.top_p : 0.95,
    top_k: typeof payload.top_k === 'number' ? payload.top_k : 64,
    cache_prompt: false,
    id_slot: slotId,
    reasoning_format: 'none',
    reasoning_in_content: false,
    stream: false,
  };
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
    try {
      return sanitizeCompletionPayload(JSON.parse(bodyText));
    } catch {
      return { text: sanitizeLlmText(bodyText) };
    }
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

function createNodeLlamaCppEngine() {
  return {
    getDescriptor() {
      return {
        id: 'node-llama-cpp',
        label: 'node-llama-cpp (llama.cpp compatible)',
        environment: 'node',
        canInfer: true,
        supportsGguf: true,
      };
    },

    async probe(context) {
      const endpoint = normalizeBaseUrl(context.llmEndpoint);
      try {
        await postJson(
          `${endpoint}/completion`,
          buildChatPayload(
            { messages: [{ role: 'user', content: 'ping' }], max_tokens: 1, temperature: 0, top_p: 1.0 },
            context,
            1
          ),
          6000
        );
        return {
          available: true,
          canInfer: true,
          reason: null,
          details: { endpoint },
        };
      } catch (error) {
        return {
          available: false,
          canInfer: true,
          reason: error && error.message ? error.message : String(error),
          details: { endpoint },
        };
      }
    },

    async complete(payload, context) {
      const endpoint = normalizeBaseUrl(context.llmEndpoint);
      const slotId = resolveSlotId(context);
      await eraseSlot(endpoint, slotId);

      const data = await postJson(
        `${endpoint}/completion`,
        buildChatPayload(payload, context, 256)
      );

      const message = data && data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message
        : null;

      const content = message
        ? (message.content || message.reasoning_content || '')
        : (data && (data.content || data.text || data.generated_text || ''));

      const clean = sanitizeText(content);
      return {
        text: clean,
        content: clean,
        finish_reason: data && data.choices && data.choices[0] ? data.choices[0].finish_reason : 'stop',
        usage: data ? data.usage || null : null,
      };
    },
  };
}

module.exports = {
  createNodeLlamaCppEngine,
};
