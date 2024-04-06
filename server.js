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
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let clientsInRoom = [];
io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on("Join_Room", async (data) => {
    socket.join(data.roomId);
    clientsInRoom = [...clientsInRoom, { [data.senderId]: socket.id }];
    console.log(clientsInRoom);
  });

  socket.on("Send_Message", async (data) => {
    console.log(data);
    const type1 = data.senderId + data.recipientId;
    const type2 = data.recipientId + data.senderId;
    recipientSocket = clientsInRoom.find((clientDetails) =>
      Object.keys(clientDetails).includes(data.recipientId)
    );
    console.log(type1, type2, "types", recipientSocket);
    try {
      // Check room exist or not
      const findRoom = await chat.findOne({
        $or: [{ room: type1 }, { room: type2 }],
      });
      // if room not exist then create room and add first message
      if (!findRoom) {
        const newChatRoom = await chat.create({
          chats: [data],
          room: type1,
          user1: data.senderId,
          user2: data.recipientId,
        });
        // If the recipient is offline then do not emit
        if (recipientSocket) {
          io.to(recipientSocket[data.recipientId]).emit(
            "Receive_Message",
            data
          );
        }
      } else {
        findRoom.chats.push(data);
        await findRoom.save();
        if (recipientSocket) {
          // If the recipient is offline then do not emit
          io.to(recipientSocket[data.recipientId]).emit(
            "Receive_Message",
            data
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("disconnect", () => {
    clientsInRoom = clientsInRoom.filter(
      (socketId) => !Object.values(socketId).includes(socket.id)
    );
    console.log(`User ${socket.id} disconnected`);
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
