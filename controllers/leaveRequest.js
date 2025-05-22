const mongoose = require("mongoose");
const Leave = require("../models/leave");
const LeaveRequest = require("../models/leaveRequest");
const User = require("../models/user.js");
const messages = require("../constants/messages.js");

const { LeaveReq, Common } = messages;

const applyLeave = async (req, res) => {
  try {
    const { start_date, end_date, request_to_id, leave_type, reason } =
      req.body;

    await LeaveRequest.create({
      user_id: req.user.id,
      start_date,
      end_date,
      request_to_id,
      leave_type,
      reason,
      status: "Pending",
    });

    return res
      .status(201)
      .json({ success: true, message: LeaveReq.APPLIED_SUCCESS });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || Common.SOMETHING_WENT_WRONG,
    });
  }
};

const approveLeave = async (req, res) => {
  try {
    const { status, id } = req.body;

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest)
      return res
        .status(404)
        .json({ success: false, message: LeaveReq.NOT_FOUND });

    await LeaveRequest.updateOne(
      { _id: leaveRequest._id },
      { $set: { status } }
    );

    if (status.toLowerCase() === "approved") {
      let leaveDays = 0;

      if (leaveRequest.leave_type === "Full day") {
        leaveDays = 1;
      } else if (
        leaveRequest.leave_type === "First half" ||
        leaveRequest.leave_type === "Second half"
      ) {
        leaveDays = 0.5;
      } else {
        const start = new Date(leaveRequest.start_date);
        const end = new Date(leaveRequest.end_date);
        leaveDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }

      await Leave.updateOne(
        { user_id: leaveRequest.user_id },
        { $inc: { used_leave: leaveDays, available_leave: -leaveDays } }
      );
    }

    return res.status(200).json({
      success: true,
      message: LeaveReq.APPROVAL_SUCCESS(status),
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || Common.SOMETHING_WENT_WRONG,
    });
  }
};

const getIndividualLeave = async (req, res) => {
  try {
    const { id } = req.user;

    const {
      page = 1,
      limit = 10,
      sort = "start_date:desc",
      search = "",
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let sortField = "start_date";
    let sortOrder = -1; // default descending

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
      return res
        .status(400)
        .json({ success: false, message: LeaveReq.NO_LEAVE_REQUESTS });
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
      message: LeaveReq.FETCH_SUCCESS,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || Common.SOMETHING_WENT_WRONG,
    });
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
      return res
        .status(404)
        .json({ success: false, message: LeaveReq.NOT_FOUND });
    }

    return res.status(200).json({
      success: true,
      data: leave[0],
      message: LeaveReq.FETCH_ONE_SUCCESS,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || Common.SOMETHING_WENT_WRONG,
    });
  }
};

const updateLeave = async (req, res) => {
  try {
    const { editId } = req.params;
    const { start_date, end_date, request_to_id, leave_type, reason } =
      req.body;

    const payload = {
      start_date,
      end_date,
      request_to_id,
      leave_type,
      reason,
      status: "Pending",
    };

    const leavexists = await LeaveRequest.findById(editId);

    if (!leavexists) {
      return res
        .status(404)
        .json({ success: false, message: LeaveReq.NOT_FOUND });
    }

    const updatedLeave = await LeaveRequest.findByIdAndUpdate(editId, payload, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      data: updatedLeave,
      message: LeaveReq.UPDATED_SUCCESS,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || Common.SOMETHING_WENT_WRONG,
    });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const isLeaveExists = await LeaveRequest.findById(id);

    if (!isLeaveExists) {
      return res
        .status(400)
        .json({ success: false, message: LeaveReq.NOT_FOUND });
    }

    await LeaveRequest.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: LeaveReq.DELETED_SUCCESS });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || Common.SOMETHING_WENT_WRONG,
    });
  }
};

// for Admin
const getAllLeaves = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sort } = req.query;

    let searchFilter = {};
    if (search) {
      searchFilter = {
        name: { $regex: search, $options: "i" },
      };
    }

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
          pipeline: [{ $project: { name: 1, _id: 0 } }],
        },
      },
      { $unwind: { path: "$user" } },
      { $addFields: { name: "$user.name" } },
      { $match: searchFilter },
      {
        $project: {
          name: 1,
          start_date: 1,
          end_date: 1,
          leave_type: 1,
          reason: 1,
          status: 1,
        },
      },
      {
        $facet: {
          data: [
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: limitNumber },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const allLeaves = fetchedLeaves[0]?.data;
    const totalLeaves = fetchedLeaves[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalLeaves / limitNumber);

    if (!allLeaves) {
      return res
        .status(400)
        .json({ success: false, message: messages.AdminLeave.NOT_FOUND });
    }

    return res.status(200).json({
      success: true,
      data: allLeaves,
      page: pageNumber,
      limit: limitNumber,
      totalLeaves,
      totalPages,
      message: messages.AdminLeave.ALL_FETCH_SUCCESS,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || Common.SOMETHING_WENT_WRONG,
    });
  }
};

const requestToOptions = async (req, res) => {
  const { role } = req.user;
  const newRole = role.toLowerCase() === "student" ? "Hod/Staff" : "Admin";

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
    { $addFields: { label: "$name", value: "$_id" } },
    { $project: { label: 1, value: 1, _id: 0 } },
  ]);

  if (!options || options.length === 0) {
    return res.status(400).json({
      success: false,
      data: [],
      message: messages.Dropdown.USERS_NOT_FOUND,
    });
  }

  return res.status(200).json({
    success: true,
    data: options,
    message: messages.Dropdown.USERS_FETCHED,
  });
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
