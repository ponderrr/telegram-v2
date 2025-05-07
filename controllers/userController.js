const User = require("../models/User");
const jwt = require("jsonwebtoken");
const messageController = require("./messageController");

const userController = {
  // Authentication
  getLoginPage: (req, res) => {
    res.render("auth/login", { user: null });
  },

  getRegisterPage: (req, res) => {
    res.render("auth/register", { user: null });
  },

  registerUser: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.render("auth/register", {
          user: null,
          error: "User already exists",
        });
      }

      // Create new user
      user = new User({
        username,
        email,
        password,
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "secret_token",
        { expiresIn: "1d" }
      );

      // Set token cookie
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.render("auth/register", {
        user: null,
        error: "Registration failed",
      });
    }
  },

  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ username });
      if (!user) {
        return res.render("auth/login", {
          user: null,
          error: "Invalid credentials",
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.render("auth/login", {
          user: null,
          error: "Invalid credentials",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "secret_token",
        { expiresIn: "1d" }
      );

      // Set token cookie
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.render("auth/login", {
        user: null,
        error: "Login failed",
      });
    }
  },

  logout: (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
  },

  getDashboard: async (req, res) => {
    try {
      // Get user's subscribed topics
      const user = await User.findById(req.user.id).populate(
        "subscribedTopics"
      );

      // Get 2 most recent messages for each subscribed topic
      const topicsWithMessages = await messageController.getRecentMessages(
        req.user.id
      );

      res.render("dashboard", {
        user: user,
        topicsWithMessages: topicsWithMessages,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("error", {
        user: req.user,
        error: "Server error",
      });
    }
  },
};
module.exports = userController;
