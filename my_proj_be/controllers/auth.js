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
    });
  } catch(err) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  };

};

async function login(req, res, next) {
  const { email, password } = req.body;

  // rejected if email password is not given
  if (!email || !password) {
    res.status(400).json({ success: false, error: "Please provide an email and password"});
  }

  try {
    // searching for given email in db
    const user = await User.findOne({ email }).select("+password");

    // rejected if email not found
    if (!user) {
      res.status(404).json({ success: false, error: "Invalid credentials!"});
    }

    // comparing given pw to pw in db with given email
    const isMatch = await user.matchPasswords(password);

    // rejecting login if given pw doesnot match db pw
    if (!isMatch) {
      res.status(404).json({ success: false, error: "Invalid credentials!"});
    }

    // if pw is correct, respond with jwt
    res.status(201).json({
      success: true,
      token: 'fwefwfewef'
    });

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