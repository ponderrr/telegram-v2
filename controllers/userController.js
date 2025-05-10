const User = require("../models/User");
const jwt = require("jsonwebtoken");
const messageController = require("./messageController");

const userController = {
  getLoginPage: (req, res) => {
    res.render("auth/login", { user: null });
  },

  getRegisterPage: (req, res) => {
    res.render("auth/register", { user: null });
  },

  registerUser: async (req, res) => {
    try {
      const { username, password } = req.body;

      let user = await User.findOne({ username });
      if (user) {
        return res.render("auth/register", {
          user: null,
          error: "User already exists",
        });
      }

      user = new User({
        username,
        password,
      });

      await user.save();

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
      res.render("auth/register", {
        user: null,
        error: "Registration failed",
      });
    }
  },

  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
        return res.render("auth/login", {
          user: null,
          error: "Invalid credentials",
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.render("auth/login", {
          user: null,
          error: "Invalid credentials",
        });
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
      const user = await User.findById(req.user.id).populate(
        "subscribedTopics"
      );

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
