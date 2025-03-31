const express = require('express');
const { check, body } = require('express-validator/check');
const router = express.Router();
const authController = require('../app/controllers/AuthController');
const User = require('../app/models/User');
const isAuthUserAll = require('../app/middlewares/is-auth-userAll');

// GET login page
router.get('/dang-nhap', isAuthUserAll, authController.getLogin);

// POST login
router.post(
  '/dang-nhap',
  isAuthUserAll,
  [
    body('email')
      .isEmail()
      .withMessage('Vui lòng nhập email hợp lệ')
      .normalizeEmail(),

    body('password', 'Vui lòng nhập mật khẩu chỉ có số và văn bản và ít nhất 6 ký tự!')
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

// GET signup page
router.get('/dang-ky', isAuthUserAll, authController.getSignup);

// POST signup
router.post(
  '/dang-ky',
  isAuthUserAll,
  [
    check('email')
      .isEmail()
      .withMessage('Vui lòng nhập email hợp lệ!')
      .custom((value) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('Email đã được sử dụng!');
          }
        });
      })
      .normalizeEmail(),

    body('password', 'Vui lòng nhập mật khẩu chỉ có số và văn bản và ít nhất 6 ký tự!')
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),

    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Mật khẩu phải khớp!');
        }
        return true;
      }),
  ],
  authController.postSignup
);

// POST logout
router.post('/dang-xuat', authController.postLogout);

// GET reset password page
router.get('/dat-lai-mat-khau', isAuthUserAll, authController.getReset);

// POST reset password
router.post('/dat-lai-mat-khau', isAuthUserAll, authController.postReset);

// GET new password page with token
router.get('/dat-lai-mat-khau/:token', isAuthUserAll, authController.getNewPassword);

// POST new password
router.post('/mat-khau-moi', isAuthUserAll, authController.postNewPassword);

module.exports = router;