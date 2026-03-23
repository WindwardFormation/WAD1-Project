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

//for reviews tab
exports.findReviewsByUser = function(userId) {
    return Review.find({userId: userId});
};



//find reviews of specific user for a specific product
//check if user reviewed 
exports.findReviewsByUserAndProduct = function(userId, productId) {
    return Review.find({
        userId: userId,
        productId: productId
    });
};

//check if review belongs to user before update/delete
exports.findReviewByIdAndUser = function(reviewId, userId) {
    return Review.findOne({
        _id: reviewId,
        userId: userId
    });
};

//populate the username of reviewer and sort review
exports.findReviewsByProductId = function(productId) {
    return Review.find({ productId: productId })
    // handles how review is retrieved from db
        .populate('userId', 'username') 
        .sort({ createdAt: -1 }); //sort based on newest review
};


//create
exports.addReview = function(newReview) {
    return Review.create(newReview);
};

//user can only update their own reviews
exports.updateReview = function(reviewId, userId, updatedReview) {
    return Review.findOneAndUpdate(
        { _id: reviewId, userId: userId },
        updatedReview,
        { returnDocument: 'after' }
    );
};

//delete
exports.deleteReview = function(reviewId, userId) {
    return Review.deleteOne({
        _id: reviewId,
        userId: userId
    });
};