import type { AgentId } from './agent.ts'

export type ConversationId = string

export type ConversationKind = 'direct' | 'group' | 'broadcast'

export interface Conversation {
  id: ConversationId
  kind: ConversationKind
  title?: string
  ownerAgentId: AgentId
  createdAt: Date
}

export function createConversation(
  props: Omit<Conversation, 'createdAt'> & { createdAt?: Date }
): Conversation {
  return {
    ...props,
    createdAt: props.createdAt ?? new Date()
  }
}
