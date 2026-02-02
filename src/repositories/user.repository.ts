import { User, IUser } from "../models/User";
import { ApiError } from "../utils/ApiError";

export class UserRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = await User.create(userData);
      return user;
    } catch (error: any) {
      if (error.code === 11000) {
        throw ApiError.badRequest("Email already exists");
      }
      throw error;
    }
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select("-password");
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id).select("+password");
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select("+password");
  }

  async findAll(query: any = {}): Promise<IUser[]> {
    return User.find(query).select("-password");
  }

  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: userData },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user;
  }

  async delete(id: string): Promise<void> {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw ApiError.notFound("User not found");
    }
  }

  async count(query: any = {}): Promise<number> {
    return User.countDocuments(query);
  }
}
