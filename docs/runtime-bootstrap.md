# App runtime bootstrap

## Core & domain model
- `packages/api/src/modules/app/entities/app.ts` outlines the in-memory representation of a running app instance (id, version, environment, start time).
- `packages/api/src/modules/app/entities/app-config.ts` captures the domain-facing configuration contract, including the log level the rest of the system should respect.
- `packages/api/src/modules/app/ports/app-config-provider.ts` is the boundary that any configuration source (env files, secrets managers, test doubles) must satisfy.
- `packages/api/src/core/services/logger.ts` defines the logger abstraction shared across modules so policies/use-cases are transport agnostic.

## Application use-case
- `packages/api/src/modules/app/use-cases/start-app-use-case.ts` orchestrates booting the app: load config, generate an id, set the logger level, and emit the first lifecycle log. It is the single entry point for "start a new instance" logic.

## Infrastructure adapters
- `packages/api/src/infrastructure/config/environment-app-config-provider.ts` reads `.env` values via `Bun.env`, normalizes them, and returns the domain config model. Defaults keep things runnable without extra setup.
- `packages/api/src/infrastructure/logging/console-logger.ts` is a minimal console logger that respects log levels and supports structured context payloads.
- `packages/api/src/infrastructure/ids/uuid-v7-generator.ts` provides deterministic id generation for the runtime without leaking crypto details into the domain.

## Composition root
- `packages/api/src/cmd/serve.ts` is the CLI entrypoint. It binds the runtime container module once, resolves `StartAppUseCase`, and logs the bootstrap duration alongside the computed config. Anything starting the app should go through this command so clean-architecture boundaries stay intact.

## Environment knobs
- `APP_NAME`, `VERSION`, and `NODE_ENV` now describe the runtime identity.
- `APP_LOG_LEVEL` (debug/info/warn/error) tunes the console logger before other modules emit logs.
- Default values keep development simple, but production shells can override them without touching code.
