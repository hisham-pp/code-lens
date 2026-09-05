import pc from 'picocolors';

export class Format {
  public static banner(): string {
    return [
      pc.bold(pc.cyan('   ___          _         _                         ')),
      pc.bold(pc.cyan('  / __\\___   __| | ___   | |    ___ _ __  ___  ___  ')),
      pc.bold(pc.cyan(" / /  / _ \\ / _` |/ _ \\  | |   / _ \\ '_ \\/ __|/ _ \\ ")),
      pc.bold(pc.cyan('/ /__| (_) | (_| |  __/  | |__|  __/ | | \\__ \\  __/ ')),
      pc.bold(pc.cyan('\\____/\\___/ \\__,_|\\___|  |_____\\___|_| |_|___/\\___| ')),
      pc.dim(' Local-first repository intelligence for developers  '),
      '',
    ].join('\n');
  }

  public static header(title: string): string {
    return pc.bold(pc.blue(`\n=== ${title} ===\n`));
  }

  public static success(msg: string): string {
    return `${pc.green('✔')} ${msg}`;
  }

  public static info(msg: string): string {
    return `${pc.cyan('ℹ')} ${msg}`;
  }

  public static warn(msg: string): string {
    return `${pc.yellow('⚠')} ${msg}`;
  }

  public static error(msg: string): string {
    return `${pc.red('✖')} ${msg}`;
  }

  public static kv(key: string, value: string | number, pad: number = 16): string {
    return `${pc.dim(key.padEnd(pad))} ${pc.bold(String(value))}`;
  }

  public static badge(
    text: string,
    color: 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' = 'blue',
  ): string {
    const fn = pc[color];
    return fn(`[${text}]`);
  }

  public static divider(): string {
    return pc.dim('─'.repeat(60));
  }
}
