// @desc    func to return required data only for the user
exports.sanitizeUser = function (user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
};
