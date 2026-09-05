import { detectLanguage } from './detector.js';
import { LANGUAGE_REGISTRY } from './registry.js';
import type { LanguageDefinition, LanguageDetection } from './types.js';

export * from './types.js';
export * from './registry.js';

export class LanguageDetector {
  public static detect(filePath: string, contentSample?: string): LanguageDetection {
    return detectLanguage(filePath, contentSample);
  }

  public static getDefinition(languageId: string): LanguageDefinition | undefined {
    return LANGUAGE_REGISTRY.find((l) => l.id === languageId);
  }

  public static isCodeLanguage(languageId: string): boolean {
    const def = this.getDefinition(languageId);
    return def ? def.isCode : false;
  }
}
