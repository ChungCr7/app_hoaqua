const express = require("express");
const router = express.Router();
const userController = require("../app/controllers/userApiController");
const isAdmin = require("../app/middlewares/is-auth-admin"); // ✅ import middleware admin

// 🔐 Chỉ admin mới được truy cập danh sách users
router.get("/", isAdmin, userController.getAllUsers);

// Các route khác dùng chung
router.post("/login", userController.loginUser);
router.post("/create", userController.createUser);
router.put("/update/:id", userController.updateUser);
router.delete("/delete/:id", userController.deleteUser);

module.exports = router;
