import { ErrorRequestHandler } from 'express';
import { HttpException } from '../common/exceptions/http.exception';

export const errorMiddleware: ErrorRequestHandler = (
  err: HttpException,
  req,
  res,
  next,
) => {
  const status = err.status || 500;
  const message = err.message;

  res.status(status).send({
    "success": false,
    "response": null,
    "error": {
    status,
    message,
    }
  });

  next();
};
