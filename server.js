const express = require("express");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
app.use(cors());
dotenv.config();
const chat = require("./models/chat.model");
const postRouter = require("./routes/post.routes");
const authRouter = require("./routes/authentication.routes");
const bookmarkRouter = require("./routes/bookmark.routes");
const connection = require("./database/connection");
const userRouter = require("./routes/user.routes");
const followRouter = require("./routes/follow.routes");
const chatRouter = require("./routes/chat.routes");

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://connectify-react-app.netlify.app",
      "https://improved-fortnight-45ggpgvqjjxh7rp9-3000.app.github.dev",
      "https://improved-fortnight-45ggpgvqjjxh7rp9-3001.app.github.dev",
      "*",
    ],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("Join_Room", async (data) => {
    const type1 = data.loggedUserId + data.targetUserId;
    const type2 = data.targetUserId + data.loggedUserId;
    console.log("check_received_ids", data);
    try {
      const findRoom = await chat.findOne({
        $or: [{ room: type1 }, { room: type2 }],
      });

      if (!findRoom) {
        const newChatRoom = await chat.create({
          chats: [],
          room: type1,
          user1: data.loggedUserId,
          user2: data.targetUserId,
        });
        console.log(newChatRoom, "create_because_no_room_found");
        socket.join(newChatRoom.room);
        console.log(
          `User ${data.loggedUserId} connected to room ${newChatRoom.room}`
        );
      } else {
        console.log(
          `User ${data.loggedUserId} connected to room ${findRoom.room}`
        );
        socket.join(findRoom.room);
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("Send_Message", async (data) => {
    const type1 = data.loggedUserId + data.targetUserId;
    const type2 = data.targetUserId + data.loggedUserId;
    try {
      let updateChat = await chat.findOne({
        $or: [{ room: type1 }, { room: type2 }],
      });

      if (updateChat) {
        updateChat.chats.push(data.message);
        await updateChat.save();
        socket.to(updateChat.room).emit("Receive_Message", data.message);
      } else {
        updateChat = await chat.create({
          chats: [data.message],
          room: type1,
          user1: data.loggedUserId,
          user2: data.targetUserId,
        });
        await updateChat.save();
        socket.to(updateChat.room).emit("Receive_Message", updateChat);
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});

app.get("/", (req, res) => {
  res.send("Success");
});

app.use(express.json({ limit: "50mb" }));
app.use("/", authRouter);
app.use("/posts", postRouter);
app.use("/bookmarks", bookmarkRouter);
app.use("/users", userRouter);
app.use("/", followRouter);
app.use("/chat", chatRouter);

connection();
