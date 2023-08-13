const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true, // trim delete extra spaces
      unique: [true, "Sub Category must be Unique"],
      minLength: [2, "too short sub category name"],
      maxLength: [32, "too long sub category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "CategroyModel",
      required: [true, "sub category must be belonged to parent category"],
    },
  },
  { timestamps: true } // creates time stamps automatically
);

module.exports = mongoose.model("SubCategoryModel", subCategorySchema);
