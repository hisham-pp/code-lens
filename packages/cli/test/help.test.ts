import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { COMMAND_DOCS } from '../src/commands/help-data.js';
import { helpCommand } from '../src/commands/help.js';

describe('CLI Help Command Tests', () => {
  let logs: string[] = [];
  const origStdoutWrite = process.stdout.write;
  const origStderrWrite = process.stderr.write;

  beforeEach(() => {
    logs = [];
    process.stdout.write = (chunk: unknown) => {
      logs.push(String(chunk));
      return true;
    };
    process.stderr.write = (chunk: unknown) => {
      logs.push(String(chunk));
      return true;
    };
  });

  afterEach(() => {
    process.stdout.write = origStdoutWrite;
    process.stderr.write = origStderrWrite;
  });

  it('should list all available CLI commands in COMMAND_DOCS', () => {
    const expectedCommands = [
      'init',
      'index',
      'watch',
      'status',
      'search',
      'files',
      'symbols',
      'graph',
      'ask',
      'doctor',
      'config',
      'help',
    ];

    for (const cmd of expectedCommands) {
      expect(COMMAND_DOCS[cmd]).toBeDefined();
      expect(COMMAND_DOCS[cmd]?.name).toBe(cmd);
      expect(COMMAND_DOCS[cmd]?.usage).toContain(cmd);
      expect(COMMAND_DOCS[cmd]?.examples.length).toBeGreaterThan(0);
    }
  });

  it('should render overview with categories and examples when no command is specified', async () => {
    await helpCommand();
    const output = logs.join('\n');

    expect(output).toContain('Usage: code-lense <command>');
    expect(output).toContain('Indexing:');
    expect(output).toContain('Search & Intelligence:');
    expect(output).toContain('AI:');
    expect(output).toContain('Diagnostics & Config:');
    expect(output).toContain('Quick Examples:');
    expect(output).toContain('code-lense help <command>');
  });

  it('should render detailed command usage and options for a specific command', async () => {
    await helpCommand('search');
    const output = logs.join('\n');

    expect(output).toContain('code-lense search');
    expect(output).toContain('Usage: code-lense search');
    expect(output).toContain('--mode');
    expect(output).toContain('--limit');
    expect(output).toContain('Examples:');
  });

  it('should gracefully handle unknown command queries', async () => {
    await helpCommand('nonexistent-command');
    const output = logs.join('\n');

    expect(output).toContain('Unknown command');
    expect(output).toContain('nonexistent-command');
    expect(output).toContain('code-lense help');
  });
});
