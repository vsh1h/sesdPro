import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { IUser } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../utils/enums";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface AuthResponse {
  user: IUser;
  token: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
    this.jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw ApiError.badRequest("Email already registered");
    }

    // Create new user
    const user = await this.userRepository.create(data);

    // Generate token
    const token = this.generateToken(user._id.toString());

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse as IUser,
      token,
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user with password
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Generate token
    const token = this.generateToken(user._id.toString());

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse as IUser,
      token,
    };
  }

  async verifyToken(token: string): Promise<string> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };
      return decoded.userId;
    } catch (error) {
      throw ApiError.unauthorized("Invalid or expired token");
    }
  }

  async getCurrentUser(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return user;
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }
}
