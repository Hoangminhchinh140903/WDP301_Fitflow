const mongoose = require('mongoose');

const profileAuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'VIEW_PROFILE',
        'UPDATE_PROFILE',
        'CHANGE_PASSWORD',
        'UPLOAD_AVATAR',
        'EXPORT_DATA',
        'UPDATE_PREFERENCES',
        'LOCK_ACCOUNT',
        'UNLOCK_ACCOUNT'
      ]
    },
    ipAddress: {
      type: String,
      default: 'unknown'
    },
    userAgent: {
      type: String,
      default: 'unknown'
    },
    changedFields: {
      type: [String],
      default: []
    },
    oldValues: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    newValues: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success'
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for query optimization
profileAuditLogSchema.index({ userId: 1, action: 1 });
profileAuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ProfileAuditLog', profileAuditLogSchema);
