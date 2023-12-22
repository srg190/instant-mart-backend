import { constants } from "crypto";
import ErrorHandler from "../middleware/error.js";
import { Order } from "../models/orderModel.js";

export const newOrder = async (req, res, next) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });
    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    res.status(200).json({
      succes: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const myOrders = async (req, res, next) => {
  try {
    const id = "64aac47c0d53bc10bfe580b8";
    // 646499a682db8cff2a2576a1
    // 64aac47c0d53bc10bfe580b8
    // 64aac47c0d53bc10bfe580b8
    const orders = await Order.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();
    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });
    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }
    if (req.body.status == "Shipped") {
      order.orderItems.forEach(async (o) => {
        await updateStock(o.product, o.quantity);
      });
    }
    if (req.body.status == "Delivered") {
      order.deliveredAt = Date.now();
    }
    await order.save({ validateBeforeSave: false });
    res.status(200).json({
      succes: true,
    });
  } catch (error) {
    next(error);
  }
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// Admin --delete
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};
