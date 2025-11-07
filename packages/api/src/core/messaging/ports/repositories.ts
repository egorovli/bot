import type { Conversation, ConversationId } from '../entities/conversation.ts'
import type { Message, MessageId } from '../entities/message.ts'
import type { Participant, ParticipantId } from '../entities/participant.ts'

export interface ConversationRepository {
  findById(id: ConversationId): Promise<Conversation | undefined>
  save(conversation: Conversation): Promise<void>
}

export interface ParticipantRepository {
  findById(id: ParticipantId): Promise<Participant | undefined>
  save(participant: Participant): Promise<void>
}

export interface MessageRepository {
  findById(id: MessageId): Promise<Message | undefined>
  save(message: Message): Promise<void>
}
