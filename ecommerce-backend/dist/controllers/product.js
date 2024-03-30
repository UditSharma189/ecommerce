import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";
//Cache revalidated on NEW, UPDATE, DELETE and NEW ORDER
export const getLatestProduct = TryCatch(async (req, res, next) => {
    let products = [];
    if (myCache.has("latest-product"))
        products = JSON.parse(myCache.get("latest-product"));
    else {
        products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
        myCache.set("latest-product", JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products,
    });
});
//Cache revalidated on NEW, UPDATE, DELETE and NEW ORDER
export const getCategory = TryCatch(async (req, res, next) => {
    let category;
    if (myCache.has("category"))
        category = JSON.parse(myCache.get("category"));
    else {
        category = await Product.distinct("category");
        myCache.set("category", JSON.stringify(category));
    }
    return res.status(200).json({
        success: true,
        category,
    });
});
export const getAdminProduct = TryCatch(async (req, res, next) => {
    let products;
    if (myCache.has("all-products"))
        products = JSON.parse(myCache.get("all-products"));
    else {
        products = await Product.find({});
        myCache.set("all-products", JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products,
    });
});
export const getSingleProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    let product;
    if (myCache.has(`product-${id}`))
        product = JSON.parse(myCache.get(`product-${id}`));
    else {
        product = await Product.findById(id);
        if (!product)
            return next(new ErrorHandler("Product not found", 404));
    }
    return res.status(200).json({
        success: true,
        product,
    });
});
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, category, price, stock } = req.body;
    const photo = req.file;
    if (!photo)
        return next(new ErrorHandler("Please add photo", 400));
    if (!name || !category || !price || !stock) {
        rm(photo.path, () => {
            console.log("Deleted");
        });
        return next(new ErrorHandler("Please enter all fields", 400));
    }
    await Product.create({
        name,
        price,
        stock,
        category: category.toLowerCase(),
        photo: photo?.path,
    });
    await invalidateCache({ product: true });
    return res.status(201).json({
        success: true,
        message: `Product created succesfully`,
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const { name, category, price, stock } = req.body;
    const photo = req.file;
    const product = await Product.findById(id);
    if (!product)
        return next(new ErrorHandler("Invalid product id", 404));
    //   if (!photo) return next(new ErrorHandler("Please add photo", 400));
    if (photo) {
        rm(product.photo, () => {
            console.log("Deleted");
        });
        product.photo = photo.path;
    }
    if (name)
        product.name = name;
    if (category)
        product.category = category;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    await product.save();
    await invalidateCache({ product: true, productId: String(product._id) });
    return res.status(200).json({
        success: true,
        message: `Product updated succesfully`,
    });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product)
        return next(new ErrorHandler("Product not found", 404));
    rm(product.photo, () => {
        console.log("Product photo deleted");
    });
    await product?.deleteOne();
    await invalidateCache({ product: true, productId: String(product._id) });
    return res.status(200).json({
        success: true,
        message: "Product deleted succesfully",
    });
});
export const getAllProducts = TryCatch(async (req, res, next) => {
    const { search, price, category, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    const baseQuery = {};
    if (search) {
        baseQuery.name = {
            $regex: search,
            $options: "i",
        };
    }
    if (price) {
        baseQuery.price = { $lte: Number(price) };
    }
    if (category) {
        baseQuery.category = category;
    }
    const productPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);
    // We are using promise here because of 2 awaits parallerly one for products and another for filterProducts was not good.
    const [products, filteredOnlyProducts] = await Promise.all([
        productPromise,
        Product.find(baseQuery),
    ]);
    // const filteredOnlyProducts = await Product.find(baseQuery);
    const totalPage = Math.ceil(filteredOnlyProducts.length / limit);
    return res.status(200).json({
        success: true,
        products,
        totalPage,
    });
});
