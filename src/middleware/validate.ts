import { ZodError, ZodObject, ZodRawShape, ZodIssue } from "zod";
import { Request, Response, NextFunction, RequestHandler } from "express";

// Schema type
type Schema = ZodObject<ZodRawShape>;

/**
 * Express validation middleware using Zod
 */
export function validate<T extends Schema>(schema: T): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
      return res.status(400).json({
        message: "Validation failed",
        errors: [{ field: "", message: "Request body is missing" }],
      });
    }

    try {
      // Parse and validate the request body
      req.body = schema.parse(req.body);
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: err.issues.map((issue: ZodIssue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      next(err);
    }
  };
}
