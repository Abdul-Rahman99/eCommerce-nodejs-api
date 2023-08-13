const router = require("express").Router();
const subCategoriesRoute = require("./subCategoryRoute");

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoryValidator");

const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../services/categoryService");

// Routes

router
  .route("/")
  .get(getCategories)
  .post(createCategoryValidator, createCategory);

router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(updateCategoryValidator, updateCategory)
  .delete(deleteCategoryValidator, deleteCategory);

// if any resource came with this style >>> go to subCategoriesRoute
router.use("/:categoryId/subcategories", subCategoriesRoute);

module.exports = router;
