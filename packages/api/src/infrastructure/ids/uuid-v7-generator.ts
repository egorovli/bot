import type { IdGenerator } from '../../core/services/id-generator.ts'

import { injectable } from 'inversify'

@injectable()
export class UuidV7Generator implements IdGenerator {
	generate(): string {
		return Bun.randomUUIDv7()
	}
}
