const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const Cart = require('./models/cartModel');
const Order = require('./models/orderModel');
const Review = require('./models/reviewModel');
require('dotenv').config();

async function seedDB() {
    try {
        await mongoose.connect(process.env.DB);
        console.log('Connected to DB');

        // Create dummy users
        const hashedPassword = await bcrypt.hash('password', 10);
        const users = await User.insertMany([
            { username: 'vendor1', email: 'vendor1@example.com', passwordHash: hashedPassword, role: 'vendor' },
            { username: 'vendor2', email: 'vendor2@example.com', passwordHash: hashedPassword, role: 'vendor' },
            { username: 'customer1', email: 'customer1@example.com', passwordHash: hashedPassword, role: 'customer' },
            { username: 'customer2', email: 'customer2@example.com', passwordHash: hashedPassword, role: 'customer' }
        ]);
        console.log('Users created');

        // Create products
        const products = await Product.insertMany([
            { name: 'Laptop', description: 'A powerful laptop for work and gaming', price: 999.99, category: 'Electronics', stock: 10, vendorId: users[0]._id },
            { name: 'Book', description: 'An inspiring novel', price: 19.99, category: 'Books', stock: 50, vendorId: users[1]._id },
            { name: 'Shoes', description: 'Comfortable running shoes', price: 79.99, category: 'Fashion', stock: 20, vendorId: users[0]._id },
            { name: 'Phone', description: 'Latest smartphone with advanced features', price: 699.99, category: 'Electronics', stock: 15, vendorId: users[1]._id },
            { name: 'Headphones', description: 'Noise-cancelling wireless headphones', price: 149.99, category: 'Electronics', stock: 25, vendorId: users[0]._id },
            { name: 'T-shirt', description: 'Cotton t-shirt', price: 14.99, category: 'Fashion', stock: 100, vendorId: users[1]._id }
        ]);
        console.log('Products created');

        // Create cart items
        const carts = await Cart.insertMany([
            { userId: users[2]._id, productId: products[0]._id, quantity: 1 },
            { userId: users[2]._id, productId: products[1]._id, quantity: 2 },
            { userId: users[3]._id, productId: products[2]._id, quantity: 1 },
            { userId: users[2]._id, productId: products[4]._id, quantity: 1 }
        ]);
        console.log('Cart items created');

        // Create orders
        const orders = await Order.insertMany([
            { userId: users[2]._id, items: [{ productId: products[0]._id, quantity: 1, price: 999.99 }], totalPrice: 999.99, status: 'Completed' },
            { userId: users[3]._id, items: [{ productId: products[1]._id, quantity: 1, price: 19.99 }, { productId: products[2]._id, quantity: 1, price: 79.99 }], totalPrice: 99.98, status: 'Pending' },
            { userId: users[2]._id, items: [{ productId: products[3]._id, quantity: 1, price: 699.99 }], totalPrice: 699.99, status: 'Completed' }
        ]);
        console.log('Orders created');

        // Create reviews
        const reviews = await Review.insertMany([
            { userId: users[2]._id, productId: products[0]._id, rating: 5, comment: 'Excellent laptop, very fast and reliable!' },
            { userId: users[3]._id, productId: products[1]._id, rating: 4, comment: 'Good book, enjoyed reading it.' },
            { userId: users[2]._id, productId: products[2]._id, rating: 4, comment: 'Comfortable shoes, good for running.' },
            { userId: users[3]._id, productId: products[3]._id, rating: 5, comment: 'Amazing phone, camera is superb.' },
            { userId: users[2]._id, productId: products[4]._id, rating: 3, comment: 'Good sound quality, but battery life could be better.' }
        ]);
        console.log('Reviews created');

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedDB();