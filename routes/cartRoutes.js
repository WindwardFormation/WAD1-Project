const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth-middleware');

router.get('/', requireAuth, cartController.getCartPage);
router.post('/add', requireAuth, cartController.addToCart);
router.post('/update/:id', requireAuth, cartController.updateCartItem);
router.post('/remove/:id', requireAuth, cartController.removeCartItem);
router.post('/remove-all', requireAuth, cartController.clearCart);

module.exports = router;