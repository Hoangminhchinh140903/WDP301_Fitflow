import {
  approveBlogRequest,
  createBlogRequest,
  deleteBlogRequest,
  getApprovedBlogsRequest,
  getBlogBySlugRequest,
  getMyBlogsRequest,
  getPendingBlogsRequest,
  getPublishedBlogsRequest,
  publishBlogRequest,
  rejectBlogRequest,
  submitBlogRequest,
  updateBlogRequest,
  uploadBlogThumbnailRequest,
} from "../api/blog.api";

/**
 * @namespace BlogService
 * @description Các dịch vụ kết nối API liên quan đến tính năng quản lý và hiển thị Blog
 */

/**
 * Lấy danh sách tất cả các bài viết đã được xuất bản (công khai)
 * @memberof BlogService
 * @param {Object} params - Tham số bộ lọc (category, tag, q, page, limit)
 * @returns {Promise<Object>} Dữ liệu danh sách bài viết kèm thông tin phân trang
 */
export const getPublishedBlogsApi = async (params) => {
  const response = await getPublishedBlogsRequest(params);
  return response.data;
};

/**
 * Lấy chi tiết một bài viết công khai theo đường dẫn tĩnh (Slug) hoặc ID
 * @memberof BlogService
 * @param {string} slug - Slug hoặc ID của bài viết
 * @returns {Promise<Object>} Chi tiết bài viết tìm được
 */
export const getBlogBySlugApi = async (slug) => {
  const response = await getBlogBySlugRequest(slug);
  return response.data;
};

/**
 * Tạo mới một bài viết nháp trên hệ thống
 * @memberof BlogService
 * @param {Object} payload - Thông tin bài viết mới
 * @param {string} payload.title - Tiêu đề bài viết
 * @param {string} payload.content - Nội dung bài viết
 * @param {string} [payload.thumbnail] - Đường dẫn ảnh thu nhỏ
 * @param {string} [payload.category] - Danh mục bài viết
 * @param {string[]} [payload.tags] - Từ khóa bài viết
 * @returns {Promise<Object>} Kết quả tạo bài viết từ backend
 */
export const createBlogApi = async (payload) => {
  const response = await createBlogRequest(payload);
  return response.data;
};

/**
 * Cập nhật nội dung bài viết hiện tại
 * @memberof BlogService
 * @param {string} id - ID bài viết cần chỉnh sửa
 * @param {Object} payload - Dữ liệu cập nhật mới
 * @returns {Promise<Object>} Thông tin bài viết sau khi được cập nhật
 */
export const updateBlogApi = async (id, payload) => {
  const response = await updateBlogRequest(id, payload);
  return response.data;
};

/**
 * Lấy danh sách bài viết cá nhân của người dùng hiện tại
 * @memberof BlogService
 * @param {Object} params - Bộ lọc bổ sung (status)
 * @returns {Promise<Object>} Danh sách bài viết của tôi
 */
export const getMyBlogsApi = async (params) => {
  const response = await getMyBlogsRequest(params);
  return response.data;
};

/**
 * Gửi yêu cầu kiểm duyệt bài viết nháp
 * @memberof BlogService
 * @param {string} id - ID bài viết cần gửi duyệt
 * @returns {Promise<Object>} Trạng thái phản hồi từ hệ thống
 */
export const submitBlogApi = async (id) => {
  const response = await submitBlogRequest(id);
  return response.data;
};

/**
 * Xóa một bài viết khỏi hệ thống
 * @memberof BlogService
 * @param {string} id - ID bài viết cần xóa
 * @returns {Promise<Object>} Kết quả xóa bài viết
 */
export const deleteBlogApi = async (id) => {
  const response = await deleteBlogRequest(id);
  return response.data;
};

/**
 * Lấy danh sách các bài viết đang chờ phê duyệt (Dành cho quản lý)
 * @memberof BlogService
 * @returns {Promise<Object>} Danh sách bài viết chờ duyệt
 */
export const getPendingBlogsApi = async () => {
  const response = await getPendingBlogsRequest();
  return response.data;
};

/**
 * Lấy danh sách các bài viết đã được duyệt thông qua
 * @memberof BlogService
 * @returns {Promise<Object>} Danh sách bài viết đã duyệt
 */
export const getApprovedBlogsApi = async () => {
  const response = await getApprovedBlogsRequest();
  return response.data;
};

/**
 * Phê duyệt chấp thuận một bài viết chờ duyệt
 * @memberof BlogService
 * @param {string} id - ID bài viết
 * @returns {Promise<Object>} Kết quả phê duyệt bài viết
 */
export const approveBlogApi = async (id) => {
  const response = await approveBlogRequest(id);
  return response.data;
};

/**
 * Từ chối phê duyệt bài viết
 * @memberof BlogService
 * @param {string} id - ID bài viết
 * @returns {Promise<Object>} Kết quả từ chối bài viết
 */
export const rejectBlogApi = async (id) => {
  const response = await rejectBlogRequest(id);
  return response.data;
};

/**
 * Xuất bản công khai bài viết đã được duyệt
 * @memberof BlogService
 * @param {string} id - ID bài viết
 * @returns {Promise<Object>} Kết quả xuất bản bài viết
 */
export const publishBlogApi = async (id) => {
  const response = await publishBlogRequest(id);
  return response.data;
};

/**
 * Tải ảnh thu nhỏ (thumbnail) của bài viết lên máy chủ đám mây
 * @memberof BlogService
 * @param {File|Blob} file - Đối tượng tệp ảnh cần tải lên
 * @returns {Promise<Object>} Đường dẫn URL của ảnh sau khi tải lên thành công
 */
export const uploadBlogThumbnailApi = async (file) => {
  const response = await uploadBlogThumbnailRequest(file);
  return response.data;
};
