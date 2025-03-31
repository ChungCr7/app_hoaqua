const express = require("express");
const router = express.Router();
const userController = require("../app/controllers/userApiController");

// ❌ Bỏ kiểm tra quyền admin
// const isAdmin = require("../app/middlewares/is-auth-admin");

// ✅ Ai cũng có thể lấy danh sách users (hoặc bạn có thể thêm isAuth nếu cần)
router.get("/", userController.getAllUsers);

// Các route khác
router.post("/login", userController.loginUser);
router.post("/create", userController.createUser);
router.put("/update/:id", userController.updateUser);
router.delete("/delete/:id", userController.deleteUser);

module.exports = router;
