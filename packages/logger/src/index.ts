import { LogLevel } from '@misan/types';

export interface LogContext {
  module?: string;
  guildId?: string;
  userId?: string;
  command?: string;
  event?: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
}

export class Logger {
  private module: string;

  constructor(module: string = 'Core') {
    this.module = module;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const mod = context?.module || this.module;
    const guildStr = context?.guildId ? ` [Guild: ${context.guildId}]` : '';
    const userStr = context?.userId ? ` [User: ${context.userId}]` : '';
    const cmdStr = context?.command ? ` [Cmd: ${context.command}]` : '';
    const eventStr = context?.event ? ` [Event: ${context.event}]` : '';

    return `[${timestamp}] [${level.toUpperCase().padEnd(5)}] [${mod}]${guildStr}${userStr}${cmdStr}${eventStr} - ${message}`;
  }

  public debug(message: string, context?: LogContext): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug('\x1b[36m' + this.formatMessage('debug', message, context) + '\x1b[0m');
    }
  }

  public info(message: string, context?: LogContext): void {
    console.info('\x1b[32m' + this.formatMessage('info', message, context) + '\x1b[0m');
  }

  public warn(message: string, context?: LogContext): void {
    console.warn('\x1b[33m' + this.formatMessage('warn', message, context) + '\x1b[0m');
  }

  public error(message: string, context?: LogContext): void {
    console.error('\x1b[31m' + this.formatMessage('error', message, context) + '\x1b[0m');
    if (context?.error) {
      console.error(context.error);
    }
  }

  public fatal(message: string, context?: LogContext): void {
    console.error('\x1b[41m\x1b[37m' + this.formatMessage('fatal', message, context) + '\x1b[0m');
    if (context?.error) {
      console.error(context.error);
    }
  }
}

export const logger = new Logger('Misan');
