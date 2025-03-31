// src/app/models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    country: { type: String },
    resetToken: String,
    resetTokenExpiration: Date,
    role: { type: Number, default: 2 }, // 1 = admin, 2 = user
    cart: {
      items: [
        {
          productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
          quantity: { type: Number },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// METHOD: Thêm sản phẩm vào giỏ
userSchema.methods.addToCart = function (product, quantity) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = Number(quantity);
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + newQuantity;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      quantity: newQuantity,
      productId: product._id,
    });
  }

  this.cart = { items: updatedCartItems };
  return this.save();
};

// METHOD: Xoá sản phẩm khỏi giỏ
userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

// METHOD: Xoá toàn bộ giỏ
userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
