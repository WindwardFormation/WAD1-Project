const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth-middleware');

router.post('/place', requireAuth, orderController.placeOrder);
router.get('/', requireAuth, orderController.getOrdersPage);
router.post('/cancel/:id', requireAuth, orderController.cancelOrder);
router.post('/complete/:id', requireAuth, orderController.completeOrder);

module.exports = router;