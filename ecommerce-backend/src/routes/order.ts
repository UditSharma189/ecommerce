import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { newOrder } from "../controllers/order.js";

const app = express();

// /api/v1/user/new
app.post("/new", newOrder);

export default app;
