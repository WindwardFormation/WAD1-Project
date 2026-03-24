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

const Order = mongoose.model('Order', orderSchema, 'orders');

Order.getOrdersByUserId = function (userId) {
    return this.find({ userId }).populate('items.productId');
};

Order.getCompletedOrdersByUserAndProduct = function(userId, productId) {
    return this.find({
        userId: userId,
        status: 'Completed',
        'items.productId': productId
    });
};

Order.createOrder = function(orderData) {
    return this.create(orderData);
};

Order.updateOrderStatus = function(orderId, userId, status) {
    return this.findOneAndUpdate(
        { _id: orderId, userId },
        { status },
        { new: true }
    );
};

module.exports = Order;