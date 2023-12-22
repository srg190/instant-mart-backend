import { Cart } from "../models/cartModel.js";
import { Product } from "../models/productModel.js";
import ErrorHandler from "../middleware/error.js";
import { jwtSignCart } from "../utils/features.js";
import { User } from "../models/userModel.js";

export const addToCart = async (req, res, next) => {
  try {
    const { _id, productId, isInCart, isInWishList, quantity } = req.body;
    let cart;
    const product = await Product.findById({ _id: productId });
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    if (product.stock < quantity && product.stock !== 0) {
      return next(new ErrorHandler("Not enough stock", 400));
    }
    if (product.stock === 0) {
      return next(new ErrorHandler("Out of stock", 400));
    }
    if (!_id) {
      cart = await Cart.create({
        products: [
          {
            product: productId,
            isInCart,
            isInWishList,
            quantity,
          },
        ],
      });
    } else {
      cart = await Cart.findById(_id);
      let flag = false;
      cart.products = cart.products.map((item) => {
        if (item.product.includes(productId)) {
          flag = true;
          item = {
            product: productId,
            isInCart: isInCart === undefined ? item.isInCart : isInCart,
            isInWishList:
              isInWishList === undefined ? item.isInWishList : isInWishList,
            quantity: quantity === undefined ? item.quantity : quantity,
          };
        }
        return item;
      });
      if (!flag) {
        cart.products.push({
          product: productId,
          isInCart,
          isInWishList,
          quantity,
        });
      }
    }
    res.status(200).json({
      success: true,
      cart,
      message: "Added Successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllCartsItems = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findById({ _id });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    if (!user.cartId) {
      return next(new ErrorHandler("User has no cart items", 400));
    }
    const data = await Cart.findById({ _id: user.cartId });
    res.status(200).json({
      success: true,
      cart: data,
      message: "Get cart successfully",
    });
  } catch (error) {
    next(error);
  }
};
