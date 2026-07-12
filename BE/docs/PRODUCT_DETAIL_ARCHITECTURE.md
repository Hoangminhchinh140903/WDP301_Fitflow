# TÀI LIỆU KIẾN TRÚC VÀ THIẾT KẾ HỆ THỐNG CHI TIẾT SẢN PHẨM (PRODUCT DETAIL & INVENTORY ARCHITECTURE SPECIFICATION)

Tài liệu này đặc tả chi tiết kiến trúc, thiết kế cơ sở dữ liệu, các APIs, và giải thuật thông minh liên quan đến hệ thống quản lý chi tiết sản phẩm (Product Detail) và theo dõi tồn kho thuộc nền tảng FitFlow.

---

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)

Hệ thống quản lý chi tiết sản phẩm chịu trách nhiệm hiển thị thông tin sản phẩm đầy đủ, giá thuê/bán, trạng thái tồn kho thực tế, các gợi ý liên quan thông minh và xuất báo cáo chi tiết sản phẩm phục vụ công tác quản lý và vận hành.

### Các thành phần chính (Core Components)
1.  **Product Detail Viewer:** Hiển thị thông tin thuộc tính sản phẩm, hỗ trợ đa ngôn ngữ (vi/en), phân rã kích thước (sizes) và màu sắc (colors).
2.  **Product Spec PDF Generator:** Xuất file PDF Spec Sheet chính thức của sản phẩm sử dụng thư viện `pdfkit`.
3.  **Smart Recommendation Engine:** Gợi ý sản phẩm tương quan thông minh dựa trên độ lệch giá, độ tương đồng danh mục, màu sắc, và điểm đánh giá.
4.  **Price History Tracker:** Lưu lại vết thay đổi giá thuê/giá bán của từng sản phẩm nhằm phục vụ phân tích biểu đồ giá.
5.  **Product Traffic & Analytics:** Ghi nhận lưu lượng lượt xem sản phẩm (unique views, device types, referrers) hỗ trợ thống kê kinh doanh.

---

## 2. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA SPECIFICATION)

Hệ thống sử dụng các Collection sau trong MongoDB:
*   `products` (Bảng sản phẩm chính)
*   `productinstances` (Từng mẫu vật lý của sản phẩm trong kho)
*   `productviewlogs` (Nhật ký lượt xem chi tiết sản phẩm)
*   `productpricehistories` (Lịch sử biến động giá)

### 2.1. ProductViewLog Schema
```javascript
const productViewLogSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  viewedAt: { type: Date, default: Date.now, index: true },
  ipAddress: { type: String, default: 'unknown' },
  userAgent: { type: String, default: 'unknown' },
  referrer: { type: String, default: '' },
  deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'], default: 'unknown' }
});
```

### 2.2. ProductPriceHistory Schema
```javascript
const productPriceHistorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  oldRentPrice: { type: Number, required: true },
  newRentPrice: { type: Number, required: true },
  oldSalePrice: { type: Number, required: true },
  newSalePrice: { type: Number, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now, index: true },
  reason: { type: String, default: 'Regular price update' }
});
```

---

## 3. CHI TIẾT CÁC ENDPOINTS APIs MỚI

Tất cả các API dưới đây được tích hợp vào `BE/routes/product.routes.js`:

### 3.1. Lấy lịch sử biến động giá của sản phẩm
*   **URL:** `/api/products/:id/price-history`
*   **Method:** `GET`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "64cb123abc5678de90123ef1",
          "productId": "648a12bc9a9f931d8820abc1",
          "oldRentPrice": 120000,
          "newRentPrice": 150000,
          "oldSalePrice": 500000,
          "newSalePrice": 600000,
          "updatedBy": {
            "_id": "648a12bc9a9f931d88201234",
            "name": "Admin Manager",
            "email": "admin@fitflow.vn"
          },
          "changedAt": "2026-07-10T08:30:00.000Z",
          "reason": "Điều chỉnh giá mùa cao điểm"
        }
      ]
    }
    ```

### 3.2. Gợi ý sản phẩm thông minh (Smart Recommendations)
*   **URL:** `/api/products/:id/smart-recommendations?limit=4`
*   **Method:** `GET`
*   **Thuật toán tính điểm tương quan (Scoring Logic):**
    *   **Trùng danh mục con (Child category):** +40 điểm.
    *   **Trùng danh mục cha (Parent category):** +20 điểm.
    *   **Trùng màu sắc chính (Color match):** +15 điểm.
    *   **Khoảng cách giá thuê sát nhau:** Độ lệch < 10% nhận +25 điểm; lệch < 25% nhận +15 điểm.
    *   **Lượt thích (Likes) & Đánh giá (Rating):** Tỉ lệ thuận với điểm chất lượng của sản phẩm.
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "648a12bc9a9f931d8820abc2",
          "name": "Áo sơ mi linen cá tính",
          "category": "Shirt",
          "baseRentPrice": 160000,
          "baseSalePrice": 650000,
          "imageUrl": "https://res.cloudinary.com/..."
        }
      ]
    }
    ```

### 3.3. Xuất Spec Sheet dạng PDF (PDF Generation)
*   **URL:** `/api/products/:id/export-pdf`
*   **Method:** `GET`
*   **Headers nhận về:** `Content-Type: application/pdf`
*   **Mô tả chức năng:** Sinh file PDF động chứa đầy đủ thông tin kỹ thuật của sản phẩm, giá thuê/bán, bảng kê kích thước (size table) có sẵn, tiền cọc và bồi thường tối đa.

---

## 4. CHI TIẾT KIỂM THỬ ĐƠN VỊ (UNIT TESTING DETAIL)

Hệ thống được đảm bảo chất lượng thông qua các test cases viết bằng Jest tại thư mục `BE/tests`:
1.  **`tests/product.controller.test.js`**: Giả lập các hành vi của Product và ProductInstance để kiểm tra tính chính xác của dữ liệu trả về và quá trình kết xuất file PDF.
2.  **`tests/product.model.test.js`**: Đảm bảo các ràng buộc nghiệp vụ (validation rules) của Product model được kiểm tra đầy đủ (giá không âm, các trường bắt buộc, chuẩn hóa chuỗi).

---

*Tài liệu kỹ thuật được lưu hành nội bộ dự án FitFlow.*
