const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// Public routes
router.get("/register", userController.getRegisterPage);
router.post("/register", userController.registerUser);
router.get("/login", userController.getLoginPage);
router.post("/login", userController.loginUser);
router.get("/logout", userController.logout);

// Protected routes
router.get("/dashboard", auth, userController.getDashboard);

module.exports = router;
