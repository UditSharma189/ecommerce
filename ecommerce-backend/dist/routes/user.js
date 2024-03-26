import express from "express";
import { deleteUser, getAllUsers, getUser, newUser, } from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";
const app = express();
// /api/v1/user/new
app.post("/new", newUser);
// /api/v1/user/all
app.get("/all", adminOnly, getAllUsers);
// /api/v1/user/Dynamic Id
// app.get("/:id", getUser);
app.route("/:id").get(getUser).delete(adminOnly, deleteUser);
//second param in below we will write in controller
// app.post("/new", () => {});
export default app;
