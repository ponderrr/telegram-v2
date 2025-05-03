const express = require("express");
const router = express.Router();
const topivcController = require("../controllers/topicController");
const auth = require("../middleware/auth");

router.get("/", auth, topicController.getAllTopics);
router.get("/create", auth, topicController.getCreateTopicForm);
router.post("/create", auth, topicController.createTopic);
router.get("/stats", auth, topicController.getTopicStats);
router.get("/:Id", auth, topicController.getTopicById);
router.post("/:Id/subscribe", auth, topicController.subscribeTopic);
router.post("/:Id/unsubscribe", auth, topicController.unsubscribeTopic);

module.exports = router;
