const Wishlist = require('../models/wishlistModel');

exports.getWishlistPage = async (req, res) => {
    const wishlistItems = await Wishlist.getWishlistItemsByUserId(req.session.userId);
    res.render('wishlist', { wishlistItems, session: req.session });
};

exports.addToWishlist = async (req, res) => {
    const { productId } = req.body;
    if (!productId) return res.redirect('/products');

    await Wishlist.addOrUpdateWishlistItem(req.session.userId, productId);
    res.redirect('/products');
};

exports.removeFromWishlist = async (req, res) => {
    await Wishlist.removeWishlistItem(req.params.id, req.session.userId);
    res.redirect('/wishlist');
};