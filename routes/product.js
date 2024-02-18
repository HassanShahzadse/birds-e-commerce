const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');
const path = require('path');
const { requireAdmin } = require('../middlewares/authentication');

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/createProduct',requireAdmin,productController.createProduct);
router.put('/updateProduct/:id',requireAdmin,productController.updateProduct);
router.put('/updateProductInventory/:id',requireAdmin,productController.updateProductInventory);
router.get('/getProduct/:id', productController.getProductById);
router.get('/getAllProduct', productController.getAllProduct);
router.get('/getAllProductByCategory/:categoryId', productController.getAllProductByCategory);
router.delete('/deleteProductById/:id',requireAdmin, productController.deleteProductById);
module.exports = router;
