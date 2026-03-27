const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
    }],
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    orderDate: { type: Date, default: Date.now }
});

//updated
const Order = mongoose.model('Order', orderSchema, 'orders');

module.exports = Order;

//find order and product id for reviews
module.exports.getOrdersByUserId = function(userId) {
    return Order.find({ userId: userId }).populate('items.productId')
};

module.exports.getCompletedOrdersByUserAndProduct = function(userId, productId) {
    return Order.find({
        userId: userId,
        status: 'Completed',
        'items.productId': productId
    });
};