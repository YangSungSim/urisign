import { Email, Name, Password } from '../../../@types/datatype';

export interface SignUpDto {
  email: Email;
  password: Password;
  name: Name;
}

export type SignUpResponse = boolean;
