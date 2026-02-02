import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const validate = (
  validationFn: (data: any) => { isValid: boolean; errors?: string[] },
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = validationFn(req.body);

      if (!result.isValid) {
        throw ApiError.badRequest(
          result.errors?.join(", ") || "Validation failed",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
