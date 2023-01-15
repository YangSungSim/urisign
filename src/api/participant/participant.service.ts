import { UUID } from '../../@types/datatype';
import { NotFoundException } from '../../common/exceptions';
import * as jwt from '../../lib/jwt';
import { SignDto } from './dto/sign.dto';
import { ParticipantTokenDto } from './dto/token.dto';
import { ParticipantJson } from './entities/participant.entity';
import { ParticipantRepository } from './participant.repository';

const DISABLE_STATUSES = Object.freeze(['CREATED', 'DELETED']);

export class ParticipantService {
  constructor(private readonly participantRepository: ParticipantRepository) {}

  issueAccessToken({
    documentId,
    email,
  }: ParticipantTokenDto): [string, ParticipantJson] {
    const participant = this.participantRepository.findByDocumentIdAndEmail(
      documentId,
      email,
    );

    console.log("findByDocumentIdAndEmail: >>>>>");
    console.log(participant);

    if (!participant || DISABLE_STATUSES.includes(participant.status)) {
      throw new NotFoundException('참가자 정보를 찾을 수 없습니다.');
    }

    const token = jwt.sign({
      participant_id: participant.id,
      email: participant.email,
    });

    return [
      token,
      participant.toJson(),
    ];
  }

  readDocument(document_id: UUID, email: string) {
    return this.participantRepository.readDocument(document_id, email);
  }


  async sign(signature: string,document_id:UUID, email:string): Promise<Boolean> {
    this.participantRepository.sign(signature, document_id, email);
    return true;
  }
}
