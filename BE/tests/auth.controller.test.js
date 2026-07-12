const authController = require('../controllers/auth.controller');
const User = require('../model/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

jest.mock('../model/User.model');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('nodemailer');
jest.mock('google-auth-library');

describe('Auth Controller - Unit Tests', () => {
  let mockRequest;
  let mockResponse;
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      _id: 'user_999999',
      name: 'Tester User',
      email: 'test@example.com',
      phone: '0123456789',
      passwordHash: 'hashedSecretPassword',
      role: 'customer',
      status: 'active',
      save: jest.fn().mockResolvedValue(true)
    };

    mockRequest = {
      body: {},
      params: {},
      query: {},
      headers: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };

    process.env.JWT_SECRET = 'my_super_secret_jwt_key';
    process.env.JWT_REFRESH_SECRET = 'my_super_secret_refresh_key';
  });

  describe('signup', () => {
    it('should create new user and return 201 with access tokens', async () => {
      mockRequest.body = {
        name: 'Tester User',
        email: 'test@example.com',
        phone: '0123456789',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null); // No email/phone conflict
      bcrypt.hash.mockResolvedValue('hashedSecretPassword');
      User.create.mockResolvedValue(mockUser);

      jwt.sign
        .mockReturnValueOnce('mockAccessToken')
        .mockReturnValueOnce('mockRefreshToken');

      await authController.signup(mockRequest, mockResponse);

      expect(User.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Dang ky tai khoan thanh cong',
          data: expect.objectContaining({
            accessToken: 'mockAccessToken',
            refreshToken: 'mockRefreshToken'
          })
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = {
        email: 'test@example.com'
      };

      await authController.signup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Vui long nhap day du cac truong bat buoc'
        })
      );
    });

    it('should return 409 if email is already registered', async () => {
      mockRequest.body = {
        name: 'Tester User',
        email: 'test@example.com',
        phone: '0123456789',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(mockUser); // Existing user found

      await authController.signup(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Email da duoc su dung'
        })
      );
    });
  });

  describe('login', () => {
    it('should return 200 with tokens on successful login', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      // User model select mock chaining for select('+passwordHash')
      const selectMock = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({
        select: selectMock
      });

      bcrypt.compare.mockResolvedValue(true);
      jwt.sign
        .mockReturnValueOnce('mockAccessToken')
        .mockReturnValueOnce('mockRefreshToken');

      await authController.login(mockRequest, mockResponse);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedSecretPassword');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Dang nhap thanh cong',
          data: expect.objectContaining({
            accessToken: 'mockAccessToken',
            refreshToken: 'mockRefreshToken'
          })
        })
      );
    });

    it('should return 400 if email or password is empty', async () => {
      mockRequest.body = {
        email: ''
      };

      await authController.login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Email va mat khau la bat buoc'
        })
      );
    });

    it('should return 401 if user does not exist', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const selectMock = jest.fn().mockResolvedValue(null);
      User.findOne.mockReturnValue({
        select: selectMock
      });

      await authController.login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Email hoac mat khau khong dung'
        })
      );
    });

    it('should return 401 if password check fails', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongPassword'
      };

      const selectMock = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({
        select: selectMock
      });

      bcrypt.compare.mockResolvedValue(false);

      await authController.login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Email hoac mat khau khong dung'
        })
      );
    });

    it('should return 403 if account is locked', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const lockedUser = { ...mockUser, status: 'locked' };
      const selectMock = jest.fn().mockResolvedValue(lockedUser);
      User.findOne.mockReturnValue({
        select: selectMock
      });

      bcrypt.compare.mockResolvedValue(true);

      await authController.login(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Tai khoa da bi khoa'
        })
      );
    });
  });

  describe('googleLogin', () => {
    it('should verify google ticket and log user in', async () => {
      mockRequest.body = {
        idToken: 'google_id_token_123'
      };

      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          email: 'google@example.com',
          name: 'Google User',
          picture: 'http://example.com/pic.jpg',
          email_verified: true
        })
      });

      OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;

      User.findOne.mockResolvedValue(null); // Create new google user
      bcrypt.hash.mockResolvedValue('hashedRandomPassword');
      User.create.mockResolvedValue({
        ...mockUser,
        email: 'google@example.com',
        name: 'Google User',
        avatarUrl: 'http://example.com/pic.jpg',
        authProvider: 'google'
      });

      jwt.sign
        .mockReturnValueOnce('mockAccessToken')
        .mockReturnValueOnce('mockRefreshToken');

      await authController.googleLogin(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Dang nhap Google thanh cong'
        })
      );
    });
  });

  describe('refresh', () => {
    it('should verify refresh token and issue new access token', async () => {
      mockRequest.body = {
        refreshToken: 'validRefreshToken'
      };

      jwt.verify.mockReturnValue({ id: 'user_999999' });
      User.findById.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('newAccessToken');

      await authController.refresh(mockRequest, mockResponse);

      expect(jwt.verify).toHaveBeenCalledWith('validRefreshToken', 'my_super_secret_refresh_key');
      expect(User.findById).toHaveBeenCalledWith('user_999999');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            accessToken: 'newAccessToken'
          })
        })
      );
    });

    it('should return 401 if refresh token is missing', async () => {
      mockRequest.body = {};

      await authController.refresh(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('should return 403 if token validation fails', async () => {
      mockRequest.body = {
        refreshToken: 'invalidToken'
      };

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token signature');
      });

      await authController.refresh(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token and email it to user', async () => {
      mockRequest.body = {
        email: 'test@example.com'
      };

      User.findOne.mockResolvedValue(mockUser);
      crypto.randomBytes = jest.fn().mockReturnValue(Buffer.from('random_bytes_hex'));

      const mockSendMail = jest.fn().mockResolvedValue({ messageId: '12345' });
      nodemailer.createTransport.mockReturnValue({
        sendMail: mockSendMail
      });

      await authController.forgotPassword(mockRequest, mockResponse);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.passwordResetToken).toBeDefined();
      expect(mockUser.passwordResetExpires).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Yeu cau lay lai mat khau da duoc gui'
        })
      );
    });

    it('should return 404 if email is not found', async () => {
      mockRequest.body = {
        email: 'nonexistent@example.com'
      };

      User.findOne.mockResolvedValue(null);

      await authController.forgotPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('resetPassword', () => {
    it('should update password if token is valid', async () => {
      mockRequest.body = {
        token: 'validResetToken_123',
        newPassword: 'newSuperPassword123'
      };

      const selectMock = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({
        select: selectMock
      });
      bcrypt.hash.mockResolvedValue('hashedNewPassword');

      await authController.resetPassword(mockRequest, mockResponse);

      expect(bcrypt.hash).toHaveBeenCalledWith('newSuperPassword123', 10);
      expect(mockUser.passwordHash).toBe('hashedNewPassword');
      expect(mockUser.passwordResetToken).toBeNull();
      expect(mockUser.passwordResetExpires).toBeNull();
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if token or password is missing', async () => {
      mockRequest.body = {
        token: 'token_only'
      };

      await authController.resetPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if reset token is invalid or expired', async () => {
      mockRequest.body = {
        token: 'invalid_token',
        newPassword: 'newPassword123'
      };

      const selectMock = jest.fn().mockResolvedValue(null);
      User.findOne.mockReturnValue({
        select: selectMock
      });

      await authController.resetPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('logout', () => {
    it('should return 200 on logout', async () => {
      await authController.logout(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Dang xuat thanh cong'
        })
      );
    });
  });
});
