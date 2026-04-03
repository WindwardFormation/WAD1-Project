const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('./models/userModel');
require('./models/productModel');
require('./models/cartModel');
require('./models/wishlistModel');
require('./models/reviewModel');
require('./models/orderModel');

const User = mongoose.model('User');
const Product = mongoose.model('Product');
const Cart = mongoose.model('Cart');
const Wishlist = mongoose.model('Wishlist');
const Review = mongoose.model('Review');
const Order = mongoose.model('Order');

require('dotenv').config();

async function seedDB() {
    try {
        await mongoose.connect(process.env.DB);
        console.log('Connected to DB');

        // Clear existing collections to avoid duplicates when seeding repeatedly
        await User.deleteMany({});
        await Product.deleteMany({});
        await Cart.deleteMany({});
        await Wishlist.deleteMany({});
        await Review.deleteMany({});
        await Order.deleteMany({});

        // Hash a password for all sample users
        const hashedPassword = await bcrypt.hash('password', 10);

        // Create dummy users with all available fields in userModel
        const users = await User.insertMany([
            {
                username: 'vendor1',
                email: 'vendor1@example.com',
                passwordHash: hashedPassword,
                role: 'vendor',
                shippingAddress: '123 Vendor St, VendorCity',
                region: 'West'
            },
            {
                username: 'vendor2',
                email: 'vendor2@example.com',
                passwordHash: hashedPassword,
                role: 'vendor',
                shippingAddress: '456 Vendor Ave, VendorTown',
                region: 'East'
            },
            {
                username: 'customer1',
                email: 'customer1@example.com',
                passwordHash: hashedPassword,
                role: 'customer',
                shippingAddress: '789 Customer Rd, CustomerCity',
                region: 'North'
            },
            {
                username: 'customer2',
                email: 'customer2@example.com',
                passwordHash: hashedPassword,
                role: 'customer',
                shippingAddress: '321 Customer Ln, CustomerTown',
                region: 'South'
            }
        ]);
        console.log('Users created');

        // Create dummy products with vendor relations
        const products = await Product.insertMany([
            {
                name: 'Laptop',
                description: 'A powerful laptop for work and gaming',
                price: 999.99,
                category: 'Electronics',
                stock: 10,
                vendorId: users[0]._id
            },
            {
                name: 'Book',
                description: 'An inspiring novel',
                price: 19.99,
                category: 'Books',
                stock: 50,
                vendorId: users[1]._id
            },
            {
                name: 'Shoes',
                description: 'Comfortable running shoes',
                price: 79.99,
                category: 'Fashion',
                stock: 20,
                vendorId: users[0]._id
            },
            {
                name: 'Phone',
                description: 'Latest smartphone with advanced features',
                price: 699.99,
                category: 'Electronics',
                stock: 15,
                vendorId: users[1]._id
            },
            {
                name: 'Headphones',
                description: 'Noise-cancelling wireless headphones',
                price: 149.99,
                category: 'Electronics',
                stock: 25,
                vendorId: users[0]._id
            },
            {
                name: 'T-shirt',
                description: 'Cotton t-shirt',
                price: 14.99,
                category: 'Fashion',
                stock: 100,
                vendorId: users[1]._id
            }
        ]);
        console.log('Products created');

        // Create cart items for customers (userId+productId+quantity)
        await Cart.insertMany([
            { userId: users[2]._id, productId: products[0]._id, quantity: 1 },
            { userId: users[2]._id, productId: products[1]._id, quantity: 2 },
            { userId: users[3]._id, productId: products[2]._id, quantity: 1 },
            { userId: users[2]._id, productId: products[4]._id, quantity: 1 }
        ]);
        console.log('Cart items created');

        // Create wishlist items for customers
        await Wishlist.insertMany([
            { userId: users[2]._id, productId: products[2]._id },
            { userId: users[2]._id, productId: products[3]._id },
            { userId: users[3]._id, productId: products[0]._id }
        ]);
        console.log('Wishlist items created');

        // Create orders including all required fields
        const orders = await Order.insertMany([
            {
                userId: users[2]._id,
                items: [{ productId: products[0]._id, quantity: 1, price: products[0].price }],
                totalPrice: products[0].price * 1,
                status: 'Completed',
                orderDate: new Date()
            },
            {
                userId: users[3]._id,
                items: [
                    { productId: products[1]._id, quantity: 1, price: products[1].price },
                    { productId: products[2]._id, quantity: 1, price: products[2].price }
                ],
                totalPrice: products[1].price + products[2].price,
                status: 'Pending',
                orderDate: new Date()
            },
            {
                userId: users[2]._id,
                items: [{ productId: products[3]._id, quantity: 1, price: products[3].price }],
                totalPrice: products[3].price,
                status: 'Completed',
                orderDate: new Date()
            }
        ]);
        console.log('Orders created');

        // Create reviews (orderId is required in reviewModel)
        await Review.insertMany([
            {
                userId: users[2]._id,
                productId: products[0]._id,
                orderId: orders[0]._id,
                rating: 5,
                comment: 'Excellent laptop, very fast and reliable!',
                username: users[2].username
            },
            {
                userId: users[3]._id,
                productId: products[1]._id,
                orderId: orders[1]._id,
                rating: 4,
                comment: 'Good book, enjoyed reading it.',
                username: users[3].username
            },
            {
                userId: users[2]._id,
                productId: products[2]._id,
                orderId: orders[1]._id,
                rating: 4,
                comment: 'Comfortable shoes, good for running.',
                username: users[2].username
            },
            {
                userId: users[3]._id,
                productId: products[3]._id,
                orderId: orders[2]._id,
                rating: 5,
                comment: 'Amazing phone, camera is superb.',
                username: users[3].username
            },
            {
                userId: users[2]._id,
                productId: products[4]._id,
                orderId: orders[0]._id,
                rating: 3,
                comment: 'Good sound quality, but battery life could be better.',
                username: users[2].username
            }
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