const Cart = require('../models/cart');
const mongoose = require('mongoose');
const Product = require('../models/product');
const ObjectId = mongoose.Types.ObjectId;
// Add item to the cart


async function addItem(req, res) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user.id;
      if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid productId' });
      }
      const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }
      let cart = await Cart.findOne({ user: userId });
  
      if (!cart) {
        cart = new Cart({ user: userId, products: [{ productId, quantity }] });
      } else {
        const existingProductIndex = cart.products.findIndex(
          (product) => product.productId.equals(productId)
        );
  
        if (existingProductIndex !== -1) {
          cart.products[existingProductIndex].quantity += quantity;
        } else {
          cart.products.push({ productId, quantity });
        }
      }
  
      await cart.save();
      res.status(201).json({ message: 'Item added to the cart', cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  

// Get cart items
async function getCartItems(req, res) {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId }).populate('products.productId', 'name price');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Update cart
async function updateCart(req, res) {
  try {
    const { products } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { products } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ message: 'Cart updated successfully', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Remove item from the cart
async function removeItem(req, res) {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const updatedProducts = cart.products.filter(
      (product) => product.productId.toString() !== productId
    );

    cart.products = updatedProducts;
    await cart.save();

    res.status(200).json({ message: 'Item removed from the cart', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { addItem, getCartItems, updateCart, removeItem };
