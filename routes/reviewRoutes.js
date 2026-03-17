const express = require('express');
const Review = require('../models/reviewModel');

const router = express.Router();

// Middleware
function requireAuth(req, res, next) {
    if (req.session.userId) return next();
    res.redirect('/login');
}

// POST /reviews/add
router.post('/add', requireAuth, async (req, res) => {
    const { productId, rating, comment } = req.body;
    const review = new Review({ userId: req.session.userId, productId, rating: parseInt(rating), comment });
    await review.save();
    res.redirect(`/products/${productId}`);
});

// POST /reviews/update/:id
router.post('/update/:id', requireAuth, async (req, res) => {
    const { rating, comment } = req.body;
    await Review.findByIdAndUpdate(req.params.id, { rating: parseInt(rating), comment });
    const review = await Review.findById(req.params.id);
    res.redirect(`/products/${review.productId}`);
});

// POST /reviews/delete/:id
router.post('/delete/:id', requireAuth, async (req, res) => {
    const review = await Review.findById(req.params.id);
    await Review.findByIdAndDelete(req.params.id);
    res.redirect(`/products/${review.productId}`);
});

module.exports = router;