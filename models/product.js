const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
  name: { type: String, required: false },
  description: { type: String, required: true },
  price: { type: String, required: false },
  tags: { type: String, required: false, unique: false },
  stock: { type: String, required: false, unique: false },
  brand: { type: String, required: false },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
});

const Product = mongoose.model('Product', ProductsSchema);
module.exports = Product;
