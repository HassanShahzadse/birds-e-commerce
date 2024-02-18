const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAdmin, requireUser } = require('../middlewares/authentication');

// Create a review (user)
router.post('/createReview', requireUser, reviewController.createReview);

// Approve a review (admin)
router.put('/approveReview/:reviewId', requireAdmin, reviewController.approveReview);

// Get reviews of a product (public)
router.get('/getProductReviews/:productId', reviewController.getProductReviews);
router.get('/getAllReviewsAdmin',requireAdmin, reviewController.getAllReviewsAdmin);
router.get('/getReview/:reviewId', requireUser, reviewController.getReviewById);
// Delete a review (admin or user who created the review)
router.delete('/deleteReview/:reviewId', requireUser, reviewController.deleteReview);
router.put('/updateReview/:reviewId', requireUser, reviewController.updateReview);
module.exports = router;
