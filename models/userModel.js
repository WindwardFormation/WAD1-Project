const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'vendor'], default: 'customer' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

User.findByUsername = function (username) {
    return this.findOne({ username });
};

User.createUser = function (data) {
    return this.create(data);
};

User.updateUserById = function (userId, updates) {
    return this.findByIdAndUpdate(userId, updates, { new: true });
};

module.exports = User;