import type { Participant, ParticipantId } from '../../../modules/messaging/entities/participant.ts'
import type { ParticipantRepository } from '../../../modules/messaging/ports/repositories.ts'

import { injectable } from 'inversify'

@injectable()
export class InMemoryParticipantRepository implements ParticipantRepository {
  private readonly participants = new Map<ParticipantId, Participant>()

  async findById(id: ParticipantId): Promise<Participant | undefined> {
    return this.participants.get(id)
  }

  async save(participant: Participant): Promise<void> {
    this.participants.set(participant.id, participant)
  }
}
