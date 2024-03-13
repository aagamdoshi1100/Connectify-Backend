const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const user = require("../models/authentication.model");
const {
  isAccountExist,
  accountNotExist,
} = require("../middlewares/middlewares");

const JWT_SECRET = process.env.SECRET;

const authRouter = express.Router();

authRouter.post("/login", accountNotExist, async (req, res) => {
  const { username, password } = req.body;
  try {
    const response = await user.findOne({ username });
    const decoded = await bcrypt.compare(password, response.password);
    if (response.username === username && decoded) {
      const userId = response._id;
      const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" });
      res
        .status(200)
        .json({ loggedInUser: response, message: "Login success", token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.post("/signup", isAccountExist, async (req, res) => {
  const { email, username, password, firstname, lastname } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const response = await user.create({
      email,
      username,
      password: hashedPassword,
      firstname,
      lastname,
      profileIcon: "",
      dob: "",
      bio: "",
      country: "",
    });
    const token = jwt.sign({ username: response._id }, JWT_SECRET);
    res.status(201).json({
      message: "New user created",
      data: { createdUser: response, token },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = authRouter;
