const express = require('express');
const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

const router = express.Router();

function requireAuth(req, res, next) {
    if (req.session.userId) return next();
    res.redirect('/login');
}

// READ Wishlist

// GET /wishlist
router.get('/', requireAuth, async (req, res) => {
    const wishlistItems = await Wishlist.find({ userId: req.session.userId }).populate('productId');
    res.render('wishlist', { wishlistItems, session: req.session });
});

// CREATE and UPDATE Wishlist

// POST /wishlist/add
router.post('/add', requireAuth, async (req, res) => {
    const { productId } = req.body;
    if (!productId) {
        return res.redirect('/products');
    }

    try {
        await Wishlist.findOneAndUpdate(
            { userId: req.session.userId, productId },
            { userId: req.session.userId, productId },
            // Using upsert for creating and updating at the same time
            // Using setDefaultsOnInsert for default date updating
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
    } catch (error) {
        console.error('Wishlist add failed', error);
    }

    res.redirect('/products');
});

// DELETE Wishlist

// POST /wishlist/remove/:id
router.post('/remove/:id', requireAuth, async (req, res) => {
    await Wishlist.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
    res.redirect('/wishlist');
});

module.exports = router;
