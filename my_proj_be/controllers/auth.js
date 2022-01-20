const crypto = require('crypto');
const User = require('../models/Users');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

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
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("Email could not be sent", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save();

    const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;

    const message = `
      <h1>You have requested a Password Reset</h1>
      <p>Please got to this link to reset your password</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message
      });

      res.status(200).json({
        success: true,
        data: "Email Sent"
      })
    } catch (err) {
      user.getResetPasswordToken = undefined;
      user.getResetPasswordExpire= undefined;

      await user.save();

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (err) {
    next(err);
  }
};

async function resetPassword (req, res, next) {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      getResetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse("Invalid Reset Token", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.getResetPasswordExpire = undefined;

    user.save();

    return res.status(201).json({
      success: true,
      data: "Password has been reset successfully"
    })
  } catch (err) {
    next(err);
  }
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