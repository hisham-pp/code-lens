import { describe, it, expect } from 'vitest';
import { createLogger, type LogEntry, formatLogEntry } from '../src/logger/index.js';

describe('Common Logger Tests', () => {
  it('should format log entry with timestamp and level badge', () => {
    const entry: LogEntry = {
      level: 'info',
      message: 'Repository indexed successfully',
      timestamp: new Date('2026-09-05T14:30:00.123Z'),
      context: 'indexer',
      args: [],
    };

    const formatted = formatLogEntry(entry, { colors: false, timestamp: true });
    expect(formatted).toContain('[INFO]');
    expect(formatted).toContain('[indexer]');
    expect(formatted).toContain('Repository indexed successfully');
  });

  it('should omit timestamp when timestamp option is false', () => {
    const entry: LogEntry = {
      level: 'warn',
      message: 'Git state dirty',
      timestamp: new Date(),
      args: [],
    };

    const formatted = formatLogEntry(entry, { colors: false, timestamp: false });
    expect(formatted.startsWith('[WARN]')).toBe(true);
    expect(formatted).toContain('Git state dirty');
  });

  it('should filter log entries based on configured log level', () => {
    const logs: LogEntry[] = [];
    const logger = createLogger({
      level: 'warn',
      sink: (entry) => {
        logs.push(entry);
      },
    });

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');

    expect(logs.length).toBe(2);
    expect(logs[0]?.level).toBe('warn');
    expect(logs[1]?.level).toBe('error');
  });

  it('should support contextual child loggers', () => {
    const logs: LogEntry[] = [];
    const rootLogger = createLogger({
      level: 'info',
      sink: (entry) => {
        logs.push(entry);
      },
    });

    const dbLogger = rootLogger.withContext('database');
    dbLogger.info('Connected to SQLite WAL');

    expect(logs.length).toBe(1);
    expect(logs[0]?.context).toBe('database');
    expect(logs[0]?.message).toBe('Connected to SQLite WAL');
  });

  it('should support raw output pass-through', () => {
    let captured = '';
    const logger = createLogger({
      sink: (_entry, text) => {
        captured = text;
      },
    });

    logger.raw('ASCII BANNER ART');
    expect(captured).toBe('ASCII BANNER ART');
  });
});
