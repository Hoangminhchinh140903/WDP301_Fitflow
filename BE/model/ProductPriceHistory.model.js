const mongoose = require('mongoose');

const productPriceHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    oldRentPrice: {
      type: Number,
      required: true
    },
    newRentPrice: {
      type: Number,
      required: true
    },
    oldSalePrice: {
      type: Number,
      required: true
    },
    newSalePrice: {
      type: Number,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    reason: {
      type: String,
      default: 'Regular price update'
    }
  },
  {
    timestamps: true
  }
);

productPriceHistorySchema.index({ productId: 1, changedAt: -1 });

module.exports = mongoose.model('ProductPriceHistory', productPriceHistorySchema);
