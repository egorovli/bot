# Runtime bootstrap

## Core contracts
- `packages/api/src/core/services/logger.ts` defines the logging interface and log levels. Everything talks to `InjectionKey.Logger` so adapters stay pluggable.
- `packages/api/src/core/services/runtime-config-provider.ts` owns the minimal config shape (name, env, version, log level) plus the provider contract. This replaced the previous app module.
- `packages/api/src/core/services/id-generator.ts` is reused directly to issue runtime identifiers when the process starts.

## Infrastructure adapters
- `packages/api/src/infrastructure/config/environment-app-config-provider.ts` reads `.env` via `Bun.env`, normalizes log levels, and returns the `RuntimeConfig` contract.
- `packages/api/src/infrastructure/logging/console-logger.ts` implements the `Logger` port with level-aware stdout/stderr writes.
- `packages/api/src/infrastructure/ids/uuid-v7-generator.ts` (still a thin wrapper around `crypto.randomUUID`) powers runtime ids.

## Composition
- `packages/api/src/cmd/serve.ts` now loads a `TypedContainerModule<BindingMap>` (`runtimeContainerModule`) once. The module binds logger/config/id-generator singletons only when they are not already registered, mirroring the strongly-typed usage described in the Inversify docs and community examples (see DeepWiki summary and the Perplexity example gathered earlier).
- After loading the module, the command pulls the config + id generator directly, applies the log level, emits the "Runtime ready" log, and prints a single CLI line.

## Environment knobs
- `APP_NAME`, `VERSION`, `NODE_ENV`, and `APP_LOG_LEVEL` remain the only inputs. Missing values fall back to developer-friendly defaults so Bun scripts start without extra setup.
