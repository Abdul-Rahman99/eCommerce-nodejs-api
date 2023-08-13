const mongoose = require("mongoose");

//  create Schema
const categroySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category Required"],
      unique: [true, "Category must be Unique"],
      minLength: [3, "Too Short Category name"],
      maxLength: [32, "Too Long Category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

// create Model
const CategoryModel = mongoose.model("CategoryModel", categroySchema);

module.exports = CategoryModel;
