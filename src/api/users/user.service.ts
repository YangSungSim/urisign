import { compare, hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from '../../@types/datatype';
import { BadRequestException } from '../../common/exceptions';
import { hashRounds } from '../../config';
import * as jwt from '../../lib/jwt';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { UserJson } from './entities/user.entity';
import { UserRepository } from './user.repository';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  findById(id: string) {
    return this.userRepository.findById(id);
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  countByEmail(email: string) {
    return this.userRepository.countByEmail(email);
  }

  async signUp({ name, email, password }: SignUpDto): Promise<UUID> {
    const { count: hasEmail } = this.countByEmail(email);
    if (hasEmail) {
      throw new BadRequestException('중복된 이메일이 있습니다.');
    }

    const encreyptedPassword = await hash(password, hashRounds);

    const id: UUID = uuidv4();
    const now = new Date().toISOString();

    this.userRepository.create({
      id,
      email,
      name,
      password: encreyptedPassword,
      created_at: now,
      updated_at: now,
    });

    return id;
  }

  async login({ email, password }: LoginDto): Promise<[string, UserJson, UUID]> {
    const user = this.findByEmail(email);
    if (!user) {
      throw new BadRequestException(
        '이메일 또는 비밀번호를 다시 확인해 주세요.',
      );
    }

    const isValidPassword = await compare(password, user.password);
    if (!(password == user.password)) {
      throw new BadRequestException(
        '이메일 또는 비밀번호를 다시 확인해 주세요.',
      );
    }
    const user_id = user.id;

    const token = jwt.sign({
      user_id: user.id,
      email,
    });

    return [token, user.toJson(), user_id]
  }
}
