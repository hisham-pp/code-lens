import { classifyLayer } from './layer-classifier.js';
import { analyzeProject } from './project-analyzer.js';
import { detectRoute } from './route-detector.js';

export * from './types.js';

export class ProjectRecognizer {
  public static analyze = analyzeProject;
  public static detectRoute = detectRoute;
  public static classifyLayer = classifyLayer;
}
