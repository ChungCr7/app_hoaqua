const Product = require("../models/Product");
const Story = require("../models/Story");
const Order = require("../models/Order");
const Rating = require("../models/Rating");
const path = require("path");

const ITEMS_PER_PAGE = 15;

const { mongooseToObject, mutipleMongooseToObject } = require("../../util/mongoose");

class AdminController {
  create(req, res, next) {
    res.render("admin/create");
  }

  store(req, res, next) {
    if (req.files.length !== 4) {
      return res.render("admin/create", {
        errorMessage: "Vui lòng tải lên 4 ảnh!",
        oldInput: {
          name: req.body.name,
          description: req.body.description,
          thuong_hieu: req.body.thuong_hieu,
          price: req.body.price,
        },
      });
    }

    req.body.img = req.files.map(file => path.join("uploads", file.filename).replace(/\\/g, "/"));

    const product = new Product({
      product_type: req.body.product_type,
      name: req.body.name,
      description: req.body.description,
      img: req.body.img,
      thuong_hieu: req.body.thuong_hieu,
      tinh_trang: req.body.tinh_trang,
      price: req.body.price,
      userId: req.user,
    });

    product.save()
      .then(() => res.redirect("/admin/stored/products"))
      .catch(next);
  }

  edit(req, res, next) {
    Product.findById(req.params.id)
      .then(product => res.render("admin/edit", { product: mongooseToObject(product) }))
      .catch(next);
  }

  update(req, res, next) {
    Product.updateOne({ _id: req.params.id }, req.body)
      .then(() => res.redirect("/admin/stored/products"))
      .catch(next);
  }

  destroy(req, res, next) {
    Product.delete({ _id: req.params.id })
      .then(() => res.redirect("back"))
      .catch(next);
  }

  forceDestroy(req, res, next) {
    Product.deleteOne({ _id: req.params.id })
      .then(() => res.redirect("back"))
      .catch(next);
  }

  restore(req, res, next) {
    Product.restore({ _id: req.params.id })
      .then(() => res.redirect("back"))
      .catch(next);
  }

  handleFormActions(req, res, next) {
    switch (req.body.action) {
      case "delete":
        Product.delete({ _id: { $in: req.body.productIds } })
          .then(() => res.redirect("back"))
          .catch(next);
        break;
      default:
        res.json({ message: "Action is invalid" });
    }
  }

  storedProducts(req, res, next) {
    const page = +req.query.page || 1;
    let totalItems;
    Promise.all([
      Product.find()
        .count()
        .then(numProducts => {
          totalItems = numProducts;
          return Product.find({})
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .sortable(req);
        }),
      Product.countDocumentsDeleted(),
    ])
      .then(([products, deletedCount]) => res.render("admin/stored-products", {
        products: mutipleMongooseToObject(products),
        deletedCount,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      }))
      .catch(next);
  }

  trashProducts(req, res, next) {
    Product.findDeleted({})
      .then(products => res.render("admin/trash-products", {
        products: mutipleMongooseToObject(products),
      }))
      .catch(next);
  }

  updateStatusCart(req, res, next) {
    Order.updateOne({ _id: req.params.id }, req.body)
      .then(() => res.redirect("/admin/order"))
      .catch(next);
  }

  getOrders(req, res, next) {
    Order.find({})
      .sortable(req)
      .then(orders => res.render("order", {
        orders: mutipleMongooseToObject(orders),
      }))
      .catch(next);
  }

  createNews(req, res, next) {
    res.render("admin/create-news");
  }

  getNews(req, res, next) {
    Promise.all([
      Story.find({}).sortable(req),
      Story.countDocumentsDeleted(),
    ])
      .then(([stories, deletedCount]) => res.render("admin/news", {
        stories: mutipleMongooseToObject(stories),
        deletedCount,
      }))
      .catch(next);
  }

  postNews(req, res, next) {
    req.body.imgStory = path
      .join("uploads", req.files[0].filename)
      .replace(/\\/g, "/");

    const story = new Story({
      title: req.body.title,
      content: req.body.content,
      imgStory: req.body.imgStory,
      user: {
        email: req.user.email,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        userId: req.user._id,
      },
    });

    story.save()
      .then(() => res.redirect("/admin/news"))
      .catch(next);
  }

  editNews(req, res, next) {
    Story.findById(req.params.id)
      .then(story => res.render("admin/edit-news", {
        story: mongooseToObject(story),
      }))
      .catch(next);
  }

  updateNews(req, res, next) {
    Story.updateOne({ _id: req.params.id }, req.body)
      .then(() => res.redirect("/admin/news"))
      .catch(next);
  }

  destroyNews(req, res, next) {
    Story.delete({ _id: req.params.id })
      .then(() => res.redirect("back"))
      .catch(next);
  }

  trashNews(req, res, next) {
    Story.findDeleted({})
      .then(stories => res.render("admin/trash-news", {
        stories: mutipleMongooseToObject(stories),
      }))
      .catch(next);
  }

  restoreNews(req, res, next) {
    Story.restore({ _id: req.params.id })
      .then(() => res.redirect("back"))
      .catch(next);
  }

  forceDestroyNews(req, res, next) {
    Story.deleteOne({ _id: req.params.id })
      .then(() => res.redirect("back"))
      .catch(next);
  }

  postFeedback(req, res, next) {
    Rating.updateOne({ _id: req.params.id }, { feedback: req.body.feedback })
      .then(() => res.redirect("back"))
      .catch(next);
  }
}

module.exports = new AdminController();