import type { Conversation, ConversationId } from '../../../modules/messaging/entities/conversation.ts'
import type { ConversationRepository } from '../../../modules/messaging/ports/repositories.ts'

import { injectable } from 'inversify'

@injectable()
export class InMemoryConversationRepository implements ConversationRepository {
  private readonly conversations = new Map<ConversationId, Conversation>()

  async findById(id: ConversationId): Promise<Conversation | undefined> {
    return this.conversations.get(id)
  }

  async save(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation)
  }
}
