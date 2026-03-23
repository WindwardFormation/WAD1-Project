const express = require('express');
const Product = require('../models/productModel');
const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');

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
    if (req.session.userId && req.session.role === 'vendor') {
        return res.redirect('/vendor/dashboard');
    }
    const { category, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    const products = await Product.find(query).populate('vendorId', 'username');
    res.render('products', { products, category, search, session: req.session });
});

// Vendor routes
// GET /products/vendor/dashboard
// router.get('/vendor/dashboard', requireAuth, requireVendor, async (req, res) => {
//     const products = await Product.find({ vendorId: req.session.userId });
//     res.render('vendorDashboard', { products, session: req.session });
// });

router.get('/dashboard', requireAuth, requireVendor, async (req, res) => {
    // prevent access via /products/dashboard
    if (req.baseUrl === '/products') {
        return res.redirect('/products');
    }

    const { category, search } = req.query;
    let query = { vendorId: req.session.userId };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    const products = await Product.find(query);
    res.render('vendorDashboard', {products, category, search,session: req.session 
});
});

// GET /vendor/add
router.get('/add', requireAuth, requireVendor, (req, res) => {
    // prevent access via /products/dashboard
    if (req.baseUrl === '/products') {
        return res.redirect('/products');
    }

    res.render('addProduct', { error: null, session: req.session });
});

// POST /vendor/add
router.post('/add', requireAuth, requireVendor, async (req, res) => {
    const { name, description, price, category, stock } = req.body;
    try {
        const product = new Product({ name, description, price: parseFloat(price), category, stock: parseInt(stock), vendorId: req.session.userId });
        await product.save();
        res.redirect('/vendor/dashboard');
    } catch (err) {
        res.render('addProduct', { error: 'Failed to add product', session: req.session });
    }
});

// GET /vendor/edit/:id
router.get('/edit/:id', requireAuth, requireVendor, async (req, res) => {
    // prevent access via /products/dashboard
    if (req.baseUrl === '/products') {
        return res.redirect('/products');
    }

    const product = await Product.findById(req.params.id);
    if (product.vendorId.toString() !== req.session.userId) return res.status(403).send('Access denied');
    res.render('editProduct', { product, error: null, session: req.session });
});

// POST /vendor/edit/:id
router.post('/edit/:id', requireAuth, requireVendor, async (req, res) => {
    const { name, description, price, category, stock } = req.body;
    try {
        await Product.findByIdAndUpdate(req.params.id, { name, description, price: parseFloat(price), category, stock: parseInt(stock) });
        res.redirect('/vendor/dashboard');
    } catch (err) {
        const product = await Product.findById(req.params.id);
        res.render('editProduct', { product, error: 'Failed to update product', session: req.session });
    }
});

// POST /vendor/delete/:id
router.post('/delete/:id', requireAuth, requireVendor, async (req, res) => {
    // prevent access via /products/dashboard
    if (req.baseUrl === '/products') {
        return res.redirect('/products');
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/vendor/dashboard');
});

// // GET /products/:id
// router.get('/:id', async (req, res) => {
//     const product = await Product.findById(req.params.id).populate('vendorId', 'username');
//     const reviews = await Review.find({ productId: req.params.id }).populate('userId', 'username');
//     res.render('productDetails', { product, reviews, session: req.session });
// });

// GET /products/:id UPDATED
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('vendorId', 'username');
        const reviews = await Review.findReviewsByProductId(req.params.id); 

        reviews.forEach(review => {
            const date = new Date(review.createdAt);
            const day = date.getDate();
            const year = date.getFullYear();
            const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            const month = months[date.getMonth()];

            review.formatDate = day + " " + month + " " + year;

        })

        let canReview = false;

        if (req.session.userId) {
            // All completed orders of this user containing this product
            const completedOrders = await Order.findCompletedOrdersByUserAndProduct(
                req.session.userId,
                req.params.id
            );

            // All reviews this user has already written for this product
            const existingReviews = await Review.findReviewsByUserAndProduct(
                req.session.userId,
                req.params.id
            );

            // Orders already used for reviews
            const reviewedOrderIds = existingReviews.map(review => review.orderId.toString());

            // Find one completed order not yet used for review
            const availableOrder = completedOrders.find(order =>
                !reviewedOrderIds.includes(order._id.toString())
            );

            canReview = !!availableOrder;
        }

        const message = req.query.message;

        res.render('productDetails', {
            product,
            reviews,
            session: req.session,
            canReview,
            message
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


module.exports = router;