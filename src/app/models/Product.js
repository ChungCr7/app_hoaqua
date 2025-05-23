const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    product_type: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    img: { type: Array, required: true },
    thuong_hieu: { type: String, required: true },
    tinh_trang: { type: String, required: true },
    danh_gia: [
      { ratingId: { type: Schema.Types.ObjectId, ref: 'Rating' } }
    ],
    price: { type: Number, required: true },
    slug: { type: String, slug: 'name', unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deleteAt: {},
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ name: 'text', description: 'text' });

ProductSchema.query.sortable = function (req) {
  if (req.query.hasOwnProperty('_sort')) {
    const isValidtype = ['asc', 'desc'].includes(req.query.type);
    return this.sort({
      [req.query.column]: isValidtype ? req.query.type : 'desc',
    });
  }
  return this;
};

mongoose.plugin(slug);

ProductSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});

module.exports = mongoose.model('Product', ProductSchema);
