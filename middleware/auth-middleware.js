function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

function requireVendor(req, res, next) {
    if (req.session.role === 'vendor') return next();
    res.status(403).send('Access denied');
}

module.exports = {
    requireAuth,
    requireVendor
};