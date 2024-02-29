const express = require("express");
const bookmark = require("../models/bookmark.model");

const bookmarkRouter = express.Router();

bookmarkRouter.post("/:postId/:userId", async (req, res) => {
  console.log(req.params.postId, req.params.userId);
  try {
    const getBookmark = await bookmark.findOne({ userId: req.params.userId });
    if (!getBookmark) {
      const addBookmark = await bookmark.create({
        bookmarks: [req.params.postId],
        userId: req.params.userId,
      });
      res.status(200).json({
        success: true,
        message: "bookmark created successfully",
        bookmarks: addBookmark.bookmarks,
      });
    } else {
      if (getBookmark.bookmarks.includes(req.params.postId)) {
        getBookmark.bookmarks = getBookmark.bookmarks.filter((bookmark) => {
          return bookmark !== req.params.postId;
        });
        const savebookmark = await getBookmark.save();
        res.status(200).json({
          success: true,
          message: "bookmark removed successfully",
          bookmarks: savebookmark.bookmarks,
        });
      } else {
        getBookmark.bookmarks = [...getBookmark.bookmarks, req.params.postId];
        await getBookmark.save();
        res.status(200).json({
          success: true,
          message: "bookmark added successfully",
          bookmarks: getBookmark.bookmarks,
        });
      }
    }
  } catch (e) {
    res.status(500).json({ success: false, message: "Server Error", e });
  }
});

bookmarkRouter.get("/:userId", async (req, res) => {
  try {
    const getBookmark = await bookmark.findOne({ userId: req.params.userId });
    res.status(200).json({ success: true, bookmarks: getBookmark.bookmarks });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server Error", e });
  }
});

module.exports = bookmarkRouter;
