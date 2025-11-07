export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  appId?: string
  [key: string]: unknown
}

export interface Logger {
  level: LogLevel
  setLevel(level: LogLevel): void
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
}
