const User = require('../model/User.model');
const mongoose = require('mongoose');

describe('User Model Schema Tests', () => {
  it('should create a valid user instance with default fields', () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'somehashedstring'
    };

    const user = new User(userData);

    expect(user.role).toBe('customer');
    expect(user.roleLevel).toBe(0);
    expect(user.status).toBe('active');
    expect(user.authProvider).toBe('local');
    expect(user.preferences.theme).toBe('light');
    expect(user.preferences.language).toBe('vi');
    expect(user.preferences.notifications.email).toBe(true);
    expect(user.preferences.notifications.sms).toBe(false);
    expect(user.preferences.notifications.push).toBe(true);
    expect(user.preferences.notifications.marketing).toBe(false);
    expect(user.securitySettings.twoFactorEnabled).toBe(false);
    expect(user.securitySettings.loginAlertsEnabled).toBe(true);
    expect(user.profileCompleteness).toBe(0);
    expect(user.createdAt).toBeDefined();
  });

  describe('Field Normalization Setters', () => {
    it('should normalize email to lowercase and trim spaces', () => {
      const user = new User({
        name: 'Tester',
        email: '   TEST.User@EXAMPLE.com   ',
        passwordHash: 'pass'
      });

      expect(user.email).toBe('test.user@example.com');
    });

    it('should normalize phone number by removing whitespaces', () => {
      const user = new User({
        name: 'Tester',
        email: 'test@example.com',
        passwordHash: 'pass',
        phone: '  0987  654   321  '
      });

      expect(user.phone).toBe('0987654321');
    });

    it('should set phone to null if undefined or null is passed', () => {
      const user = new User({
        name: 'Tester',
        email: 'test@example.com',
        passwordHash: 'pass',
        phone: null
      });

      expect(user.phone).toBeNull();
    });
  });

  describe('Validation Rules', () => {
    it('should fail validation if name is missing', () => {
      const user = new User({
        email: 'test@example.com',
        passwordHash: 'pass'
      });

      const err = user.validateSync();
      expect(err.errors.name).toBeDefined();
    });

    it('should fail validation if email is missing', () => {
      const user = new User({
        name: 'Tester',
        passwordHash: 'pass'
      });

      const err = user.validateSync();
      expect(err.errors.email).toBeDefined();
    });

    it('should fail validation if role is invalid', () => {
      const user = new User({
        name: 'Tester',
        email: 'test@example.com',
        passwordHash: 'pass',
        role: 'superadmin' // Invalid role enum
      });

      const err = user.validateSync();
      expect(err.errors.role).toBeDefined();
    });

    it('should fail validation if status is invalid', () => {
      const user = new User({
        name: 'Tester',
        email: 'test@example.com',
        passwordHash: 'pass',
        status: 'suspended' // Invalid status enum
      });

      const err = user.validateSync();
      expect(err.errors.status).toBeDefined();
    });

    it('should fail validation if gender is invalid', () => {
      const user = new User({
        name: 'Tester',
        email: 'test@example.com',
        passwordHash: 'pass',
        gender: 'unknown' // Invalid gender enum
      });

      const err = user.validateSync();
      expect(err.errors.gender).toBeDefined();
    });

    it('should pass validation if gender is valid or null', () => {
      const user1 = new User({
        name: 'Tester',
        email: 'test@example.com',
        passwordHash: 'pass',
        gender: 'female'
      });
      const user2 = new User({
        name: 'Tester',
        email: 'test2@example.com',
        passwordHash: 'pass',
        gender: null
      });

      expect(user1.validateSync()).toBeUndefined();
      expect(user2.validateSync()).toBeUndefined();
    });
  });
});
