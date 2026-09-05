import type { ChatRequest, ChatResponse, LLMProvider } from '@code-lense/core';

export interface OpenAILLMOptions {
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

export class OpenAILLMProvider implements LLMProvider {
  public readonly name = 'openai';
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor(options: OpenAILLMOptions = {}) {
    this.apiKey = options.apiKey || process.env['OPENAI_API_KEY'] || '';
    this.endpoint = (options.endpoint || 'https://api.openai.com/v1').replace(/\/+$/, '');
    this.model = options.model || 'gpt-4o-mini';
  }

  public async chat(request: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(`${this.endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 2048,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI chat failed with status ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
      usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    };

    const firstChoice = data.choices[0];
    return {
      content: firstChoice?.message.content || '',
      model: this.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
