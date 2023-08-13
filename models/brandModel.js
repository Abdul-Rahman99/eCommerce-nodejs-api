const mongoose = require("mongoose");

//  create Schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand Required"],
      unique: [true, "Brand must be Unique"],
      minLength: [3, "Too Short Brand name"],
      maxLength: [32, "Too Long Brand name"],
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
const BrandModel = mongoose.model("BrandModel", brandSchema);

module.exports = BrandModel;
