import type { LogLevel } from './logger.ts'

export interface RuntimeConfig {
  name: string
  environment: string
  version: string
  logLevel: LogLevel
}

export interface RuntimeConfigProvider {
  load(): Promise<RuntimeConfig> | RuntimeConfig
}
