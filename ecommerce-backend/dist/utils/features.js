import mongoose from "mongoose";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";
export const connectDB = (uri) => {
    mongoose
        .connect(uri, {
        dbName: "Ecommerce_24",
    })
        .then((c) => console.log(`DB connected to ${c.connection.host}`))
        .catch((e) => console.log(e));
};
export const invalidateCache = async ({ product, order, admin, userId, orderId, productId, }) => {
    if (product) {
        const productKeys = [
            "latest-products",
            "category",
            "all-products",
        ];
        if (typeof productId === "string")
            productKeys.push(`product-${productId}`);
        if (typeof productId === "object")
            productId.forEach((i) => productKeys.push(`product-${i}`));
        myCache.del(productKeys);
    }
    if (order) {
        const orderKeys = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`,
        ];
        myCache.del(orderKeys);
    }
    if (admin) {
    }
};
// export const reduceStock = async (orderItems: OrderItemType[]) => {
//   // orderItems.forEach(async (order) => {
//   //   const product = await Product.findById(order.quantity);
//   //   if (!product) throw new Error("Producty not found ");
//   //   product.stock -= order.quantity;
//   //   await product.save();
//   // });
//   for (let i = 0; i < orderItems.length; i++) {
//     const order = orderItems[i];
//     const product = await Product.findById(order.productId);
//     if (!product) throw new Error("Producty not found ");
//     product.stock -= order.quantity;
//     await product.save();
//   }
// };
export const reduceStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product)
            throw new Error("Product Not Found");
        product.stock -= order.quantity;
        await product.save();
    }
};
