const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // no spaces added
      minLength: [3, "Too Short Product title"],
      maxLength: [32, "Too Long Product title"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description required"],
      minLength: [20, "Too Short for descripe a product"],
    },
    quantity: {
      type: Number,
      required: [true, "Product Quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Price is required for Product"],
      trim: true,
      max: [10, "Too Long product price"],
    },
    priceAfterDiscount: {
      type: Number,
      required: [true, "Price is required for Product"],
      trim: true,
      maxLength: [10, "Too Long product price"],
    },
    imageCover: {
      type: String,
      required: [true, "Image Cover is Required"],
    },
    images: [String],
    colors: [String],

    //////////////

    category: {
      type: mongoose.Schema.ObjectId,
      ref: "CategoryModel",
      required: [true, "Product must belong to Category"],
    },
    subCategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategoryModel",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "BrandModel",
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductModel", productSchema);
