const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

exports.placeOrder = async (req, res) => {
    const cartItems = await Cart.getCartItemsByUserId(req.session.userId);

    if (!cartItems.length) {
        return res.redirect('/cart');
    }

    const items = cartItems.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price
    }));

    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    await Order.createOrder({
        userId: req.session.userId,
        items,
        totalPrice
    });

    await Cart.clearCart(req.session.userId);

    res.redirect('/orders');
};

exports.getOrdersPage = async (req, res) => {
    const orders = await Order.getOrdersByUserId(req.session.userId);
    res.render('orders', { orders, session: req.session });
};

exports.cancelOrder = async (req, res) => {
    const order = await Order.updateOrderStatus(req.params.id, req.session.userId, 'Cancelled');
    if (!order) {
        return res.status(404).send('Order not found or unauthorized');
    }
    res.redirect('/orders');
};

exports.completeOrder = async (req, res) => {
    const order = await Order.updateOrderStatus(req.params.id, req.session.userId, 'Completed');
    if (!order) {
        return res.status(404).send('Order not found or unauthorized');
    }
    res.redirect('/orders');
};