import { CODE_LANGUAGES_PRIMARY } from './registry-code-primary.js';
import { CODE_LANGUAGES_SECONDARY } from './registry-code-secondary.js';
import { MARKUP_LANGUAGES } from './registry-markup.js';
import type { LanguageDefinition } from './types.js';

export const LANGUAGE_REGISTRY: LanguageDefinition[] = [
  ...CODE_LANGUAGES_PRIMARY,
  ...CODE_LANGUAGES_SECONDARY,
  ...MARKUP_LANGUAGES,
];
