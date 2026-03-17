const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const router = express.Router();

// Middleware to check if logged in
function requireAuth(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// GET /register
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// POST /register
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, passwordHash: hashedPassword, role: role || 'customer' });
        await user.save();
        req.session.userId = user._id;
        req.session.role = user.role;
        res.redirect('/products');
    } catch (err) {
        res.render('register', { error: 'Registration failed. Username or email may already exist.' });
    }
});

// GET /login
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

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