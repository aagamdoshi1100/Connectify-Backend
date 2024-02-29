const express = require("express");
const post = require("../models/post.model");

const postRouter = express.Router();
const { tokenVerify } = require("../middlewares/middlewares");

postRouter.get("/", async (req, res) => {
  try {
    const posts = await post
      .find({})
      .populate("user", "firstname lastname username _id profileIcon");
    res.status(200).json({
      success: true,
      posts,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
    console.log(e, "posts");
  }
});

postRouter.post("/:userId/post", tokenVerify, async (req, res) => {
  try {
    const newPostCreationResponse = await post.create(req.body);
    const postWithUserDetailsPopulated = await newPostCreationResponse.populate(
      "user",
      "firstname lastname email username _id",
    );
    res.status(201).json({
      message: "New post created",
      data: postWithUserDetailsPopulated,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error", e });
  }
});

postRouter.post("/:postId/likeHandler", async (req, res) => {
  try {
    const getPost = await post.findOne({ _id: req.params.postId });
    if (getPost.likedBy.includes(req.body.likedBy)) {
      getPost.likedBy = getPost.likedBy.filter(
        (item) => item !== req.body.likedBy,
      );
    } else {
      getPost.likedBy = [...getPost.likedBy, req.body.likedBy];
    }
    const savePost = await getPost.save();
    res.status(201).json({
      success: true,
      postId: req.params.postId,
      likedBy: req.body.likedBy,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error", e });
  }
});

postRouter.post("/edit/:postId", async (req, res) => {
  try {
    const editedPost = await post.findOneAndUpdate(
      { _id: req.params.postId },
      req.body,
      { new: true },
    );
    res.status(201).json({ success: true, editedPost });
  } catch (e) {
    res.status(500).json({ message: "Server Error", e });
  }
});

postRouter.delete("/:postId", async (req, res) => {
  try {
    const deletedPost = await post.findOneAndDelete({
      _id: req.params.postId,
    });
    res.status(200).json({ success: true, deletedPost });
  } catch (e) {
    res.status(500).json({ message: "Server Error", e });
  }
});

module.exports = postRouter;
