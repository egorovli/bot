import type { IdGenerator } from '../../core/services/id-generator.ts'
import type { Logger } from '../../core/services/logger.ts'
import type {
  ConversationRepository,
  MessageRepository,
  ParticipantRepository
} from '../../modules/messaging/ports/repositories.ts'
import type { ResponsePolicy } from '../../modules/messaging/ports/response-policy.ts'
import type {
  PlanResponseUseCase,
  RecordIncomingMessageUseCase,
  RegisterConversationUseCase
} from '../../modules/messaging/use-cases/index.ts'
import type { RuntimeConfigProvider } from '../services/runtime-config-provider.ts'

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
  [InjectionKey.Logger]: Logger
  [InjectionKey.IdGenerator]: IdGenerator
  [InjectionKey.RuntimeConfigProvider]: RuntimeConfigProvider
  [InjectionKey.ConversationRepository]: ConversationRepository
  [InjectionKey.ParticipantRepository]: ParticipantRepository
  [InjectionKey.MessageRepository]: MessageRepository
  [InjectionKey.ResponsePolicy]: ResponsePolicy
  [InjectionKey.RegisterConversationUseCase]: RegisterConversationUseCase
  [InjectionKey.RecordIncomingMessageUseCase]: RecordIncomingMessageUseCase
  [InjectionKey.PlanResponseUseCase]: PlanResponseUseCase
}
