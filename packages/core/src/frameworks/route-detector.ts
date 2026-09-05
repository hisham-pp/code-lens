import { NEXTJS } from './constants.js';
import type { RouteMetadata } from './types.js';

const METHOD_ALL = 'ALL';
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

function extractHttpMethods(content: string): string[] {
  const methods: string[] = [];
  for (const m of HTTP_METHODS) {
    const fnRegex = new RegExp(`export\\s+(async\\s+)?function\\s+${m}\\b`);
    const constRegex = new RegExp(`export\\s+const\\s+${m}\\b`);
    if (fnRegex.test(content) || constRegex.test(content)) {
      methods.push(m);
    }
  }
  return methods.length > 0 ? methods : [METHOD_ALL];
}

function detectAppRoute(
  normalized: string,
  content: string | undefined,
  relativePath: string,
): RouteMetadata | undefined {
  const match = normalized.match(/(?:^|\/)app\/(api\/.*?)\/route\.[jt]sx?$/);
  if (!match || !match[1]) return undefined;

  const methods = content ? extractHttpMethods(content) : [METHOD_ALL];
  return {
    type: 'api-route',
    framework: NEXTJS,
    route: `/${match[1]}`,
    methods,
    filePath: relativePath,
  };
}

function detectPagesRoute(normalized: string, relativePath: string): RouteMetadata | undefined {
  const match = normalized.match(/(?:^|\/)pages\/(api\/.*?)(?:\/index)?\.[jt]sx?$/);
  if (!match || !match[1]) return undefined;

  return {
    type: 'api-route',
    framework: NEXTJS,
    route: `/${match[1]}`,
    methods: [METHOD_ALL],
    filePath: relativePath,
  };
}

export function detectRoute(relativePath: string, content?: string): RouteMetadata | undefined {
  const normalized = relativePath.replace(/\\/g, '/');
  return (
    detectAppRoute(normalized, content, relativePath) ?? detectPagesRoute(normalized, relativePath)
  );
}
