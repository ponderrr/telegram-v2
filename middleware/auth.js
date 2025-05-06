const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/login");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_token");

    // Find user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.redirect("/login");
    }

    // Add user to request
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
};

module.exports = auth;
