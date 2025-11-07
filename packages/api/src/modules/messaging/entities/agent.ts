export type AgentId = string

export interface Agent {
  id: AgentId
  username: string
  displayName: string
  createdAt: Date
}

export function createAgent(
  props: Omit<Agent, 'createdAt'> & { createdAt?: Date }
): Agent {
  return {
    ...props,
    createdAt: props.createdAt ?? new Date()
  }
}
