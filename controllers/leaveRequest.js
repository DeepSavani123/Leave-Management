const mongoose = require("mongoose");
const Leave = require("../models/leave");
const LeaveRequest = require("../models/leaveRequest");
const User = require("../models/user.js");
const messages = require("../constants/messages.js");  
const { leave, error, leaveRequest } = messages;

const applyLeave = async (req, res) => {
  try {
    const { start_date, end_date, request_to_id, leave_type, reason } = req.body;

    await LeaveRequest.create({
      user_id: req.user.id,
      start_date,
      end_date,
      request_to_id,
      leave_type,
      reason,
      status: "Pending",
    });

    return res.status(201).json({ success: true, message: leave.applySuccess });
  } catch (err) {
    return res.status(400).json({ success: false, message:  error.defaultError });
  }
};

const approveLeave = async (req, res) => {
  try {
    const { status, id } = req.body;
    const newStatus = status;

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found!" });
    }
    
    const originalStatus = leaveRequest.status

    if (originalStatus === "Rejected" && newStatus === "Approved") {
      return res
        .status(400)
        .json({ message: "Cannot approve a leave that has already been rejected." });
    }

    const isHalfDay =
      leaveRequest.leave_type === "First half" ||
      leaveRequest.leave_type === "Second half";
    const leaveValuePerDay = isHalfDay ? 0.5 : 1;

    const startDate = new Date(leaveRequest.start_date);
    const endDate = new Date(leaveRequest.end_date);
    const totalDays =
      Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const totalLeaveDays = leaveValuePerDay * totalDays;

    let usedLeaveAdjustment = 0;
    if (originalStatus === "Pending" && newStatus === "Approved") {
      usedLeaveAdjustment = totalLeaveDays;
    }

  
    else if (originalStatus === "Approved" && newStatus === "Rejected") {
      usedLeaveAdjustment = -totalLeaveDays;
    }


    else if (originalStatus === "Pending" && newStatus === "Rejected") {
      usedLeaveAdjustment = 0; 
    }

    await LeaveRequest.updateOne({ _id: id }, { $set: { status: newStatus } });

 
    if (usedLeaveAdjustment !== 0) {
      const userLeave = await Leave.findOne({ user_id: leaveRequest.user_id });
      if (!userLeave) {
        return res
          .status(404)
          .json({ message: "User leave record not found!" });
      }

      const updatedUsedLeave = userLeave.used_leave + usedLeaveAdjustment;

      if (updatedUsedLeave < 0) {
        return res
          .status(400)
          .json({ message: "Used leave cannot be negative." });
      }

      if (updatedUsedLeave > userLeave.total_leave) {
        return res
          .status(400)
          .json({ message: "Used leave exceeds total leave." });
      }

      const updatedAvailableLeave = userLeave.total_leave - updatedUsedLeave;

      await Leave.updateOne(
        { user_id: leaveRequest.user_id },
        {
          $set: {
            used_leave: updatedUsedLeave,
            available_leave: updatedAvailableLeave,
          },
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Leave request ${newStatus.toLowerCase()} successfully!`,
    });
  } catch (err) {
    console.error("Leave approval error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};


const getIndividualLeave = async (req, res) => {
  try {
    const { id } = req.user;
    const { page = 1, limit = 10, sort = "start_date:desc", search = "" } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let sortField = "start_date";
    let sortOrder = -1;

    if (sort) {
      const [field, order] = sort.split(":");
      sortField = field?.trim() || "start_date";
      sortOrder = order?.trim() === "asc" ? 1 : -1;
    }

    const leave = await LeaveRequest.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "request_to_id",
          foreignField: "_id",
          as: "request_to_name",
          pipeline: [{ $project: { name: 1, _id: 0 } }],
        },
      },
      { $unwind: { path: "$request_to_name" } },
      { $addFields: { request_to: "$request_to_name.name" } },
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(id),
          $or: [{ request_to: { $regex: search, $options: "i" } }],
        },
      },
      {
        $project: {
          start_date: 1,
          end_date: 1,
          leave_type: 1,
          reason: 1,
          status: 1,
          request_to: 1,
        },
      },
      { $sort: { [sortField]: sortOrder } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limitNumber }],
        },
      },
    ]);

    if (!leave || leave.length === 0) {
      return res.status(400).json({ success: false, message: leave.leaveRequestsNotFound });
    }

    const data = leave[0].data;
    const totalLeaves = leave[0].metadata[0]?.total || 0;

    return res.status(200).json({
      success: true,
      data,
      page: pageNumber,
      limit: limitNumber,
      totalLeaves,
      totalPages: Math.ceil(totalLeaves / limitNumber),
      message: leaveRequest.fetchSuccess,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: error.defaultError });
  }
};

const getoneLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await LeaveRequest.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "request_to_id",
          foreignField: "_id",
          as: "request_to_name",
          pipeline: [{ $project: { name: 1, _id: 0 } }],
        },
      },
      { $unwind: { path: "$request_to_name" } },
      {
        $project: {
          start_date: 1,
          end_date: 1,
          leave_type: 1,
          reason: 1,
          status: 1,
          request_to_id: {
            label: "$request_to_name.name",
            value: "$request_to_id",
          },
        },
      },
    ]);

    if (!leave || leave.length === 0) {
      return res.status(404).json({ success: false, message: leave.leaveRequestNotFound });
    }

    return res.status(200).json({
      success: true,
      data: leave[0],
      message: leave.leaveRequestFetched,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: error.defaultError });
  }
};

const updateLeave = async (req, res) => {
  try {
    const { editId } = req.params;
    const { start_date, end_date, request_to_id, leave_type, reason } = req.body;

    const payload = { start_date, end_date, request_to_id, leave_type, reason, status: "Pending" };

    const leaveExists = await LeaveRequest.findById(editId);
    if (!leaveExists) return res.status(404).json({ success: false, message: leave.leaveRequestNotFound });

    const updatedLeave = await LeaveRequest.findByIdAndUpdate(editId, payload, { new: true });
    return res.status(200).json({
      success: true,
      data: updatedLeave,
      message: leave.updateSuccess,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: error.defaultError });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const isLeaveExists = await LeaveRequest.findById(id);
    if (!isLeaveExists) return res.status(400).json({ success: false, message: leave.leaveRequestNotFound });

    await LeaveRequest.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: leave.deleteSuccess });
  } catch (err) {
    return res.status(400).json({ success: false, message: error.defaultError });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sort } = req.query;

    let searchFilter = {};
    if (search) searchFilter = { name: { $regex: search, $options: "i" } };

    let sortOptions = { createdAt: -1 };
    if (sort) {
      sortOptions = {};
      const [key, order] = sort.split(":");
      sortOptions[key] = order === "asc" ? 1 : -1;
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;
  const fetchedLeaves = await LeaveRequest.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "user_id",
      foreignField: "_id",
      as: "user",
      pipeline: [
        {
          $lookup: {
            from: "roles",
            localField: "role",
            foreignField: "_id",
            as: "role",
            pipeline: [
              { $project: { name: 1, _id: 0 } }
            ]
          }
        },
        { $unwind: "$role" },
        { $project: { name: 1, role: "$role.name" } }
      ]
    },
  },
  { $unwind: { path: "$user" } },
  {
    $addFields: {
      name: "$user.name",
      role: "$user.role"
    }
  },
  { $match: searchFilter },
  {
    $project: {
      name: 1,
      role: 1,
      start_date: 1,
      end_date: 1,
      leave_type: 1,
      reason: 1,
      status: 1,
    },
  },
  {
    $facet: {
      data: [{ $sort: sortOptions }, { $skip: skip }, { $limit: limitNumber }],
      totalCount: [{ $count: "count" }],
    },
  },
]);

const allLeaves = fetchedLeaves[0]?.data;
const totalLeaves = fetchedLeaves[0]?.totalCount[0]?.count || 0;
const totalPages = Math.ceil(totalLeaves / limitNumber);

if (!allLeaves) return res.status(400).json({ success: false, message: leave.leavesNotFound });

return res.status(200).json({
  success: true,
  data: allLeaves,
  page: pageNumber,
  limit: limitNumber,
  totalLeaves,
  totalPages,
  message: leave.allLeavesFetched,
});

  } catch (err) {
    return res.status(400).json({ success: false, message: error.defaultError });
  }
};

const requestToOptions = async (req, res) => {
  try {
    const { role } = req.user;
    const newRole = role.toLowerCase() === "student" ? "Hod/Staff" : "Admin";
    console.log(newRole)

    const options = await User.aggregate([
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role_details",
          pipeline: [{ $project: { name: 1, _id: 0 } }],
        },
      },
      { $unwind: { path: "$role_details" } },
      { $match: { "role_details.name": newRole } },
      {
        $addFields: {
          label: "$name",
          value: "$_id",
        },
      },
      {
        $project: {
          label: 1,
          value: 1,
          _id: 0,
        },
      },
    ]);

    if (!options || options.length === 0) {
      return res.status(400).json({ success: false, data: [], message: leaveRequest.requestToUsersNotFound });
    }

    return res.status(200).json({
      success: true,
      data: options,
      message: leaveRequest.requestToUsersFound,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: error.defaultError });
  }
};

module.exports = {
  applyLeave,
  approveLeave,
  getIndividualLeave,
  getoneLeave,
  updateLeave,
  deleteLeave,
  getAllLeaves,
  requestToOptions,
};
