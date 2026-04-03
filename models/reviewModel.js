const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true},
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    username: { type: String, default: 'Deleted User' },  
    createdAt: { type: Date, default: Date.now },

});

const Review = mongoose.model('Review', reviewSchema, 'reviews');

// get all reviews by specific user (reviews tab)
exports.getReviewsByUser = function(userId) {
    return Review.find({userId: userId});
};

// check if user already reviewd 
exports.getReviewsByUserAndProduct = function(userId, productId) {
    return Review.find({
        userId: userId,
        productId: productId
    });
};

// get review by ID and user (ownership check before update/delete)
exports.getReviewByIdAndUser = function(reviewId, userId) {
    return Review.findOne({
        _id: reviewId,
        userId: userId
    });
};

// get all reviews for a product
exports.getReviewsByProductId = function(productId) {
    return Review.find({ productId: productId })
        .sort({ createdAt: -1 });
};



exports.createReview = function(newReview) {
    return Review.create(newReview);
};


exports.updateReview = function(reviewId, userId, updatedReview) {
    return Review.findOneAndUpdate(
        { _id: reviewId, userId: userId },
        updatedReview,
        { returnDocument: 'after' }
    );
};


exports.deleteReview = function(reviewId, userId) {
    return Review.deleteOne({
        _id: reviewId,
        userId: userId
    });
};