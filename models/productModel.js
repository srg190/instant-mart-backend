import mongoose from "mongoose";
const productSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please Enter Product Name"],
  },
  description: {
    type: String,
    required: [true, "Please Enter product Description"],
  },
  price: {
    type: Number,
    required: [true, "Please Enter Product Price"],
    maxLength: [8, "Price Cannot be more than 8 character"],
  },
  rating: {
    type: Number,
    default: 0.0,
  },
  stock: {
    type: Number,
    default: 1,
  },
  brand: {
    type: String,
    required: [true, "Please provide brand name"],
  },
  thumbnail: {
    type: String,
  },
  images: [
    {
      type: String,
    },
  ],
  category: {
    type: String,
    required: [true, "Please Provide Product Category"],
  },
  quantity: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export const Product = mongoose.model("Product", productSchema);
