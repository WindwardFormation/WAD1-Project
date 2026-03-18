const express = require('express');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const router = express.Router();

// Middleware
function requireAuth(req, res, next) {
    if (req.session.userId) return next();
    res.redirect('/login');
}

// CREATE Orders

// POST /orders/place
router.post('/place', requireAuth, async (req, res) => {
    const cartItems = await Cart.find({ userId: req.session.userId }).populate('productId');
    if (cartItems.length === 0) return res.redirect('/cart');
    let total = 0;
    const items = cartItems.map(item => {
        total += item.productId.price * item.quantity;
        return {
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price
        };
    });
    const order = new Order({ userId: req.session.userId, items, totalPrice: total });
    await order.save();
    // Clear cart
    await Cart.deleteMany({ userId: req.session.userId });
    res.redirect('/orders');
});

// READ Orders

// GET /orders
router.get('/', requireAuth, async (req, res) => {
    const orders = await Order.find({ userId: req.session.userId }).populate('items.productId');
    res.render('orders', { orders, session: req.session });
});

// UPDATE Orders

// POST /orders/cancel/:id
router.post('/cancel/:id', requireAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        if (order.userId.toString() !== req.session.userId.toString()) {
            return res.status(403).send('Unauthorized');
        }
        await Order.findByIdAndUpdate(req.params.id, { status: 'Cancelled' });
        res.redirect('/orders');
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).send('Error cancelling order');
    }
});

// POST /orders/complete/:id
router.post('/complete/:id', requireAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).send('Order not found');
        }
        if (order.userId.toString() !== req.session.userId.toString()) {
            return res.status(403).send('Unauthorized');
        }
        await Order.findByIdAndUpdate(req.params.id, { status: 'Completed' });
        res.redirect('/orders');
    } catch (error) {
        console.error('Error completing order:', error);
        res.status(500).send('Error completing order');
    }
});

module.exports = router;