const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// export to orderRoute
exports.placeOrder = async (req, res) => {
    // get user cart
    const cartItems = await Cart.getCartItemsByUserId(req.session.userId);

    // if nothing in cart, redirect to /cart route
    if (!cartItems.length) {
        return res.redirect("/cart");
    }

    const items = cartItems.map((item) => ({
        // only gets the attributes needed
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
    }));

    // loops through items and calculates total price
    let totalPrice = 0;
    items.forEach(async (item) => {
        totalPrice += item.price * item.quantity;
        await Product.reduceStock(item.productId, item.quantity);
    });

    await Order.createOrder({
        userId: req.session.userId,
        items,
        totalPrice,
    });

    await Cart.clearCart(req.session.userId);

    res.redirect("/orders");
};

// get orders page (read)
exports.getOrdersPage = async (req, res) => {
    const orders = await Order.getOrdersByUserId(req.session.userId);
    res.render("orders", { orders });
};

// cancel order (update)
exports.cancelOrder = async (req, res) => {
    try {
        const update = await Order.updateOrderStatus(req.params.id, "Cancelled");
        const order = await Order.getOrderByOrderId(req.params.id);
        let items = order.items;
        items.forEach(async item =>{
            await Product.restoreStock(item.productId, item.quantity);
        })
    } catch (error) {
        console.log(error);
        return res.send(error);
    } finally {
        res.redirect('/orders');
    }};


// complete order (update)
exports.completeOrder = async (req, res) => {
    try {
        const order = await Order.updateOrderStatus(req.params.id, "Completed");
    } catch (error) {
        console.log(error);
        return res.send(error);
    } finally {
        res.redirect('/orders');
    }};
