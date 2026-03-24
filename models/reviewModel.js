const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true},
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema, 'reviews');

// Get all reviews by user
exports.getReviewsByUser = function(userId) {
    return Review.find({userId: userId});
};

// Get reviews by user and product
exports.getReviewsByUserAndProduct = function(userId, productId) {
    return Review.find({
        userId: userId,
        productId: productId
    });
};

// Get review by ID and user (ownership check)
exports.getReviewByIdAndUser = function(reviewId, userId) {
    return Review.findOne({
        _id: reviewId,
        userId: userId
    });
};

// Get reviews by product ID with user populated and sorted
exports.getReviewsByProductId = function(productId) {
    return Review.find({ productId: productId })
        .populate('userId', 'username')
        .sort({ createdAt: -1 });
};

// Create review
exports.createReview = function(newReview) {
    return Review.create(newReview);
};

// Update review (user ownership validated)
exports.updateReview = function(reviewId, userId, updatedReview) {
    return Review.findOneAndUpdate(
        { _id: reviewId, userId: userId },
        updatedReview,
        { returnDocument: 'after' }
    );
};

// Delete review (user ownership validated)
exports.deleteReview = function(reviewId, userId) {
    return Review.deleteOne({
        _id: reviewId,
        userId: userId
    });
};