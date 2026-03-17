const express = require('express');
const Product = require('../models/productModel');
const Review = require('../models/reviewModel');

const router = express.Router();

// Middleware
function requireAuth(req, res, next) {
    if (req.session.userId) return next();
    res.redirect('/login');
}

function requireVendor(req, res, next) {
    if (req.session.role === 'vendor') return next();
    res.status(403).send('Access denied');
}

// GET /products
router.get('/', async (req, res) => {
    const { category, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    const products = await Product.find(query).populate('vendorId', 'username');
    res.render('products', { products, category, search, session: req.session });
});

// GET /products/:id
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('vendorId', 'username');
    const reviews = await Review.find({ productId: req.params.id }).populate('userId', 'username');
    res.render('productDetails', { product, reviews, session: req.session });
});

// Vendor routes
// GET /products/vendor/dashboard
router.get('/vendor/dashboard', requireAuth, requireVendor, async (req, res) => {
    const products = await Product.find({ vendorId: req.session.userId });
    res.render('vendorDashboard', { products, session: req.session });
});

// GET /products/vendor/add
router.get('/vendor/add', requireAuth, requireVendor, (req, res) => {
    res.render('addProduct', { error: null, session: req.session });
});

// POST /products/vendor/add
router.post('/vendor/add', requireAuth, requireVendor, async (req, res) => {
    const { name, description, price, category, stock } = req.body;
    try {
        const product = new Product({ name, description, price: parseFloat(price), category, stock: parseInt(stock), vendorId: req.session.userId });
        await product.save();
        res.redirect('/products/vendor/dashboard');
    } catch (err) {
        res.render('addProduct', { error: 'Failed to add product', session: req.session });
    }
});

// GET /products/vendor/edit/:id
router.get('/vendor/edit/:id', requireAuth, requireVendor, async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product.vendorId.toString() !== req.session.userId) return res.status(403).send('Access denied');
    res.render('editProduct', { product, error: null, session: req.session });
});

// POST /products/vendor/edit/:id
router.post('/vendor/edit/:id', requireAuth, requireVendor, async (req, res) => {
    const { name, description, price, category, stock } = req.body;
    try {
        await Product.findByIdAndUpdate(req.params.id, { name, description, price: parseFloat(price), category, stock: parseInt(stock) });
        res.redirect('/products/vendor/dashboard');
    } catch (err) {
        const product = await Product.findById(req.params.id);
        res.render('editProduct', { product, error: 'Failed to update product', session: req.session });
    }
});

// POST /products/vendor/delete/:id
router.post('/vendor/delete/:id', requireAuth, requireVendor, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/products/vendor/dashboard');
});

module.exports = router;