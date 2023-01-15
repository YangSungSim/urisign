import { Handler } from 'express';
import Tokens from 'csrf';

export const CSRF_TOKEN_HEADER = 'x-csrf-token';

const ignorePaths = ['/api'];
const tokens = new Tokens();
var secret = tokens.secretSync()
var token = tokens.create(secret)

export const csrf = (): Handler => (req, res, next) => {
  
  if (!tokens.verify(secret, token)) {
    throw new Error('invalid token!')
  }
  next();
};
