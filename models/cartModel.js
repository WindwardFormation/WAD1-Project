const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    addedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);

Cart.getCartItemsByUserId = function (userId) {
    return this.find({ userId }).populate('productId');
};

Cart.findCartItem = function (userId, productId) {
    return this.findOne({ userId, productId });
};

Cart.addOrIncrementItem = async function (userId, productId, quantity) {
    const existing = await this.findCartItem(userId, productId);
    if (existing) {
        existing.quantity += quantity;
        return existing.save();
    }
    return this.create({ userId, productId, quantity });
};

Cart.updateCartItemQuantity = function (cartItemId, quantity) {
    return this.findByIdAndUpdate(cartItemId, { quantity }, { new: true });
};

Cart.removeCartItemById = function (cartItemId, userId) {
    return this.findOneAndDelete({ _id: cartItemId, userId });
};

Cart.clearCart = function (userId) {
    return this.deleteMany({ userId });
};

module.exports = Cart;