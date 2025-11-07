import type { IdGenerator } from '../../core/services/id-generator.ts'

import { InjectionKey } from './injection-key.enum.ts'

/**
 * BindingMap - Type-safe mapping of InjectionKeys to their implementations
 *
 * This interface defines the contract for all container bindings, providing
 * compile-time type safety for bindings, retrievals, and injections.
 *
 * @see https://inversify.io/docs/ecosystem/strongly-typed/
 */
export interface BindingMap {
	[InjectionKey.IdGenerator]: IdGenerator
}
