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

// functions

// for review
// find order and product id for reviews
function getOrdersByUserId(userId) {
    return Order.find({ userId:userId })
        .populate({
            path: 'items.productId',
            populate: { path: 'vendorId', select: 'username' }
        });
};

// find order by orderId 
function getOrderByOrderId(orderId) {
    return Order.findOne({ _id:orderId });
};

// create new order 
function createOrder(orderData) {
    return Order.create(orderData)
    // orderData from cart
};

// update order 
function updateOrderStatus(orderId, status) {
    return Order.findOneAndUpdate(
        { _id: orderId },
        { status: status },
        { returnDocument: "after" }
        // returns the updated order not the old one 
    );
};

// delete order (not used)
function deleteOrder(orderId) {
    return Order.findOneAndDelete(
        {_id:orderId}
    )
};

// for reviews 
// returns the completed order for specific user and product
function getCompletedOrdersByUserAndProduct(userId, productId) {
    return Order.find({
        userId: userId, 
        status: 'Completed',
        'items.productId': productId
    });
};

module.exports = {
    createOrder, 
    getOrdersByUserId,
    getOrderByOrderId, 
    updateOrderStatus, 
    getCompletedOrdersByUserAndProduct
};
