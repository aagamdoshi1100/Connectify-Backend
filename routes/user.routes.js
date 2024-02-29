const express = require("express");
const post = require("../models/post.model");
const user = require("../models/authentication.model");
const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  try {
    const users = await user.find({});
    const removePassword = users.map((userDetails) => {
      const { password, ...rest } = userDetails._doc;
      return rest;
    });
    if (users.length > 0) {
      res
        .status(200)
        .json({ message: `${users.length} found`, users: removePassword });
    } else {
      res.status(404).json({ message: "Users not found" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

userRouter.get("/:userId/profile", async (req, res) => {
  try {
    const userData = await user.findById(req.params.userId);
    if (!userData) {
      res.status(404).json({ message: "User not found" });
    }
    const {
      _doc: { password, ...userDataWithoutPassword },
    } = userData;
    res.status(200).json({
      message: "Profile fetched",
      profile: userDataWithoutPassword,
    });
  } catch (e) {
    res.status(500).json(e);
    console.error(e);
  }
});

userRouter.post("/:userId/profileImage", async (req, res) => {
  try {
    const response = await user.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
    });
    if (req.body.profileIcon !== "") {
      const postDetails = {
        content: "",
        image: req.body.profileIcon,
        user: req.params.userId,
        like: 0,
        dislike: 0,
      };
      const newPostCreationResponse = await post.create(postDetails);
    }
    const {
      _doc: { password, ...userProfileWithoutPassword },
    } = response;
    res.status(200).json({
      message: "Profile image updated",
      profile: userProfileWithoutPassword,
    });
  } catch (e) {
    res.status(500).json(e);
    console.error(e);
  }
});

userRouter.post("/:userId/edit", async (req, res) => {
  console.log(req.body);
  try {
    const response = await user.findByIdAndUpdate(
      req.params.userId,
      req.body.data,
      { new: true },
    );
    const {
      _doc: { password, ...userProfileWithoutPassword },
    } = response;
    res.status(200).json({
      message: "Profile updated",
      profile: userProfileWithoutPassword,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

module.exports = userRouter;
