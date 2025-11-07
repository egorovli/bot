import type { ConversationId } from './conversation.ts'
import type { ParticipantId } from './participant.ts'

export type MessageId = string

export type MessageKind = 'text' | 'command'

export interface Message {
  id: MessageId
  conversationId: ConversationId
  participantId: ParticipantId
  text: string
  kind: MessageKind
  sentAt: Date
  replyToMessageId?: MessageId
}

export function createMessage(
  props: Omit<Message, 'sentAt'> & { sentAt?: Date }
): Message {
  return {
    ...props,
    sentAt: props.sentAt ?? new Date()
  }
}

export function isCommand(message: Message): boolean {
  return message.kind === 'command'
}
