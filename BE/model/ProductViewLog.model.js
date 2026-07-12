const mongoose = require('mongoose');

const productViewLogSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    ipAddress: {
      type: String,
      default: 'unknown'
    },
    userAgent: {
      type: String,
      default: 'unknown'
    },
    referrer: {
      type: String,
      default: ''
    },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    }
  },
  {
    timestamps: true
  }
);

productViewLogSchema.index({ productId: 1, viewedAt: -1 });

module.exports = mongoose.model('ProductViewLog', productViewLogSchema);
