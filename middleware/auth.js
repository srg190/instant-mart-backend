import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "./error.js";

export const isAuthenticatedUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded._id);
  next();
};

export const authorizedUser = (roles) => {
  return (req, res, next) => {
    if (req.user.role !== roles) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
