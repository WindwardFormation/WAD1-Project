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

// GET /orders
router.get('/', requireAuth, async (req, res) => {
    const orders = await Order.find({ userId: req.session.userId }).populate('items.productId');
    res.render('orders', { orders, session: req.session });
});

// POST /orders/cancel/:id
router.post('/cancel/:id', requireAuth, async (req, res) => {
    await Order.findByIdAndUpdate(req.params.id, { status: 'Cancelled' });
    res.redirect('/orders');
});

module.exports = router;