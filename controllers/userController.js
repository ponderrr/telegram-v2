const User = require("../models/User");
const Topic = require("../models/Topic");
const jwt = require("jsonwebtoken");
const messageController = require("./messageController");

const userController = {
  getRegisterForm: (req, res) => {
    res.render("auth/register");
  },

  getLoginForm: (req, res) => {
    res.render("auth/login");
  },

  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      user = new User({
        username,
        email,
        password,
      });

      await user.save();

      // JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "secret_token",
        { expiresIn: "1d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "secret_token",
        { expiresIn: "1d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  logout: (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
  },

  getDashboard: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).populate(
        "subscribedTopics"
      );

      const topicsWithMessages = await messageController.getRecentMessages(
        req.user.id
      );

      res.render("dashboard", {
        user,
        topicsWithMessages,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = userController;
