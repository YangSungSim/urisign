import { Email, UUID } from '../../@types/datatype';
import { Repository } from '../../common/interfaces/repository.interface';
import { db } from '../../lib/database';
import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentRaw } from './entities/document.entities';


export class DocumentRepository implements Repository {
    readonly tableName = 'documents';
  
    findById(id: UUID) {
      const raw: DocumentRaw = db
        .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
        .get(id);

      console.log("findById: >>>>>");
      console.log(`SELECT * FROM ${this.tableName} WHERE id = `+id);
      console.log(Document.fromJson(raw));

      const document_id = id;

      const raw2 = db
            .prepare(`SELECT id, name, email, status, created_at, updated_at  FROM participants WHERE document_id = ?`)
            .get(document_id);

      raw['participants'] = raw2;
      return raw;
    }
  
    findAll() {
      const raw: DocumentRaw[] = db
        .prepare(
          `SELECT * FROM ${this.tableName}`,
        ).all();

        
        for (let i=0; i< raw.length; i++) {
          let document_id = raw[i].id;
          const raw2 = db
            .prepare(`SELECT id, name, email, status, created_at, updated_at  FROM participants WHERE document_id = ?`)
            .all(document_id);
          
          raw[i]['participants'] = raw2;  
        }

        console.log(raw);
  
      return raw;
    }

    create({
        userId,
        document_id,
        participants,
        title,
        content,
        status,
        type,
        created_at,
        updated_at
    }) {
        
        let id = document_id;
        const user_id = userId;
        const result = db
                        .prepare(
                            [
                            'INSERT INTO',
                            this.tableName,
                            '(id, user_id, title, content, status, created_at, updated_at)',
                            'VALUES',
                            '($id, $user_id, $title, $content, $status, $created_at, $updated_at)',
                            ].join(' '),
                        )
                        .run({id, user_id, title, content, status, created_at, updated_at });

        const data = null;
        const result2 = db
                        .prepare(
                            [
                            'INSERT INTO',
                            'document_histories',
                            '(document_id, type, data, created_at)',
                            'VALUES',
                            '($document_id, $type, $data, $created_at)',
                            ].join(' '),
                        )
                        .run({document_id, type, data, created_at });

        const signature = null;
        
        const result3 = [];
        const result4 = [];

        for (let i=0; i< participants.length; i++) {
          const name = participants[i].name;
          const email = participants[i].email;
          const participant_id: UUID = uuidv4();
          id = participant_id;

          const result3_1 = db
                        .prepare(
                            [
                            'INSERT INTO',
                            'participants',
                            '(id, document_id, name, email, status, signature, created_at, updated_at)',
                            'VALUES',
                            '($id, $document_id, $name, $email, $status, $signature, $created_at, $updated_at)',
                            ].join(' '),
                        )
                        .run({id, document_id, name, email, status, signature, created_at, updated_at });
          
          result3.push(result3_1);

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

          result4.push(result4_1);

        }
        
        return [result, result2, result3, result4];

    }


    remove(id: UUID) {
      db
        .prepare(`UPDATE ${this.tableName} SET status='DELETED' WHERE id = ?`)
        .run(id);

      
      const type = "DELETE";
      const data = null;
      const now = new Date().toISOString();
      const created_at = now;
      const document_id = id;
      const participant_id = db.prepare(`SELECT id FROM participants WHERE document_id = ?`).get(document_id).id;
      console.log("participant_id:>>>>>>>>>>");
      console.log(participant_id);

      const result4 = db
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

      const result2 = db
                    .prepare(
                        [
                        'INSERT INTO',
                        'document_histories',
                        '(document_id, type, data, created_at)',
                        'VALUES',
                        '($document_id, $type, $data, $created_at)',
                        ].join(' '),
                    )
                    .run({document_id, type, data, created_at });

      console.log("remove: 논리삭제 >>>>>");
      console.log(`DELETE FROM ${this.tableName} WHERE id = `+id);


      
  
      return true;
    }

    publish(id1: UUID) {
      console.log("publish: >>>>>>.");
      let id = id1;
      db
        .prepare(`UPDATE ${this.tableName} SET status='PUBLISHED' WHERE id = ?`)
        .run(id);

      
      let type = "INVITED";
      const data = null;
      const now = new Date().toISOString();
      const created_at = now;
      const document_id = id;
      const participant_id = db.prepare(`SELECT id FROM participants WHERE document_id = ?`).get(document_id).id;
      console.log("participant_id:>>>>>>>>>>");
      console.log(participant_id);

      id = participant_id;
      db
        .prepare(`UPDATE participants SET status='INVITED' WHERE id = ?`)
        .run(id);

      const result4 = db
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

      type = "PUBLISH";
      const result2 = db
                    .prepare(
                        [
                        'INSERT INTO',
                        'document_histories',
                        '(document_id, type, data, created_at)',
                        'VALUES',
                        '($document_id, $type, $data, $created_at)',
                        ].join(' '),
                    )
                    .run({document_id, type, data, created_at });

      return true;
    }
  }

