const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

exports.getCartPage = async (req, res) => {
    const cartItems = await Cart.getCartItemsByUserId(req.session.userId);
    res.render('cart', { cartItems, session: req.session });
};

exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const stockAmount = await Product.findStocks(productId);
    if (stockAmount <= 0) {
        return res.redirect("/products");
    };
    await Cart.addOrIncrementItem(req.session.userId, productId, parseInt(quantity));
    res.redirect('/cart');
};

exports.updateCartItem = async (req, res) => {
    const { quantity } = req.body;
    await Cart.updateCartItemQuantity(req.params.id, parseInt(quantity));
    res.redirect('/cart');
};

exports.removeCartItem = async (req, res) => {
    await Cart.removeCartItemById(req.params.id, req.session.userId);
    res.redirect('/cart');
};

exports.clearCart = async (req, res) => {
    await Cart.clearCart(req.session.userId);
    res.redirect('/cart');
};