/* eslint-disable import/no-extraneous-dependencies */
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const Category = require("../models/categoryModel");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public

//1- Disk Stoorage
// const multerStorage = multer.diskStorage({
//     destination: function(req , file , cb){
//         cb(null , "uploads/categories")
//     },
//     filename: function(req,file,cb){
//         // category-${id}-Date.now().jpeg
//         const ext = file.mimetype.split("/")[1]; // to get the mimtype
//         const filename = `category-${uuidv4()}-${Date.now()}.${ext}`
//         cb(null , filename) ;
//     },
// })

exports.uploadCategoryImage = uploadSingleImage("image");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);
  }

  // save image into DB
  req.body.image = filename;

  next();
});

// Build query
exports.getCategories = factory.getAll(Category);

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = factory.getOne(Category);

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private
exports.createCategory = factory.createOne(Category);

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = factory.updateOne(Category);

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = factory.deleteOne(Category);
