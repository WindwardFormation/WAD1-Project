const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/auth-middleware');

router.get('/', requireAuth, wishlistController.getWishlistPage);
router.post('/add', requireAuth, wishlistController.addToWishlist);
router.post('/remove/:id', requireAuth, wishlistController.removeFromWishlist);

module.exports = router;
