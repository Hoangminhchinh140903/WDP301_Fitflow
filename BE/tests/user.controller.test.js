const userController = require('../controllers/user.controller');
const User = require('../model/User.model');
const RentOrder = require('../model/RentOrder.model');
const SaleOrder = require('../model/SaleOrder.model');
const ProfileAuditLog = require('../model/ProfileAuditLog.model');
const bcrypt = require('bcryptjs');

// Mock all Mongoose models
jest.mock('../model/User.model');
jest.mock('../model/RentOrder.model');
jest.mock('../model/SaleOrder.model');
jest.mock('../model/ProfileAuditLog.model');
jest.mock('bcryptjs');
jest.mock('../utils/cloudinary', () => ({
  hasCloudinaryConfig: jest.fn(() => true),
  uploadImageBuffer: jest.fn(() => Promise.resolve({ secure_url: 'http://res.cloudinary.com/avatar.png' }))
}));
jest.mock('../utils/guestVerification', () => ({
  isValidEmail: jest.fn(() => true),
  isValidPhone: jest.fn(() => true),
  normalizeEmail: jest.fn((e) => e),
  normalizePhone: jest.fn((p) => p)
}));

describe('User Controller - Unit Tests', () => {
  let mockRequest;
  let mockResponse;
  let mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUser = {
      _id: 'user_123456',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '0987654321',
      address: '123 FitFlow Street',
      gender: 'male',
      dateOfBirth: new Date('1995-01-01'),
      role: 'customer',
      status: 'active',
      avatarUrl: 'http://example.com/avatar.jpg',
      createdAt: new Date(),
      preferences: {
        theme: 'light',
        language: 'vi',
        notifications: {
          email: true,
          sms: false,
          push: true,
          marketing: false
        }
      },
      save: jest.fn().mockResolvedValue(true)
    };

    mockRequest = {
      user: {
        id: 'user_123456',
        role: 'customer'
      },
      body: {},
      params: {},
      query: {},
      headers: {
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'Jest-Test-Agent'
      },
      socket: {
        remoteAddress: '127.0.0.1'
      }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn()
    };
  });

  describe('getMyProfile', () => {
    it('should return 200 and profile details on success', async () => {
      User.findById.mockResolvedValue(mockUser);

      await userController.getMyProfile(mockRequest, mockResponse);

      expect(User.findById).toHaveBeenCalledWith('user_123456');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Get profile successfully',
          data: expect.objectContaining({
            name: 'John Doe',
            email: 'john.doe@example.com'
          })
        })
      );
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await userController.getMyProfile(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'User not found'
        })
      );
    });

    it('should return 500 if database error occurs', async () => {
      User.findById.mockRejectedValue(new Error('DB connection failure'));

      await userController.getMyProfile(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error getting profile'
        })
      );
    });
  });

  describe('updateMyProfile', () => {
    it('should update and return 200 on valid data', async () => {
      mockRequest.body = {
        name: 'Jane Doe',
        phone: '0123456789',
        address: '456 Flow Street'
      };

      User.findById.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue(null); // No conflicts
      User.findByIdAndUpdate.mockResolvedValue({
        ...mockUser,
        name: 'Jane Doe',
        phone: '0123456789',
        address: '456 Flow Street'
      });

      await userController.updateMyProfile(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Update profile successfully',
          data: expect.objectContaining({
            name: 'Jane Doe',
            phone: '0123456789',
            address: '456 Flow Street'
          })
        })
      );
    });

    it('should return 400 if no valid fields provided', async () => {
      mockRequest.body = {
        invalidField: 'dummy'
      };

      await userController.updateMyProfile(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No valid profile fields to update'
        })
      );
    });

    it('should return 409 if email conflict exists', async () => {
      mockRequest.body = {
        email: 'conflict@example.com'
      };

      User.findById.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue({ _id: 'another_user' }); // Conflict!

      await userController.updateMyProfile(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Email đã được sử dụng'
        })
      );
    });

    it('should return 409 if phone conflict exists', async () => {
      mockRequest.body = {
        phone: '0999999999'
      };

      User.findById.mockResolvedValue(mockUser);
      User.findOne.mockResolvedValue({ _id: 'another_user' }); // Conflict!

      await userController.updateMyProfile(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Số điện thoại đã được sử dụng'
        })
      );
    });

    it('should return 400 if name is empty string', async () => {
      mockRequest.body = {
        name: '   '
      };

      User.findById.mockResolvedValue(mockUser);

      await userController.updateMyProfile(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Tên không được để trống'
        })
      );
    });
  });

  describe('deleteMyProfile', () => {
    it('should delete and return 200', async () => {
      User.findByIdAndDelete.mockResolvedValue(mockUser);

      await userController.deleteMyProfile(mockRequest, mockResponse);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user_123456');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Delete profile successfully'
        })
      );
    });

    it('should return 404 if user not found to delete', async () => {
      User.findByIdAndDelete.mockResolvedValue(null);

      await userController.deleteMyProfile(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockRequest.body = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123'
      };

      const selectMock = jest.fn().mockResolvedValue(mockUser);
      User.findById.mockReturnValue({
        select: selectMock
      });

      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('newHashedPassword');

      await userController.changePassword(mockRequest, mockResponse);

      expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword123', undefined);
      expect(mockUser.passwordHash).toBe('newHashedPassword');
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if fields are missing', async () => {
      mockRequest.body = {
        currentPassword: 'old'
      };

      await userController.changePassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'currentPassword and newPassword are required'
        })
      );
    });

    it('should return 400 if new password is too short', async () => {
      mockRequest.body = {
        currentPassword: 'oldPassword123',
        newPassword: 'short'
      };

      await userController.changePassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'newPassword must be at least 6 characters'
        })
      );
    });

    it('should return 400 if current password does not match', async () => {
      mockRequest.body = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123'
      };

      const selectMock = jest.fn().mockResolvedValue(mockUser);
      User.findById.mockReturnValue({
        select: selectMock
      });

      bcrypt.compare.mockResolvedValue(false);

      await userController.changePassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Current password is incorrect'
        })
      );
    });
  });

  describe('uploadMyAvatar', () => {
    it('should upload avatar and update User model', async () => {
      mockRequest.file = {
        buffer: Buffer.from('mockImage')
      };

      User.findByIdAndUpdate.mockResolvedValue({
        ...mockUser,
        avatarUrl: 'http://res.cloudinary.com/avatar.png'
      });

      await userController.uploadMyAvatar(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Upload avatar successfully',
          data: expect.objectContaining({
            avatarUrl: 'http://res.cloudinary.com/avatar.png'
          })
        })
      );
    });

    it('should return 400 if file is missing', async () => {
      mockRequest.file = null;

      await userController.uploadMyAvatar(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Avatar file is required'
        })
      );
    });
  });

  describe('getMyPreferences', () => {
    it('should return preferences of user', async () => {
      User.findById.mockResolvedValue(mockUser);

      await userController.getMyPreferences(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            theme: 'light',
            language: 'vi'
          })
        })
      );
    });

    it('should return default preferences if none set on user', async () => {
      const userNoPref = { ...mockUser, preferences: undefined };
      User.findById.mockResolvedValue(userNoPref);

      await userController.getMyPreferences(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateMyPreferences', () => {
    it('should update and return new preferences', async () => {
      mockRequest.body = {
        theme: 'dark',
        language: 'en',
        notifications: {
          sms: true
        }
      };

      User.findById.mockResolvedValue(mockUser);

      await userController.updateMyPreferences(mockRequest, mockResponse);

      expect(mockUser.preferences.theme).toBe('dark');
      expect(mockUser.preferences.language).toBe('en');
      expect(mockUser.preferences.notifications.sms).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getProfileCompleteness', () => {
    it('should calculate completeness and return fields', async () => {
      User.findById.mockResolvedValue(mockUser);

      await userController.getProfileCompleteness(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            score: 100,
            isComplete: true
          })
        })
      );
    });

    it('should identify missing fields if profile is incomplete', async () => {
      const incompleteUser = {
        ...mockUser,
        phone: null,
        address: '',
        gender: null,
        dateOfBirth: null,
        save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(incompleteUser);

      await userController.getProfileCompleteness(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            isComplete: false,
            missingFields: expect.arrayContaining(['Số điện thoại', 'Địa chỉ giao hàng', 'Giới tính', 'Ngày sinh'])
          })
        })
      );
    });
  });

  describe('getMyProfileActivityLogs', () => {
    it('should fetch paginated activity logs', async () => {
      const mockLogs = [
        { action: 'UPDATE_PROFILE', createdAt: new Date() },
        { action: 'VIEW_PROFILE', createdAt: new Date() }
      ];

      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(mockLogs);
      const sortMock = jest.fn().mockReturnValue({
        skip: skipMock
      });

      ProfileAuditLog.find.mockReturnValue({
        sort: sortMock
      });
      ProfileAuditLog.countDocuments.mockResolvedValue(10);

      mockRequest.query = { page: '2', limit: '5' };

      await userController.getMyProfileActivityLogs(mockRequest, mockResponse);

      expect(ProfileAuditLog.find).toHaveBeenCalledWith({ userId: 'user_123456' });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(skipMock).toHaveBeenCalledWith(5);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('exportMyProfileDataJSON', () => {
    it('should stream json file format', async () => {
      User.findById.mockResolvedValue(mockUser);
      RentOrder.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
      SaleOrder.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
      ProfileAuditLog.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

      await userController.exportMyProfileDataJSON(mockRequest, mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('attachment; filename='));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('exportMyProfileDataCSV', () => {
    it('should stream csv file format', async () => {
      User.findById.mockResolvedValue(mockUser);
      RentOrder.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
      SaleOrder.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

      await userController.exportMyProfileDataCSV(mockRequest, mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('exportMyProfileDataXML', () => {
    it('should stream xml file format', async () => {
      User.findById.mockResolvedValue(mockUser);
      RentOrder.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
      SaleOrder.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

      await userController.exportMyProfileDataXML(mockRequest, mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/xml');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });

  describe('exportMyProfileDataHTML', () => {
    it('should stream html file format', async () => {
      User.findById.mockResolvedValue(mockUser);
      RentOrder.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
      SaleOrder.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

      await userController.exportMyProfileDataHTML(mockRequest, mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalled();
    });
  });
});
