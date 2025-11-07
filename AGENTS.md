# Repository Guidelines

Contributors build a Bun-powered TypeScript monorepo focused on the API living in `packages/api`. Use this guide to stay aligned on structure, tooling, and review expectations.

## Project Structure & Module Organization
`packages/api/src` is split by responsibility: `cmd` holds CLI/bootstrap code, `core` models pure domain logic, `modules` organize feature entry points, `infrastructure` wires adapters, and `types` centralize shared contracts. Shared docs, ADRs, and diagrams belong in `docs/`. Container bits live under `packages/api/docker/` and the top-level `compose.yml` for local dependencies; update them whenever interfaces change. Keep new packages or tools in `packages/*` so they participate in the workspace install. We aim for clean architecture boundaries but always keep implementations simple and minimalistic—avoid ceremony unless it buys testability or clarity.

## Build, Test, and Development Commands
- `bun install` — install root and workspace dependencies.
- `bun run --filter @bot/api dev` — start the API with hot reload via `src/index.ts`.
- `bun run --filter @bot/api types:check` — strict TypeScript compile check.
- `bun run lint` / `bun run lint:fix` — biome static analysis (add `--write` for autofix).
- `bun run --filter @bot/api test` — Bun test suite with randomized ordering.
- `bun run --filter @bot/api test:coverage` — emit lcov files under `packages/api/coverage`.

## Coding Style & Naming Conventions
Stick to ESM TypeScript with 2-space indentation. Favor small, focused modules with filenames that describe the exported capability (`modules/session/session.service.ts`). Use `PascalCase` for classes/inversify services, `camelCase` for functions, and `SCREAMING_SNAKE_CASE` only for environment constants. Run Biome before committing; it enforces import sorting, unused symbol pruning, and stylistic rules.

## Testing Guidelines
Write Bun tests next to the code they cover using the `.test.ts` or `.spec.ts` suffix. Structure tests as arrange/act/assert blocks and keep mocks inside the module when possible. Randomized execution catches hidden coupling—avoid relying on global state, and seed deterministically when diagnosing flake (`BUN_TEST_SEED=123 bun test`). Attach coverage reports to PRs when exercising new surfaces.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat: add session module`, `fix: revert race condition`) to keep history searchable—the repo already uses the pattern (`chore: initial project setup...`). Each PR should include: intent summary, linked issue, testing notes (commands + output), and screenshots for user-facing flows. Keep diffs focused, ensure lint/tests pass, and flag breaking changes in both the title and description.

## Messaging Domain Notes
- Messaging domain logic lives under `packages/api/src/modules/messaging`, mirroring the clean-architecture example we studied but intentionally transport-agnostic so adapters (Telegram, stdin/stdout, etc.) depend on the domain—not the other way around.
- Entities (`Agent`, `Conversation`, `Participant`, `Message`, `ResponsePlan`) carry only generic identifiers, naming, conversation-kind, and timing so any transport can materialize them. A hard rule: never mention concrete protocols (e.g., “Telegram”) in the core layer.
- To stay minimalistic, domain entities expose plain object properties plus simple factory helpers (no class getter/setter patterns or `readonly` interface modifiers)—prefer object literals and pure functions.
- Use cases (`RegisterConversationUseCase`, `RecordIncomingMessageUseCase`, `PlanResponseUseCase`) depend solely on repository/policy ports, keeping them runnable in unit tests or alternate drivers (grammY runner, CLI, etc.).
- `KeywordResponsePolicy` remains the starter policy; implement richer planners (LLM, rules, etc.) as additional `ResponsePolicy` implementations so you can swap them without touching the domain.

## Cursor Rule Imports
- **Boolean checks**: Never use `Boolean(value)` or `!!value`. Write explicit predicates (length comparisons, strict equality checks) when coercing.
- **Import order**: Keep four groups separated by blank lines—type-only imports first, then Node/Bun built-ins, external modules, and finally local paths. Alphabetize within each group and avoid mixing value + type imports in one statement.
- **Missing values**: Prefer `undefined` over `null` for optional data. Repository/use-case signatures should follow the `Foo | undefined` pattern unless legacy interop forces `null`.
- **Interface immutability**: Never use `readonly` on interface properties. If immutability is required, enforce it at usage sites (e.g., via `as const`) rather than the type definition.
