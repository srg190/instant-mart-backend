import express from "express";
import { addToCart, getAllCartsItems } from "../controllers/cartController.js";
import { isAuthenticatedUser } from "../middleware/auth.js";
const router = express.Router();

router.route("/addToCartWish").post(addToCart);
router.route("/getAllCartItems").get(isAuthenticatedUser, getAllCartsItems);

export default router;
