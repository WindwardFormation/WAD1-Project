const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

exports.getRegister = (req, res) => {
    res.render('register', { error: null });
};

exports.postRegister = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.createUser({ username, email, passwordHash: hashedPassword, role: role || 'customer' });
        req.session.userId = user._id;
        req.session.role = user.role;
        res.redirect('/products');
    } catch (err) {
        res.render('register', { error: 'Registration failed. Username or email may already exist.' });
    }
};

exports.getLogin = (req, res) => {
    res.render('login', { error: null });
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findByUsername(username);
        if (user && await bcrypt.compare(password, user.passwordHash)) {
            req.session.userId = user._id;
            req.session.role = user.role;
            if (user.role === 'vendor') {
                return res.redirect('/vendor/dashboard');
            }
            return res.redirect('/products');
        }
        res.render('login', { error: 'Invalid credentials' });
    } catch (err) {
        res.render('login', { error: 'Login failed' });
    }
};

exports.postLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        res.render('profile', { user, error: null, session: req.session });
    } catch (err) {
        res.redirect('/login');
    }
};

exports.postProfile = async (req, res) => {
    const { username, email } = req.body;
    try {
        await User.updateUserById(req.session.userId, { username, email });
        res.redirect('/profile');
    } catch (err) {
        const user = await User.findById(req.session.userId);
        res.render('profile', { user, error: 'Update failed', session: req.session });
    }
};