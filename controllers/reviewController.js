const Review = require('../models/review');
const Product = require('../models/product');

const reviewController = {
  // Create a review
  createReview: async (req, res) => {
    try {
      const { user, product, rating, comment } = req.body;

      // Check if the product exists
      const existingProduct = await Product.findById(product);
      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found.' });
      }

      // Create the review
      const review = new Review({
        user,
        product,
        rating,
        comment
      });

      await review.save();

      return res.status(201).json({ review });
    } catch (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Approve a review (admin)
  approveReview: async (req, res) => {
    try {
      const reviewId = req.params.reviewId;

      // Check if the review ID is valid
      if (!isValidObjectId(reviewId)) {
        return res.status(400).json({ message: 'Invalid review ID.' });
      }

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found.' });
      }

      review.approved = true;
      await review.save();

      return res.status(200).json({ review });
    } catch (error) {
      console.error('Error approving review:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Get reviews of a product (public)
  getProductReviews: async (req, res) => {
    try {
      const productId = req.params.productId;

      // Check if the product ID is valid
      if (!isValidObjectId(productId)) {
        return res.status(400).json({ message: 'Invalid product ID.' });
      }

      const reviews = await Review.find({ product: productId, approved: true }).populate('user', 'username');
      return res.status(200).json({ reviews });
    } catch (error) {
      console.error('Error getting product reviews:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },
  getAllReviewsAdmin: async (req, res) => {
    try {
      const reviews = await Review.find()
        .populate('user', 'username')
        .populate('product');
      return res.status(200).json({ reviews });
    } catch (error) {
      console.error('Error getting reviews:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },
  getReviewById: async (req, res) => {
    try {
      const reviewId = req.params.reviewId;

      // Check if the review ID is valid
      if (!isValidObjectId(reviewId)) {
        return res.status(400).json({ message: 'Invalid review ID.' });
      }

      // Find the review by ID
      const review = await Review.findById(reviewId).populate('user', 'username');

      if (!review) {
        return res.status(404).json({ message: 'Review not found.' });
      }

      return res.status(200).json({ review });
    } catch (error) {
      console.error('Error getting review by ID:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },

  // Delete a review (admin or user who created the review)
  deleteReview: async (req, res) => {
    try {
      const reviewId = req.params.reviewId;
  
      // Check if the review ID is valid
      if (!isValidObjectId(reviewId)) {
        return res.status(400).json({ message: 'Invalid review ID.' });
      }
  
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found.' });
      }
  
      // Check if the user is authorized to delete the review
      if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized to delete this review.' });
      }
  
      await Review.deleteOne({ _id: reviewId }); // Use deleteOne to delete the review
  
      return res.status(200).json({ message: 'Review deleted successfully.' });
    } catch (error) {
      console.error('Error deleting review:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  },  
  // Update a review
updateReview: async (req, res) => {
    try {
      const reviewId = req.params.reviewId;
      const { rating, comment } = req.body;
  
      // Check if the review ID is valid
      if (!isValidObjectId(reviewId)) {
        return res.status(400).json({ message: 'Invalid review ID.' });
      }
  
      // Check if the review exists
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found.' });
      }
  
      // Check if the user is authorized to update the review
      if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized to update this review.' });
      }
  
      // Update the review
      if (rating) {
        review.rating = rating;
      }
      if (comment) {
        review.comment = comment;
      }
      review.approved = false
      await review.save();
  
      return res.status(200).json({ review });
    } catch (error) {
      console.error('Error updating review:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }
  
};

module.exports = reviewController;

// Function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id) {
  const mongoose = require('mongoose');
  return mongoose.Types.ObjectId.isValid(id);
}
