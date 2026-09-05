import type { ChatRequest, ChatResponse, LLMProvider } from '@code-lense/core';

export * from './ollama.js';
export * from './openai.js';

export class MockLLMProvider implements LLMProvider {
  public readonly name = 'mock';

  public async chat(request: ChatRequest): Promise<ChatResponse> {
    const lastUserMessage = request.messages.filter((m) => m.role === 'user').pop();
    const content = lastUserMessage ? lastUserMessage.content : '';

    return {
      content: `[Code Lense Analysis]\nBased on repository context:\n${content.slice(0, 300)}...`,
      model: 'mock-intelligence-v1',
      usage: {
        promptTokens: Math.ceil(content.length / 4),
        completionTokens: 50,
        totalTokens: Math.ceil(content.length / 4) + 50,
      },
    };
  }
}
