const Leave = require("../models/leave");

const getLeave = async (req, res) => {
    try {

        const leave = await Leave.findOne({ user_id: req.user.id });

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave not found" });
        }

        return res.status(200).json({ success: true, data: leave, message: "Leave get successfully!" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

module.exports = {
    getLeave
}