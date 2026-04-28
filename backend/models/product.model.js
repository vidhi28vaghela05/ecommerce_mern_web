const mongoose = require("mongoose");

let productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 3,
      required: true,
    },
    description: {
      type: String,
      minLength: 10,
      required: true,
    },
    stock: {
      type: Number,
      minLength: 0,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      minLength: 0,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      minLength: 0,
      default: 0,
    },
    isNewproduct: {
      type: Boolean,
      default: true,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      minLength: 3,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("product", productSchema);
