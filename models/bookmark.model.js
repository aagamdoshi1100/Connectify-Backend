const mongoose = require("mongoose");
const user = require("./authentication.model");
const post = require("./post.model");

const bookmarkSchema = new mongoose.Schema({
      bookmarks: [String],
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
});

const bookmark = new mongoose.model("bookmark", bookmarkSchema);
module.exports = bookmark;
