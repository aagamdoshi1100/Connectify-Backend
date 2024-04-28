const express = require("express");
const mongoose = require("mongoose");
const chat = require("../models/chat.model");
const chatRouter = express.Router();

chatRouter.get("/user/:loggedUserId", async (req, res) => {
  try {
    const response = await chat
      .find({
        $or: [
          { user1: req.params.loggedUserId },
          { user2: req.params.loggedUserId },
        ],
      })
      .populate("user1", "_id firstname lastname username profileIcon")
      .populate("user2", "_id firstname lastname username profileIcon");

    const filteredDetails = response.map((item) => {
      if (
        item.user1._id.equals(
          new mongoose.Types.ObjectId(req.params.loggedUserId)
        )
      ) {
        return {
          _id: item._id,
          chats: item.chats,
          recipient: item.user2,
        };
      } else {
        return {
          _id: item._id,
          chats: item.chats,
          recipient: item.user1,
        };
      }
    });

    res.status(200).json({
      message: `All chats found of ${req.params.loggedUserId}`,
      data: filteredDetails,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

chatRouter.get("/:senderId/:recipientId", async (req, res) => {
  const type1 = req.params.senderId + req.params.recipientId;
  const type2 = req.params.recipientId + req.params.senderId;
  try {
    const isRoomExistForProfile = await chat.findOne({
      $or: [{ room: type1 }, { room: type2 }],
    });
    if (isRoomExistForProfile) {
      const populateUser2 = await chat
        .findById(isRoomExistForProfile._id)
        .populate("user2", "_id firstname lastname username profileIcon");
      res.status(200).json({
        message: "Room found",
        data: {
          _id: isRoomExistForProfile._id,
          chats: isRoomExistForProfile.chats,
          recipient: populateUser2.user2,
        },
      });
    } else {
      const newRoom = await chat.create({
        chats: [],
        room: type1,
        user1: req.params.senderId,
        user2: req.params.recipientId,
      });
      const populatedUserDetails = await chat
        .findById(newRoom._id)
        .populate("user2", "_id firstname lastname username profileIcon");

      console.log(newRoom, "newRoom_created", populatedUserDetails);
      res.status(201).json({
        message: "Room Created",
        data: {
          _id: newRoom._id,
          chats: newRoom.chats,
          recipient: populatedUserDetails.user2,
        },
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

module.exports = chatRouter;
