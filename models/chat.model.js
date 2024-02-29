const mongoose = require("mongoose");
const user = require("./authentication.model");

const chatSchema = new mongoose.Schema({
  chats: [
    {
      username: String,
      message: String,
      date: String,
      time: String,
    },
  ],
  room: String,
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

const chat = new mongoose.model("chat", chatSchema);
module.exports = chat;
