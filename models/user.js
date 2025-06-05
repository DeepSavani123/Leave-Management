// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId; // password required if not using Google
      },
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
    },

    image: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },

    otp: {
      type: Number,
      default: null,
    },

    otpExpireAt: {
      type: Date,
      default: Date.now,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordTokenExpireAt: {
      type: Date,
      dafault: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
