const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router.post('/signup', authController.signup);
router.get('/verify-email', authController.verifySignUp);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-verify-email', authController.resendVerificationEmail);
router.get('/reset-password', authController.verifyResetPassword);

module.exports = router;
