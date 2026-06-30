const express = require("express");
const blogController = require("../controllers/blog.controller");
const { PERMISSIONS } = require("../access-control/permissions");
const {
  requireAuth,
  checkPermission,
  checkRole,
} = require("../middleware/auth.middleware");
const { uploadBlogThumbnail } = require("../middleware/upload.middleware");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  checkPermission(PERMISSIONS.blog.post.create),
  blogController.createBlog,
);
router.put(
  "/:id",
  requireAuth,
  checkPermission(PERMISSIONS.blog.post.update),
  blogController.updateBlog,
);
router.get(
  "/my",
  requireAuth,
  checkPermission(PERMISSIONS.blog.post.view),
  blogController.getMyBlogs,
);
router.post(
  "/:id/submit",
  requireAuth,
  checkPermission(PERMISSIONS.blog.post.submit),
  blogController.submitBlog,
);
router.post(
  "/upload-thumbnail",
  requireAuth,
  checkPermission(PERMISSIONS.blog.post.create),
  uploadBlogThumbnail,
  blogController.uploadBlogThumbnail,
);

router.get(
  "/pending",
  requireAuth,
  checkRole("owner"),
  checkPermission(PERMISSIONS.blog.post.approve),
  blogController.getPendingBlogs,
);
router.get(
  "/approved",
  requireAuth,
  checkRole("owner"),
  checkPermission(PERMISSIONS.blog.post.approve),
  blogController.getApprovedBlogs,
);
router.post(
  "/:id/approve",
  requireAuth,
  checkRole("owner"),
  checkPermission(PERMISSIONS.blog.post.approve),
  blogController.approveBlog,
);
router.post(
  "/:id/reject",
  requireAuth,
  checkRole("owner"),
  checkPermission(PERMISSIONS.blog.post.approve),
  blogController.rejectBlog,
);
router.post(
  "/:id/publish",
  requireAuth,
  checkRole("owner"),
  checkPermission(PERMISSIONS.blog.post.publish),
  blogController.publishBlog,
);
router.delete(
  "/:id",
  requireAuth,
  checkPermission(PERMISSIONS.blog.post.delete),
  blogController.deleteBlog,
);

router.get("/", blogController.getPublishedBlogs);
router.get("/:slug", blogController.getPublishedBlogBySlug);

module.exports = router;

// l�m vi?c Blog

/*
 * ==========================================
 * B? sung c?p nh?t t�nh nang Blog
 * T�nh nang dang du?c ho�n thi?n
 * Ng�y c?p nh?t: 2026-06-30
 * L�m vi?c Blog - C?i thi?n UI/UX
 * T?i uu h�a API tr? v?
 * Chu?n b? cho c�c t�nh nang n�ng cao (TBD)
 * ==========================================
 */
