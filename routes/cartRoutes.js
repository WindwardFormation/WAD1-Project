const express = require('express');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const router = express.Router();

// Middleware
function requireAuth(req, res, next) {
    if (req.session.userId) return next();
    res.redirect('/login');
}

// GET /cart
router.get('/', requireAuth, async (req, res) => {
    const cartItems = await Cart.find({ userId: req.session.userId }).populate('productId');
    res.render('cart', { cartItems, session: req.session });
});

// POST /cart/add
router.post('/add', requireAuth, async (req, res) => {
    const { productId, quantity } = req.body;
    const existing = await Cart.findOne({ userId: req.session.userId, productId });
    if (existing) {
        existing.quantity += parseInt(quantity);
        await existing.save();
    } else {
        const cartItem = new Cart({ userId: req.session.userId, productId, quantity: parseInt(quantity) });
        await cartItem.save();
    }
    res.redirect('/cart');
});

// POST /cart/update/:id
router.post('/update/:id', requireAuth, async (req, res) => {
    const { quantity } = req.body;
    await Cart.findByIdAndUpdate(req.params.id, { quantity: parseInt(quantity) });
    res.redirect('/cart');
});

// POST /cart/remove/:id
router.post('/remove/:id', requireAuth, async (req, res) => {
    await Cart.findByIdAndDelete(req.params.id);
    res.redirect('/cart');
});

// Clear Cart without Order
router.post('/remove-all', requireAuth, async (req, res) => {
    await Cart.deleteMany( { userId : req.session.userId })
    res.redirect('/cart');
});

module.exports = router;