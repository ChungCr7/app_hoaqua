const Product = require('../models/Product');
const Rating = require('../models/Rating');

class ProductController {
  // [GET] /san-pham/:slug
  show(req, res, next) {
    Product.findOne({ slug: req.params.slug })
      .populate('danh_gia.ratingId')
      .then((product) => {
        if (!product) {
          return res.status(404).send("Không tìm thấy sản phẩm.");
        }

        const productObj = product.toObject(); // dùng chuẩn

        let totalRating = null;

        if (productObj.danh_gia && productObj.danh_gia.length > 0) {
          const ratings = productObj.danh_gia.map(i => i.ratingId?.rating || 0);
          const total = ratings.reduce((sum, r) => sum + r, 0);
          totalRating = Math.round((total / ratings.length) * 10) / 10;
        }

        // ✅ In log để kiểm tra product._id tồn tại
        console.log("🟢 Product loaded:", productObj.name, "| ID =", productObj._id);

        res.render('products/show', {
          product: productObj,
          totalRating: totalRating
        });
      })
      .catch(next);
  }
}

module.exports = new ProductController();
