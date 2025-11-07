import { inject, injectable } from 'inversify'

import { InjectionKey } from '../../ioc/injection-key.enum.ts'
import type { Agent } from '../entities/agent.ts'
import type { Message } from '../entities/message.ts'
import type { ResponsePlan } from '../entities/response-plan.ts'
import type { ResponsePolicy } from '../ports/response-policy.ts'

export interface PlanResponseInput {
  agent: Agent
  message: Message
}

export interface PlanResponseOutput {
  plan: ResponsePlan | null
}

@injectable()
export class PlanResponseUseCase {
  constructor(
    @inject(InjectionKey.ResponsePolicy)
    private readonly responsePolicy: ResponsePolicy
  ) {}

  async execute(input: PlanResponseInput): Promise<PlanResponseOutput> {
    const plan = await this.responsePolicy.decide(input.agent, input.message)
    return { plan }
  }
}
