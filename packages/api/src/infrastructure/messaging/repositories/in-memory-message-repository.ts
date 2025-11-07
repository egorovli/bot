import type { Message, MessageId } from '../../../modules/messaging/entities/message.ts'
import type { MessageRepository } from '../../../modules/messaging/ports/repositories.ts'

import { injectable } from 'inversify'

@injectable()
export class InMemoryMessageRepository implements MessageRepository {
  private readonly messages = new Map<MessageId, Message>()

  async findById(id: MessageId): Promise<Message | undefined> {
    return this.messages.get(id)
  }

  async save(message: Message): Promise<void> {
    this.messages.set(message.id, message)
  }
}
