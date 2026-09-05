import pc from 'picocolors';
import type { LogEntry, LogLevel } from './types.js';

function formatTimestamp(date: Date, useColors: boolean): string {
  const pad = (n: number, w: number = 2) => String(n).padStart(w, '0');
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 3);
  const formatted = `[${h}:${m}:${s}.${ms}]`;
  return useColors ? pc.dim(formatted) : formatted;
}

function formatLevelBadge(level: LogLevel, useColors: boolean): string {
  const labels: Record<LogLevel, string> = {
    debug: '[DEBUG]',
    info: '[INFO] ',
    success: '[SUCCESS]',
    warn: '[WARN] ',
    error: '[ERROR]',
    silent: '',
  };

  const label = labels[level];
  if (!useColors) return label;

  switch (level) {
    case 'debug':
      return pc.magenta(label);
    case 'info':
      return pc.cyan(label);
    case 'success':
      return pc.green(label);
    case 'warn':
      return pc.yellow(label);
    case 'error':
      return pc.red(label);
    default:
      return label;
  }
}

function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return arg.stack || arg.message;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

export function formatLogEntry(
  entry: LogEntry,
  options: { timestamp?: boolean; colors?: boolean } = {},
): string {
  const useColors = options.colors ?? true;
  const showTimestamp = options.timestamp ?? true;
  const parts: string[] = [];

  if (showTimestamp) {
    parts.push(formatTimestamp(entry.timestamp, useColors));
  }

  parts.push(formatLevelBadge(entry.level, useColors));

  if (entry.context) {
    const ctx = `[${entry.context}]`;
    parts.push(useColors ? pc.blue(ctx) : ctx);
  }

  parts.push(entry.message);

  if (entry.args.length > 0) {
    const formattedArgs = entry.args.map(formatArg).join(' ');
    parts.push(formattedArgs);
  }

  return parts.join(' ');
}
