import type { CodeSymbol, GitState, SearchResult } from '@code-lense/core';

export function formatSnippets(results: SearchResult[]): string[] {
  const sections: string[] = ['### 1. Primary Code Chunks'];
  for (const res of results) {
    const sym = res.symbolName ? ` | Symbol: \`${res.symbolName}\`` : '';
    const header = `File: \`${res.filePath}\` (Lines ${res.startLine}-${res.endLine})${sym}`;
    const snippet = `\`\`\`${res.language || ''}\n${res.content}\n\`\`\``;
    sections.push(`${header}\n${snippet}`);
  }
  return sections;
}

export function formatSymbols(symbols: CodeSymbol[]): string[] {
  if (symbols.length === 0) return [];
  const lines: string[] = ['### 2. Symbol & Structural Hierarchy'];
  for (const s of symbols) {
    const sig = s.signature ? ` (${s.signature})` : '';
    lines.push(`- **${s.type}** \`${s.name}\` in \`${s.filePath}\`${sig}`);
  }
  return lines;
}

export function formatDependencies(deps: string[]): string[] {
  if (deps.length === 0) return [];
  const uniqueDeps = Array.from(new Set(deps)).slice(0, 10);
  return ['### 3. Dependency & Relationship Graph', uniqueDeps.map((d) => `- ${d}`).join('\n')];
}

export function formatGitState(gitState: GitState | null | undefined): string[] {
  if (!gitState) return [];
  const hasChanges =
    !gitState.isClean || gitState.staged.length > 0 || gitState.unstaged.length > 0;
  if (!hasChanges) return [];

  const lines = ['### 4. Git Workspace State'];
  lines.push(`Branch: \`${gitState.branch}\` (HEAD: \`${gitState.commitHash.slice(0, 8)}\`)`);
  if (gitState.staged.length > 0) {
    lines.push(`Staged: ${gitState.staged.join(', ')}`);
  }
  if (gitState.unstaged.length > 0) {
    lines.push(`Modified (unstaged): ${gitState.unstaged.join(', ')}`);
  }
  return lines;
}
