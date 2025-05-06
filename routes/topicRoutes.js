const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topicController");
const auth = require("../middleware/auth");

router.get("/", auth, topicController.getAllTopics);
router.get("/create", auth, topicController.getCreateTopicForm);
router.post("/create", auth, topicController.createTopic);
router.get("/stats", auth, topicController.getTopicStats);
router.get("/:id", auth, topicController.getTopicById);
router.post("/:id/subscribe", auth, topicController.subscribeTopic);
router.post("/:id/unsubscribe", auth, topicController.unsubscribeTopic);

module.exports = router;
