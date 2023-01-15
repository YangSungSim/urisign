import { Email, UUID } from '../../../@types/datatype';
import { ParticipantJson } from '../entities/participant.entity';

export interface ParticipantTokenDto {
  documentId: UUID;
  email: Email;
}

export interface ParticipantTokenResponse {
  token: string;
  participant: ParticipantJson;
}
