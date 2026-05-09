/**
 * Chat Quality Inspector Tool
 * 
 * Validates LLM responses for corruption, garbling, and quality issues.
 * Detects:
 * - Character repetition patterns (로직로직로직)
 * - Mixed encoding/corruption
 * - Incomplete content
 * - Non-meaningful output
 */

export class ChatQualityInspector {
  constructor(options = {}) {
    this.strictMode = options.strictMode ?? false;
    this.maxCorruptionThreshold = options.maxCorruptionThreshold ?? 0.15;
    this.minContentLength = options.minContentLength ?? 50;
  }

  /**
   * Main inspection entry point
   */
  inspect(llmResponse) {
    if (!llmResponse) {
      return {
        ok: false,
        quality: {
          isValid: false,
          issues: ['No response payload provided'],
          score: 0,
          details: {}
        }
      };
    }

    const issues = [];
    let score = 100;

    // Extract content
    const content = this._extractContent(llmResponse);
    if (!content) {
      return {
        ok: false,
        quality: {
          isValid: false,
          issues: ['No extractable content from response'],
          score: 0,
          details: { responseKeys: Object.keys(llmResponse || {}) }
        }
      };
    }

    // Check for basic validity
    if (content.length < this.minContentLength) {
      issues.push(`Content too short: ${content.length} chars (min: ${this.minContentLength})`);
      score -= 20;
    }

    // Check for corruption patterns
    const corruptionCheck = this._checkCorruption(content);
    if (corruptionCheck.corrupted) {
      issues.push(`Corruption detected: ${corruptionCheck.reason}`);
      score -= Math.max(30, Math.floor(corruptionCheck.severity * 40));
    }

    // Check for repetition
    const repetitionCheck = this._checkRepetition(content);
    if (repetitionCheck.hasRepetition) {
      issues.push(`Excessive repetition: ${repetitionCheck.pattern} (${repetitionCheck.count}x)`);
      score -= Math.max(25, Math.floor(repetitionCheck.severity * 35));
    }

    // Check for meaningful content
    const meaningCheck = this._checkMeaningfulness(content);
    if (!meaningCheck.meaningful) {
      issues.push(`Content lacks substance: ${meaningCheck.reason}`);
      score -= 30;
    }

    // Check encoding sanity
    const encodingCheck = this._checkEncoding(content);
    if (!encodingCheck.sane) {
      issues.push(`Encoding issue: ${encodingCheck.reason}`);
      score -= Math.max(20, Math.floor(encodingCheck.severity * 30));
    }

    const isValid = issues.length === 0 && score >= 70;
    score = Math.max(0, Math.min(100, score));

    return {
      ok: true,
      quality: {
        isValid,
        issues,
        score: Math.round(score),
        details: {
          contentLength: content.length,
          corruption: corruptionCheck,
          repetition: repetitionCheck,
          meaningfulness: meaningCheck,
          encoding: encodingCheck
        }
      }
    };
  }

  _extractContent(response) {
    if (typeof response === 'string') return response;
    if (response && typeof response === 'object') {
      return response.content || response.text || response.output || response.response || '';
    }
    return '';
  }

  _checkCorruption(content) {
    // Detect mixed/corrupted character sequences
    const lines = content.split('\n');
    let corruptedLines = 0;

    for (const line of lines) {
      // Check for CJK character repetition with garbling
      if (/[\u4E00-\u9FFF\uAC00-\uD7AF]{2,}/.test(line)) {
        const cjkMatch = line.match(/[\u4E00-\u9FFF\uAC00-\uD7AF]+/g);
        if (cjkMatch) {
          for (const match of cjkMatch) {
            // Check if same character repeats 3+ times
            if (/(.)\1{2,}/.test(match)) {
              corruptedLines++;
              break;
            }
          }
        }
      }
    }

    const corruption = corruptedLines / Math.max(lines.length, 1);

    return {
      corrupted: corruption > this.maxCorruptionThreshold,
      severity: corruption,
      corruptedLines,
      totalLines: lines.length,
      reason: corruption > this.maxCorruptionThreshold
        ? `${Math.round(corruption * 100)}% of lines show corruption patterns`
        : ''
    };
  }

  _checkRepetition(content) {
    // Find repeated substrings (words or character sequences)
    const words = content.split(/\s+/).filter(w => w.length > 2);
    const wordFreq = new Map();

    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }

    // Find the word with highest repetition
    let maxRepeat = 0;
    let repeatWord = '';

    for (const [word, count] of wordFreq) {
      if (count > maxRepeat) {
        maxRepeat = count;
        repeatWord = word;
      }
    }

    const hasRepetition = maxRepeat > 3;
    const repetitionRatio = maxRepeat / Math.max(words.length, 1);

    return {
      hasRepetition,
      pattern: repeatWord,
      count: maxRepeat,
      ratio: repetitionRatio,
      severity: Math.min(1, repetitionRatio),
      reason: hasRepetition
        ? `Word "${repeatWord}" repeats ${maxRepeat} times (${Math.round(repetitionRatio * 100)}% of content)`
        : ''
    };
  }

  _checkMeaningfulness(content) {
    // Very basic semantic check
    const trimmed = content.trim();

    if (trimmed.length < 20) {
      return {
        meaningful: false,
        reason: 'Content too brief to assess meaning',
        length: trimmed.length
      };
    }

    // Check for common meaningful patterns
    const hasCapitals = /[A-Z]/.test(trimmed);
    const hasLowercases = /[a-z]/.test(trimmed);
    const hasPunctuation = /[.!?;:]/.test(trimmed);
    const hasWords = /\b\w+\b/g.test(trimmed);

    const structureScore = (hasCapitals ? 1 : 0) + (hasLowercases ? 1 : 0) + (hasPunctuation ? 1 : 0) + (hasWords ? 1 : 0);

    return {
      meaningful: structureScore >= 2,
      reason: structureScore < 2 ? 'Lacks normal language structure' : '',
      structureScore,
      characteristics: { hasCapitals, hasLowercases, hasPunctuation, hasWords }
    };
  }

  _checkEncoding(content) {
    // Check for encoding sanity
    try {
      // Check if all characters can be properly handled
      const encoded = encodeURIComponent(content);
      const decoded = decodeURIComponent(encoded);

      if (decoded !== content) {
        return {
          sane: false,
          severity: 0.5,
          reason: 'Encoding/decoding mismatch detected'
        };
      }

      // Check for suspicious UTF-8 sequences or mojibake patterns
      const lines = content.split('\n');
      let suspiciousLines = 0;

      for (const line of lines) {
        // Pattern: high UTF-8 bytes mixed with ASCII in odd ways
        const byteCount = new TextEncoder().encode(line).length;
        const charCount = line.length;

        if (byteCount > charCount * 3) {
          suspiciousLines++;
        }
      }

      const suspicionRatio = suspiciousLines / Math.max(lines.length, 1);

      return {
        sane: suspicionRatio < 0.3,
        severity: suspicionRatio,
        reason: suspicionRatio >= 0.3 ? 'Unusual UTF-8 byte patterns detected' : ''
      };
    } catch (e) {
      return {
        sane: false,
        severity: 1.0,
        reason: `Encoding error: ${e.message}`
      };
    }
  }
}

export function createInspector(options) {
  return new ChatQualityInspector(options);
}

export async function runInspection(llmResponse, options) {
  const inspector = createInspector(options);
  return inspector.inspect(llmResponse);
}
