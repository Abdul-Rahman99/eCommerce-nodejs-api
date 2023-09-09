const slugify = require("slugify");
const { check, body } = require("express-validator");
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require("bcryptjs");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("E-mail Required")
    .isEmail()
    .withMessage("Invalid E-mail address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in-use"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 charcters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number Only EGYPT & SAUDI-ARABIA"),
  check("profileImg").optional(),
  check("role").optional(),

  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("E-mail Required")
    .isEmail()
    .withMessage("Invalid E-mail address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in-use"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number Only EGYPT & SAUDI-ARABIA"),
  check("profileImg").optional(),
  check("role").optional(),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.changePasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  check("currentPassword")
    .notEmpty()
    .withMessage("Enter your current password"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Enter The Confirmation Password"),
  check("password")
    .notEmpty()
    .withMessage("Enter NEW password")
    .custom(async (val, { req }) => {
      // 1- current password is verified
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("There is no user by this ID");
      }

      // comparing the current password with the old one
      const isPasswordCorrect = await bcrypt.compare(
        req.body.currentPassword, // current
        user.password // old
      );
      if (!isPasswordCorrect) {
        throw new Error("Incorrect Current Password");
      }

      // 2- Confirm the new password (typed twice)
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
    }),
  validatorMiddleware,
];
