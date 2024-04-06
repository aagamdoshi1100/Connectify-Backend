const mongoose = require("mongoose");
const user = require("./authentication.model");

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  rating: [],
  message: [],
});

const feedback = new mongoose.model("feedback", feedbackSchema);
module.exports = feedback;
