import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";
export const myOrder = TryCatch(async (req, res, next) => {
    const { id: user } = req.query;
    let orders = [];
    // invalidateCache({ product: true, order: true, admin: true });
    if (myCache.has(`my-orders-${user}`))
        JSON.parse(myCache.get(`my-orders-${user}`));
    else {
        orders = await Order.find({ user });
        myCache.set(`my-orders-${user}`, JSON.stringify(orders));
    }
    return res.status(200).json({
        success: true,
        orders,
    });
});
export const allOrder = TryCatch(async (req, res, next) => {
    let orders = [];
    // invalidateCache({ product: true, order: true, admin: true });
    if (myCache.has(`all-orders`))
        JSON.parse(myCache.get(`all-orders`));
    else {
        orders = await Order.find().populate("user", "name");
        myCache.set(`all-orders`, JSON.stringify(orders));
    }
    return res.status(200).json({
        success: true,
        orders,
    });
});
export const getSingleOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    let order;
    const key = `order-${id}`;
    // invalidateCache({ product: true, order: true, admin: true });
    if (myCache.has(key))
        JSON.parse(myCache.get(key));
    else {
        order = await Order.findById(id).populate("user", "name");
        if (!order)
            return next(new ErrorHandler("Order not found", 404));
        myCache.set(key, JSON.stringify(order));
    }
    return res.status(200).json({
        success: true,
        order,
    });
});
export const newOrder = TryCatch(async (req, res, next) => {
    const { shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, total, } = req.body;
    if (!total)
        return next(new ErrorHandler("Please Enter All Fields", 400));
    const order = await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    });
    await reduceStock(orderItems);
    invalidateCache({
        product: true,
        order: true,
        admin: true,
        userId: user,
        productId: order.orderItems.map((i) => String(i.productId)),
    });
    return res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
    });
});
export const processOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order not found", 404));
    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;
        default:
            order.status = "Delivered";
            break;
    }
    await order.save();
    invalidateCache({
        product: false,
        order: true,
        admin: true,
        userId: order.user,
        orderId: String(order._id),
        // productId: order.orderItems.map((i) => String(i.productId)),
    });
    return res.status(200).json({
        success: true,
        message: "Order Processed Successfully",
    });
});
export const deleteOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("Order not found", 404));
    await order.deleteOne();
    // await order.save();
    invalidateCache({
        product: false,
        order: true,
        admin: true,
        userId: order.user,
        orderId: String(order._id),
        productId: order.orderItems.map((i) => String(i.productId)),
    });
    return res.status(200).json({
        success: true,
        message: "Order Deleted Successfully",
    });
});
