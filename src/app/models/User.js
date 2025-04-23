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
    avatar: { type: String, default: "" },
    resetToken: String,
    resetTokenExpiration: Date,
    role: { type: Number, default: 2 }, // 1 = admin, 2 = user
    cart: {
      items: [
        {
          productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, // ✅ Đã sửa
          quantity: { type: Number, default: 1 },
        },
      ],
    },
  },
  { timestamps: true }
);

// METHOD: Thêm sản phẩm vào giỏ
userSchema.methods.addToCart = function (product, quantity) {
  const productId = product._id.toString();
  console.log("🛒 Cart items:", this.cart.items);

  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId && cp.productId.toString() === productId;
  });

  const updatedCartItems = [...this.cart.items];
  const qty = Number(quantity) || 1;

  if (cartProductIndex >= 0) {
    updatedCartItems[cartProductIndex].quantity += qty;
  } else {
    updatedCartItems.push({
      productId: product._id, // giữ nguyên ObjectId
      quantity: qty,
    });
  }

  this.cart.items = updatedCartItems;
  return this.save();
};


// METHOD: Xoá sản phẩm khỏi giỏ hàng
userSchema.methods.removeFromCart = function (productId) {
  this.cart.items = this.cart.items.filter(
    item => item.productId.toString() !== productId.toString()
  );
  return this.save();
};

// METHOD: Xoá toàn bộ giỏ hàng
userSchema.methods.clearCart = function () {
  this.cart.items = [];
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
