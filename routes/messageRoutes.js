const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middleware/auth");

// Protected routes
router.post("/topics/:id/messages", auth, messageController.createMessage);

module.exports = router;
