// CRUD SERVICE FOR THE Category SYSTEM

const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const CategoryModel = require("../models/categoryModel");
const ApiError = require("../utils/apiError");

// @desc    Get list of all Categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;
  const categories = await CategoryModel.find({}).skip(skip).limit(limit);
  res.status(200).json({ results: categories.length, data: categories });
});

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await CategoryModel.findById(id);
  if (!category) {
    // res.status(404).json({msg: `No Category for ${id}`})
    return next(new ApiError(`No category for this id ${id}`, 404));
  }
  res.status(200).json({ data: category });
});

// @desc    Create new Category
// @route   POST /api/v1/categories
// @access  Private
exports.createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await CategoryModel.create({ name, slug: slugify(name) });
  res.status(201).json({ data: category }); //201 = create //400 = bad request
});

// @desc    Update existing Category
// @route   PUT /api/v1/categories/:id
// @access  private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const name = req.body;
  const category = await CategoryModel.findByIdAndUpdate(
    { _id: id },
    { name, slug: slugify(name) },
    { new: true }
  );

  if (!category) {
    return next(new ApiError(`No category for this id ${id}`, 404));
  }
  res.status(200).json({ data: category });
});

// @desc    Delete existing Category
// @route   DELETE /api/v1/categories/:id
// @access  private

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const category = await CategoryModel.findByIdAndDelete(id);
  if (!category) {
    return next(new ApiError(`No category for this id ${id}`, 404));
  }
  res.status(200).send();
});
