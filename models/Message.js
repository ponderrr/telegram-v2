const moongoose = require("mongoose");

const MessageSchema = new moongoose.Schema({
  context: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: moongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  topic: {
    type: moongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MessageSchema.index({ topic: 1, createdAt: -1 });

const Message = moongoose.model("Message", MessageSchema);

module.exports = Message;
