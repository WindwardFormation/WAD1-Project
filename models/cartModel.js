const mongoose = require('mongoose');

// refer to addOrIncrementItem and updateCartItemQuantity function
const Product = require('./productModel');

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

// Modified the code so that quantity is capped
// at the amount of stock left
Cart.addOrIncrementItem = async function (userId, productId, quantity) {
    const existing = await this.findCartItem(userId, productId);
    let stockAmount = await Product.findStocks(productId);
    if (existing) {
        existing.quantity += quantity;
        if (existing.quantity <= stockAmount) {
            return existing.save();
        } else {
            existing.quantity = stockAmount
            return existing.save();
        };
    } else {
        if (quantity <= stockAmount) {
        return this.create({ userId, productId, quantity });
    }   else {
        return this.create({ userId, productId, quantity: stockAmount });
    };
    };
};

// Added checking of stocks left against the quantity updated
Cart.updateCartItemQuantity = async function (cartItemId, quantity) {
    const product = await Cart.findOne( { _id: cartItemId } );
    const productId = product.productId;
    let stockAmount = await Product.findStocks(productId);
    if (quantity <= stockAmount) {
    return this.findByIdAndUpdate(cartItemId, { quantity }, { new: true });
    } else {
    return this.findByIdAndUpdate(cartItemId, { quantity: stockAmount}, { new: true})
    };
};

Cart.removeCartItemById = function (cartItemId, userId) {
    return this.findOneAndDelete({ _id: cartItemId, userId });
};

Cart.clearCart = function (userId) {
    return this.deleteMany({ userId });
};

module.exports = Cart;