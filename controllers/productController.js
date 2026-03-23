const productModel = require('../models/productModel');
const Review = require('../models/reviewModel');

// GET /products
exports.getAllProducts = async (req, res) => {
    try {
        if (req.session.userId && req.session.role === 'vendor') {
            return res.redirect('/products/dashboard');
        }

        const { category, search } = req.query;
        const query = {};

        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };

        const products = await productModel.getAllProducts(query);

        res.render('products', {products,category,search,session: req.session});
    } catch (error) {
        res.send('Failed to load products');
    }
}


exports.getVendorDashboard = async (req, res) => {
    try {
        const { category, search } = req.query;
        const query = { vendorId: req.session.userId };

        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };

        const products = await productModel.getVendorProducts(query);

        res.render('vendorDashboard', {products,category,search,session: req.session,success: null});
    } catch (error) {
        res.send('Failed to load dashboard');
    }
}


// GET /vendor/add
exports.getAddProduct = async (req, res) => {
    res.render('addProduct', {errors: {},old: {},session: req.session});
}

// POST /products/add
exports.postAddProduct = async (req, res) => {
    let { name, description, price, category, stock } = req.body;

    // Trim
    name = name?.trim();
    description = description?.trim();
    category = category?.trim();

    let errors = {};

    // Name
    if (!name) {
        errors.name = 'Name is required';
    }

    // Description
    if (!description) {
        errors.description = 'Description is required';
    }

    // Price (float with 2dp)
    if (!price) {
        errors.price = 'Price is required';
    } else if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        errors.price = 'Price must be a number with up to 2 decimal places';
    }

    // category
    const validCategories = ['Electronics', 'Fashion', 'Home & Living', 'Books'];

    if (!category) {
        errors.category = 'Category is required';
    } else if (!validCategories.includes(category)) {
        errors.category = 'Invalid category selected';
    }
   

    // Stock (positive whole number)
    if (!stock) {
        errors.stock = 'Stock is required';
    } else if (!/^\d+$/.test(stock) || parseInt(stock) < 0) {
        errors.stock = 'Stock must be a positive whole number';
    }

    // If got errors → return with old input
    if (Object.keys(errors).length > 0) {
        return res.render('addProduct', {errors, old: { name, description, price, category, stock },session: req.session});
    }

    try {
        await productModel.createProduct({
            name,
            description,
            price: parseFloat(price),
            category,
            stock: parseInt(stock),
            vendorId: req.session.userId
        });

        const products = await productModel.getVendorProducts({vendorId: req.session.userId});

        res.render('vendorDashboard', {
            products,
            category: '',
            search: '',
            session: req.session,
            success: `${name} added successfully!`
        });
    } catch (error) {
        res.render('addProduct', {
            errors: { general: 'Failed to add product' },
            old: { name, description, price, category, stock },
            session: req.session
            });
}};

// GET /vendor/edit/:id
exports.getEditProduct = async (req, res) => {
    try {
        const product = await productModel.getProductById(req.params.id);

        if (product.vendorId.toString() !== req.session.userId) {
            return res.status(403).send('Access denied');
        }

        res.render('editProduct', {product,errors: {},old: {},session: req.session});
    } catch (error) {
        res.send('Failed to load product');
    }
}

exports.postEditProduct = async (req, res) => {
    let { name, description, price, category, stock } = req.body;

    name = name?.trim();
    description = description?.trim();
    category = category?.trim();

    const validCategories = ['Electronics', 'Fashion', 'Home & Living', 'Books'];

    let errors = {};

    // Name
    if (!name) errors.name = 'Name is required';

    // Description
    if (!description) errors.description = 'Description is required';

    // Price
    if (!price) {
        errors.price = 'Price is required';
    } else if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        errors.price = 'Price must be up to 2 decimal places';
    }

    // Category
    if (!category) {
        errors.category = 'Category is required';
    } else if (!validCategories.includes(category)) {
        errors.category = 'Invalid category';
    }

    // Stock
    if (!stock) {
        errors.stock = 'Stock is required';
    } else if (!/^\d+$/.test(stock) || parseInt(stock) < 0) {
        errors.stock = 'Stock must be a positive whole number';
    }

    // If errors → re-render with old data
    if (Object.keys(errors).length > 0) {
        return res.render('editProduct', {
            errors,
            old: { name, description, price, category, stock },
            product: { _id: req.params.id }, 
            session: req.session
        });
    }

    try {
        // Check if there are no changes
        const product = await productModel.getProductById(req.params.id);
        const priceNum = parseFloat(price).toFixed(2);
        const stockNum = parseInt(stock);
        if (
            product.name === name &&
            product.description === description &&
            product.price.toFixed(2) === priceNum &&
            product.category === category &&
            product.stock === stockNum
        ) {
            return res.render('editProduct', { 
            errors: { general: 'No changes detected' },
            old: { name, description, price, category, stock },
            product,
            session: req.session
            });
        }

        await productModel.updateProductById(req.params.id, {
            name,
            description,
            price: parseFloat(price),
            category,
            stock: parseInt(stock)
        });


        const products = await productModel.getVendorProducts({ vendorId: req.session.userId });
        res.render('vendorDashboard', {
            products,
            category: '',
            search: '',
            session: req.session,
            success: `${name} updated successfully!`
        });

    } catch (error) {
        res.render('editProduct', {
            errors: { general: 'Failed to update product' },
            old: { name, description, price, category, stock },
            product: { _id: req.params.id },
            session: req.session
        });
    }
};

// POST /vendor/delete/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await productModel.getProductById(req.params.id);

        if (product.vendorId.toString() !== req.session.userId) {
            return res.status(403).send('Access denied');
        }
        await productModel.deleteProductById(req.params.id);
        const products = await productModel.getVendorProducts({vendorId: req.session.userId});

        res.render('vendorDashboard', {
            products,
            category: '',
            search: '',
            session: req.session,
            success: `${product.name} deleted successfully!`
        });
    } catch (error) {
        res.send('Failed to delete product');
    }}


// GET /products/:id
exports.getProductDetails = async (req, res) => {
    try {
        const product = await productModel.getProductByIdWithVendor(req.params.id);
        const reviews = await Review.find({ productId: req.params.id }).populate('userId', 'username');
        res.render('productDetails', {
            product,
            reviews,
            session: req.session
        });
    } catch (error) {
        res.send('Failed to load product details');
    }
}
