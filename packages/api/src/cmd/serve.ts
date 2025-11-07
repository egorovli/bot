import { Command } from 'commander'

import { container, InjectionKey } from '../core/ioc/index.ts'
import { EnvironmentAppConfigProvider } from '../infrastructure/config/environment-app-config-provider.ts'
import { ConsoleLogger } from '../infrastructure/logging/console-logger.ts'
import { UuidV7Generator } from '../infrastructure/ids/uuid-v7-generator.ts'
import { StartAppUseCase } from '../modules/app/use-cases/start-app-use-case.ts'

const ensureRuntime = (): void => {
	if (!container.isBound(InjectionKey.Logger)) {
		container.bind(InjectionKey.Logger).toConstantValue(new ConsoleLogger())
	}

	if (!container.isBound(InjectionKey.IdGenerator)) {
		container.bind(InjectionKey.IdGenerator).to(UuidV7Generator).inSingletonScope()
	}

	if (!container.isBound(InjectionKey.AppConfigProvider)) {
		container
			.bind(InjectionKey.AppConfigProvider)
			.to(EnvironmentAppConfigProvider)
			.inSingletonScope()
	}

	if (!container.isBound(InjectionKey.StartAppUseCase)) {
		container.bind(InjectionKey.StartAppUseCase).to(StartAppUseCase).inSingletonScope()
	}
}

/**
 * Composition Root - Entry point for dependency resolution
 *
 * This command wires up runtime services once and then executes use cases.
 */
export const serve = new Command('serve').description('Start app runtime')

serve.action(async () => {
	ensureRuntime()

	const start = process.hrtime.bigint()
	const startAppUseCase = container.get(InjectionKey.StartAppUseCase)
	const { app } = await startAppUseCase.execute()
	const duration = Number((process.hrtime.bigint() - start) / BigInt(1e6))

	const logger = container.get(InjectionKey.Logger)
	logger.info('Runtime ready', {
		appId: app.id,
		durationMs: duration,
		environment: app.environment
	})

	process.stdout.write(
		`[${app.id}] ${app.name} v${app.version} running in ${app.environment} mode (${duration}ms bootstrap)\n`
	)
})
