/**
 * USER ROUTES - Định nghĩa các endpoints cho User
 * 
 * Routes CHỈ định tuyến, KHÔNG chứa logic
 * Logic xử lý nằm trong controller
 */

const express = require('express');
const router = express.Router();

// Import controller
const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../middleware/upload.middleware');

// CRUD profile cá nhân
router.get('/me', requireAuth, userController.getMyProfile);
router.put('/me', requireAuth, userController.updateMyProfile);
router.delete('/me', requireAuth, userController.deleteMyProfile);

// Đổi mật khẩu
router.put('/me/change-password', requireAuth, userController.changePassword);

// Upload avatar
router.put('/me/avatar', requireAuth, uploadAvatar, userController.uploadMyAvatar);

// Profile preferences and settings
router.get('/me/preferences', requireAuth, userController.getMyPreferences);
router.put('/me/preferences', requireAuth, userController.updateMyPreferences);

// Profile completeness and audit history
router.get('/me/completeness', requireAuth, userController.getProfileCompleteness);
router.get('/me/activity-logs', requireAuth, userController.getMyProfileActivityLogs);

// GDPR Data Export (multiple formats)
router.get('/me/export/json', requireAuth, userController.exportMyProfileDataJSON);
router.get('/me/export/csv', requireAuth, userController.exportMyProfileDataCSV);
router.get('/me/export/xml', requireAuth, userController.exportMyProfileDataXML);
router.get('/me/export/html', requireAuth, userController.exportMyProfileDataHTML);

module.exports = router;
