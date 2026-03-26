const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const server = express();

// Connect to MongoDB
async function connectDB() {
  try {
    // connecting to Database with our config.env file and DB is constant in config.env
    await mongoose.connect(process.env.DB);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Middleware
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.set('view engine', 'ejs');
server.use(express.static('public'));

// Session
server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

server.use('/', authRoutes);
server.use('/products', productRoutes);
server.use('/vendor', productRoutes);
server.use('/cart', cartRoutes);
server.use('/orders', orderRoutes);
server.use('/reviews', reviewRoutes);
server.use('/wishlist', wishlistRoutes);

// Home route
server.get('/', (req, res) => {
    res.redirect('/products');
});

function startServer() {
  const hostname = "localhost"; // Define server hostname
  const port = process.env.PORT || 8000;// Define port number
 
  // Start the server and listen on the specified hostname and port
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

// call connectDB first and when connection is ready we start the web server
connectDB().then(startServer);