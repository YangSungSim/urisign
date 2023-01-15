import { Handler } from 'express';
import { ForbiddenException, UnauthorizedException } from '../common/exceptions';
import { verify } from '../lib/jwt';

export const verifyJWT: Handler = (req, res, next) => {
  const bearerToken = req.header('authorization');

  if (bearerToken) {
    try {
      const token = bearerToken.replace(/^Bearer /, '');
      const decoded = verify(token);

      next();
    } catch (err) {
      next(new UnauthorizedException());
    }
  } else {
    next();
  }
};
