const Message = require("../models/Message");
const Topic = require("../models/Topic");
const User = require("../models/User");
const { topicSubject } = require("../observers/topicObserver");

const messageController = {
  createMessage: async (req, res) => {
    try {
      const { content } = req.body;
      const topicId = req.params.topicId;

      const topic = await Topic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      // check if user subscribed
      const user = await User.findById(req.user.id);
      const isSubscribed = user.subscribedTopics.some(
        (id) => id.toString() === topicId
      );

      if (!isSubscribed) {
        return res.status(403).json({
          message: "You must be subscribed to post in this topic",
        });
      }

      const newMessage = new Message({
        content,
        author: req.user.id,
        topic: topicId,
      });

      await newMessage.save();

      const populatedMessage = await Message.findById(newMessage._id).populate(
        "author",
        "username"
      );

      topicSubject
        .setTopic(topic)
        .setAction("new_message")
        .setMessage(populatedMessage)
        .notifyObservers();

      res.redirect(`/topics/${topicId}`);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  getRecentMessages: async (userId) => {
    try {
      const user = await User.findById(userId);

      // get 2 most recent messages
      const topicsWithMessages = await Promise.all(
        user.subscribedTopics.map(async (topicId) => {
          const topic = await Topic.findById(topicId);

          const messages = await Message.find({ topic: topicId })
            .sort({ createdAt: -1 })
            .limit(2)
            .populate("author", "username");

          return {
            topic,
            messages,
          };
        })
      );

      return topicsWithMessages;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get recent messages");
    }
  },
};

module.exports = messageController;
