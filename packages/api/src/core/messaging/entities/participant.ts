export type ParticipantId = string

export interface Participant {
  id: ParticipantId
  firstName: string
  lastName?: string
  handle?: string
  locale?: string
  createdAt: Date
}

export function createParticipant(
  props: Omit<Participant, 'createdAt'> & { createdAt?: Date }
): Participant {
  return {
    ...props,
    createdAt: props.createdAt ?? new Date()
  }
}
