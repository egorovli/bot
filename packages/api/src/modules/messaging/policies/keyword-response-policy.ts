import { injectable } from 'inversify'

import type { Agent } from '../entities/agent.ts'
import { isCommand, type Message } from '../entities/message.ts'
import { createTextResponsePlan } from '../entities/response-plan.ts'
import type { ResponsePolicy } from '../ports/response-policy.ts'

export interface KeywordResponsePolicyOptions {
  responses: Record<string, string>
  fallback?: string
}

/**
 * KeywordResponsePolicy - Minimal policy that maps normalized message text to
 * canned responses. It allows the application layer to stay framework-agnostic
 * while we bootstrap the bot's conversational flow.
 */
@injectable()
export class KeywordResponsePolicy implements ResponsePolicy {
  constructor(private readonly options: KeywordResponsePolicyOptions) {}

  async decide(agent: Agent, message: Message) {
    const normalized = this.normalize(message)
    const response =
      this.options.responses[normalized] ??
      (normalized === 'start' ? this.options.responses['start'] : undefined) ??
      this.options.fallback

    if (!response) {
      return null
    }

    const hydrated = response.replaceAll('{agentName}', agent.displayName)
    return createTextResponsePlan({
      conversationId: message.conversationId,
      text: hydrated,
      replyToMessageId: message.id
    })
  }

  private normalize(message: Message): string {
    const trimmed = message.text.trim().toLowerCase()

    if (isCommand(message)) {
      return trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
    }

    return trimmed
  }
}
