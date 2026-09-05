import type { LLMProvider, SearchResult, CodeSymbol } from '@code-lense/core';
import type { ContextBuilder } from '../context/index.js';
import { CODE_LENSE_SYSTEM_PROMPT, buildUserPrompt } from '../prompts/index.js';

export interface AskResult {
  answer: string;
  sources: SearchResult[];
  relatedSymbols: CodeSymbol[];
}

export class AskEngine {
  constructor(
    private contextBuilder: ContextBuilder,
    private llmProvider: LLMProvider,
  ) {}

  public async ask(question: string): Promise<AskResult> {
    // 1. Assemble intelligent context from codebase
    const context = await this.contextBuilder.buildContext(question);

    // 2. Build prompt
    const userPrompt = buildUserPrompt(question, context.contextText);

    // 3. Query LLM provider
    const response = await this.llmProvider.chat({
      messages: [
        { role: 'system', content: CODE_LENSE_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
    });

    return {
      answer: response.content,
      sources: context.sources,
      relatedSymbols: context.relatedSymbols,
    };
  }
}
