const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

exports.getRegister = (req, res) => {
    res.render('register', { error: null });
};

exports.postRegister = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const existingUsername = await User.findByUsername(username);
        const existingEmail = await User.findByEmail(email);

        if (existingUsername && existingEmail) {
            return res.render('register', {
                error: 'Username and email already exist. Please log in instead.'
            });
        }

        if (existingUsername) {
            return res.render('register', {
                error: 'Username already exists. Please choose another one.'
            });
        }

        if (existingEmail) {
            return res.render('register', {
                error: 'Email already exists. Please log in instead.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.createUser({ username, email, passwordHash: hashedPassword, role: role || 'customer' });
        req.session.userId = user._id;
        req.session.role = user.role;

        res.redirect('/profile'); 
    } catch (err) {
        res.render('register', { error: 'Registration failed. Please try again.' });
    }
};

exports.getLogin = (req, res) => {
    res.render('login', { error: null });
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findByUsername(username);

        // Username does not exist
        if (!user) {
            return res.render('login', {
                error: 'Username does not exist'
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        // Password wrong
        if (!isMatch) {
            return res.render('login', {
                error: 'Incorrect password'
            });
        }

        // Login success
        req.session.userId = user._id;
        req.session.role = user.role;

        return req.session.save(() => {
            if (user.role === 'vendor') {
                return res.redirect('/vendor/dashboard');
            }
            return res.redirect('/products');
        });

    } catch (err) {
        console.error(err);
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
        console.log('session:', req.session);
        console.log('userId:', req.session.userId);
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('profile', { user, error: null, session: req.session });
    } catch (err) {
        res.redirect('/login');
    }
};

exports.editProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.redirect('/login');
        }

        const showDelete = req.query.delete === 'true';

        res.render('editProfile', {
            user,
            error: null,
            session: req.session,
            showDelete
        });
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
        res.render('editProfile', { user, error: 'Update failed', session: req.session });
    }
};
exports.deleteProfile = async (req, res) => {
    const { confirmPassword } = req.body;

    try {
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(confirmPassword, user.passwordHash);

        if (!isMatch) {
            return res.render('editProfile', {
                user,
                error: 'Incorrect password. Account was not deleted.',
                session: req.session
            });
        }

        const deletedUser = await User.deleteUserById(req.session.userId);
        console.log('Deleted user:', deletedUser);
        const checkUser = await User.findById(req.session.userId);
        console.log('🔍 After delete, user exists?:', checkUser);

        req.session.destroy((err) => {
            if (err) {
                return res.redirect('/profile');
            }
            res.redirect('/register');
        });
    } catch (err) {
        console.error(err);

        const user = await User.findById(req.session.userId);

        res.render('editProfile', {
            user,
            error: 'Failed to delete account.',
            session: req.session
        });
    }
};

exports.getForgotPassword = (req, res) => {
    res.render('forgotPassword', { error: null, success: null });
};

exports.postForgotPassword = async (req, res) => {
    const { username, newPassword } = req.body;

    try {
        const user = await User.findByUsername(username);

        if (!user) {
            return res.render('forgotPassword', {
                error: 'Username does not exist',
                success: null
            });
        }
        // if user exists: hash new password, update passwordHash, show success msg
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.updateUserById(user._id, {
            passwordHash: hashedPassword
        });

        res.render('forgotPassword', {
            error: null,
            success: 'Password updated successfully. Please log in.'
        });
    } catch (err) {
        console.error(err);
        res.render('forgotPassword', {
            error: 'Failed to reset password.',
            success: null
        });
    }
};