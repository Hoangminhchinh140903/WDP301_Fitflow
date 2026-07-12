const Product = require('../model/Product.model');
const ProductViewLog = require('../model/ProductViewLog.model');
const ProductPriceHistory = require('../model/ProductPriceHistory.model');
const mongoose = require('mongoose');

describe('Product Models - Schema Unit Tests', () => {
  describe('Product Model Schema', () => {
    it('should create a valid product instance with default fields', () => {
      const productData = {
        name: { vi: 'Đầm dạ hội đỏ', en: 'Red Evening Dress' },
        category: { vi: 'Đầm', en: 'Dress' },
        color: 'Red',
        baseRentPrice: 200000,
        baseSalePrice: 1000000
      };

      const product = new Product(productData);

      expect(product.hasSizes).toBe(false);
      expect(product.sizes).toEqual([]);
      expect(product.pricingMode).toBe('common');
      expect(product.commonRentPrice).toBe(0);
      expect(product.quantity).toBe(0);
      expect(product.isDraft).toBe(false);
      expect(product.images).toEqual([]);
      expect(product.depositAmount).toBe(0);
      expect(product.buyoutValue).toBe(0);
      expect(product.likeCount).toBe(0);
      expect(product.averageRating).toBe(0);
      expect(product.reviewCount).toBe(0);
    });

    it('should fail validation if name is missing or empty', () => {
      const product = new Product({
        category: { vi: 'Đầm', en: 'Dress' },
        color: 'Red',
        baseRentPrice: 200000,
        baseSalePrice: 1000000
      });

      const err = product.validateSync();
      expect(err.errors.name).toBeDefined();
    });

    it('should fail validation if category is missing or empty', () => {
      const product = new Product({
        name: { vi: 'Đầm dạ hội đỏ', en: 'Red Evening Dress' },
        color: 'Red',
        baseRentPrice: 200000,
        baseSalePrice: 1000000
      });

      const err = product.validateSync();
      expect(err.errors.category).toBeDefined();
    });

    it('should fail validation if color is missing', () => {
      const product = new Product({
        name: { vi: 'Đầm dạ hội đỏ', en: 'Red Evening Dress' },
        category: { vi: 'Đầm', en: 'Dress' },
        baseRentPrice: 200000,
        baseSalePrice: 1000000
      });

      const err = product.validateSync();
      expect(err.errors.color).toBeDefined();
    });

    it('should fail validation if baseRentPrice is negative', () => {
      const product = new Product({
        name: { vi: 'Đầm dạ hội đỏ', en: 'Red Evening Dress' },
        category: { vi: 'Đầm', en: 'Dress' },
        color: 'Red',
        baseRentPrice: -50000,
        baseSalePrice: 1000000
      });

      const err = product.validateSync();
      expect(err.errors.baseRentPrice).toBeDefined();
    });
  });

  describe('ProductViewLog Model Schema', () => {
    it('should create a valid view log instance with default fields', () => {
      const logData = {
        productId: new mongoose.Types.ObjectId()
      };

      const log = new ProductViewLog(logData);

      expect(log.userId).toBeNull();
      expect(log.viewedAt).toBeDefined();
      expect(log.ipAddress).toBe('unknown');
      expect(log.userAgent).toBe('unknown');
      expect(log.referrer).toBe('');
      expect(log.deviceType).toBe('unknown');
    });

    it('should fail validation if productId is missing', () => {
      const log = new ProductViewLog({
        userId: new mongoose.Types.ObjectId()
      });

      const err = log.validateSync();
      expect(err.errors.productId).toBeDefined();
    });

    it('should fail validation if deviceType is invalid', () => {
      const log = new ProductViewLog({
        productId: new mongoose.Types.ObjectId(),
        deviceType: 'smart_tv' // Invalid enum value
      });

      const err = log.validateSync();
      expect(err.errors.deviceType).toBeDefined();
    });
  });

  describe('ProductPriceHistory Model Schema', () => {
    it('should create a valid price history instance', () => {
      const historyData = {
        productId: new mongoose.Types.ObjectId(),
        oldRentPrice: 150000,
        newRentPrice: 180000,
        oldSalePrice: 500000,
        newSalePrice: 550000,
        updatedBy: new mongoose.Types.ObjectId()
      };

      const history = new ProductPriceHistory(historyData);

      expect(history.changedAt).toBeDefined();
      expect(history.reason).toBe('Regular price update');
      expect(history.validateSync()).toBeUndefined();
    });

    it('should fail validation if updatedBy is missing', () => {
      const history = new ProductPriceHistory({
        productId: new mongoose.Types.ObjectId(),
        oldRentPrice: 150000,
        newRentPrice: 180000,
        oldSalePrice: 500000,
        newSalePrice: 550000
      });

      const err = history.validateSync();
      expect(err.errors.updatedBy).toBeDefined();
    });
  });
});
