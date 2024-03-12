const express = require("express");
const bookmark = require("../models/bookmark.model");
const { tokenVerify } = require("../middlewares/middlewares");

const bookmarkRouter = express.Router();

bookmarkRouter.post("/:postId/:userId", tokenVerify, async (req, res) => {
  console.log(req.params.postId, req.params.userId);
  try {
    const getBookmark = await bookmark.findOne({ userId: req.params.userId });
    if (!getBookmark) {
      const addBookmark = await bookmark.create({
        bookmarks: [req.params.postId],
        userId: req.params.userId,
      });
      res.status(200).json({
        message: "Bookmark created successfully",
        bookmarks: addBookmark.bookmarks,
      });
    } else {
      if (getBookmark.bookmarks.includes(req.params.postId)) {
        getBookmark.bookmarks = getBookmark.bookmarks.filter((bookmark) => {
          return bookmark !== req.params.postId;
        });
        const savebookmark = await getBookmark.save();
        res.status(200).json({
          message: "Bookmark removed successfully",
          bookmarks: savebookmark.bookmarks,
        });
      } else {
        getBookmark.bookmarks = [...getBookmark.bookmarks, req.params.postId];
        await getBookmark.save();
        res.status(200).json({
          message: "Bookmark added successfully",
          bookmarks: getBookmark.bookmarks,
        });
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

bookmarkRouter.get("/:userId", tokenVerify, async (req, res) => {
  try {
    const getBookmark = await bookmark.findOne({ userId: req.params.userId });
    if (getBookmark) {
      res.status(200).json({ bookmarks: getBookmark.bookmarks });
    } else {
      res.status(200).json({ bookmarks: [] });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = bookmarkRouter;
