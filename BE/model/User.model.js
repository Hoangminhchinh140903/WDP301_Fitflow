const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['owner', 'staff', 'customer'],
    required: true,
    default: 'customer'
  },
  roleLevel: {
    type: Number,
    default: 0
  },
  directPermissions: {
    type: [String],
    default: []
  },
  deniedPermissions: {
    type: [String],
    default: []
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false,
    default: null,
    set: (value) => {
      if (value === undefined || value === null) return null;
      const normalized = String(value).replace(/\s+/g, '').trim();
      return normalized || null;
    }
  },
  email: {
    type: String,
    required: true,
    set: (value) => String(value || '').trim().toLowerCase()
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  passwordResetToken: {
    type: String,
    default: null,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    default: null,
    select: false
  },
  staffInviteToken: {
    type: String,
    default: null,
    select: false
  },
  staffInviteExpires: {
    type: Date,
    default: null,
    select: false
  },
  staffInviteAcceptedAt: {
    type: Date,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  status: {
    type: String,
    enum: ['active', 'locked', 'pending'],
    default: 'active'
  },
  avatarUrl: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: ''
  },
  segment: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', null],
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['vi', 'en'],
      default: 'vi'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    }
  },
  securitySettings: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    loginAlertsEnabled: {
      type: Boolean,
      default: true
    },
    passwordLastChanged: {
      type: Date,
      default: Date.now
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockoutUntil: {
      type: Date,
      default: null
    }
  },
  profileCompleteness: {
    type: Number,
    default: 0
  },
  customSettings: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      phone: { $type: 'string' }
    }
  }
);

module.exports = mongoose.model('User', userSchema);
