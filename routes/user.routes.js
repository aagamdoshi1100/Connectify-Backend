const express = require("express");
const post = require("../models/post.model");
const user = require("../models/authentication.model");
const { tokenVerify } = require("../middlewares/middlewares");
const feedback = require("../models/feedback.model");
const userRouter = express.Router();

userRouter.get("/", tokenVerify, async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

userRouter.get("/:reqUserProfileId/profile", tokenVerify, async (req, res) => {
  try {
    const userData = await user.findById(req.params.reqUserProfileId);
    if (!userData) {
      res.status(404).json({ message: "User not found" });
    } else {
      const {
        _doc: { password, ...userDataWithoutPassword },
      } = userData;
      res.status(200).json({
        message: "Profile fetched",
        profile: userDataWithoutPassword,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

userRouter.put("/:userId/profileImage", tokenVerify, async (req, res) => {
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
      await post.create(postDetails); //This will update profile pic and post will be created with the profile pic
    }
    const {
      _doc: { password, ...userProfileWithoutPassword },
    } = response;
    res.status(200).json({
      message: "Profile image updated",
      profile: userProfileWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

userRouter.put("/:userId/edit", tokenVerify, async (req, res) => {
  try {
    const response = await user.findByIdAndUpdate(
      req.params.userId,
      req.body.data,
      { new: true }
    );
    const {
      _doc: { password, ...userProfileWithoutPassword },
    } = response;
    res.status(200).json({
      message: "Profile updated",
      profile: userProfileWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

userRouter.delete("/:userId/delete", tokenVerify, async (req, res) => {
  try {
    const userRes = await user.findByIdAndDelete(req.params.userId);
    if (!userRes) {
      res.status(404).json({
        message: `User ${req.params.userId} not found or may be already deleted`,
      });
    } else {
      res.status(200).json({
        message: `User ${userRes.username} has been deleted`,
        userId: req.params.userId,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

userRouter.post("/:userId/feedback", tokenVerify, async (req, res) => {
  try {
    const isFeedbackAlreadyGiven = await feedback.findOne({
      userId: req.params.userId,
    });
    if (!isFeedbackAlreadyGiven) {
      const create = await feedback.create({
        ...req.body,
        rating: [req.body.rating],
        message: [req.body.message],
      });
      res.status(201).json({
        message: "Feedback submitted",
        feedback: create,
      });
    } else {
      isFeedbackAlreadyGiven.rating.push(req.body.rating);
      isFeedbackAlreadyGiven.message.push(req.body.message);
      await isFeedbackAlreadyGiven.save();
      res.status(201).json({
        message: "Feedback submitted",
        feedback: isFeedbackAlreadyGiven,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

userRouter.get("/:userId/search/:keyword", tokenVerify, async (req, res) => {
  try {
    const getUser = await user.find({
      $or: [
        { username: { $regex: new RegExp(req.params.keyword, "i") } },
        { name: { $regex: new RegExp(req.params.keyword, "i") } },
        { lastname: { $regex: new RegExp(req.params.keyword, "i") } },
      ],
    });
    const removePasswordFromData = getUser.map((user) => {
      const {
        _doc: { password, ...restDetails },
      } = user;
      return {
        ...restDetails,
      };
    });
    res.status(200).json({
      data: removePasswordFromData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = userRouter;
