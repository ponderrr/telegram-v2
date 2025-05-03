const moongoose = require("mongoose");

const TopicSchema = new moongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  creator: {
    type: moongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subscribers: [
    {
      type: moongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  accessCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

TopicSchema.methods.incrementAccessCount = async function () {
  this.accessCount += 1;
  await this.save();
  return this;
};

TopicSchema.methods.addSubscriber = async function (userId) {
  if (!this.subscribers.includes(userId)) {
    this.subscribers.push(userId);
    return this.save();
  }
  return this;
};

TopicSchema.methods.removeSubscriber = async function (userId) {
  this.subscribers = this.subscribers.filter(
    (subscriber) => subscriber.toString() !== userId.toString()
  );
  await this.save();
  return this;
};

const Topic = moongoose.model("Topic", TopicSchema);

module.exports = Topic;
