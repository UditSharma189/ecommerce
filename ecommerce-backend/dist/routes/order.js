import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { allOrder, deleteOrder, getSingleOrder, myOrder, newOrder, processOrder, } from "../controllers/order.js";
const app = express();
// /api/v1/order/new
app.post("/new", newOrder);
// /api/v1/order/my
app.get("/my", myOrder);
// /api/v1/order/all/
app.get("/all", adminOnly, allOrder);
// /api/v1/order/:id
app
    .route("/:id")
    .get(getSingleOrder)
    .put(adminOnly, processOrder)
    .delete(adminOnly, deleteOrder);
export default app;
