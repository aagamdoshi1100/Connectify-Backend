const mongoose = require("mongoose");
const MongoURI = process.env.URI;

const connection = async () => {
  try {
    const response = await mongoose.connect(MongoURI, {});
    console.log("Connected to database");
  } catch (error) {
    console.log("Failed to connect database", error);
  }
};
module.exports = connection;
