import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

type LogFields = Record<string, string | number | boolean | null | undefined>;

@Injectable()
export class StructuredLoggerService implements LoggerService {
  private readonly serviceName = 'api';

  constructor(
    private readonly environment: string,
    private readonly minLevel: LogLevel = 'log',
  ) {}

  log(message: unknown, contextOrFields?: string | LogFields): void {
    this.write('info', String(message), this.normalizeFields(contextOrFields));
  }

  error(message: unknown, traceOrFields?: string | LogFields, fields?: LogFields): void {
    if (typeof traceOrFields === 'string') {
      this.write('error', String(message), {
        ...fields,
        trace: traceOrFields,
      });
      return;
    }

    this.write('error', String(message), traceOrFields ?? {});
  }

  warn(message: unknown, contextOrFields?: string | LogFields): void {
    this.write('warn', String(message), this.normalizeFields(contextOrFields));
  }

  debug(message: unknown, contextOrFields?: string | LogFields): void {
    this.write('debug', String(message), this.normalizeFields(contextOrFields));
  }

  verbose(message: unknown, contextOrFields?: string | LogFields): void {
    this.write('debug', String(message), this.normalizeFields(contextOrFields));
  }

  private normalizeFields(contextOrFields?: string | LogFields): LogFields {
    if (typeof contextOrFields === 'string') {
      return { context: contextOrFields };
    }

    return contextOrFields ?? {};
  }

  private write(level: string, message: string, fields: LogFields): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      environment: this.environment,
      message,
      ...fields,
    };

    const line =
      this.environment === 'production' ? JSON.stringify(payload) : this.formatDev(payload);

    console.log(line);
  }

  private formatDev(payload: Record<string, unknown>): string {
    const { timestamp, level, message, ...rest } = payload;
    const extra = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
    return `${String(timestamp)} [${String(level)}] ${String(message)}${extra}`;
  }

  private shouldLog(level: string): boolean {
    const order = ['debug', 'info', 'warn', 'error'] as const;
    const normalized = level === 'log' ? 'info' : level;
    const min = this.minLevel === 'log' ? 'info' : this.minLevel;
    const currentIndex = order.indexOf(normalized as (typeof order)[number]);
    const minIndex = order.indexOf(min as (typeof order)[number]);

    if (currentIndex === -1 || minIndex === -1) {
      return true;
    }

    return currentIndex >= minIndex;
  }
}
