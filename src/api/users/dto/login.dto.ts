import { Email, Password } from '../../../@types/datatype';
import { UserJson } from '../entities/user.entity';

export interface LoginDto {
  email: Email;
  password: Password;
}

export interface LoginResponse {
  token: string;
  user: UserJson;
}
