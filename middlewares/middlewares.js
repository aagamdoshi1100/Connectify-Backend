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

  const decoded = jwt.verify(req.headers.authorization, process.env.SECRET);
  const getUsername = await user.findOne({ _id: req.params.userId });
  if (decoded.username === getUsername.username) {
    next();
  } else {
    res
      .status(401)
      .json({ message: "Unauthorized access, please provide valid token" });
  }
};
module.exports = { isAccountExist, accountNotExist, tokenVerify };