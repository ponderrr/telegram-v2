const Topic = require("../models/Topic");
const User = require("../models/User");
const Message = require("../models/Message");
const { topicSubject } = require("../observers/topicObserver");

const topicController = {
  getAllTopics: async (req, res) => {
    try {
      const topics = await Topic.find().populate("creator", "username");
      res.render("topics/all", { topics });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  getTopicById: async (req, res) => {
    try {
      const topic = await Topic.findById(req.params.id)
        .populate("creator", "username")
        .populate("subscribers", "username");

      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      // observer pattern
      await topic.incrementAccessCount();
      topicSubject.setTopic(topic).setAction("access").notifyObservers();

      const messages = await Message.find({ topic: topic._id })
        .sort({ createdAt: -1 })
        .populate("author", "username");

      res.render("topics/view", { topic, messages });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  getCreateTopicForm: (req, res) => {
    res.render("topics/create");
  },

  createTopic: async (req, res) => {
    try {
      const { title, description } = req.body;

      const existingTopic = await Topic.findOne({ title });
      if (existingTopic) {
        return res.status(400).json({ message: "Topic already exists" });
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
      res.status(500).json({ message: "Server error" });
    }
  },

  subscribeTopic: async (req, res) => {
    try {
      const topicId = req.params.id;
      const userId = req.user.id;

      const topic = await Topic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      await topic.addSubscriber(userId);

      const user = await User.findById(userId);
      await user.subscribeTopic(topicId);

      topicSubject.setTopic(topic).setAction("subscribed").notifyObservers();

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  unsubscribeTopic: async (req, res) => {
    try {
      const topicId = req.params.id;
      const userId = req.user.id;

      const topic = await Topic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      await topic.removeSubscriber(userId);

      const user = await User.findById(userId);
      await user.unsubscribeTopic(topicId);

      topicSubject.setTopic(topic).setAction("unsubscribed").notifyObservers();

      res.redirect("/dashboard");
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  getTopicStats: async (req, res) => {
    try {
      const topics = await Topic.find().sort({ accessCount: -1 });
      res.render("topics/stats", { topics });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = topicController;
