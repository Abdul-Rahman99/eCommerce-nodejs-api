const router = require("express").Router();

const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");

const {
  getProduct,
  createProduct,
  getPeoducts,
  updateProduct,
  deleteProduct,
} = require("../services/productService");

// Routes

router.route("/").get(getPeoducts).post(createProductValidator, createProduct);

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(updateProductValidator, updateProduct)
  .delete(deleteProductValidator, deleteProduct);

// if any resource came with this style >>> go to subCategoriesRoute

module.exports = router;
