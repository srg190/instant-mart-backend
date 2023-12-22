import { faker } from "@faker-js/faker";
import axios from "axios";
import cloudinary from "cloudinary";
import { Product } from "../models/productModel.js";

export const generateFakeProducts = async (req, res, next) => {
  try {
    const response = await axios.get("https://dummyjson.com/products?limit=0");
    // console.log(res.data.products);
    const datas = response.data;
    const products = [];
    for (let data of datas.products) {
      products.push(await Product.create(data));
    }
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
