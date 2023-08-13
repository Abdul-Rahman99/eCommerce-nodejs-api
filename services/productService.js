// CRUD SERVICE FOR THE Category SYSTEM

const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const ApiError = require("../utils/apiError");

const ProductModel = require("../models/productModel");

// @desc    Get list of all Products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const products = await ProductModel.find({}).skip(skip).limit(limit);
  res.status(200).json({ results: products.length, data: products });
});

// @desc    Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await ProductModel.findById(id);
  if (!product) {
    // res.status(404).json({msg: `No Category for ${id}`})
    return next(new ApiError(`No product for this id ${id}`, 404));
  }
  res.status(200).json({ data: product });
});

// @desc    Create new Product
// @route   POST /api/v1/products
// @access  Private
exports.createProduct = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.title);
  const products = await ProductModel.create(req.body);
  res.status(201).json({ data: products }); //201 = create //400 = bad request
});

// @desc    Update existing Product
// @route   PUT /api/v1/products/:id
// @access  private
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  req.body.slug = slugify(req.body.title);

  const products = await ProductModel.findByIdAndUpdate({ _id: id }, req.body, {
    new: true,
  });

  if (!products) {
    return next(new ApiError(`No product for this id ${id}`, 404));
  }
  res.status(200).json({ data: products });
});

// @desc    Delete existing Product
// @route   DELETE /api/v1/products/:id
// @access  private

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const products = await ProductModel.findByIdAndDelete(id);
  if (!products) {
    return next(new ApiError(`No product for this id ${id}`, 404));
  }
  res.status(200).send();
});
