const jwt = require("jsonwebtoken");
const user = require("../models/authentication.model");

const isAccountExist = async (req, res, next) => {
  const userExist = await user.findOne({ username: req.body.username });
  if (userExist) {
    res
      .status(409)
      .json({ message: `User ${req.body.username} already exist` });
  } else {
    next();
  }
};

const accountNotExist = async (req, res, next) => {
  const userExist = await user.findOne({ username: req.body.username });
  if (!userExist) {
    return res
      .status(404)
      .json({ message: `User ${req.body.username} do not exist` });
  } else {
    next();
  }
};

const tokenVerify = async (req, res, next) => {
  try {
    console.log(req.params.userId, req.body.userId, req.query.userId);
    const decoded = jwt.verify(req.headers.authorization, process.env.SECRET);
    const getUsername = await user.findOne({
      _id: req.params.userId || req.body.userId || req.query.userId,
    });
    if (!getUsername) {
      return res.status(404).json({ message: "User not found" });
    }
    if (decoded.username === getUsername.username) {
      next();
    }
  } catch (err) {
    res
      .status(401)
      .json({ message: "Unauthorized access, please provide valid token" });
  }
};
module.exports = { isAccountExist, accountNotExist, tokenVerify };
