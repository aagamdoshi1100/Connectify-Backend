const mongoose = require("mongoose");
const user = require("./authentication.model");

const followSchema = new mongoose.Schema({
  following: [
    {
      followedUser: String,
      sender: Boolean,
      returnFollowed: Boolean,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

const follow = new mongoose.model("follow", followSchema);
module.exports = follow;
