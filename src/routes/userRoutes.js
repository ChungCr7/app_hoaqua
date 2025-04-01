const express = require("express");
const router = express.Router();
const userController = require("../app/controllers/userApiController");
const multer = require("multer");
const path = require("path");

// Cấu hình multer để lưu file avatar và kiểm tra loại file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/avatars"); // thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // tên file
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|webp|gif/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép tải lên các file ảnh (jpg, jpeg, png, webp, gif)"));
    }
  }
});

// GET tất cả người dùng, POST để tạo người dùng
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

// PUT để cập nhật, DELETE để xoá người dùng theo ID
router
  .route("/:id")
  .put(userController.updateUser)
  .delete(userController.deleteUser);

// ✅ Route upload/cập nhật avatar riêng biệt
router.put("/:id/avatar", upload.single("avatar"), userController.updateAvatar);

// Route đăng nhập
router.post("/login", userController.loginUser);

module.exports = router;
