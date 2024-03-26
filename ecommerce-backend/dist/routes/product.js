import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { deleteProduct, getAdminProduct, getAllProducts, getCategory, getLatestProduct, getSingleProduct, newProduct, updateProduct, } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
const app = express();
app.post("/new", adminOnly, singleUpload, newProduct);
app.get("/all", getAllProducts);
app.get("/latest", getLatestProduct);
app.get("/categories", getCategory);
app.get("/admin-products", adminOnly, getAdminProduct);
app
    .route("/:id")
    .get(getSingleProduct)
    .put(adminOnly, singleUpload, updateProduct)
    .delete(adminOnly, deleteProduct);
export default app;
