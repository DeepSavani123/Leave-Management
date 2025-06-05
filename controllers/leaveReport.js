const Leave = require("../models/leave");
const messages = require("../constants/messages.js");  

const { leave, error } = messages;

const getLeaveReport = async (req, res) => {
  try {
    const leaves = await Leave.find().populate({
      path: "user_id",
      select: "name email role",
      populate: {
        path: "role",
        select: "name",
      },
    });

    const report = leaves
      .filter((leave) => leave.user_id && leave.user_id.role)
      .map((leave) => ({
        name: leave.user_id.name,
        email: leave.user_id.email,
        role: leave.user_id.role.name,
        used_leave: leave.used_leave,
        available_leave: leave.available_leave,
        total_leave: leave.total_leave,
        academic_year: leave.academic_year || "N/A",
      }));

    const leaderboard = [...report]
      .sort((a, b) => b.used_leave - a.used_leave)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        report,
        leaderboard,
      },
      message: leave.reportFetchSuccess,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: leave.reportFetchFailed ||  error.defaultError,
    });
  }
};

module.exports = { getLeaveReport };
