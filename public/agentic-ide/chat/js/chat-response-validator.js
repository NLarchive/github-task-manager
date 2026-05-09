/**
 * Chat Quality Validator Integration
 * 
 * Integrates the chat-quality-inspector into the chat app to validate
 * all LLM responses before displaying them to the user.
 */

import { ChatQualityInspector } from '../components/tools/chat-quality-inspector/main.js';

export class ChatResponseValidator {
  constructor(options = {}) {
    this.inspector = new ChatQualityInspector(options);
    this.strictMode = options.strictMode ?? false;
    this.autoFlag = options.autoFlag ?? true;
    this.validationLog = [];
  }

  /**
   * Validate incoming LLM response
   * Returns validation result and optionally flags/blocks poor responses
   */
  validateResponse(llmResponse) {
    const result = this.inspector.inspect(llmResponse);

    this.validationLog.push({
      timestamp: new Date().toISOString(),
      result
    });

    if (this.autoFlag && !result.quality.isValid) {
      console.warn('[chat-validation] Response flagged for quality issues:', result.quality.issues);
    }

    return result;
  }

  /**
   * Extract content with validation metadata
   */
  extractValidatedContent(llmResponse) {
    const validation = this.validateResponse(llmResponse);

    if (!validation.ok) {
      return {
        content: '',
        validated: false,
        issues: validation.quality.issues,
        score: validation.quality.score
      };
    }

    const content = llmResponse.content || llmResponse.text || '';

    return {
      content,
      validated: validation.quality.isValid,
      issues: validation.quality.issues,
      score: validation.quality.score,
      details: validation.quality.details
    };
  }

  /**
   * Get validation history
   */
  getValidationLog(count = 10) {
    return this.validationLog.slice(-count);
  }

  /**
   * Clear validation log
   */
  clearLog() {
    this.validationLog = [];
  }
}

/**
 * Global validator instance for use in chat-app.js
 */
let globalValidator = null;

export function initializeValidator(options = {}) {
  globalValidator = new ChatResponseValidator(options);
  console.log('[chat-validation] Validator initialized');
  return globalValidator;
}

export function getValidator() {
  if (!globalValidator) {
    globalValidator = initializeValidator();
  }
  return globalValidator;
}
