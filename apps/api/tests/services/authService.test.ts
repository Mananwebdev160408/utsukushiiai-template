import { authService } from "../../src/services";
import { userRepository } from "../../src/repositories";
import { comparePassword } from "../../src/utils/password";
import { signAccessToken } from "../../src/utils/jwt";
import { UnauthorizedError } from "../../src/errors";

jest.mock("../../src/repositories");
jest.mock("../../src/utils/password");
jest.mock("../../src/utils/jwt");

describe("Auth Service", () => {
  const mockUser = {
    _id: "usr_123",
    email: "test@example.com",
    name: "Test User",
    password: "hashed_password",
    role: "user",
    toObject: function () {
      const { password, toObject, ...rest } = this;
      return rest;
    },
  };

  const mockToken = "mock_jwt_token";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return tokens and user on successful login", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
      (comparePassword as jest.Mock).mockResolvedValueOnce(true);
      (signAccessToken as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com",
      );
      expect(comparePassword).toHaveBeenCalledWith(
        "password123",
        "hashed_password",
      );

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it("should throw UnauthorizedError on invalid email", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        authService.login({ email: "invalid@example.com", password: "password" }),
      ).rejects.toThrow(UnauthorizedError);

      expect(comparePassword).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedError on invalid password", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
      (comparePassword as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        authService.login({ email: "test@example.com", password: "wrongpassword" }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
