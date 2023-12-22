import express from "express";
import { authorizedUser, isAuthenticatedUser } from "../middleware/auth.js";
import {
  createProduct,
  getAdminProducts,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReviewOptimised,
  getAllProducts,
} from "../controllers/productController.js";

const router = express.Router();
// allProduct, createProduct, updateProduct, deleteProduct
// productDetail, productReview, deleteReview, adminProduct

router.route("/products").get(getAllProducts); // yet to work


router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizedUser("admin"), createProduct);

router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizedUser("admin"), getAdminProducts);

router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, authorizedUser("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizedUser("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails);

router.route("/review").put(isAuthenticatedUser, createProductReview);

router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticatedUser, deleteReviewOptimised);

export default router;
