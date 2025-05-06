const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

router.get("/register", userController.getRegisterForm);
router.post("/register", userController.register);
router.get("/login", userController.getLoginForm);
router.post("/login", userController.login);
router.get("/logout", userController.logout);

router.get("/dashboard", auth, userController.getDashboard);

module.exports = router;
