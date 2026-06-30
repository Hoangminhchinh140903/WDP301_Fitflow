const mongoose = require("mongoose");
const Blog = require("../model/Blog.model");
const {
  hasCloudinaryConfig,
  uploadImageBuffer,
} = require("../utils/cloudinary");

// ==========================================
// HẰNG SỐ & ĐỊNH NGHĨA
// ==========================================
const BLOG_STATUSES = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "published",
  REJECTED: "rejected",
};

// ==========================================
// CÁC HÀM BỔ TRỢ (HELPERS) & CHUẨN HÓA
// ==========================================

/**
 * Chuẩn hóa chuỗi văn bản
 * @param {string} value 
 * @returns {string}
 */
const normalizeText = (value) => String(value || "").trim();

/**
 * Chuẩn hóa vai trò người dùng (in thường)
 * @param {string} value 
 * @returns {string}
 */
const normalizeRole = (value) => String(value || "").trim().toLowerCase();

/**
 * Chuẩn hóa trạng thái bài viết
 * @param {string} value 
 * @returns {string}
 */
const normalizeStatus = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  const validStatuses = Object.values(BLOG_STATUSES);
  return validStatuses.includes(raw) ? raw : "";
};

/**
 * Chuẩn hóa danh sách tags từ Array hoặc String phân cách bằng dấu phẩy
 * @param {Array|string} value 
 * @returns {string[]}
 */
const normalizeTags = (value) => {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(value.map((item) => normalizeText(item)).filter(Boolean))
    );
  }
  if (typeof value === "string") {
    return Array.from(
      new Set(
        value
          .split(",")
          .map((item) => normalizeText(item))
          .filter(Boolean)
      )
    );
  }
  return [];
};

/**
 * Escape các ký tự đặc biệt trong regex
 * @param {string} value 
 * @returns {string}
 */
const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Kiểm tra vai trò của người dùng
 */
const isOwner = (req) => normalizeRole(req.user?.role) === "owner";
const isStaff = (req) => normalizeRole(req.user?.role) === "staff";

/**
 * Đảm bảo người dùng hiện tại là Tác giả bài viết hoặc Owner hệ thống
 * @param {Object} req 
 * @param {Object} blog 
 * @returns {boolean}
 */
const ensureAuthorOrOwner = (req, blog) => {
  if (!blog?.author) return false;
  if (isOwner(req)) return true;
  return String(blog.author) === String(req.user?.id);
};

/**
 * Định dạng dữ liệu bài viết trả về cho client
 * @param {Object} item Dữ liệu từ database (lean object)
 * @returns {Object} Dữ liệu chuẩn hóa
 */
const mapBlog = (item) => {
  if (!item) return null;
  return {
    _id: item._id,
    title: item.title || "",
    slug: item.slug || "",
    content: item.content || "",
    thumbnail: item.thumbnail || "",
    category: item.category || "",
    tags: Array.isArray(item.tags) ? item.tags : [],
    status: normalizeStatus(item.status) || BLOG_STATUSES.DRAFT,
    author: item.author
      ? {
          _id: item.author._id || item.author,
          name: item.author.name || "",
          email: item.author.email || "",
        }
      : null,
    approvedBy: item.approvedBy
      ? {
          _id: item.approvedBy._id || item.approvedBy,
          name: item.approvedBy.name || "",
          email: item.approvedBy.email || "",
        }
      : null,
    publishedAt: item.publishedAt || null,
    metaTitle: item.metaTitle || "",
    metaDescription: item.metaDescription || "",
    viewCount: Number(item.viewCount || 0),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

/**
 * Chuẩn hóa thông tin đầu vào khi tạo/cập nhật bài viết
 * @param {Object} body 
 * @returns {Object} Dữ liệu đã chuẩn hóa
 */
const normalizeBlogInput = (body = {}) => {
  return {
    title: normalizeText(body.title),
    content: String(body.content || "").trim(),
    thumbnail: normalizeText(body.thumbnail),
    category: normalizeText(body.category),
    tags: normalizeTags(body.tags),
    metaTitle: normalizeText(body.metaTitle),
    metaDescription: normalizeText(body.metaDescription),
  };
};

/**
 * Xác thực các trường bắt buộc của bài viết
 * @param {Object} input 
 * @returns {string} Thông báo lỗi nếu có, ngược lại là chuỗi rỗng
 */
const validateRequiredFields = ({ title, content }) => {
  if (!title) return "Tiêu đề bài viết là bắt buộc";
  if (!content) return "Nội dung bài viết là bắt buộc";
  return "";
};

// ==========================================
// CÁC PHẢN HỒI CHUẨN HÓA (RESPONSE HELPERS)
// ==========================================
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== null && { data }),
  });
};

const sendError = (res, message, error = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(error && { error: typeof error === "string" ? error : error.message }),
  });
};

// Wrapper bắt lỗi tự động cho các async functions (tránh lặp lại try-catch)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error("Blog Controller Error:", err);
    return sendError(res, "Đã xảy ra lỗi hệ thống nghiêm trọng", err);
  });
};

// ==========================================
// BỘ ĐIỀU HƯỚNG NGHIỆP VỤ (CONTROLLERS)
// ==========================================

/**
 * @desc    Tạo bài viết mới (Mặc định ở trạng thái Nháp)
 * @route   POST /api/blogs
 * @access  Private
 */
const createBlog = asyncHandler(async (req, res) => {
  const payload = normalizeBlogInput(req.body);
  const validationError = validateRequiredFields(payload);
  if (validationError) {
    return sendError(res, validationError, null, 400);
  }

  const created = await Blog.create({
    ...payload,
    author: req.user.id,
    status: BLOG_STATUSES.DRAFT,
    approvedBy: null,
    publishedAt: null,
  });

  const blog = await Blog.findById(created._id)
    .populate("author", "name email")
    .lean();

  return sendSuccess(res, "Tạo bài viết mới thành công", mapBlog(blog), 201);
});

/**
 * @desc    Cập nhật thông tin bài viết
 * @route   PUT /api/blogs/:id
 * @access  Private (Chỉ tác giả hoặc Owner)
 */
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return sendError(res, "Không tìm thấy bài viết yêu cầu", null, 404);
  }

  if (!ensureAuthorOrOwner(req, blog)) {
    return sendError(res, "Bạn không có quyền chỉnh sửa bài viết này", null, 403);
  }

  const payload = normalizeBlogInput(req.body);
  const validationError = validateRequiredFields(payload);
  if (validationError) {
    return sendError(res, validationError, null, 400);
  }

  // Cập nhật các trường dữ liệu chính
  blog.title = payload.title;
  blog.content = payload.content;
  blog.thumbnail = payload.thumbnail;
  blog.category = payload.category;
  blog.tags = payload.tags;
  blog.metaTitle = payload.metaTitle;
  blog.metaDescription = payload.metaDescription;

  // Nếu không phải là Owner chỉnh sửa, bài viết sẽ bị thu hồi trạng thái để duyệt lại
  if (!isOwner(req)) {
    blog.status = BLOG_STATUSES.DRAFT;
    blog.approvedBy = null;
    blog.publishedAt = null;
  }

  await blog.save();

  const updated = await Blog.findById(blog._id)
    .populate("author", "name email")
    .populate("approvedBy", "name email")
    .lean();

  return sendSuccess(res, "Cập nhật bài viết thành công", mapBlog(updated));
});

/**
 * @desc    Lấy danh sách bài viết của cá nhân đang đăng nhập
 * @route   GET /api/blogs/my
 * @access  Private
 */
const getMyBlogs = asyncHandler(async (req, res) => {
  const status = normalizeStatus(req.query.status);
  const query = { author: req.user.id };
  if (status) {
    query.status = status;
  }

  const blogs = await Blog.find(query)
    .sort({ updatedAt: -1 })
    .populate("author", "name email")
    .populate("approvedBy", "name email")
    .lean();

  return sendSuccess(res, "Tải danh sách bài viết thành công", blogs.map(mapBlog));
});

/**
 * @desc    Gửi yêu cầu duyệt bài viết lên hệ thống
 * @route   POST /api/blogs/:id/submit
 * @access  Private (Chỉ tác giả hoặc Owner)
 */
const submitBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return sendError(res, "Không tìm thấy bài viết để gửi duyệt", null, 404);
  }

  if (!ensureAuthorOrOwner(req, blog)) {
    return sendError(res, "Bạn không có quyền gửi duyệt bài viết này", null, 403);
  }

  if (blog.status === BLOG_STATUSES.PUBLISHED) {
    return sendError(
      res, 
      "Bài viết đã được xuất bản công khai. Vui lòng chỉnh sửa trước khi gửi duyệt lại nếu cần thiết.", 
      null, 
      400
    );
  }

  blog.status = BLOG_STATUSES.PENDING;
  blog.approvedBy = null;
  blog.publishedAt = null;
  await blog.save();

  return sendSuccess(res, "Đã gửi duyệt bài viết thành công", mapBlog(blog.toObject()));
});

/**
 * @desc    Lấy danh sách các bài viết đang chờ duyệt (Dành cho Admin/Owner)
 * @route   GET /api/blogs/pending
 * @access  Private (Chỉ Owner/Staff có thẩm quyền)
 */
const getPendingBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ status: BLOG_STATUSES.PENDING })
    .sort({ updatedAt: -1 })
    .populate("author", "name email")
    .populate("approvedBy", "name email")
    .lean();

  return sendSuccess(res, "Tải danh sách bài viết chờ duyệt thành công", blogs.map(mapBlog));
});

/**
 * @desc    Lấy danh sách các bài viết đã được duyệt thông qua
 * @route   GET /api/blogs/approved
 * @access  Private (Chỉ Owner/Staff)
 */
const getApprovedBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({
    $or: [
      { status: BLOG_STATUSES.PUBLISHED },
      { status: BLOG_STATUSES.PENDING, approvedBy: { $ne: null } },
    ],
  })
    .sort({ updatedAt: -1 })
    .populate("author", "name email")
    .populate("approvedBy", "name email")
    .lean();

  return sendSuccess(res, "Tải danh sách bài viết đã duyệt thành công", blogs.map(mapBlog));
});

/**
 * @desc    Duyệt chấp thuận một bài viết
 * @route   POST /api/blogs/:id/approve
 * @access  Private (Chỉ Owner)
 */
const approveBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return sendError(res, "Không tìm thấy bài viết để duyệt", null, 404);
  }

  if (blog.status !== BLOG_STATUSES.PENDING) {
    return sendError(res, "Chỉ có thể duyệt bài viết đang ở trạng thái Chờ duyệt", null, 400);
  }

  blog.approvedBy = req.user.id;
  await blog.save();

  const approved = await Blog.findById(blog._id)
    .populate("author", "name email")
    .populate("approvedBy", "name email")
    .lean();

  return sendSuccess(res, "Duyệt bài viết thành công", mapBlog(approved));
});

/**
 * @desc    Từ chối duyệt bài viết và trả về trạng thái Từ chối
 * @route   POST /api/blogs/:id/reject
 * @access  Private (Chỉ Owner)
 */
const rejectBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return sendError(res, "Không tìm thấy bài viết cần xử lý", null, 404);
  }

  blog.status = BLOG_STATUSES.REJECTED;
  blog.approvedBy = null;
  blog.publishedAt = null;
  await blog.save();

  const rejected = await Blog.findById(blog._id)
    .populate("author", "name email")
    .populate("approvedBy", "name email")
    .lean();

  return sendSuccess(res, "Đã từ chối duyệt bài viết thành công", mapBlog(rejected));
});

/**
 * @desc    Xuất bản bài viết đã được phê duyệt lên trang công khai
 * @route   POST /api/blogs/:id/publish
 * @access  Private (Chỉ Owner)
 */
const publishBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return sendError(res, "Không tìm thấy bài viết để xuất bản", null, 404);
  }

  if (!blog.approvedBy) {
    return sendError(res, "Bài viết này chưa được phê duyệt, không thể xuất bản", null, 400);
  }

  if (blog.status !== BLOG_STATUSES.PENDING) {
    return sendError(res, "Chỉ có thể xuất bản bài viết ở trạng thái Chờ duyệt", null, 400);
  }

  blog.status = BLOG_STATUSES.PUBLISHED;
  blog.publishedAt = new Date();
  await blog.save();

  const published = await Blog.findById(blog._id)
    .populate("author", "name email")
    .populate("approvedBy", "name email")
    .lean();

  return sendSuccess(res, "Xuất bản bài viết thành công", mapBlog(published));
});

/**
 * @desc    Xóa bài viết
 * @route   DELETE /api/blogs/:id
 * @access  Private (Tác giả chỉ được xóa bản nháp, Owner được xóa tất cả)
 */
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return sendError(res, "Không tìm thấy bài viết cần xóa", null, 404);
  }

  // Trường hợp là Owner: Có quyền xóa bất kỳ bài viết nào
  if (isOwner(req)) {
    await blog.deleteOne();
    return sendSuccess(res, "Owner xóa bài viết thành công");
  }

  // Trường hợp là Tác giả/Staff
  if (!ensureAuthorOrOwner(req, blog)) {
    return sendError(res, "Bạn không có quyền xóa bài viết này", null, 403);
  }

  if (blog.status !== BLOG_STATUSES.DRAFT) {
    return sendError(res, "Nhân viên chỉ được quyền xóa bài viết đang ở trạng thái Nháp", null, 400);
  }

  await blog.deleteOne();
  return sendSuccess(res, "Xóa bài viết nháp thành công");
});

/**
 * @desc    Lấy danh sách bài viết đã xuất bản (Public API)
 * @route   GET /api/blogs
 * @access  Public
 */
const getPublishedBlogs = asyncHandler(async (req, res) => {
  const category = normalizeText(req.query.category);
  const tag = normalizeText(req.query.tag);
  const keyword = normalizeText(req.query.q);
  const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 50);
  const page = Math.max(Number(req.query.page || 1), 1);
  const skip = (page - 1) * limit;

  // Chỉ lấy các bài viết đã được xuất bản công khai
  const query = { status: { $in: ["published", "Published"] } };

  if (category) {
    query.category = category;
  }
  if (tag) {
    query.tags = tag;
  }
  if (keyword) {
    const pattern = new RegExp(escapeRegex(keyword), "i");
    query.$or = [
      { title: pattern },
      { content: pattern },
      { category: pattern },
      { tags: pattern },
    ];
  }

  const [items, total] = await Promise.all([
    Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name")
      .populate("approvedBy", "name")
      .lean(),
    Blog.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    data: items.map(mapBlog),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

/**
 * @desc    Lấy chi tiết bài viết công khai theo Slug hoặc ID và tăng lượt xem
 * @route   GET /api/blogs/:slug
 * @access  Public
 */
const getPublishedBlogBySlug = asyncHandler(async (req, res) => {
  const slug = normalizeText(req.params.slug);
  if (!slug) {
    return sendError(res, "Đường dẫn bài viết (Slug) là bắt buộc", null, 400);
  }

  const detailQuery = {
    status: { $in: ["published", "Published"] },
    $or: [{ slug }],
  };

  if (mongoose.Types.ObjectId.isValid(slug)) {
    detailQuery.$or.push({ _id: slug });
  }

  const blog = await Blog.findOneAndUpdate(
    detailQuery,
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate("author", "name")
    .populate("approvedBy", "name")
    .lean();

  if (!blog) {
    return sendError(res, "Không tìm thấy bài viết công khai tương ứng", null, 404);
  }

  return sendSuccess(res, "Tải chi tiết bài viết thành công", mapBlog(blog));
});

/**
 * @desc    Tải ảnh thumbnail bài viết lên Cloudinary
 * @route   POST /api/blogs/upload-thumbnail
 * @access  Private
 */
const uploadBlogThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, "Vui lòng đính kèm tệp ảnh để tải lên", null, 400);
  }

  if (!hasCloudinaryConfig()) {
    return sendError(res, "Cấu hình Cloudinary chưa được cài đặt trên hệ thống", null, 500);
  }

  const uploaded = await uploadImageBuffer(req.file.buffer, {
    folder: "fitflow/blogs",
    resource_type: "image",
  });

  return sendSuccess(res, "Tải ảnh lên thành công", {
    url: uploaded?.secure_url || "",
  });
});

module.exports = {
  approveBlog,
  createBlog,
  deleteBlog,
  getMyBlogs,
  getApprovedBlogs,
  getPendingBlogs,
  getPublishedBlogBySlug,
  getPublishedBlogs,
  publishBlog,
  rejectBlog,
  submitBlog,
  updateBlog,
  uploadBlogThumbnail,
};
