import { NextFunction, Request, Response } from 'express';

export type Handler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => any | Promise<any>;

export const wrap = (handler: Handler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await handler(req, res, next);
      const response2 = {"success": true,
                          "respose": response,
                          "error": null}
      
      res.json(response2);
      next();
    } catch (err) {
      next(err);
    }
  };
