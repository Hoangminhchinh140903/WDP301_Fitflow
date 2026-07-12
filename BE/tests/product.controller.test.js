const productController = require('../controllers/product.controller');
const Product = require('../model/Product.model');
const ProductInstance = require('../model/ProductInstance.model');
const ProductViewLog = require('../model/ProductViewLog.model');
const ProductPriceHistory = require('../model/ProductPriceHistory.model');
const PDFDocument = require('pdfkit');

// Mock all Mongoose models
jest.mock('../model/Product.model');
jest.mock('../model/ProductInstance.model');
jest.mock('../model/ProductViewLog.model');
jest.mock('../model/ProductPriceHistory.model');
jest.mock('pdfkit');

describe('Product Controller - Unit Tests', () => {
  let mockRequest;
  let mockResponse;
  let mockProduct;
  let mockInstances;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProduct = {
      _id: 'product_123',
      name: { vi: 'Áo sơ mi lụa cao cấp', en: 'Premium Silk Shirt' },
      category: { vi: 'Áo', en: 'Shirt' },
      categoryPath: { parent: 'Apparel', child: 'Shirt', ancestors: ['Apparel'] },
      color: 'White',
      baseRentPrice: 150000,
      baseSalePrice: 600000,
      depositAmount: 100000,
      buyoutValue: 500000,
      likeCount: 15,
      averageRating: 4.5,
      reviewCount: 10,
      hasSizes: true,
      sizes: [
        { size: 'M', quantity: 5 },
        { size: 'L', quantity: 3 }
      ],
      images: ['http://example.com/shirt1.jpg'],
      isDraft: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockInstances = [
      { _id: 'inst_1', productId: 'product_123', size: 'M', color: 'White', conditionLevel: 'New', lifecycleStatus: 'Available' },
      { _id: 'inst_2', productId: 'product_123', size: 'M', color: 'White', conditionLevel: 'Used', lifecycleStatus: 'Rented' },
      { _id: 'inst_3', productId: 'product_123', size: 'L', color: 'White', conditionLevel: 'New', lifecycleStatus: 'Available' }
    ];

    mockRequest = {
      params: { id: 'product_123' },
      query: { lang: 'vi', limit: '8', page: '1' },
      headers: {
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'Mozilla/5.0 Jest-Agent'
      },
      socket: { remoteAddress: '127.0.0.1' },
      body: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn()
    };
  });

  describe('getProductById', () => {
    it('should return 200 and product details, and log view', async () => {
      Product.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProduct)
      });
      ProductInstance.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockInstances)
      });

      await productController.getProductById(mockRequest, mockResponse);

      expect(Product.findById).toHaveBeenCalledWith('product_123');
      expect(ProductInstance.find).toHaveBeenCalledWith({ productId: 'product_123' });
      expect(ProductViewLog.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: 'Áo sơ mi lụa cao cấp',
            availableQuantity: 2,
            totalQuantity: 3
          })
        })
      );
    });

    it('should return 404 if product not found', async () => {
      Product.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      await productController.getProductById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Product not found'
        })
      );
    });
  });

  describe('getProductPriceHistory', () => {
    it('should fetch and return product price history records', async () => {
      const mockHistory = [
        { productId: 'product_123', oldRentPrice: 130000, newRentPrice: 150000, oldSalePrice: 550000, newSalePrice: 600000, changedAt: new Date() }
      ];

      ProductPriceHistory.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockHistory)
      });

      await productController.getProductPriceHistory(mockRequest, mockResponse);

      expect(ProductPriceHistory.find).toHaveBeenCalledWith({ productId: 'product_123' });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array)
        })
      );
    });
  });

  describe('getSmartProductRecommendations', () => {
    it('should calculate scores and recommend items', async () => {
      const mockCandidates = [
        {
          _id: 'product_456',
          name: { vi: 'Áo sơ mi hoa', en: 'Flower Shirt' },
          category: { vi: 'Áo', en: 'Shirt' },
          baseRentPrice: 160000,
          color: 'White',
          isDraft: false,
          likeCount: 5
        },
        {
          _id: 'product_789',
          name: { vi: 'Quần jeans nam', en: 'Men Jeans' },
          category: { vi: 'Quần', en: 'Jeans' },
          baseRentPrice: 300000,
          color: 'Blue',
          isDraft: false,
          likeCount: 12
        }
      ];

      Product.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProduct)
      });

      Product.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCandidates)
      });

      await productController.getSmartProductRecommendations(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array)
        })
      );
    });
  });

  describe('exportProductSpecPDF', () => {
    it('should create and pipe PDF spec sheet', async () => {
      Product.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProduct)
      });
      ProductInstance.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockInstances)
      });

      const mockPipe = jest.fn();
      const mockRect = jest.fn().mockReturnThis();
      const mockFill = jest.fn().mockReturnThis();
      const mockFillColor = jest.fn().mockReturnThis();
      const mockFontSize = jest.fn().mockReturnThis();
      const mockText = jest.fn().mockReturnThis();
      const mockMoveDown = jest.fn().mockReturnThis();
      const mockStroke = jest.fn().mockReturnThis();
      const mockEnd = jest.fn();

      PDFDocument.mockImplementation(() => ({
        pipe: mockPipe,
        rect: mockRect,
        fill: mockFill,
        fillColor: mockFillColor,
        fontSize: mockFontSize,
        text: mockText,
        moveDown: mockMoveDown,
        stroke: mockStroke,
        end: mockEnd,
        y: 150
      }));

      await productController.exportProductSpecPDF(mockRequest, mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('attachment; filename='));
      expect(mockPipe).toHaveBeenCalledWith(mockResponse);
      expect(mockEnd).toHaveBeenCalled();
    });
  });
});
