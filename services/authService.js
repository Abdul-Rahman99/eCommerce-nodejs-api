// eslint-disable-next-line import/no-extraneous-dependencies
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");

// @desc    Signup to the server
// @route   GET /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1- create User
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  // 2- create token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

  res.status(201).json({ data: user, token });
});

// @desc    login to the server
// @route   GET /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1- check if password and email in the body (validation)
  // 2- check if user exists & check if password is correct
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect Email or Password", 401));
  }

  // 3- generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

  // 4- send response to the client side

  res.status(200).json({ data: user, token });
});

// @desc    make sure user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1- check if token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }
  if (!token) {
    return next(ApiError("Login to use this functionalty", 401));
  }

  // 2- verify the token (No change happened and token is not expired)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3- check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(new ApiError("User is not belong to that token", 401));
  }
  // 4- check if user didn't change password after token is generated
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    // password changed after token Created
    if (passwordChangedTimeStamp > decoded.iat) {
      return next(new ApiError("User Changed Password .. login again", 401));
    }
  }
  req.user = currentUser;
  next();
});

// @desc    Authorization (User Permissions)
// ["admin" , "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1- access rules for admin and manager
    // 2- access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(new ApiError("You are not allowed to access this page", 403));
    }
    next();
  });

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  // 1- Get User by Email and store it in user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with thin Email ${req.body.email}`)
    );
  }

  // 2- If User Exists by Email, Generate hash reset Random 6 digits and save it to DB
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // save hashed password resetCode to DB
  User.passwordResetCode = hashedResetCode;
  // Add expiration time for password after 5 min
  User.passwordResetExpires = Date.now() + 5 * 60 * 1000;
  User.passwordResetVierified = false;
  // save to database
  await user.save();

  const message = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-Commerce Team`;

  // 3- send the reset  code via Email
  try {
    await sendEmail({
      email: user.email,
      subject: "your password reset code (valid for 5 min).",
      message,
    });
  } catch (err) {
    User.passwordResetCode = undefined;
    User.passwordResetExpires = undefined;
    User.passwordResetVierified = undefined;

    await user.save();
    return next(new ApiError(`There is an error in sending Email ${err}`, 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset Code sent to Email" });
});

// @desc    verify Password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // 1- get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Reset Code invalid or expired", 500));
  }

  // 2- reset code valid
  user.passwordResetVierified = true;
  await user.save();
  res.status(200).json({
    status: "Success",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1- Get user from database based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no USER with this Email ${req.body.email}`, 404)
    );
  }

  // 2- check if reset code verified
  if (!user.passwordResetVierified) {
    return next(new ApiError("Reset Code Not Verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVierified = undefined;

  await user.save();

  // 3- if everyhing okay >> generate token
  // create token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
  res.status(200).json({ token });
});
