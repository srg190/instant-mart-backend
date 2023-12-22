import { Product } from "../models/productModel.js";
import { User } from "../models/userModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cloudinary from "cloudinary";
import ErrorHandler from "../middleware/error.js";
// Admin - create product

export const createProduct1 = async (req, res, next) => {
  try {
    const { name, description, price, category, stock, images } = req.body;
    const requestData = {
      body: req.body,
      headers: req.headers,
      url: req.url,
    };
    await fs.writeFile(
      "req.txt",
      JSON.stringify(requestData, null, 2),
      (err) => {
        if (err) {
          console.error("Error writing req object to req.txt:", err);
        } else {
          console.log("req object has been saved to req.txt");
        }
      }
    );
    // Check if the images are empt
    if (images?.length === 0) {
      throw new Error("Please provide at least one image.");
    }

    // Save the images locally
    const imgArr = await saveImagesLocally(images);

    // Upload the images to Cloudinary
    const cloudinaryImgArr = await uploadImagesToCloudinary(imgArr);

    // Create the product
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images: cloudinaryImgArr,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
};

async function saveImagesLocally(images) {
  const imgArr = [];
  for (let image of images) {
    const localPath = path.join(__dirname, "../static/img", image.name);
    await image.mv(localPath);
    imgArr.push(localPath);
  }
  return imgArr;
}

async function uploadImagesToCloudinary(imgArr) {
  const cloudinaryImgArr = [];
  for (let imagePath of imgArr) {
    const myCloud = await cloudinary.v2.uploader.upload(imagePath, {
      folder: "products",
      width: 150,
      crop: "scale",
    });
    cloudinaryImgArr.push({
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    });
  }
  return cloudinaryImgArr;
}

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const images = req.files;
    console.log(images.images, typeof images, " --------------");
    // if (!images || !Array.isArray(images)) {
    //   return res.status(400).json({ error: "Invalid images data." });
    // }

    images.images.forEach((image, index) => {
      const temp = image.data + "";
      const base64Data = temp.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");

      // Save the buffer to a file (you can adjust the path and filename)
      const imageName = `product-image-${index}.jpg`;
      fs.writeFileSync(`./avatars/${imageName}`, imageBuffer);
    });

    const images_ = req.files?.images;
    let imgArr = [];
    for (let image of images) {
      let avatarImage = image; // Access the uploaded image file

      // Save the image locally
      let currentFilePath = fileURLToPath(import.meta.url);
      let currentDirectory = dirname(currentFilePath);
      let localDirectory = path.join(currentDirectory, "../static/img");
      let localPath = path.join(localDirectory, avatarImage.name);
      await avatarImage.mv(localPath);

      // Upload the image to Cloudinary
      let myCloud = await cloudinary.v2.uploader.upload(localPath, {
        folder: "products",
        width: 150,
        crop: "scale",
      });
      imgArr.push({
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      });
      await fs.promises.unlink(localPath);
    }
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images: imgArr,
      user: req.user._id,
    });
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { search, page, perPage, price, rating, title, category, brand } =
      req.query;

    // Prepare query conditions based on search and filter parameters
    const conditions = {};
    if (search) {
      conditions.name = { $regex: search, $options: "i" };
    }
    if (price) {
      const priceRange = price.split("-");
      conditions.price = {
        $gte: parseInt(priceRange[0]),
        $lte: parseInt(priceRange[1]),
      };
    }
    if (brand) {
      conditions.brand = { $regex: brand, $options: "i" };
    }
    if (rating) {
      conditions.rating = { $gte: parseInt(rating), $lte: 5 };
    }
    if (title) {
      conditions.title = { $regex: title, $options: "i" };
    }
    if (category) {
      conditions.category = { $regex: category, $options: "i" };
    }
    // Count total number of products based on the conditions
    const totalProducts = await Product.countDocuments(conditions);

    // Calculate pagination parameters
    const currentPage = parseInt(page) || 1;
    const productsPerPage = parseInt(perPage) || 10;
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    // Retrieve products based on conditions, pagination, and sorting
    const products = await Product.find(conditions)
      .skip((currentPage - 1) * productsPerPage)
      .limit(productsPerPage)
      .sort({ createdAt: -1 });

    // Count filtered products based on conditions
    const filteredProductCount = await Product.countDocuments(conditions);

    // Prepare response data
    const response = {
      currentPage,
      totalPages,
      totalProducts,
      productsPerPage,
      filteredProductCount,
      products,
    };

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    // Handle any errors that occur during the process
    return next(error);
    // res.status(500).json({ error: "Internal Server Error" });
  }
};

// Admin - All Products
export const getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};
// Update Product - Admin
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 404));
    }
    const images = req.files.images;
    let imgArr = [];
    if (images.length > 0) {
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }
      for (let image of images) {
        let avatarImage = image; // Access the uploaded image file

        // Save the image locally
        let currentFilePath = fileURLToPath(import.meta.url);
        let currentDirectory = dirname(currentFilePath);
        let localDirectory = path.join(currentDirectory, "../static/img");
        let localPath = path.join(localDirectory, avatarImage.name);
        await avatarImage.mv(localPath);

        // Upload the image to Cloudinary
        let myCloud = await cloudinary.v2.uploader.upload(localPath, {
          folder: "products",
          width: 150,
          crop: "scale",
        });
        imgArr.push({
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        });
        await fs.promises.unlink(localPath);
      }
    }
    req.body.images = imgArr;
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 404));
    }
    for (let i = 0; i < product.images.length; i++) {
      cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Product Delete Successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product is not found"));
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating,
      comment,
    };
    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
      // Update existing review
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString()) {
          rev.rating = rating;
          rev.comment = comment;
        }
      });
    } else {
      // Create new review
      product.reviews.push(review);
    }

    // Calculate average rating
    let totalRatings = 0;
    product.reviews.forEach((rev) => {
      totalRatings += rev.rating;
    });
    product.rating = totalRatings / product.reviews.length;

    // Update the number of reviews
    product.numOfReviews = product.reviews.length;

    // Save the product
    await product.save();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.id);
    if (!product) {
      return next(new ErrorHandler("Product not Found", 404));
    }
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {}
};

export const deleteReview = async (req, res, next) => {
  try {
    const product = Product.findById(req.query.productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
    const avg =
      reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length;
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

// optimised Version of above deletion
export const deleteReviewOptimised = async (req, res, next) => {
  try {
    const { productId, id } = req.query;

    const product = await Product.findOneAndUpdate(
      { _id: productId, "reviews._id": id },
      {
        $pull: { reviews: { _id: id } },
        $inc: { numOfReviews: -1 },
      },
      { new: true, runValidators: true, useFindAndModify: false }
    );

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const avg =
      product.reviews.reduce((sum, rev) => sum + rev.rating, 0) /
      product.numOfReviews;

    product.ratings = avg;

    await product.save();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

export const addToCartWishListList = async (req, res, next) => {
  try {
    const { cartList, wishList } = req.body;
    const { _id } = req.user;
    const { cartItems, cartLastUpdate } = cartList;
    const { wishListItems, wishListLastUpdate } = wishList;

    const user = await User.findById(_id);
    let cartFlag = false;
    let wishFlag = false;
    let message = "";

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    cartItems.forEach(async (item) => {
      const product = await Product.findById(item._id);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      if (!user.cartItems.products.includes(item._id)) {
        if (item.quantity > product.stock) {
          return next(new ErrorHandler("Not enough stock", 400));
        }

        cartFlag = true;
        user.cartItems.products.push(item);
        product.stock -= item.quantity;
        await product.save();
      }
    });

    wishListItems.forEach((item) => {
      if (!user.whishList.products.includes(item._id)) {
        wishFlag = true;
        user.whishList.products.push(item);
      }
    });

    if (!cartFlag && !wishFlag) {
      message = "Already Updated";
    } else {
      message = "Update Successful";
    }

    user.cartItems.lastUpdate = new Date(cartLastUpdate);
    user.whishList.lastUpdate = new Date(wishListLastUpdate);

    await user.save();

    res.status(200).json({ success: true, user, message });
  } catch (error) {
    return next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { cart } = req.body;
    const { _id } = req.user;
    const user = await User.findById(_id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const { cartItem: item, cartLastUpdate } = cart;

    const product = await Product.findById(item._id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    if (!user.cartItems.products.includes(item._id)) {
      if (item.quantity > product.stock) {
        return next(new ErrorHandler("Not enough stock", 400));
      }

      cartFlag = true;
      user.cartItems.products.push(item);
      product.stock -= item.quantity;
      await product.save();
    }

    user.cartItems.lastUpdate = new Date(cartLastUpdate);

    user.save();
    res.status(200).json({ success: true, user, message: "Added Successful" });
  } catch (error) {
    return next(error);
  }
};

export const addToWishList = async (req, res, next) => {
  try {
    const { wishList } = req.body;
    const { _id } = req.user;
    const user = await User.findById(_id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const { wishListItem: item, wishListLastUpdate } = wishList;

    const product = await Product.findById(item._id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    if (!user.whishList.products.includes(item._id)) {
      user.whishList.products.push(item);
    }

    user.whishList.lastUpdate = new Date(wishListLastUpdate);

    user.save();

    res.status(200).json({ success: true, user, message: "Added Successful" });
  } catch (error) {
    return next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const product = await Product.findById(item._id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const { cartItem: item, cartLastUpdate } = cart;
    user.cartItems.products = user.cartItems.products.filter(
      (v) => v._id !== item._id
    );
    product.stock += item.quantity;
    await product.save();
    user.cartItems.lastUpdate = new Date(cartLastUpdate);
    await user.save();
    res
      .status(200)
      .json({ success: true, user, message: " Item removed from Cart" });
  } catch (error) {
    return next(error);
  }
};

export const removeFromWishList = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    const product = await Product.findById(item._id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const { wishListItems: item, wishListLastUpdate } = wishList;
    user.whishList.products = user.whishList.products.filter(
      (v) => v._id !== item._id
    );
    product.stock += item.quantity;
    await product.save();

    user.whishList.lastUpdate = new Date(wishListLastUpdate);
    await user.save();
    res
      .status(200)
      .json({ success: true, user, message: " Item removed from Wishlist" });
  } catch (error) {
    return next(error);
  }
};
