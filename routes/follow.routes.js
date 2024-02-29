const express = require("express");
const follow = require("../models/follow.model");

const followRouter = express.Router();

followRouter.get("/:userId", async (req, res) => {
  try {
    const getFollow = await follow.findOne({ user: req.params.userId });
    const followArr = await follow.find({});

    if (!getFollow) {
      const addFollow = await follow.create({
        following: [],
        user: req.params.userId,
      });
      res.status(201).json({
        message: `Follow details added`,
        response: followArr,
      });
    } else {
      res.status(200).json({
        message: `Follow details fetched`,
        response: followArr,
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

followRouter.get("/:userId/:followingId", async (req, res) => {
  try {
    const reqSender = await follow.findOne({ user: req.params.userId });
    const reqReceiver = await follow.findOne({ user: req.params.followingId });

    if (
      reqSender.following.find(
        (checkIfAlreadyFollowed) =>
          checkIfAlreadyFollowed.followedUser === req.params.followingId,
      )
    ) {
      //Steps to unfollow
      //   const findAllToUnfollow = await follow.find({})  // will send all obj after saved
      reqSender.following = reqSender.following.filter(
        (checkIfAlreadyFollowed) =>
          checkIfAlreadyFollowed.followedUser !== req.params.followingId,
      );
      reqReceiver.following = reqReceiver.following.filter(
        (checkIfAlreadyFollowed) =>
          checkIfAlreadyFollowed.followedUser !== req.params.userId,
      );
    } else {
      //Steps to follow
      reqSender.following = [
        ...reqSender.following,
        {
          followedUser: req.params.followingId, // insert the id of the user you want to follow
          sender: true,
          returnFollowed: false,
        },
      ];
      reqReceiver.following = [
        ...reqReceiver.following,
        {
          followedUser: req.params.userId, // insert id who is following
          sender: false,
          returnFollowed: false, // Need to think
        },
      ];
    }
    await reqSender.save();
    await reqReceiver.save();
    const followArr = await follow.find({}); // will send all obj after saved
    res.status(200).json({ response: followArr });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

followRouter.get("/:userId/:followingId/followBack", async (req, res) => {
  try {
    const sender = await follow.findOne({ user: req.params.followingId });
    const recipient = await follow.findOne({ user: req.params.userId });
    if (sender) {
      sender.following = sender.following.map((obj) => {
        if (obj.followedUser === req.params.userId) {
          obj.returnFollowed = true; //followback sender side
        }
        return obj;
      });

      recipient.following = recipient.following.map((obj) => {
        if (obj.followedUser === req.params.followingId) {
          obj.returnFollowed = true; //followback recipient side
        }
        return obj;
      });
    }
    await sender.save();
    await recipient.save();
    const followArr = await follow.find({});
    res.status(200).json({
      message: `User ${req.params.userId} followed back`,
      response: followArr,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = followRouter;
