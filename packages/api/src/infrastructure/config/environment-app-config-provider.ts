import type { LogLevel } from '../../core/services/logger.ts'
import type { RuntimeConfig, RuntimeConfigProvider } from '../../core/services/runtime-config-provider.ts'

import { injectable } from 'inversify'

const LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error']

@injectable()
export class EnvironmentAppConfigProvider implements RuntimeConfigProvider {
  load(): RuntimeConfig {
		return {
			name: Bun.env.APP_NAME ?? 'app',
			environment: Bun.env.NODE_ENV ?? 'development',
			version: Bun.env.VERSION ?? '0.0.0',
			logLevel: this.resolveLogLevel(Bun.env.APP_LOG_LEVEL)
		}
	}

	private resolveLogLevel(rawLevel?: string): LogLevel {
		if (!rawLevel) {
			return 'info'
		}
		const normalized = rawLevel.toLowerCase() as LogLevel
		if (LOG_LEVELS.includes(normalized)) {
			return normalized
		}
		return 'info'
	}
}
