const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Middleware
function requireAuth(req, res, next) {
    if (req.session.userId) return next();
    res.redirect('/login');
}

router.get('/', requireAuth, reviewController.getReviewPage);

router.post('/add', requireAuth, reviewController.addReview);
router.post('/update/:id', requireAuth, reviewController.updateReview);
router.post('/delete/:id', requireAuth, reviewController.deleteReview);




module.exports = router;