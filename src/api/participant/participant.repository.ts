import { Email, UUID } from '../../@types/datatype';
import { Repository } from '../../common/interfaces/repository.interface';
import { db } from '../../lib/database';
import { Document, DocumentRaw } from '../documents/entities/document.entities';
import { Participant, ParticipantRaw } from './entities/participant.entity';

export class ParticipantRepository implements Repository {
  readonly tableName = 'participants';

  findById(id: UUID) {
    const raw: ParticipantRaw = db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      .get(id);

    return Participant.fromJson(raw);
  }

  findByDocumentIdAndEmail(documentId: UUID, email: Email) {
    const raw: ParticipantRaw = db
      .prepare(
        `SELECT * FROM ${this.tableName} WHERE document_id = ? and email = ?`,
      )
      .get(documentId, email);

    return Participant.fromJson(raw);
  }

  readDocument(document_id: UUID, email: string) {
    let id = document_id;
    const raw: DocumentRaw = db
      .prepare(`SELECT * FROM documents WHERE id = ?`)
      .get(id);

    const participant_id = this.findByDocumentIdAndEmail(document_id, email).id;
    const created_at = new Date().toISOString();
    const type = 'READ_DOCUMENT';
    const data = null;

    const result4_1 = db
          .prepare(
              [
              'INSERT INTO',
              'participant_histories',
              '(participant_id, type, data, created_at)',
              'VALUES',
              '($participant_id, $type, $data, $created_at)',
              ].join(' '),
          )
          .run({participant_id, type, data, created_at });

    return Document.fromJson(raw);
  }


  sign(signature: string, document_id:UUID, email:string) {
    const status = 'SIGNED';
    const type = 'SIGN';

    //업데이트
    const result4 = db
                  .prepare(`UPDATE participants SET status = ? WHERE document_id = ? and email = ?`)
                  .run(status, document_id, email);

    //insert
    const data = null;
    const created_at = new Date().toISOString();
    const participant_id = this.findByDocumentIdAndEmail(document_id, email).id;
    const result4_1 = db
          .prepare(
              [
              'INSERT INTO',
              'participant_histories',
              '(participant_id, type, data, created_at)',
              'VALUES',
              '($participant_id, $type, $data, $created_at)',
              ].join(' '),
          )
          .run({participant_id, type, data, created_at });

    return true;
  }
}
