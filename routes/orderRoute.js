import express from "express";
import { isAuthenticatedUser, authorizedUser } from "../middleware/auth.js";
import {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";
const router = express.Router();

// newOrder, getSingle order, myOrder, getAllorder,
// updateOrder, deleteOrder

router.route("/order/new").post(isAuthenticatedUser, newOrder);

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, myOrders);

router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizedUser("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizedUser("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizedUser("admin"), deleteOrder);
export default router;
