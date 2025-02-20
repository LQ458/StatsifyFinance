import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  conversationId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    default: "新对话",
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 更新updatedAt字段
chatSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// 创建索引
chatSchema.index({ userId: 1, conversationId: 1 });
chatSchema.index({ updatedAt: -1 });

export const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
