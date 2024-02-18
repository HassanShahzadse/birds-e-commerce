const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const yup = require('yup');
const statusSchema = yup.string().oneOf(['confirm', 'pending', 'delivered', 'refundApplied', 'refunded']);
const orderController = {
  // Add item to the cart
  
  createOrder: async (req, res) => {
    try {
      const userId = req.user.id;

      // Get the user's cart
      const userCart = await Cart.findOne({ user: userId }).populate('products.productId');

      if (!userCart || userCart.products.length === 0) {
        return res.status(400).json({ message: 'Cart is empty. Add items to the cart before creating an order.' });
      }

      // Calculate total price based on the products in the cart
      const totalPrice = userCart.products.reduce((total, product) => {
        return total + product.productId.price * product.quantity;
      }, 0);

      // Create the order
      const order = await Order.create({
        user: userId,
        products: userCart.products,
        totalPrice,
        status: 'pending', // Set the initial status
      });

      // Clear the user's cart after creating the order
      await Cart.findOneAndUpdate({ user: userId }, { $set: { products: [] } });

      return res.status(201).json({ message: 'Order created successfully.', order });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Get user's orders
  getOrder: async (req, res) => {
    try {
      const userId = req.user.id;

      // Get the user's orders
      const userOrders = await Order.find({ user: userId }).populate('products.productId');

      return res.status(200).json({ orders: userOrders });
    } catch (error) {
      console.error('Error getting orders:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },
  getOrderById: async (req, res) => {
    try {
      const orderId = req.params.id;
  
      // Check if the order ID is valid
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID.' });
      }
  
      // Find the order by ID
      const order = await Order.findOne({ _id: orderId, user: req.user.id }).populate('products.productId');
  
      // Check if the order exists
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }
  
      return res.status(200).json({ order });
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Update order
  updateOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const { orderId, productId, quantity } = req.body;

      // Validate input
      if (!orderId || !productId || !quantity) {
        return res.status(400).json({ message: 'Invalid input. Please provide orderId, productId, and quantity.' });
      }

      // Update the specified product in the order
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId, user: userId, 'products.productId': productId },
        { $set: { 'products.$.quantity': quantity } },
        { new: true }
      ).populate('products.productId');

      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order or product not found.' });
      }

      return res.status(200).json({ message: 'Order updated successfully.', order: updatedOrder });
    } catch (error) {
      console.error('Error updating order:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const userId = req.user.id;
      const { orderId, status } = req.body;

      // Validate input
      if (!orderId || !status) {
        return res.status(400).json({ message: 'Invalid input. Please provide orderId and status.' });
      }
      try {
        await statusSchema.validate(status);
      } catch (validationError) {
        return res.status(400).json({ message: 'Invalid input. Please provide a valid order status. confirm or pending or delivered or refundApplied or refunded' });
      }
      // Update the order status
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId, user: userId },
        { $set: { status } },
        { new: true }
      ).populate('products.productId');

      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      return res.status(200).json({ message: 'Order status updated successfully.', order: updatedOrder });
    } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },
};

module.exports = orderController;
