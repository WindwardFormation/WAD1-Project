const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// POST /reviews/add
exports.addReview = async (req, res) =>  {
    const productId = req.body.productId;
    const rating = parseInt(req.body.rating);
    const comment = req.body.comment ? req.body.comment.trim() : '';

    if (isNaN(rating) || rating<1 ||rating>5) {
        return res.redirect(`/products/${productId}?message=invalid_rating`);
    }
    if (!comment) {
        return res.redirect(`/products/${productId}?message=empty_comment`);
    }

    try {
        let completedOrders = await Order.getCompletedOrdersByUserAndProduct(req.session.userId, productId);
        let existingReviews = await Review.getReviewsByUserAndProduct(req.session.userId, productId);

        let availableOrder = null;

        for (let i = 0; i < completedOrders.length; i++) {
            let order = completedOrders[i];
            let alreadyReviewed = false;

            // Check if this order already has a review
            for (let j = 0; j < existingReviews.length; j++) {
                let review = existingReviews[j];
                if (review.orderId.toString() === order._id.toString()) {
                    alreadyReviewed = true;
                }
            }
            // pass order into availableOrder
            if (alreadyReviewed === false && availableOrder === null) {
                availableOrder = order;
            }
        }

        // check if user has a completed order
        if (completedOrders.length === 0) {
            console.log('User has no completed order for this product');
            return res.redirect(`/products/${productId}?message=not_allowed`);
        }

        if (!availableOrder) {
            console.log('No available completed order left for review');
            return res.redirect(`/products/${productId}?message=already_reviewed`);
        }

        let newReview = {
            userId: req.session.userId,
            productId: productId,
            orderId: availableOrder._id,
            rating: parseInt(rating),
            comment: comment
        };

        await Review.createReview(newReview); 

        res.redirect(`/products/${productId}?message=created`);

    } catch (error) {
        console.error(error);
        return res.redirect(`/products/${productId}?message=error`);
    }
};

// POST /reviews/update/:id
exports.updateReview = async (req, res) => {
    const productId = req.body.productId;
    const reviewId = req.params.id;
    const rating = parseInt(req.body.rating);
    const comment = req.body.comment ? req.body.comment.trim() : '';

    try {
        const existingReview = await Review.getReviewByIdAndUser(
            req.params.id,
            req.session.userId
        );

        if (!existingReview) {
            console.log('Review not found');
            return res.redirect('/products');
        }

        if (isNaN(rating) || rating<1 ||rating>5) {
        return res.redirect(`/products/${productId}?message=invalid_rating`);
        }
        if (!comment) {
            return res.redirect(`/products/${productId}?message=empty_comment`);
        }
        // if no changes
        if (existingReview.rating === rating && existingReview.comment === comment){
            return res.redirect(`/products/${existingReview.productId}?message=no_changes`);
        }


        let updatedReview = {
            rating: parseInt(rating),
            comment: comment
        };
        const result = await Review.updateReview(
            reviewId,
            req.session.userId,
            updatedReview
        );

        res.redirect(`/products/${result.productId}?message=updated`);
   
    } catch (error) {
        console.error(error);
        return res.redirect('/products');
    }
};

// POST /reviews/delete/:id
exports.deleteReview = async (req, res) => {
    const reviewId = req.params.id;
    try {
        const existingReview = await Review.getReviewByIdAndUser(
            reviewId,
            req.session.userId
        );

        if (!existingReview) {
            console.log('Review not found');
            return res.redirect('/products');
        }

        const productId = existingReview.productId;

        await Review.deleteReview(
            reviewId,
            req.session.userId
        );

        return res.redirect(`/products/${productId}?message=deleted`);
        
    } catch (error) {
        console.error(error);
        return res.redirect('/products');
    }
};

// reviews tab
exports.getReviewPage = async (req, res) => {
    const tab = req.query.tab || 'toreview';
        
    try {
        const orders = await Order.getOrdersByUserId(req.session.userId);
        const reviews = await Review.getReviewsByUser(req.session.userId);

        const toReviewItems = [];
        const historyItems = [];

        const reviewLookup = {};

        for (let i = 0; i < reviews.length; i++) {
            const review = reviews[i];
            const key = review.orderId.toString() + '_' + review.productId.toString();
            reviewLookup[key] = review;
        }

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];

            if (!order || order.status !== 'Completed') {
                continue;
            }

            for (let j = 0; j < order.items.length; j++) {
                const item = order.items[j];

                if (!item || !item.productId) {
                    continue;
                }

                const product = item.productId;

                if (!product || !product.vendorId) {
                    continue;
                }

                const key = order._id.toString() + '_' + product._id.toString();
                const existingReview = reviewLookup[key];

                if (existingReview) {
                    historyItems.push({
                        productId: product._id,
                        vendorName: product.vendorId.username,
                        productName: product.name,
                        rating: existingReview.rating,
                        comment: existingReview.comment,
                        createdAt: existingReview.createdAt
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

        res.render('reviews', { tab, toReviewItems, historyItems, session: req.session });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading review page');
    }
};
