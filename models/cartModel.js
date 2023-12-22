import mongoose from "mongoose";
const cartSchema = mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
      isInCart: {
        type: Boolean,
        default: false,
      },
      isInWishlist: {
        type: Boolean,
        default: false,
      },
      quantity: {
        type: Number,
        default: 0,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export const Cart = mongoose.model("Cart", cartSchema);
