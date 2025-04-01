const express = require("express");
const router = express.Router();
const userController = require("../app/controllers/userApiController");

// ✅ GET tất cả người dùng, POST để tạo người dùng
router
  .route("/")
  .get(userController.getAllUsers)    // GET /api/users
  .post(userController.createUser);   // POST /api/users

// ✅ PUT để cập nhật, DELETE để xoá người dùng theo ID
router
  .route("/:id")
  .put(userController.updateUser)     // PUT /api/users/:id
  .delete(userController.deleteUser); // DELETE /api/users/:id

// ✅ Route đăng nhập riêng biệt
router.post("/login", userController.loginUser); // POST /api/users/login

module.exports = router;