import express from "express";
import { generateFakeProducts } from "../controllers/fakeData.js";
const router = express.Router();

// newOrder, getSingle order, myOrder, getAllorder,
// updateOrder, deleteOrder

router.route("/fakeData").get(generateFakeProducts);

export default router;
