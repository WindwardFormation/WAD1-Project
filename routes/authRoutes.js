const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth-middleware');

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/profile', requireAuth, authController.getProfile);
router.get('/profile/edit', requireAuth, authController.editProfile);
router.post('/profile', requireAuth, authController.postProfile);
router.post('/profile/delete', requireAuth, authController.deleteProfile);

router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

module.exports = router;