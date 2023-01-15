import { Email, UUID } from '../../../@types/datatype';
import { ParticipantJson } from '../entities/participant.entity';

export interface SignDto {
    signature: string;
}
  
export type SignResponse = Boolean;