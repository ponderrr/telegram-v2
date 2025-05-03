const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middleware/auth");

router.post("/topics/:topicId/messages", auth, messageController.createMessage);

module.exports = router;
