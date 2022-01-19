const User = require('../models/Users');
const ErrorResponse = require('../utils/errorResponse');

async function register (req, res, next) {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({
      username, email, password
    });

    sendToken(user, 201, res);

  } catch(err) {
    next(error);
  };

};

async function login(req, res, next) {
  const { email, password } = req.body;

  // rejected if email password is not given
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  try {
    // searching for given email in db
    const user = await User.findOne({ email }).select("+password");

    // rejected if email not found
    if (!user) {
      return next(new ErrorResponse("Invalid credentials!", 401));
    }

    // comparing given pw to pw in db with given email
    const isMatch = await user.matchPasswords(password);

    // rejecting login if given pw doesnot match db pw
    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials!", 401));
    }

    // if pw is correct, respond with jwt
    sendToken(user, 200, res);

  } catch (err) {
    res.status(500).json({ success: false, error: error.message });
  }
};

async function forgotPassword (req, res, next) {
  res.send("RForgot Password Route");
};

async function resetPassword (req, res, next) {
  res.send("Reset Password Route");
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
}

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({ success: true, token });
};