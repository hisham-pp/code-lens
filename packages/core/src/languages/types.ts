export interface LanguageDetection {
  language: string;
  confidence: number;
  parser?: string;
}

export interface LanguageDefinition {
  id: string;
  name: string;
  extensions: string[];
  filenames?: string[];
  shebangs?: string[];
  treeSitterParser?: string;
  isCode: boolean;
}
