const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    createdAt: { type: Date, default: Date.now }
});

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

Wishlist.getWishlistItemsByUserId = function (userId) {
    return this.find({ userId }).populate('productId');
};

Wishlist.addOrUpdateWishlistItem = function (userId, productId) {
    return this.findOneAndUpdate(
        { userId, productId },
        { userId, productId },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
};

Wishlist.removeWishlistItem = function (wishlistId, userId) {
    return this.findOneAndDelete({ _id: wishlistId, userId });
};

module.exports = Wishlist;
