import { CountResult } from '../../common/interfaces/database-result';
import { Email, UUID } from '../../@types/datatype';
import { db } from '../../lib/database';
import { User, UserRaw } from './entities/user.entity';
import { Repository } from '../../common/interfaces/repository.interface';

export class UserRepository implements Repository {
  tableName = 'users';

  findById(id: UUID) {
    const raw: UserRaw = db
      .prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`)
      .get(id);

    return User.fromJson(raw);
  }

  findByEmail(email: Email) {
    const raw: UserRaw = db
      .prepare(`SELECT * FROM ${this.tableName} WHERE email = ?`)
      .get(email);

    return User.fromJson(raw);
  }

  countByEmail(email: Email) {
    const result: CountResult = db
      .prepare(
        `SELECT COUNT(*) as count FROM ${this.tableName} WHERE email = ?`,
      )
      .get(email);

    return result
  }

  create(raw: UserRaw) {
    const result = db
      .prepare(
        [
          'INSERT INTO',
          this.tableName,
          '(id, email, name, password, created_at, updated_at)',
          'VALUES',
          '($id, $email, $name, $password, $created_at, $updated_at)',
        ].join(' '),
      )
      .run(raw);

    return result
  }
}
