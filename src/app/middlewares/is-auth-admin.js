module.exports = (req, res, next) => {
    if (!req.session || !req.session.user) {
      // Chưa đăng nhập
      return req.originalUrl.startsWith('/api')
        ? res.status(401).json({ message: "Chưa đăng nhập" })
        : res.redirect('/dang-nhap');
    }
  
    if (req.session.user.role !== 1) {
      // Không phải admin
      return req.originalUrl.startsWith('/api')
        ? res.status(403).json({ message: "Truy cập bị từ chối. Chỉ dành cho Admin." })
        : res.redirect('/');
    }
  
    next();
  };
  