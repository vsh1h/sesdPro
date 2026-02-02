import { UserRepository } from "../repositories/user.repository";
import { IUser } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { PaginationHelper, PaginationResult } from "../utils/pagination";

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async getAllUsers(query: any): Promise<PaginationResult<IUser>> {
    const { page, limit, sort } = PaginationHelper.getPaginationParams(query);

    const users = await this.userRepository.findAll({});
    const total = await this.userRepository.count({});

    return PaginationHelper.buildPaginationResult(users, total, page, limit);
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user;
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser> {
    // Prevent updating sensitive fields
    const allowedUpdates = ["name"];
    const updates: any = {};

    allowedUpdates.forEach((field) => {
      if (data[field as keyof IUser]) {
        updates[field] = data[field as keyof IUser];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw ApiError.badRequest("No valid fields to update");
    }

    const updated = await this.userRepository.update(id, updates);
    if (!updated) {
      throw ApiError.notFound("User not found");
    }
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async updateUserRole(id: string, role: string): Promise<IUser> {
    if (!["ADMIN", "MEMBER"].includes(role)) {
      throw ApiError.badRequest("Invalid role");
    }

    const updated = await this.userRepository.update(id, {
      role,
    } as Partial<IUser>);
    if (!updated) {
      throw ApiError.notFound("User not found");
    }
    return updated;
  }
}
