const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);


// Get all products
exports.getAllProducts = function(query = {}) {
    return Product.find(query).populate('vendorId', 'username');
};

// Get vendor products
exports.getVendorProducts = function(query = {}) {
    return Product.find(query);
};

// Get product by ID
exports.getProductById = function(productId) {
    return Product.findById(productId);
};

// Get product by ID with vendor
exports.getProductByIdWithVendor = function(productId) {
    return Product.findById(productId).populate('vendorId', 'username');
};

// Create product
exports.createProduct = function(productData) {
    return Product.create(productData);
};

// Update product
exports.updateProductById = function(productId, updatedData) {
    return Product.updateOne(
        { _id: productId },
        updatedData
    );
};

// Delete product
exports.deleteProductById = function(productId) {
    return Product.deleteOne({ _id: productId });
};

// Find the stocks left for a particular item
exports.findStocks = async function(productId) {
    const product = await Product.findOne({ _id: productId });
    const stock = product.stock;
    return stock;
};