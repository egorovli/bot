import type { LogLevel } from '../../../core/services/logger.ts'

export interface AppConfig {
  name: string
  environment: string
  version: string
  logLevel: LogLevel
}
