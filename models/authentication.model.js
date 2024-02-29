const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: String,
    username: String,
    firstname: String,
    lastname: String,
    profileIcon: String,
    dob: {
      type: String,
      defaut: "",
    },
    bio: {
      type: String,
      defaut: "",
    },
    country: {
      type: String,
      defaut: "",
    },
    interestArr: [String],
  },
  {
    timestamps: true,
  },
);

const user = new mongoose.model("user", userSchema);
module.exports = user;
