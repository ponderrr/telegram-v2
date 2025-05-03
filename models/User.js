const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  subscribedTopics: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new Error("Error comparing password");
  }
};

UserSchema.methods.subscribeTopic = async function (topicId) {
  if (!this.subscribedTopics.includes(topicId)) {
    this.subscribedTopics.push(topicId);
    await this.save();
  }
  return this;
};

UserSchema.methods.unsubscribeTopic = async function (topicId) {
  this.subscribedTopics = this.subscribedTopics.filter(
    (topic) => topic.toString() !== topicId.toString()
  );
  await this.save();
  return this;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
