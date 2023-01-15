import { compare, hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../../@types/datatype';
import { BadRequestException } from '../../common/exceptions';
import { hashRounds } from '../../config';
import * as jwt from '../../lib/jwt';
import { DocumentRepository } from './document.repository';
import { CreateDto } from './dto/create.dto';

export class DocumentService {
    constructor(private readonly documentRepository: DocumentRepository) {}

    findById(id: UUID) {
        return this.documentRepository.findById(id);
    }

    findAll() {
        return this.documentRepository.findAll();
    }

    async create({ userId, title, content, participants }): Promise<UUID> {

        const document_id: UUID = uuidv4();
        const now = new Date().toISOString();
        const status = 'CREATED';
        const type = 'CREATE';

        const [result, result2, result3, result4] = this.documentRepository.create({
            userId,
            document_id,
            participants,
            title,
            content,
            status,
            type,
            created_at: now,
            updated_at: now,
        });

        console.log([result, result2, result3, result4]);

        return document_id;
    }

    remove(id: UUID) {
        return this.documentRepository.remove(id);
    }

    publish(id: UUID) {
        return this.documentRepository.publish(id);
    }
    

}