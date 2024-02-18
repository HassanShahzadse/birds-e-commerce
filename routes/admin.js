const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin, requireUser } = require('../middlewares/authentication');


router.get('/getAllUsers', requireAdmin, adminController.getAllUsers);
router.get('/getUserById/:id', requireAdmin, adminController.getUserById);

// Update user details
router.put('/updateUsers/:id', requireAdmin, adminController.updateUser);

// Delete a user
router.delete('/deleteUsers/:id', requireAdmin, adminController.deleteUser);
module.exports = router;
