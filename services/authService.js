// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");

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

// @desc    make sure user is authorized to continue
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
