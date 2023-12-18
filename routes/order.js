const express = require('express');
const router = express.Router();
const { requireUser } = require('../middlewares/authentication');
const orderController = require('../controllers/orderController');

// Add item to the cart
router.post('/createOrder', requireUser, orderController.createOrder);

// Get cart items
router.get('/getOrder', requireUser, orderController.getOrder);

// Update cart
router.put('/updateOrder', requireUser, orderController.updateOrder);
router.put('/updateOrderStatus', requireUser, orderController.updateOrderStatus);


module.exports = router;
