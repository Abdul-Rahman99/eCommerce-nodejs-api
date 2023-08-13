// CRUD SERVICE FOR THE Category SYSTEM

const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const BrandModel = require("../models/brandModel");
const ApiError = require("../utils/apiError");

// @desc    Get list of all Brands
// @route   GET /api/v1/brands
// @access  Public
exports.getBrands = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const brands = await BrandModel.find({}).skip(skip).limit(limit);
  res.status(200).json({ results: brands.length, data: brands });
});

// @desc    Get specific brand by id
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await BrandModel.findById(id);
  if (!brand) {
    // res.status(404).json({msg: `No Category for ${id}`})
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }
  res.status(200).json({ data: brand });
});

// @desc    Create new Brand
// @route   POST /api/v1/brands
// @access  Private
exports.createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const brand = await BrandModel.create({ name, slug: slugify(name) });
  res.status(201).json({ data: brand }); //201 = create //400 = bad request
});

// @desc    Update existing Brand
// @route   PUT /api/v1/brands/:id
// @access  private
exports.updateBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const brand = await BrandModel.findByIdAndUpdate(
    { _id: id },
    { name, slug: slugify(name) },
    { new: true }
  );

  if (!brand) {
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }
  res.status(200).json({ data: brand });
});

// @desc    Delete existing Brand
// @route   DELETE /api/v1/brands/:id
// @access  private

exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const brand = await BrandModel.findByIdAndDelete(id);
  if (!brand) {
    return next(new ApiError(`No brand for this id ${id}`, 404));
  }
  res.status(200).send();
});
