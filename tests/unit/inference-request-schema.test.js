const {
  normalizeInferenceRequest,
  buildPromptFromMessages,
} = require('../../public/agentic-ide/components/inference/request-schema');

describe('Inference Request Schema', () => {
  it('builds prompt text from chat messages when prompt is omitted', () => {
    const normalized = normalizeInferenceRequest({
      engineId: 'node-llama-cpp',
      messages: [
        { role: 'system', content: 'You are concise.' },
        { role: 'user', content: 'Summarize this task.' },
      ],
    });

    expect(normalized.prompt).toContain('System:\nYou are concise.');
    expect(normalized.prompt).toContain('User:\nSummarize this task.');
    expect(normalized.messages).toHaveLength(2);
    expect(normalized.stream).toBe(false);
  });

  it('keeps explicit prompt and normalizes numeric parameters', () => {
    const normalized = normalizeInferenceRequest({
      backend: 'llama-server-openai',
      prompt: 'Use this prompt directly',
      temperature: 3,
      top_p: -1,
      top_k: '0',
      max_tokens: '24',
      repeat_penalty: -2,
      response_format: 'JSON',
      stop: ['END', '', 'DONE'],
    });

    expect(normalized.engineId).toBe('llama-server-openai');
    expect(normalized.prompt).toBe('Use this prompt directly');
    expect(normalized.temperature).toBe(2);
    expect(normalized.top_p).toBe(0);
    expect(normalized.top_k).toBe(1);
    expect(normalized.max_tokens).toBe(24);
    expect(normalized.repeat_penalty).toBe(0);
    expect(normalized.response_format).toBe('json');
    expect(normalized.stop).toEqual(['END', 'DONE']);
  });

  it('extracts text from structured content arrays', () => {
    const prompt = buildPromptFromMessages([
      {
        role: 'user',
        content: 'hello',
      },
      {
        role: 'assistant',
        content: 'world',
      },
    ]);

    expect(prompt).toContain('User:\nhello');
    expect(prompt).toContain('Assistant:\nworld');
  });
});
