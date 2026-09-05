import { formatLogEntry } from './formatter.js';
import { LOG_LEVEL_VALUES, type LogEntry, type LogLevel, type LoggerOptions } from './types.js';

export class Logger {
  private level: LogLevel;

  constructor(private readonly options: LoggerOptions = {}) {
    this.level = options.level ?? 'info';
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public getLevel(): LogLevel {
    return this.level;
  }

  public debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, args);
  }

  public info(message: string, ...args: unknown[]): void {
    this.log('info', message, args);
  }

  public success(message: string, ...args: unknown[]): void {
    this.log('success', message, args);
  }

  public warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, args);
  }

  public error(message: string, ...args: unknown[]): void {
    this.log('error', message, args);
  }

  public raw(message: string): void {
    if (this.options.sink) {
      const entry: LogEntry = {
        level: this.level,
        message,
        timestamp: new Date(),
        context: this.options.context,
        args: [],
      };
      this.options.sink(entry, message);
    } else {
      process.stdout.write(message + '\n');
    }
  }

  public withContext(context: string): Logger {
    return new Logger({
      ...this.options,
      level: this.level,
      context,
    });
  }

  private log(level: LogLevel, message: string, args: unknown[]): void {
    if (LOG_LEVEL_VALUES[level] < LOG_LEVEL_VALUES[this.level]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: this.options.context,
      args,
    };

    const formatted = formatLogEntry(entry, this.options);

    if (this.options.sink) {
      this.options.sink(entry, formatted);
      return;
    }

    if (level === 'error') {
      process.stderr.write(formatted + '\n');
    } else {
      process.stdout.write(formatted + '\n');
    }
  }
}

export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

export const logger = createLogger();
