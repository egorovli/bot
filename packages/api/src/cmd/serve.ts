import type { BindingMap } from '../core/ioc/index.ts'

import { TypedContainerModule } from '@inversifyjs/strongly-typed'
import { Command } from 'commander'

import { createAgent } from '../modules/messaging/entities/agent.ts'
import { container, InjectionKey } from '../core/ioc/index.ts'
import { EnvironmentAppConfigProvider } from '../infrastructure/config/environment-app-config-provider.ts'
import { ConsoleLogger } from '../infrastructure/logging/console-logger.ts'
import { UuidV7Generator } from '../infrastructure/ids/uuid-v7-generator.ts'
import { messagingContainerModule } from '../infrastructure/messaging/container.ts'
import { GrammyBotRuntime } from '../infrastructure/messaging/grammy-bot-runtime.ts'

const runtimeContainerModule = new TypedContainerModule<BindingMap>(
	({ bind, isBound }) => {
		if (!isBound(InjectionKey.Logger)) {
			bind(InjectionKey.Logger).to(ConsoleLogger).inSingletonScope()
		}

		if (!isBound(InjectionKey.IdGenerator)) {
			bind(InjectionKey.IdGenerator).to(UuidV7Generator).inSingletonScope()
		}

		if (!isBound(InjectionKey.RuntimeConfigProvider)) {
			bind(InjectionKey.RuntimeConfigProvider)
				.to(EnvironmentAppConfigProvider)
				.inSingletonScope()
		}
	}
)

let runtimeBound = false
let messagingBound = false

const ensureRuntime = (): void => {
	if (runtimeBound) {
		return
	}
	container.load(runtimeContainerModule)
	runtimeBound = true
}

const ensureMessaging = (): void => {
	if (messagingBound) {
		return
	}
	container.load(messagingContainerModule)
	messagingBound = true
}

/**
 * Composition Root - Entry point for dependency resolution
 *
 * This command wires up runtime services once and then executes use cases.
 */
export const serve = new Command('serve').description('Start app runtime')

serve.action(async () => {
	ensureRuntime()
	ensureMessaging()

	const start = process.hrtime.bigint()

	const runtimeConfigProvider = container.get(InjectionKey.RuntimeConfigProvider)
	const logger = container.get(InjectionKey.Logger)
	const idGenerator = container.get(InjectionKey.IdGenerator)

	const config = await runtimeConfigProvider.load()
	logger.setLevel(config.logLevel)
	const runtimeId = await idGenerator.generate()

	const duration = Number((process.hrtime.bigint() - start) / BigInt(1e6))

	logger.info('Runtime ready', {
		appId: runtimeId,
		durationMs: duration,
		environment: config.environment
	})

	process.stdout.write(
		`[${runtimeId}] ${config.name} v${config.version} running in ${config.environment} mode (${duration}ms bootstrap)\n`
	)

	const token = Bun.env['TELEGRAM_BOT_TOKEN']
	if (!token) {
		logger.error('Missing TELEGRAM_BOT_TOKEN environment variable')
		process.exit(1)
	}

	const agent = createAgent({
		id: Bun.env['BOT_AGENT_ID'] ?? 'agent-runtime',
		username:
			Bun.env['BOT_AGENT_USERNAME'] ??
			(Bun.env['TELEGRAM_BOT_NAME']?.replace(/\s+/g, '_').toLowerCase() ?? 'runtime_bot'),
		displayName: Bun.env['TELEGRAM_BOT_NAME'] ?? config.name
	})

	const messagingRuntime = new GrammyBotRuntime({
		token,
		agent,
		logger,
		registerConversationUseCase: container.get(InjectionKey.RegisterConversationUseCase),
		recordIncomingMessageUseCase: container.get(InjectionKey.RecordIncomingMessageUseCase),
		planResponseUseCase: container.get(InjectionKey.PlanResponseUseCase)
	})

	await messagingRuntime.start()
})
