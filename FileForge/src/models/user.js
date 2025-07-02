const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v); // Validate a 10 digit number
      },
      message:`Please enter the valid phone number!`,
    },
  },
  password: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
