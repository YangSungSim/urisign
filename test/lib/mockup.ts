import { hashSync } from 'bcryptjs';
import * as faker from 'faker';
import { UserRepository } from '../../src/api/users/user.repository';
import { UserRaw } from '../../src/api/users/entities/user.entity';
import { hashRounds } from '../../src/config';
import { db } from '../../src/lib/database';

const userRepository = new UserRepository();

export function createUser(raw: UserRaw = mockUserRaw()) {
  const data = JSON.parse(JSON.stringify(raw));
  data.password = hashSync(data.password, hashRounds);
  return userRepository.create(data);
}

export function updateDocumentStatus(documentId: string, status: string) {
  db.prepare('UPDATE `documents` SET status = ? WHERE id = ?').run(
    status,
    documentId,
  );
}

export function updateParticipantStatus(participantId: string, status: string) {
  db.prepare('UPDATE `participants` SET status = ? WHERE id = ?').run(
    status,
    participantId,
  );
}

export function genUUID() {
  return faker.datatype.uuid();
}

export function mockUserRaw(): UserRaw {
  const now = new Date().toISOString()
  return {
    id: genUUID(),
    email: faker.internet.email(),
    name: faker.internet.userName(),
    password: faker.internet.password(),
    created_at: now,
    updated_at: now,
  };
}

export function mockCreateDocumentDto(participantCount = 2) {
  const dto = {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(),
    participants: [],
  };

  for (let i = 0; i < participantCount; i++) {
    dto.participants.push({
      email: faker.internet.email(),
      name: faker.internet.userName(),
    });
  }

  return dto;
}
