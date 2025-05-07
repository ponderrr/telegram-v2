const Message = require("../models/Message");
const Topic = require("../models/Topic");
const User = require("../models/User");
const { topicSubject } = require("../observers/topicObserver");

const messageController = {
  createMessage: async (req, res) => {
    try {
      const { content } = req.body;
      const topicId = req.params.id;

      const topic = await Topic.findById(topicId);
      if (!topic) {
        return res.status(404).render("error", {
          user: req.user,
          error: "Topic not found",
        });
      }

      const user = await User.findById(req.user.id);
      const isSubscribed = user.subscribedTopics.some(
        (id) => id.toString() === topicId
      );

      if (!isSubscribed) {
        return res.status(403).render("error", {
          user: req.user,
          error: "You must be subscribed to post in this topic",
        });
      }

      const message = new Message({
        content,
        author: req.user.id,
        topic: topicId,
      });

      await message.save();

      if (topicSubject) {
        topicSubject
          .setTopic(topic)
          .setAction("new_message")
          .setMessage(message)
          .notifyObservers();
      }

      res.redirect(`/topics/${topicId}`);
    } catch (err) {
      console.error(err);
      res.status(500).render("error", {
        user: req.user,
        error: "Server error",
      });
    }
  },

  getRecentMessages: async (userId) => {
    try {
      const user = await User.findById(userId);

      if (
        !user ||
        !user.subscribedTopics ||
        user.subscribedTopics.length === 0
      ) {
        return [];
      }

      const topicsWithMessages = await Promise.all(
        user.subscribedTopics.map(async (topicId) => {
          const topic = await Topic.findById(topicId);

          if (!topic) {
            return { topic: { title: "Deleted Topic" }, messages: [] };
          }

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

      return topicsWithMessages.filter((item) => item.topic);
    } catch (err) {
      console.error(err);
      return [];
    }
  },
};

module.exports = messageController;
