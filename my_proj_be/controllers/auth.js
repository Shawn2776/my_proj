const User = require('../models/Users')

async function register (req, res, next) {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({
      username, email, password
    });

    res.status(201).json({
      success: true,
      user
    })
  } catch(err) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }

};

async function login(req, res, next) {
  res.send("Login Route");
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