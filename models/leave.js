// models/UserLeave.js
const mongoose = require("mongoose");

const userLeaveSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    total_leave: {
      type: Number,
      required: true,
    },

    available_leave: {
      type: Number,
      required: true,
    },

    used_leave: {
      type: Number,
      required: true,
    },

    academic_year: {
      type: String,
    },

    total_working_days: {
      type: Number,
      default: 200,
    },

    attendance_percentage: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Leave = mongoose.model("Leave", userLeaveSchema);

module.exports = Leave;
