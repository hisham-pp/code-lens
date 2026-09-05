import type { ChatRequest, ChatResponse, LLMProvider } from '@code-lense/core';

export interface OllamaLLMOptions {
  endpoint?: string;
  model?: string;
}

export class OllamaLLMProvider implements LLMProvider {
  public readonly name = 'ollama';
  private endpoint: string;
  private model: string;

  constructor(options: OllamaLLMOptions = {}) {
    this.endpoint = options.endpoint || 'http://localhost:11434';
    this.model = options.model || 'llama3.2';
  }

  public async chat(request: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(`${this.endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        stream: false,
        options: {
          temperature: request.temperature ?? 0.2,
          num_predict: request.maxTokens ?? 2048,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama chat failed with status ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as {
      message: { content: string };
      prompt_eval_count?: number;
      eval_count?: number;
    };

    return {
      content: data.message.content,
      model: this.model,
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    };
  }
}
