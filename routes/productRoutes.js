const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth, requireVendor } = require('../middleware/auth-middleware');

router.get('/', productController.getAllProducts);
router.get('/dashboard', requireAuth, requireVendor, productController.getVendorDashboard);
router.get('/add', requireAuth, requireVendor, productController.getAddProduct);
router.post('/add', requireAuth, requireVendor, productController.postAddProduct);
router.get('/edit/:id', requireAuth, requireVendor, productController.getEditProduct);
router.post('/edit/:id', requireAuth, requireVendor, productController.postEditProduct);
router.post('/delete/:id', requireAuth, requireVendor, productController.deleteProduct);

router.get('/vendor/:id/reviews', requireAuth, requireVendor, productController.getVendorProductReviews);

router.get('/:id', productController.getProductDetails);

module.exports = router;