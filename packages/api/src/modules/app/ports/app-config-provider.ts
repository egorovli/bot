import type { AppConfig } from '../entities/app-config.ts'

export interface AppConfigProvider {
  load(): Promise<AppConfig> | AppConfig
}
