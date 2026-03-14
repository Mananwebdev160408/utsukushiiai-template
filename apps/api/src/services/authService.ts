import { userRepository } from "../repositories/userRepository";
import { Session } from "../models/Session";
import { UnauthorizedError, ConflictError, AppError } from "../errors";
import {
  hashPassword,
  comparePassword,
  generateTokens,
  verifyRefreshToken,
  TokenPayload,
  generateId,
} from "../utils";
import { config } from "../config";

export class AuthService {
  async register(data: any) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser)
      throw new ConflictError("User with this email already exists");

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) throw new ConflictError("Username is already taken");

    const hashedPassword = await hashPassword(data.password);
    const user = await userRepository.create({
      _id: generateId("usr"),
      ...data,
      password: hashedPassword,
    });

    const payload: TokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(payload);
    await this.createSession(user._id, tokens.refreshToken);

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(data: any) {
    const user = await userRepository.findByEmail(data.email);
    if (!user || !user.password) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const payload: TokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(payload);
    await this.createSession(user._id, tokens.refreshToken);

    // Update last login
    await userRepository.update(user._id, { lastLoginAt: new Date() });

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshToken(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      const session = await Session.findOne({
        userId: payload.userId,
        refreshToken: token,
      });

      if (!session || session.expiresAt < new Date()) {
        if (session) await session.deleteOne();
        throw new UnauthorizedError("Invalid or expired refresh token");
      }

      const user = await userRepository.findById(payload.userId);
      if (!user) throw new UnauthorizedError("User not found");

      const newPayload: TokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
      };

      const tokens = generateTokens(newPayload);

      // Rotate refresh token
      session.refreshToken = tokens.refreshToken;
      session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await session.save();

      return { user: this.sanitizeUser(user), ...tokens };
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  async logout(userId: string, refreshToken: string) {
    await Session.deleteOne({ userId, refreshToken });
  }

  private async createSession(userId: string, refreshToken: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await Session.create({ userId, refreshToken, expiresAt });
  }

  private sanitizeUser(user: any) {
    const u = user.toObject ? user.toObject() : user;
    delete u.password;
    return u;
  }
}

export const authService = new AuthService();
