import * as path from 'node:path';
import type { LayerMetadata } from './types.js';

interface LayerRule {
  layer: LayerMetadata['layer'];
  match: (norm: string, base: string) => boolean;
}

const LAYER_RULES: LayerRule[] = [
  { layer: 'hook', match: (n, b) => b.startsWith('use') || n.includes('/hooks/') },
  {
    layer: 'component',
    match: (n, b) =>
      n.includes('/components/') ||
      n.includes('/ui/') ||
      b.endsWith('.component.ts') ||
      b.endsWith('.component.tsx'),
  },
  {
    layer: 'controller',
    match: (n, b) => n.includes('/controllers/') || b.includes('.controller.'),
  },
  { layer: 'service', match: (n, b) => n.includes('/services/') || b.includes('.service.') },
  {
    layer: 'repository',
    match: (n, b) => n.includes('/repositories/') || b.includes('.repository.'),
  },
  {
    layer: 'model',
    match: (n, b) =>
      n.includes('/models/') ||
      n.includes('/entities/') ||
      b.includes('.entity.') ||
      b.includes('.model.'),
  },
  {
    layer: 'middleware',
    match: (n, b) => n.includes('/middleware/') || b.includes('.middleware.'),
  },
  { layer: 'config', match: (n, b) => n.includes('/config/') || b.includes('.config.') },
  { layer: 'util', match: (n, _b) => n.includes('/utils/') || n.includes('/lib/') },
];

export function classifyLayer(relativePath: string): LayerMetadata {
  const normalized = relativePath.replace(/\\/g, '/').toLowerCase();
  const basename = path.basename(normalized);
  for (const rule of LAYER_RULES) {
    if (rule.match(normalized, basename)) {
      return { layer: rule.layer };
    }
  }
  return { layer: 'unknown' };
}
