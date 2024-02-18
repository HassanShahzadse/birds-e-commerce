const Product = require('../models/product');
const Category = require('../models/category');
const mongoose  = require('mongoose');

async function createProduct(req, res) {
  try {
    const { name, description, price, tags, stock, categories } = req.body;
        // Validate that all categories are valid ObjectIds
        const isValidCategoryIds = categories.every(categoryId => mongoose.Types.ObjectId.isValid(categoryId));

        if (!isValidCategoryIds) {
          return res.status(400).json({ error: 'Invalid category ID(s) provided.' });
        }
    const existingCategories = await Category.find({ _id: { $in: categories } });
    const missingCategories = categories.filter(categoryId => !existingCategories.some(c => c._id.toString() === categoryId));

    if (missingCategories.length > 0) {
      return res.status(400).json({ error: `Categories with ids [${missingCategories.join(', ')}] do not exist.` });
    }
    // Assuming categories is an array of category IDs
    const product = await Product.create({ name, description, price, tags, stock, categories });

    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while creating the product.' });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, tags, stock, categories } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { name, description, price, tags, stock, categories },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while updating the product.' });
  }
}
async function updateProductInventory(req, res) {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while updating the product.' });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('categories');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while retrieving the product.' });
  }
}

async function getAllProduct(req, res) {
  try {
    const products = await Product.find().populate('categories');
    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while retrieving the products.' });
  }
}
async function getAllProductByCategory(req, res) {
  try {
    const { categoryId } = req.params;

    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Find products with the specified category ID
    const products = await Product.find({ categories: categoryId }).populate('categories');

    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while retrieving the products.' });
  }
}

async function deleteProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ message: 'Product Deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while deleting the product.' });
  }
}

module.exports = {
  createProduct,
  updateProduct,
  getProductById,
  getAllProduct,
  getAllProductByCategory,
  deleteProductById,
  updateProductInventory
};
