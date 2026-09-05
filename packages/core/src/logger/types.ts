export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success' | 'silent';

export const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  success: 25,
  warn: 30,
  error: 40,
  silent: 100,
};

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  args: unknown[];
}

export interface LoggerOptions {
  level?: LogLevel;
  timestamp?: boolean;
  colors?: boolean;
  context?: string;
  sink?: (entry: LogEntry, formattedText: string) => void;
}
