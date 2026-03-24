const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

exports.getReviewPage = async (req, res) => {
    try {
        const tab = req.query.tab || 'toreview';

        const orders = await Order.findOrdersByUserId(req.session.userId);
        const reviews = await Review.findReviewsByUser(req.session.userId);

        const toReviewItems = [];
        const historyItems = [];

        for (const order of orders) {
            if (order.status !== 'Completed') {
                continue;
            }

            for (const item of order.items) {
                const product = await Product.findById(item.productId._id)
                    .populate('vendorId', 'username');

                const existingReview = reviews.find(review =>
                    review.orderId.toString() === order._id.toString() &&
                    review.productId.toString() === product._id.toString()
                );

                if (existingReview) {
                    const date = new Date(existingReview.createdAt);
                    const day = date.getDate();
                    const year = date.getFullYear();
                    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                    const month = months[date.getMonth()];

                    historyItems.push({
                        vendorName: product.vendorId.username,
                        productName: product.name,
                        rating: existingReview.rating,
                        comment: existingReview.comment,
                        formatDate: day + " " + month + " " + year
                    });
                } else {
                    toReviewItems.push({
                        orderId: order._id,
                        productId: product._id,
                        vendorName: product.vendorId.username,
                        productName: product.name,
                        quantity: item.quantity,
                        price: item.price
                    });
                }
            }
        }

        res.render('reviews', {
            tab: tab,
            toReviewItems: toReviewItems,
            historyItems: historyItems
        });

    } catch (error) {
        console.error(error);
        res.send('Error loading review page');
    }
};

// POST /reviews/add
exports.addReview = async (req, res) =>  {
    const productId = req.body.productId;
    
    try {
        const rating = req.body.rating;
        const comment = req.body.comment;
        
        // Find all completed orders by this user that contain this product
        const completedOrders = await Order.findCompletedOrdersByUserAndProduct(
            req.session.userId,
            productId
        );

        if (completedOrders.length === 0) {
            console.log('User has no completed order for this product');
            return res.redirect(`/products/${productId}?message=notallowed`);
        }

        // Find all reviews already written by this user for this product
        const existingReviews = await Review.findReviewsByUserAndProduct(
            req.session.userId,
            productId
        );

        // Get orderIds already used for review
        const reviewedOrderIds = existingReviews.map(review => review.orderId.toString());

        // Find a completed order that has not yet been used for a review
        const availableOrder = completedOrders.find(order =>
            !reviewedOrderIds.includes(order._id.toString())
        );

        if (!availableOrder) {
            console.log('No available completed order left for review');
            return res.redirect(`/products/${productId}?message=already_reviewed`);
        }

        //create review and store in db
        const review = {
            userId: req.session.userId,
            productId: productId,
            orderId: availableOrder._id,
            rating: parseInt(rating),
            comment: comment
        };

        await Review.addReview(review); 
        res.redirect(`/products/${productId}?message=created`);

    } catch (error) {
        console.error(error);
        return res.redirect(`/products/${productId}?message=error`);
    }
};

// POST /reviews/update/:id
exports.updateReview = async (req, res) => {
    try {
        const rating = req.body.rating;
        const comment = req.body.comment;

        const review = await Review.updateReview(
            req.params.id,
            req.session.userId,
            {
                rating: parseInt(rating),
                comment: comment
            }
        );

        if (!review) {
            console.log('Review not found');
            return res.redirect('/products');
        }

        res.redirect(`/products/${review.productId}?message=updated`);
   
    } catch (error) {
        console.error(error);
        return res.redirect('/products');
    }
};

// POST /reviews/delete/:id
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findReviewByIdAndUser(
            req.params.id,
            req.session.userId
        );

        if (!review) {
            console.log('Review not found');
            return res.redirect('/products');
        }

        const productId = review.productId;
        await Review.deleteReview(
            req.params.id,
            req.session.userId
        );

        res.redirect(`/products/${productId}?message=deleted`);
    } catch (error) {
        console.error(error);
        return res.redirect('/products');
    }
};
