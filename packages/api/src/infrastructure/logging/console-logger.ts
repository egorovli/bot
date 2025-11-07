import { injectable } from 'inversify'
import type { LogContext, LogLevel, Logger } from '../../core/services/logger.ts'

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
}

@injectable()
export class ConsoleLogger implements Logger {
  level: LogLevel

  constructor(initialLevel: LogLevel = 'info') {
    this.level = initialLevel
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.write('debug', message, context)
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.write('info', message, context)
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.write('warn', message, context)
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      this.write('error', message, context)
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_RANK[level] >= LEVEL_RANK[this.level]
  }

  private write(level: LogLevel, message: string, context?: LogContext): void {
    const payload = context ? ` ${JSON.stringify(context)}` : ''
    const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}${payload}\n`
    const stream = level === 'error' ? process.stderr : process.stdout
    stream.write(line)
  }
}
