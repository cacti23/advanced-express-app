const mongoose = require("mongoose");

const User = mongoose.model("User");

// Whenever we run jest it start up new node environment and executes from the command line
// Jest then looks all the different file inside our project that end with the extension .test.js
// it loads the file and executes that file alone

module.exports = () => {
  return new User({}).save();
};
