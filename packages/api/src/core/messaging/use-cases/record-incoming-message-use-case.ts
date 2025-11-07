import { inject, injectable } from 'inversify'

import { InjectionKey } from '../../ioc/injection-key.enum.ts'
import type { AgentId } from '../entities/agent.ts'
import {
  type Conversation,
  type ConversationId,
  type ConversationKind,
  createConversation
} from '../entities/conversation.ts'
import {
  type Message,
  type MessageId,
  type MessageKind,
  createMessage
} from '../entities/message.ts'
import {
  type Participant,
  type ParticipantId,
  createParticipant
} from '../entities/participant.ts'
import type {
  ConversationRepository,
  MessageRepository,
  ParticipantRepository
} from '../ports/repositories.ts'

export interface ConversationSnapshot {
  id: ConversationId
  kind: ConversationKind
  title?: string
  ownerAgentId: AgentId
}

export interface ParticipantSnapshot {
  id: ParticipantId
  firstName: string
  lastName?: string
  handle?: string
  locale?: string
}

export interface RecordIncomingMessageInput {
  messageId: MessageId
  conversation: ConversationSnapshot
  participant: ParticipantSnapshot
  text: string
  kind: MessageKind
  sentAt?: Date
  replyToMessageId?: MessageId
}

export interface RecordIncomingMessageOutput {
  conversation: Conversation
  participant: Participant
  message: Message
}

@injectable()
export class RecordIncomingMessageUseCase {
  constructor(
    @inject(InjectionKey.ConversationRepository)
    private readonly conversationRepository: ConversationRepository,
    @inject(InjectionKey.ParticipantRepository)
    private readonly participantRepository: ParticipantRepository,
    @inject(InjectionKey.MessageRepository)
    private readonly messageRepository: MessageRepository
  ) {}

  async execute(input: RecordIncomingMessageInput): Promise<RecordIncomingMessageOutput> {
    const [conversation, participant] = await Promise.all([
      this.ensureConversation(input.conversation),
      this.ensureParticipant(input.participant)
    ])

    const message = createMessage({
      id: input.messageId,
      conversationId: conversation.id,
      participantId: participant.id,
      text: input.text,
      kind: input.kind,
      sentAt: input.sentAt,
      replyToMessageId: input.replyToMessageId
    })

    await this.messageRepository.save(message)

    return { conversation, participant, message }
  }

  private async ensureConversation(snapshot: ConversationSnapshot): Promise<Conversation> {
    const existing = await this.conversationRepository.findById(snapshot.id)
    if (existing) {
      return existing
    }

    const conversation = createConversation({
      id: snapshot.id,
      kind: snapshot.kind,
      title: snapshot.title,
      ownerAgentId: snapshot.ownerAgentId
    })

    await this.conversationRepository.save(conversation)
    return conversation
  }

  private async ensureParticipant(snapshot: ParticipantSnapshot): Promise<Participant> {
    const existing = await this.participantRepository.findById(snapshot.id)
    if (existing) {
      return existing
    }

    const participant = createParticipant({
      ...snapshot
    })

    await this.participantRepository.save(participant)
    return participant
  }
}
