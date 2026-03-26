function requireAuth(req, res, next) {
    if (req.session.userId) return next();
    res.redirect('/login');
}

function requireVendor(req, res, next) {
    if (req.session.role === 'vendor') return next();
    res.status(403).send('Access denied');
}

module.exports = {
    requireAuth,
    requireVendor
};