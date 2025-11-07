import { inject, injectable } from 'inversify'

import { InjectionKey } from '../../ioc/injection-key.enum.ts'
import {
  type Conversation,
  type ConversationId,
  type ConversationKind,
  createConversation
} from '../entities/conversation.ts'
import type { AgentId } from '../entities/agent.ts'
import type { ConversationRepository } from '../ports/repositories.ts'

export interface RegisterConversationInput {
  conversationId: ConversationId
  kind: ConversationKind
  title?: string
  ownerAgentId: AgentId
}

export interface RegisterConversationOutput {
  conversation: Conversation
  wasCreated: boolean
}

@injectable()
export class RegisterConversationUseCase {
  constructor(
    @inject(InjectionKey.ConversationRepository)
    private readonly conversationRepository: ConversationRepository
  ) {}

  async execute(
    input: RegisterConversationInput
  ): Promise<RegisterConversationOutput> {
    const existing = await this.conversationRepository.findById(input.conversationId)

    if (existing) {
      return { conversation: existing, wasCreated: false }
    }

    const conversation = createConversation({
      id: input.conversationId,
      kind: input.kind,
      title: input.title,
      ownerAgentId: input.ownerAgentId
    })

    await this.conversationRepository.save(conversation)

    return { conversation, wasCreated: true }
  }
}
