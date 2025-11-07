import type { Agent } from '../entities/agent.ts'
import type { Message } from '../entities/message.ts'
import type { ResponsePlan } from '../entities/response-plan.ts'

export interface ResponsePolicy {
  decide(agent: Agent, message: Message): Promise<ResponsePlan | null>
}
