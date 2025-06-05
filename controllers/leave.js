const Leave = require("../models/leave");
const messages = require("../constants/messages.js");  

const { leave, error } = messages;

const getLeave = async (req, res) => {
  try {
    const userLeave = await Leave.findOne({ user_id: req.user.id });

    if (!userLeave) {
      return res.status(404).json({ success: false, message: leave.notFound });
    }

    return res.status(200).json({
      success: true,
      data: userLeave,
      message: leave.fetchSuccess,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message});
  }
};

module.exports = {
  getLeave,
};
