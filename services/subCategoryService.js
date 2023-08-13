// CRUD SERVICE FOR THE subCategory SYSTEM

const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const ApiError = require("../utils/apiError");
const SubCategoryModel = require("../models/subCategoryModel");

// @desc    Get specific subcategory by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
exports.getSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategoryModel.findById(id).populate({
    path: "category",
    select: "name -_id",
  });
  if (!subCategory) {
    // res.status(404).json({msg: `No Category for ${id}`})
    return next(new ApiError(`No category for this id ${id}`, 404));
  }
  res.status(200).json({ data: subCategory, date: subCategory.req.body });
});

// @desc    Get list of all subCategories
// @route   GET /api/v1/subcategories
// @access  Public

exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObject = filterObject;
  next();
};

exports.getSubCategories = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const subCategories = await SubCategoryModel.find(req.filterObject)
    .skip(skip)
    .limit(limit);
  res
    .status(200)
    .json({ results: subCategories.length, page, data: subCategories });
});

// @desc    Create new subCategory
// @route   POST /api/v1/subsubcategories
// @access  Private
exports.setCategoryIdToBody = (req, res, next) => {
  // Nested Route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};
exports.createSubCategory = asyncHandler(async (req, res) => {
  const { name, category } = req.body;
  const subCategory = await SubCategoryModel.create({
    name,
    slug: slugify(name),
    category,
  });
  res.status(201).json({ data: subCategory }); //201 = create //400 = bad request
});

// @desc    Update existing subCategory
// @route   PUT /api/v1/subcategories/:id
// @access  private
exports.updateSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, category } = req.body;

  const subCategory = await SubCategoryModel.findByIdAndUpdate(
    { _id: id },
    { name, slug: slugify(name), category },
    { new: true }
  );
  if (!subCategory) {
    return next(new ApiError(`No category for this id ${id}`, 404));
  }
  res.status(200).json({ data: subCategory });
});

// @desc    Delete existing subCategory
// @route   DELETE /api/v1/subcategories/:id
// @access  private
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const subCategory = await SubCategoryModel.findByIdAndDelete(id);
  if (!subCategory) {
    return next(new ApiError(`No category for this id ${id}`, 404));
  }
  res.status(200).send();
});

// Nested Route
// @desc when returning to the main Category the Sub Categories show up
// GET   /api/v1/categories/:categoryId/subcategories
