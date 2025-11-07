import type { ConversationId } from './conversation.ts'
import type { MessageId } from './message.ts'

export type ResponseKind = 'text'

export interface ResponsePlan {
  conversationId: ConversationId
  text: string
  kind: ResponseKind
  replyToMessageId?: MessageId
}

export function createTextResponsePlan(
  props: Omit<ResponsePlan, 'kind'>
): ResponsePlan {
  return {
    ...props,
    kind: 'text'
  }
}
