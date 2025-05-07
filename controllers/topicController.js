const Topic = require("../models/Topic");
const User = require("../models/User");
const Message = require("../models/Message");
const { topicSubject } = require("../observers/topicObserver");

const topicController = {
  getAllTopics: async (req, res) => {
    try {
      const topics = await Topic.find().populate("creator", "username");

      // Important: Always pass the user object
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

      // Increment access count using Observer pattern
      await topic.incrementAccessCount();
      topicSubject.setTopic(topic).setAction("access").notifyObservers();

      // Get messages for this topic
      const messages = await Message.find({ topic: topic._id })
        .sort({ createdAt: -1 })
        .populate("author", "username");

      // Important: Always pass the user object
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

      // Check if topic already exists
      const existingTopic = await Topic.findOne({ title });
      if (existingTopic) {
        return res.render("topics/create", {
          user: req.user,
          error: "Topic already exists",
        });
      }

      // Create new topic
      const newTopic = new Topic({
        title,
        description,
        creator: req.user.id,
        subscribers: [req.user.id], // Creator is automatically subscribed
      });

      await newTopic.save();

      // Update user's subscribed topics
      await User.findByIdAndUpdate(req.user.id, {
        $push: { subscribedTopics: newTopic._id },
      });

      // Notify observers
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

      // Check if topic exists
      const topic = await Topic.findById(topicId);
      if (!topic) {
        return res.status(404).render("error", {
          user: req.user,
          error: "Topic not found",
        });
      }

      // Update user's subscribed topics
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { subscribedTopics: topicId },
      });

      // Update topic's subscribers
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

      // Update user's subscribed topics
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { subscribedTopics: topicId },
      });

      // Update topic's subscribers
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
