const Leave = require("../models/leave");
const Messages = require("../constants/messages");

const { Leave: LeaveMessages, Common } = Messages;

const getLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({ user_id: req.user.id });

    if (!leave) {
      return res
        .status(404)
        .json({ success: false, message: LeaveMessages.NOT_FOUND });
    }

    return res
      .status(200)
      .json({
        success: true,
        data: leave,
        message: LeaveMessages.FETCH_SUCCESS,
      });
  } catch (error) {
    return res
      .status(400)
      .json({
        success: false,
        message: error.message || Common.SOMETHING_WENT_WRONG,
      });
  }
};

module.exports = {
  getLeave,
};
