const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const factory = require("./handlersFactory");
const User = require("../models/userModel");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

exports.uploadUserImage = uploadSingleImage("profileImg");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // save image into DB
    req.body.profileImg = filename;
  }
  next();
});

// @desc    Get list of brands
// @route   GET /api/v1/brands
// @access  Public
exports.getUsers = factory.getAll(User);

// @desc    Get specific brand by id
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getUser = factory.getOne(User);

// @desc    Create brand
// @route   POST  /api/v1/brands
// @access  Private
exports.createUser = factory.createOne(User);

// @desc    Update specific brand
// @route   PUT /api/v1/brands/:id
// @access  Private
exports.updateUser = factory.updateOne(User);

// @desc    Delete specific brand
// @route   DELETE /api/v1/brands/:id
// @access  Private
exports.deleteUser = factory.deleteOne(User);
