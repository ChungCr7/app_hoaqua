const Product = require("../models/Product");
const Order = require("../models/Order");
const Story = require("../models/Story");
const Rating = require("../models/Rating");
const User = require("../models/User");
const path = require("path");

const { mutipleMongooseToObject, mongooseToObject } = require("../../util/mongoose");

class SiteController {
  // [GET] /api/search
  apiSearch(req, res, next) {
    const keyword = req.query.keyword;
    if (!keyword) {
      return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    Product.find({ name: { $regex: keyword, $options: "i" } })
      .then(productsSearch => res.json({ success: true, data: productsSearch }))
      .catch(next);
  }

  // [GET] /search
  search(req, res, next) {
    const keyword = req.query.keyword;
    Product.find({ name: { $regex: keyword, $options: "i" } })
      .then(productsSearch => {
        res.render("search", {
          productsSearch: mutipleMongooseToObject(productsSearch),
        });
      })
      .catch(next);
  }

  shoppingGuide(req, res) {
    res.render("mua-hang");
  }

  show(req, res) {
    res.render("gioi-thieu");
  }

  // [GET] /tin-tuc
  showNews(req, res, next) {
    Story.find({})
      .then(stories => {
        res.render("news", {
          stories: mutipleMongooseToObject(stories),
        });
      })
      .catch(next);
  }

  // [GET] /tin-tuc/:slug
  showNewsDetail(req, res, next) {
    Story.findOne({ slug: req.params.slug })
      .then(story => {
        res.render("news/show", {
          story: mongooseToObject(story),
        });
      })
      .catch(next);
  }

  // [GET] /gio-hang
  getCart(req, res, next) {
    req.user
      .populate("cart.items.productId")
      .then(user => {
        const cartItems = user.cart.items
          .filter(item => item.productId)
          .map(item => ({
            ...item.productId.toObject(),
            quantity: item.quantity,
          }));

        const total = cartItems.reduce((sum, item) => {
          return sum + item.quantity * (item.price || 0);
        }, 0);

        res.render("cart", {
          products: cartItems,
          total: total,
          user: req.user,
        });
      })
      .catch(next);
  }

  // [POST] /gio-hang
  addCart(req, res, next) {
    const prodId = req.body.productId; // ✅ GIỮ DẠNG STRING (ObjectId)
    const quantity = parseInt(req.body.quantity) || 1;

    console.log("📦 [POST] /gio-hang - productId:", prodId, "quantity:", quantity);

    Product.findById(prodId)
    .then((product) => {
      if (!product || product._id == null) {
        throw new Error("Không tìm thấy sản phẩm.");
      }
  
      console.log("✅ Tìm thấy sản phẩm:", product.name, "| ID =", product._id);
      return req.user.addToCart(product, quantity);
    })
  
      .then(() => {
        req.session.user = req.user;
        req.session.save(() => {
          res.redirect("/gio-hang");
        });
      })
      .catch(err => {
        console.error("🔥 Lỗi thêm giỏ hàng:", err);
        res.status(500).send("Lỗi khi thêm vào giỏ hàng.");
      });
  }

  // [POST] /cart-delete-item
  postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    req.user
      .removeFromCart(prodId)
      .then(() => {
        req.session.user = req.user;
        req.session.save(() => {
          res.redirect("/gio-hang");
        });
      })
      .catch(next);
  };

  // [POST] /create-order
  postOrder = (req, res, next) => {
    req.user
      .populate("cart.items.productId")
      .then(user => {
        const products = user.cart.items
          .filter(i => i.productId)
          .map(i => ({
            quantity: i.quantity,
            product: { ...i.productId._doc },
          }));

        const total = products.reduce((sum, p) => {
          return sum + p.quantity * (p.product.price || 0);
        }, 0);

        const order = new Order({
          user: {
            email: req.user.email,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            userId: req.user,
          },
          status: "Chờ xác nhận",
          name: req.body.name,
          phone: req.body.phone,
          address: req.body.address,
          products: products,
          tong_tien: total,
        });

        return order.save();
      })
      .then(() => req.user.clearCart())
      .then(() => {
        req.session.user = req.user;
        req.session.save(() => {
          res.redirect("/don-hang");
        });
      })
      .catch(next);
  };

  // [GET] /chat
  chatRealTime = (req, res) => {
    res.render("chat");
  };

  // [GET] /don-hang
  getPurchase(req, res, next) {
    Order.find({ "user.userId": req.user._id })
      .then(orders => {
        res.render("purchase", {
          orders: mutipleMongooseToObject(orders),
        });
      })
      .catch(next);
  }

  // [GET] /danh-gia/:slug
  getEvaluate(req, res, next) {
    Product.findOne({ slug: req.params.slug })
      .then(product => {
        res.render("evaluate", {
          product: mongooseToObject(product),
        });
      })
      .catch(next);
  }

  // [POST] /danh-gia
  postEvaluate(req, res, next) {
    req.body.imgRating = req.files
      .map(file => path.join("uploads", file.filename).replace(/\\/g, "/"))
      .join(",");

    const rating = new Rating({
      rating: req.body.rating,
      comment: req.body.comment,
      productId: req.body.productId,
      user: {
        email: req.user.email,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        userId: req.user,
      },
      imgRating: req.body.imgRating,
    });

    rating
      .save()
      .then(() => {
        return Product.updateOne(
          { _id: req.body.productId },
          { $push: { danh_gia: [{ ratingId: rating._id }] } }
        );
      })
      .then(() => res.redirect("/don-hang"))
      .catch(next);
  }

  // [GET] /tai-khoan
  showProfile(req, res, next) {
    User.findOne({ email: req.user.email })
      .then(user => {
        res.render("profile", {
          user: mongooseToObject(user),
        });
      })
      .catch(next);
  }

  // [POST] /tai-khoan
  postProfile(req, res, next) {
    User.updateOne(
      { email: req.user.email },
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone,
        address: req.body.address,
      }
    )
      .then(() => res.redirect("/tai-khoan"))
      .catch(next);
  }

  // [GET] /
  index(req, res) {
    res.render("home");
  }
}

module.exports = new SiteController();
