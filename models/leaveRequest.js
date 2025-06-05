const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },

    request_to_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    leave_type: {
      type: String,
      enum: ["First half", "Second half", "Full day"],
    },

    reason: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

   is_leave_applied: {
    type: Boolean,
    default: false, 
  },
  },
  { timestamps: true }
);

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

module.exports = LeaveRequest;
