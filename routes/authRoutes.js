const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth-middleware');

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

// GET /login
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

//test

// POST /login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.passwordHash)) {
            req.session.userId = user._id;
            req.session.role = user.role;
            res.redirect('/products');
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    } catch (err) {
        res.render('login', { error: 'Login failed' });
    }
});

// POST /logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// GET /profile
router.get('/profile', requireAuth, async (req, res) => {
    const user = await User.findById(req.session.userId);
    res.render('profile', { user, error: null, session: req.session });
});

// POST /profile
router.post('/profile', requireAuth, async (req, res) => {
    const { username, email } = req.body;
    try {
        await User.findByIdAndUpdate(req.session.userId, { username, email });
        res.redirect('/profile');
    } catch (err) {
        const user = await User.findById(req.session.userId);
        res.render('profile', { user, error: 'Update failed', session: req.session });
    }
});

module.exports = router;