import type { BindingMap } from '../../core/ioc/index.ts'

import { TypedContainerModule } from '@inversifyjs/strongly-typed'

import { InjectionKey } from '../../core/ioc/index.ts'
import { KeywordResponsePolicy } from '../../modules/messaging/policies/keyword-response-policy.ts'
import {
  PlanResponseUseCase,
  RecordIncomingMessageUseCase,
  RegisterConversationUseCase
} from '../../modules/messaging/use-cases/index.ts'
import {
  InMemoryConversationRepository,
  InMemoryMessageRepository,
  InMemoryParticipantRepository
} from './repositories/index.ts'

export const messagingContainerModule = new TypedContainerModule<BindingMap>(
  ({ bind, isBound }) => {
    if (!isBound(InjectionKey.ConversationRepository)) {
      bind(InjectionKey.ConversationRepository)
        .to(InMemoryConversationRepository)
        .inSingletonScope()
    }

    if (!isBound(InjectionKey.ParticipantRepository)) {
      bind(InjectionKey.ParticipantRepository)
        .to(InMemoryParticipantRepository)
        .inSingletonScope()
    }

    if (!isBound(InjectionKey.MessageRepository)) {
      bind(InjectionKey.MessageRepository)
        .to(InMemoryMessageRepository)
        .inSingletonScope()
    }

    if (!isBound(InjectionKey.ResponsePolicy)) {
      bind(InjectionKey.ResponsePolicy)
        .toDynamicValue(
          () =>
            new KeywordResponsePolicy({
              responses: {
                start: 'Hey there! {agentName} is online and ready to chat.'
              },
              fallback: 'I am online but only handle /start for now.'
            })
        )
        .inSingletonScope()
    }

    if (!isBound(InjectionKey.RegisterConversationUseCase)) {
      bind(InjectionKey.RegisterConversationUseCase)
        .to(RegisterConversationUseCase)
        .inSingletonScope()
    }

    if (!isBound(InjectionKey.RecordIncomingMessageUseCase)) {
      bind(InjectionKey.RecordIncomingMessageUseCase)
        .to(RecordIncomingMessageUseCase)
        .inSingletonScope()
    }

    if (!isBound(InjectionKey.PlanResponseUseCase)) {
      bind(InjectionKey.PlanResponseUseCase)
        .to(PlanResponseUseCase)
        .inSingletonScope()
    }
  }
)
