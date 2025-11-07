import { inject, injectable } from 'inversify'
import { InjectionKey } from '../../../core/ioc/injection-key.enum.ts'
import type { IdGenerator } from '../../../core/services/id-generator.ts'
import type { Logger } from '../../../core/services/logger.ts'
import type { App } from '../entities/app.ts'
import type { AppConfigProvider } from '../ports/app-config-provider.ts'

export interface StartAppInput {
  startedAt?: Date
}

export interface StartAppOutput {
  app: App
}

@injectable()
export class StartAppUseCase {
  constructor(
    @inject(InjectionKey.IdGenerator)
    private readonly idGenerator: IdGenerator,
    @inject(InjectionKey.AppConfigProvider)
    private readonly configProvider: AppConfigProvider,
    @inject(InjectionKey.Logger)
    private readonly logger: Logger
  ) {}

  async execute(input: StartAppInput = {}): Promise<StartAppOutput> {
    const config = await this.configProvider.load()
    const id = await this.idGenerator.generate()
    const startedAt = input.startedAt ?? new Date()
    this.logger.setLevel(config.logLevel)
    const app: App = {
      id,
      name: config.name,
      version: config.version,
      environment: config.environment,
      startedAt
    }
    this.logger.info('Application started', {
      appId: app.id,
      environment: app.environment,
      version: app.version
    })
    return { app }
  }
}
