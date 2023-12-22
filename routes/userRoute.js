import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import { isAuthenticatedUser, authorizedUser } from "../middleware/auth.js";
import {
  addToCart,
  addToCartWishListList,
  addToWishList,
  removeFromCart,
  removeFromWishList,
} from "../controllers/productController.js";

// loginUser, logout, registerUser, forgotPassword, resetPassword, getUserDetails,
// updatePassword, updateProfile, getAllUser, getSingleUser, updateUserRole,
// deleteUser

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);
///////////////////////////////////////////////////////////////////
router.route("/addToCart").post(isAuthenticatedUser, addToCart);
router.route("/addToWishlist").post(isAuthenticatedUser, addToWishList);
router
  .route("/addToCartWishList")
  .post(isAuthenticatedUser, addToCartWishListList);
router.route("/removeFromCart").post(isAuthenticatedUser, removeFromCart);
router
  .route("/removeFromWishlist")
  .post(isAuthenticatedUser, removeFromWishList);
//////////////////////////////////////////////////////////////////
router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/me/update").put(isAuthenticatedUser, updateProfile);

router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizedUser("admin"), getAllUser);

router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizedUser("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizedUser("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizedUser("admin"), deleteUser);

router.route("/logout").get(logout);

export default router;
