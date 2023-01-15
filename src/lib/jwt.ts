import * as jwt from 'jsonwebtoken';
import { jwtSecret } from '../config';

export type JwtPayload = JwtPayloadOfUser | JwtPayloadOfParticipant;

export interface JwtDefaultPayload {
  email: string;
}

export interface JwtPayloadOfParticipant extends JwtDefaultPayload {
  participant_id: string;
}

export interface JwtPayloadOfUser extends JwtDefaultPayload {
  user_id: string;
}

export function sign(payload: JwtPayload, options?: jwt.SignOptions) {
  return jwt.sign(payload, jwtSecret, {
    algorithm: 'HS256',
    expiresIn: '1d',
    ...options,
  });
}

export function verify(token: string, options?: jwt.VerifyOptions) {
  return jwt.verify(token, jwtSecret, options) as JwtPayload;
}
