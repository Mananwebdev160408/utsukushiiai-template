import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ValidationError } from "../errors";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isQueryDriven = req.method === "GET" || req.method === "DELETE";
      const payload = isQueryDriven
        ? { ...req.query, ...req.params }
        : req.body;

      const parsed = await schema.parseAsync(payload);

      if (!isQueryDriven) {
        req.body = parsed;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        return next(new ValidationError("Validation failed", details));
      }
      next(error);
    }
  };
