import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { AuthService } from "../services/auth.service";
import { UserRepository } from "../repositories/user.repository";
import { UserRole } from "../utils/enums";

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided");
    }

    const token = authHeader.substring(7);
    const userId = await authService.verifyToken(token);

    (req as any).userId = userId;

    const user = await authService.getCurrentUser(userId);
    (req as any).user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = (req as any).user;

      if (!user) {
        throw ApiError.unauthorized("Authentication required");
      }

      if (roles.length && !roles.includes(user.role)) {
        throw ApiError.forbidden(
          "You do not have permission to access this resource",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
