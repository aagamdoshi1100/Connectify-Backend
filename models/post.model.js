const mongoose = require("mongoose");
const user = require("../models/authentication.model");

const postSchema = new mongoose.Schema(
  {
    content: String,
    image: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    likedBy: [String],
    comment: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        content: String,
        date: String,
        time: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const post = new mongoose.model("post", postSchema);
module.exports = post;
