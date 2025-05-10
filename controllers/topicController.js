const Topic = require("../models/Topic");
const User = require("../models/User");
const Message = require("../models/Message");
const { topicSubject } = require("../observers/topicObserver");

const topicController = {
  getAllTopics: async (req, res) => {
    try {
      const topics = await Topic.find().populate("creator", "username");

      res.render("topics/all", {
        topics,
        user: req.user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("error", {
        user: req.user,
        error: "Server error",
      });
    }
  },

  getTopicById: async (req, res) => {
    try {
      const topic = await Topic.findById(req.params.id)
        .populate("creator", "username")
        .populate("subscribers", "username");

      if (!topic) {
        return res.status(404).render("error", {
          user: req.user,
          error: "Topic not found",
        });
      }

      await topic.incrementAccessCount();
      topicSubject.setTopic(topic).setAction("access").notifyObservers();

      const messages = await Message.find({ topic: topic._id })
        .sort({ createdAt: -1 })
        .populate("author", "username");

      res.render("topics/view", {
        topic,
        messages,
        user: req.user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).render("error", {
        user: req.user,
        error: "Server error",
      });
    }
  },

  getCreateTopicForm: (req, res) => {
    res.render("topics/create", { user: req.user });
  },

  createTopic: async (req, res) => {
    try {
      const { title, description } = req.body;

      const existingTopic = await Topic.findOne({ title });
      if (existingTopic) {
        return res.render("topics/create", {
          user: req.user,
          error: "Topic already exists",
        });
      }

      const newTopic = new Topic({
        title,
        description,
        creator: req.user.id,
        subscribers: [req.user.id],
      });

      await newTopic.save();

      await User.findByIdAndUpdate(req.user.id, {
        $push: { subscribedTopics: newTopic._id },
      });

      topicSubject.setTopic(newTopic).setAction("created").notifyObservers();

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.render("topics/create", {
        user: req.user,
        error: "Failed to create topic",
      });
    }
  },

  subscribeTopic: async (req, res) => {
    try {
      const topicId = req.params.id;

      const topic = await Topic.findById(topicId);
      if (!topic) {
        return res.status(404).render("error", {
          user: req.user,
          error: "Topic not found",
        });
      }

      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { subscribedTopics: topicId },
      });

      await Topic.findByIdAndUpdate(topicId, {
        $addToSet: { subscribers: req.user.id },
      });

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.status(500).render("error", {
        user: req.user,
        error: "Server error",
      });
    }
  },

  unsubscribeTopic: async (req, res) => {
    try {
      const topicId = req.params.id;

      await User.findByIdAndUpdate(req.user.id, {
        $pull: { subscribedTopics: topicId },
      });

      await Topic.findByIdAndUpdate(topicId, {
        $pull: { subscribers: req.user.id },
      });

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.status(500).render("error", {
        user: req.user,
        error: "Server error",
      });
    }
  },

  getTopicStats: async (req, res) => {
    try {
      const topics = await Topic.find()
        .sort({ accessCount: -1 })
        .populate("creator", "username");

      res.render("topics/stats", {
        topics,
        user: req.user,
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
module.exports = topicController;
