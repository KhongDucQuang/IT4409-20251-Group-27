// src/middlewares/validate.ts
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

// Middleware này nhận vào một schema của Zod
export const validate = (schema: ZodSchema) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Nó sẽ tự động ném lỗi nếu validation thất bại
  // Lỗi này sẽ được 'errorHandler' của chúng ta bắt
  schema.parse({
    body: req.body,
    query: req.query,
    params: req.params,
  });
  next();
};