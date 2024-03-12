const express = require("express");
const post = require("../models/post.model");

const postRouter = express.Router();
const { tokenVerify } = require("../middlewares/middlewares");

postRouter.get("/", tokenVerify, async (req, res) => {
  try {
    const posts = await post
      .find({})
      .populate("user", "firstname lastname username _id profileIcon");
    res.status(200).json({
      posts,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

postRouter.post("/:userId/post", tokenVerify, async (req, res) => {
  try {
    const newPostCreationResponse = await post.create(req.body);
    const postWithUserDetailsPopulated = await newPostCreationResponse.populate(
      "user",
      "firstname lastname username _id profileIcon"
    );
    res.status(201).json({
      message: "New post created",
      data: postWithUserDetailsPopulated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

postRouter.post("/:postId/likeHandler", tokenVerify, async (req, res) => {
  try {
    const getPost = await post.findOne({ _id: req.params.postId });
    if (getPost.likedBy.includes(req.body.likedBy)) {
      getPost.likedBy = getPost.likedBy.filter(
        (item) => item !== req.body.likedBy
      );
      await getPost.save();
      res.status(200).json({
        postId: req.params.postId,
        likedBy: req.body.likedBy,
        message: "Post disliked",
      });
    } else {
      getPost.likedBy = [...getPost.likedBy, req.body.likedBy];
      await getPost.save();
      res.status(200).json({
        postId: req.params.postId,
        likedBy: req.body.likedBy,
        message: "Post liked",
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

postRouter.post("/edit/:postId", tokenVerify, async (req, res) => {
  try {
    const isPostExist = await post.findOne({ _id: req.params.postId });
    if (!isPostExist) {
      res
        .status(404)
        .json({ message: "Post not found or invalid edit post request" });
    } else {
      const editedPost = await post
        .findOneAndUpdate({ _id: req.params.postId }, req.body.data, {
          new: true,
        })
        .populate("user", "firstname lastname username _id profileIcon");
      res.status(200).json({ editedPost });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

postRouter.delete("/:postId", tokenVerify, async (req, res) => {
  try {
    const deletedPost = await post.findOneAndDelete({
      _id: req.params.postId,
    });
    if (!deletedPost) {
      res.status(404).json({ message: "Post not found" });
    } else {
      res.status(200).json({ deletedPost });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

postRouter.post("/:postId/comment", tokenVerify, async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      message: "The request body is missing or invalid",
    });
  }
  try {
    const getPostById = await post.findOne({ _id: req.params.postId });
    if (!getPostById) {
      res.status(404).json({
        message: " The post with the specified ID does not exist.",
      });
    } else {
      getPostById.comment = [...getPostById.comment, req.body];
      const updatedResponse = await getPostById.save();
      res.status(201).json({
        message: "Comment added successfully",
        data: updatedResponse.comment,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = postRouter;
