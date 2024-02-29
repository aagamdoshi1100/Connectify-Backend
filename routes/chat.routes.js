const express = require("express");
const mongoose = require("mongoose");
const chat = require("../models/chat.model");
const chatRouter = express.Router();

chatRouter.get("/user/:loggedUserId", async (req, res) => {
  console.log(req.params.loggedUserId, "s1");
  try {
    const response = await chat.find({
      $or: [{ user1: req.params.loggedUserId }, { user2: req.params.loggedUserId }]
    }).populate("user1","_id firstname lastname username profileIcon").populate("user2","_id firstname lastname username profileIcon");
   
    const filteredDetails = response.map((item) =>{
      if(item.user1._id.equals(new mongoose.Types.ObjectId(req.params.loggedUserId))){
        return {
          _id: item._id,
          chats: item.chats,
          recipient: item.user2
        }
      }else{
        return {
          _id: item._id,
          chats: item.chats,
          recipient: item.user1
        }
      }
    })

    res.status(200).json({
      message: `All chats found of ${req.params.loggedUserId}`,
      data: filteredDetails,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

chatRouter.get("/:loggedUserId/:targetUserId", async (req, res) => {
  const type1 = req.params.loggedUserId + req.params.targetUserId;
  const type2 = req.params.targetUserId + req.params.loggedUserId;
  console.log("s2")
  try {
    const getCurrentChat = await chat.findOne({
      $or: [{ room: type1 }, { room: type2 }],
    });
    if (getCurrentChat) {
      res.status(200).json({
        message: "User chat found",
        data: getCurrentChat,
      });
    }
    //  else {
    //   const newChat = await chat.create({
    //     chats: [],
    //     room: type1,
    //     user1: req.params.loggedUserId,
    //     user2: req.params.targetUserId,
    //   });
    //   console.log(newChat, "newChat_created_58");
    //   res.status(201).json({
    //     message: "Chat Created",
    //     data: newChat,
    //   });
    // }
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

module.exports = chatRouter;
