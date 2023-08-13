const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Sub Category Name Required")
    .isLength({ min: 2 })
    .withMessage("Sub Category Name Too Short")
    .isLength({ max: 32 })
    .withMessage("Sub Category Name Too Long"),
  check("category")
    .notEmpty()
    .withMessage("category id REQUIRED")
    .isMongoId()
    .withMessage("Invalid Category ID format"),
];

exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];
