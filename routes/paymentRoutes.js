import express from "express";
import {
  sendStripeApiKey,
  processPayment,
} from "../controllers/paymentController.js";
import { isAuthenticatedUser } from "../middleware/auth.js";
const router = express.Router();

router.route("/payment/process").post(isAuthenticatedUser, processPayment);
router.route("/stripapikey").get(isAuthenticatedUser, sendStripeApiKey);

export default router;
