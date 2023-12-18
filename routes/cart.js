const express = require('express');
const router = express.Router();
const { requireUser } = require('../middlewares/authentication');
const cartController = require('../controllers/cartController');

// Add item to the cart
router.post('/addItemInCart', requireUser, cartController.addItem);

// Get cart items
router.get('/getCartItems', requireUser, cartController.getCartItems);

// Update cart
router.put('/updateCart', requireUser, cartController.updateCart);

// Remove item from the cart
router.delete('/removeItemFromCart/:productId', requireUser, cartController.removeItem);

module.exports = router;
